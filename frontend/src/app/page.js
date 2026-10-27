"use client";

import { useState, useEffect, useRef } from "react";

const INITIAL_PEOPLE = [
  {
    id: "lupita",
    c: "#e8307f",
    name: "Abuela Lupita",
    rel: "Grandmother",
    glow: 92,
    last: 2,
    foods: ["Mole negro", "Tamales de rajas"],
    songs: ["Cielito Lindo"],
    say: ["A full belly makes a happy heart"],
    img: null,
    stories: [
      {
        t: "Sunday mole",
        d: "March 2026",
        x: "Every Sunday Abuela Lupita ground the chiles for mole negro by hand and hummed Cielito Lindo while she stirred. She served it with tamales de rajas and always said a full belly makes a happy heart.",
      },
      {
        t: "The bus to Oaxaca",
        d: "January 2026",
        x: "Abuela once missed the last bus to Oaxaca and spent the night at the station playing lotería, a Mexican bingo game, with strangers. She won every round and never told anyone her secret.",
      },
    ],
  },
  {
    id: "joaquin",
    c: "#12b5a5",
    name: "Abuelo Joaquín",
    rel: "Grandfather",
    glow: 61,
    last: 19,
    foods: ["Café de olla", "Pan de muerto"],
    songs: ["Sabor a Mí"],
    say: ["Take it slow, son"],
    img: null,
    stories: [
      {
        t: "Songs in the truck",
        d: "February 2026",
        x: "On long drives Abuelo sang Sabor a Mí slightly off key in his blue pickup and lowered the radio to do it. A thermos of café de olla always rode between the seats.",
      },
      {
        t: "The guitar on the porch",
        d: "December 2025",
        x: "Every evening he sat on the porch with his old guitar and a plate of pan de muerto. Whenever anyone rushed him he said take it slow, son.",
      },
    ],
  },
  {
    id: "chema",
    c: "#7c3aed",
    name: "Tío Chema",
    rel: "Uncle",
    glow: 34,
    last: 48,
    foods: ["Champurrado"],
    songs: ["Bésame Mucho"],
    say: ["If you do something, you do it well"],
    img: null,
    stories: [
      {
        t: "The carpentry shop",
        d: "October 2025",
        x: "Tío Chema’s workshop smelled of cedar and champurrado. He played Bésame Mucho on a cracked radio and taught me that if you do something, you do it well.",
      },
    ],
  },
  {
    id: "xochitl",
    c: "#ff9f1c",
    name: "Prima Xóchitl",
    rel: "Cousin",
    glow: 12,
    last: 96,
    foods: [],
    songs: [],
    say: [],
    img: null,
    stories: [],
  },
];

const KNOWN_FOODS = [
  "mole",
  "tamales",
  "pan de muerto",
  "champurrado",
  "atole",
  "café",
  "churros",
  "pozole",
  "elote",
];

const ARCH_PATH = "M10 190V70C10 30 40 6 70 6s60 24 60 64v120z";

function getStatus(glow) {
  if (glow > 75) return "Burning bright";
  if (glow > 45) return "Glowing";
  if (glow > 20) return "Fading";
  return "Nearly dark";
}

// Generate Marigold Petals SVG paths
function MarigoldSymbol() {
  const layers = [
    [14, 30, 17, 8.5, "#f59e0b"],
    [11, 22, 14, 7, "#ff7a1a"],
    [8, 14, 10, 5.5, "#ffc233"],
  ];
  const ellipses = [];

  layers.forEach(([count, dist, ry, rx, fill], layerIndex) => {
    for (let i = 0; i < count; i++) {
      const angle = (i * 360) / count + (count === 11 ? 9 : 0);
      ellipses.push(
        <ellipse
          key={`${layerIndex}-${i}`}
          cx="50"
          cy={50 - dist}
          rx={rx}
          ry={ry}
          fill={fill}
          stroke="#7a3300"
          strokeOpacity="0.25"
          transform={`rotate(${angle} 50 50)`}
        />
      );
    }
  });

  return (
    <symbol id="mg" viewBox="0 0 100 100">
      {ellipses}
      <circle cx="50" cy="50" r="5" fill="#b45309" />
    </symbol>
  );
}

// Global SVG Definitions
function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        <radialGradient id="gl">
          <stop offset="0" stopColor="#ffc94d" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffc94d" stopOpacity="0" />
        </radialGradient>

        <MarigoldSymbol />

        <symbol id="sk" viewBox="0 0 100 130">
          <path
            d="M50 4C24 4 9 25 9 50c0 14 6 25 15 31v14c0 6 5 10 11 10h30c6 0 11-4 11-10V81c9-6 15-17 15-31C91 25 76 4 50 4z"
            fill="#fff8ec"
            stroke="#2a1048"
            strokeWidth="2"
          />
          <use href="#mg" x="36" y="8" width="28" height="28" />
          <circle cx="31" cy="54" r="16" fill="#e8307f" />
          <circle
            cx="31"
            cy="54"
            r="16"
            fill="none"
            stroke="#ffc233"
            strokeWidth="3"
            strokeDasharray="3 3"
          />
          <circle cx="31" cy="54" r="10" fill="#fff8ec" />
          <circle cx="31" cy="54" r="6" fill="#2a1048" />
          <circle cx="69" cy="54" r="16" fill="#12b5a5" />
          <circle
            cx="69"
            cy="54"
            r="16"
            fill="none"
            stroke="#ffc233"
            strokeWidth="3"
            strokeDasharray="3 3"
          />
          <circle cx="69" cy="54" r="10" fill="#fff8ec" />
          <circle cx="69" cy="54" r="6" fill="#2a1048" />
          <path d="M50 68l-6 10h12z" fill="#2a1048" />
          <circle cx="19" cy="76" r="4" fill="#7c3aed" />
          <circle cx="81" cy="76" r="4" fill="#7c3aed" />
          <circle cx="15" cy="66" r="2.5" fill="#ff9f1c" />
          <circle cx="85" cy="66" r="2.5" fill="#ff9f1c" />
          <path d="M27 92q23 14 46 0" fill="none" stroke="#2a1048" strokeWidth="2.5" />
          <path
            d="M36 95v11M45 98v11M55 98v11M64 95v11"
            stroke="#2a1048"
            strokeWidth="2.5"
          />
        </symbol>

        <symbol id="bf" viewBox="0 0 60 40">
          <g stroke="#1a0b2e" strokeWidth="1.5" fill="#ff8a1f">
            <path d="M30 20C18 0 2 2 4 16c1 8 14 8 26 4z" />
            <path d="M30 22C20 24 10 32 16 38c6 3 14-6 14-16z" fill="#ffc233" />
            <g transform="translate(60 0) scale(-1 1)">
              <path d="M30 20C18 0 2 2 4 16c1 8 14 8 26 4z" />
              <path d="M30 22C20 24 10 32 16 38c6 3 14-6 14-16z" fill="#ffc233" />
            </g>
          </g>
          <circle cx="9" cy="12" r="1.6" fill="#fff" />
          <circle cx="51" cy="12" r="1.6" fill="#fff" />
          <rect x="29" y="12" width="2" height="22" rx="1" fill="#1a0b2e" />
        </symbol>

        <symbol id="bd" viewBox="0 0 60 40">
          <ellipse cx="30" cy="26" rx="27" ry="13" fill="#d98a3d" />
          <path
            d="M12 22q6-8 10 2M26 14q4 8 8 0M40 24q4-8 9 0"
            stroke="#f6cf8c"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="30" cy="12" r="6" fill="#f6cf8c" />
          <circle cx="18" cy="30" r="1.4" fill="#fff" />
          <circle cx="42" cy="31" r="1.4" fill="#fff" />
        </symbol>
      </defs>
    </svg>
  );
}

function PapelPicado({ height = 80 }) {
  const colors = ["#e8307f", "#ff9f1c", "#12b5a5", "#ffd23f", "#7c3aed", "#ff6b6b"];
  const flags = [];

  for (let i = 0; i < 24; i++) {
    const y = Math.sin((Math.PI * i) / 24) * 8;
    flags.push(
      <g key={i} transform={`translate(${i * 60 + 4} ${y})`}>
        <path
          d="M0 8h52v44l-13 10-13-10-13 10-13-10z"
          fill={colors[i % 6]}
        />
        <path d="M26 18l9 10-9 10-9-10z" fill="#150726" opacity="0.45" />
        <circle cx="10" cy="14" r="3" fill="#150726" opacity="0.45" />
        <circle cx="42" cy="14" r="3" fill="#150726" opacity="0.45" />
        <circle cx="26" cy="47" r="3" fill="#150726" opacity="0.45" />
      </g>
    );
  }

  return (
    <svg
      className="pp"
      viewBox="0 0 1440 80"
      preserveAspectRatio="xMidYMin slice"
      height={height}
    >
      <path d="M0 8Q720 24 1440 8" stroke="#ffcf5a" fill="none" strokeWidth="2" />
      {flags}
    </svg>
  );
}

function Garland({ className = "" }) {
  const marigolds = [];
  for (let i = 0; i < 30; i++) {
    const z = 66 + ((i * 7) % 5) * 9;
    const x = i * 48 - 20;
    const y = 36 + ((i * 5) % 4) * 10;
    marigolds.push(
      <use key={i} href="#mg" x={x} y={y} width={z} height={z} />
    );
  }

  return (
    <svg
      className={`gar ${className}`}
      viewBox="0 0 1400 150"
      preserveAspectRatio="xMidYMax slice"
    >
      {marigolds}
    </svg>
  );
}

function Candle({ glow = 50 }) {
  return (
    <svg className="cd" viewBox="0 0 24 70">
      <circle
        cx="12"
        cy="16"
        r={10 + glow / 4}
        fill="url(#gl)"
        opacity={0.4 + glow / 160}
      />
      <path
        className="fm"
        d="M12 4c6 7 6 12 0 17-6-5-6-10 0-17z"
        fill="#ffc94d"
        opacity={0.45 + glow / 180}
      />
      <path d="M12 11c3 4 3 7 0 9-3-2-3-5 0-9z" fill="#fff" />
      <rect x="7" y="22" width="10" height="46" rx="3" fill="#fff3dc" />
    </svg>
  );
}

function Portrait({ person, width = 120 }) {
  const clipId = `clip-${person.id}`;
  const gradId = `grad-${person.id}`;

  const marigoldBorder = [
    [-4, 62],
    [2, 34],
    [22, 10],
    [52, -4],
    [82, -4],
    [108, 10],
    [128, 34],
    [134, 62],
  ].map(([x, y], idx) => (
    <use key={idx} href="#mg" x={x} y={y} width="28" height="28" />
  ));

  return (
    <svg
      viewBox="-10 -14 160 214"
      width={width}
      style={{ overflow: "visible", display: "inline-block" }}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={ARCH_PATH} />
        </clipPath>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={person.c} />
          <stop offset="1" stopColor="#2a1048" />
        </linearGradient>
      </defs>

      <path d={ARCH_PATH} fill={`url(#${gradId})`} />

      {person.img ? (
        <image
          href={person.img}
          x="10"
          y="6"
          width="120"
          height="184"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      ) : (
        <g clipPath={`url(#${clipId})`}>
          <circle cx="70" cy="88" r="25" fill="#fff4de" opacity="0.92" />
          <path
            d="M22 190c0-36 22-54 48-54s48 18 48 54z"
            fill="#fff4de"
            opacity="0.92"
          />
        </g>
      )}

      <path
        d={ARCH_PATH}
        fill="none"
        stroke="#ffcf5a"
        strokeWidth="5"
      />
      {marigoldBorder}
    </svg>
  );
}

function MiniHero({ eyebrow, title, subtitle }) {
  return (
    <div className="scene mini">
      <PapelPicado height={64} />
      <div className="wrap">
        <div className="eyebrow">{eyebrow}</div>
        <h1 style={{ fontSize: "clamp(2.8rem,6.5vw,4.6rem)" }}>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <svg
        className="sk"
        style={{ right: "6%", bottom: "-22px" }}
        width="120"
        height="156"
      >
        <use href="#sk" width="120" height="156" />
      </svg>
      <svg
        className="bf"
        style={{ right: "24%", top: "110px" }}
        width="54"
        height="36"
      >
        <use href="#bf" width="54" height="36" />
      </svg>
    </div>
  );
}

export default function App() {
  const [people, setPeople] = useState(INITIAL_PEOPLE);
  const [currentRoute, setCurrentRoute] = useState("home");
  const [activePersonId, setActivePersonId] = useState("lupita");
  const [toastMessage, setToastMessage] = useState("");
  const toastTimeoutRef = useRef(null);

  // Form states for Add Memory
  const [addWho, setAddWho] = useState("xochitl");
  const [addTitle, setAddTitle] = useState("Christmas Eve tamales");
  const [addStory, setAddStory] = useState(
    "Xóchitl and I spent every Christmas Eve folding tamales with Abuela Lupita. We sang Cielito Lindo, and she would say a full belly makes a happy heart."
  );
  const [proposedFacts, setProposedFacts] = useState(null);

  // Ask states
  const [askWho, setAskWho] = useState("all");
  const [question, setQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  // Toast helper
  const showToast = (msg) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage("");
    }, 2500);
  };

  // Synchronize hash routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "") || "home";
      if (hash.startsWith("person-")) {
        const id = hash.replace("person-", "");
        setActivePersonId(id);
        setCurrentRoute("person");
      } else {
        setCurrentRoute(hash);
      }
      window.scrollTo(0, 0);
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const navigate = (route) => {
    window.location.hash = route;
  };

  // Photo upload handler
  const handlePhotoUpload = (e, personId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPeople((prev) =>
        prev.map((p) => (p.id === personId ? { ...p, img: reader.result } : p))
      );
      showToast("Photo added. It stays on this device.");
    };
    reader.readAsDataURL(file);
  };

  // Add Memory handlers
  const handleRecordDemo = () => {
    setAddStory(
      "Xóchitl and I spent every Christmas Eve folding tamales with Abuela Lupita. We sang Cielito Lindo, and she would say a full belly makes a happy heart."
    );
    showToast("Transcribed locally with Whisper (demo)");
  };

  const handleExtractFacts = () => {
    const textLower = addStory.toLowerCase();
    const sayingsMap = {
      "full belly": "A full belly makes a happy heart",
      "take it slow": "Take it slow, son",
      "do it well": "If you do something, you do it well",
    };

    const foods = KNOWN_FOODS.filter((w) => textLower.includes(w)).map(
      (w) => w.charAt(0).toUpperCase() + w.slice(1)
    );

    const songs = ["cielito lindo", "sabor a mí", "bésame mucho"]
      .filter((w) => textLower.includes(w))
      .map((w) => w.replace(/(^|\s)\S/g, (c) => c.toUpperCase()));

    const say = Object.keys(sayingsMap)
      .filter((w) => textLower.includes(w))
      .map((w) => sayingsMap[w]);

    setProposedFacts({ foods, songs, say });
  };

  const handleSaveMemory = () => {
    const trimmedStory = addStory.trim();
    if (!trimmedStory) {
      showToast("Write or record a story first");
      return;
    }

    setPeople((prev) =>
      prev.map((p) => {
        if (p.id !== addWho) return p;

        const newStories = [
          {
            t: addTitle.trim() || "Untitled",
            d: "Today",
            x: trimmedStory,
          },
          ...p.stories,
        ];

        const updatedFoods = [...p.foods];
        (proposedFacts?.foods || []).forEach((f) => {
          if (!updatedFoods.includes(f)) updatedFoods.push(f);
        });

        const updatedSongs = [...p.songs];
        (proposedFacts?.songs || []).forEach((s) => {
          if (!updatedSongs.includes(s)) updatedSongs.push(s);
        });

        const updatedSay = [...p.say];
        (proposedFacts?.say || []).forEach((s) => {
          if (!updatedSay.includes(s)) updatedSay.push(s);
        });

        return {
          ...p,
          stories: newStories,
          foods: updatedFoods,
          songs: updatedSongs,
          say: updatedSay,
          glow: Math.min(100, p.glow + 25),
          last: 0,
        };
      })
    );

    showToast("Saved. The candle burns brighter.");
    navigate(`person-${addWho}`);
  };

  // Ask handlers
  const handleAsk = (queryText) => {
    const q = (queryText || question).trim();
    if (!q) return;

    const stopWords = "what did was the his her and with that for from about like".split(
      " "
    );
    const synonyms = {
      sing: ["sang", "song"],
      cook: ["served", "ground", "mole"],
    };

    const words = q
      .toLowerCase()
      .replace(/[^a-záéíóúñ ]/g, "")
      .split(" ")
      .filter((w) => w.length > 2 && !stopWords.includes(w))
      .map((w) => (w.length > 4 && w.endsWith("s") ? w.slice(0, -1) : w));

    let bestMatch = null;
    let highestScore = 0;

    const eligiblePeople = people.filter(
      (p) => askWho === "all" || p.id === askWho
    );

    eligiblePeople.forEach((p) => {
      p.stories.forEach((s) => {
        const text = (s.t + " " + s.x).toLowerCase();
        const matches = words.filter((w) =>
          (synonyms[w] || [w]).some((y) => text.includes(y))
        ).length;

        if (matches === 0) return;

        const nameBonus = words.some((w) => p.name.toLowerCase().includes(w))
          ? 0.5
          : 0;
        const total = matches + nameBonus;

        if (total > highestScore) {
          highestScore = total;
          bestMatch = { person: p, story: s };
        }
      });
    });

    setChatMessages((prev) => [
      ...prev,
      { type: "user", text: q },
      bestMatch
        ? {
            type: "answer",
            text: bestMatch.story.x,
            citation: {
              storyTitle: bestMatch.story.t,
              personName: bestMatch.person.name,
              personId: bestMatch.person.id,
            },
          }
        : {
            type: "not-found",
            text: "I don’t have a memory of that yet.",
          },
    ]);

    setQuestion("");
  };

  // Run initial sample query for Ask view
  useEffect(() => {
    if (currentRoute === "ask" && chatMessages.length === 0) {
      handleAsk("What did Abuelo sing in the truck?");
    }
  }, [currentRoute]);

  const activePerson = people.find((p) => p.id === activePersonId) || people[0];
  const fadingRelative = people[3] || people[0];

  return (
    <>
      <SvgDefs />

      {/* Navigation */}
      <nav>
        <div className="pill">
          <a className="logo" onClick={() => navigate("home")}>
            <svg width="26" height="26">
              <use href="#mg" width="26" height="26" />
            </svg>
            The Last Remembering
          </a>
          <a
            className={`l ${currentRoute === "home" ? "on" : ""}`}
            onClick={() => navigate("home")}
          >
            Home
          </a>
          <a
            className={`l ${
              currentRoute === "ofrenda" || currentRoute === "person" ? "on" : ""
            }`}
            onClick={() => navigate("ofrenda")}
          >
            Ofrenda
          </a>
          <a
            className={`l ${currentRoute === "add" ? "on" : ""}`}
            onClick={() => navigate("add")}
          >
            Add memory
          </a>
          <a
            className={`l ${currentRoute === "ask" ? "on" : ""}`}
            onClick={() => navigate("ask")}
          >
            Ask
          </a>
          <a
            className={`l ${currentRoute === "export" ? "on" : ""}`}
            onClick={() => navigate("export")}
          >
            Keepsake
          </a>
        </div>
      </nav>

      {/* Main Content Area */}
      <main id="app">
        {/* VIEW: HOME */}
        {currentRoute === "home" && (
          <div>
            <div className="scene big">
              <PapelPicado height={90} />

              <svg
                className="sk"
                style={{
                  left: "5%",
                  bottom: "60px",
                  transform: "rotate(-8deg)",
                }}
                width="150"
                height="195"
              >
                <use href="#sk" width="150" height="195" />
              </svg>
              <svg
                className="sk"
                style={{
                  right: "5%",
                  bottom: "60px",
                  transform: "rotate(8deg)",
                }}
                width="150"
                height="195"
              >
                <use href="#sk" width="150" height="195" />
              </svg>

              <svg
                className="bf"
                style={{ left: "22%", top: "230px" }}
                width="64"
                height="43"
              >
                <use href="#bf" width="64" height="43" />
              </svg>
              <svg
                className="bf"
                style={{ right: "20%", top: "190px", animationDelay: "-2s" }}
                width="52"
                height="35"
              >
                <use href="#bf" width="52" height="35" />
              </svg>

              <div className="wrap">
                <div className="eyebrow">Inspired by the Day of the Dead</div>
                <h1>
                  Keep their light
                  <br />
                  <em>burning.</em>
                </h1>
                <p>
                  A private place to keep the stories of the people you love,
                  their voices, recipes, songs and sayings, on an ofrenda that
                  glows brighter each time you remember them.
                </p>
                <div className="row c">
                  <a className="btn" onClick={() => navigate("ofrenda")}>
                    Visit the ofrenda
                  </a>
                  <a className="btn ghost" onClick={() => navigate("add")}>
                    Add a memory
                  </a>
                </div>
              </div>
              <Garland />
            </div>

            <section>
              <div className="wrap two">
                <div className="panel">
                  <svg width="230" height="300">
                    <use href="#sk" width="230" height="300" />
                  </svg>
                  <svg
                    style={{ position: "absolute", left: "14px", bottom: "10px" }}
                    width="80"
                    height="80"
                  >
                    <use href="#mg" width="80" height="80" />
                  </svg>
                  <svg
                    style={{ position: "absolute", right: "10px", top: "10px" }}
                    width="64"
                    height="64"
                  >
                    <use href="#mg" width="64" height="64" />
                  </svg>
                  <svg
                    style={{
                      position: "absolute",
                      right: "30px",
                      bottom: "16px",
                    }}
                    width="70"
                    height="46"
                  >
                    <use href="#bf" width="70" height="46" />
                  </svg>
                </div>
                <div>
                  <div className="eyebrow">The tradition</div>
                  <h2>An altar made of love</h2>
                  <p style={{ color: "var(--mut)" }}>
                    Each year on November 1 and 2, families welcome back loved
                    ones with an ofrenda: marigolds to guide them, candles to light
                    the way, their favorite foods, and photographs. As long as
                    someone remembers them, they are never truly gone.
                  </p>
                  <p style={{ color: "var(--mut)" }}>
                    The Last Remembering brings that idea home all year,
                    privately and offline.
                  </p>
                </div>
              </div>
            </section>

            <section className="alt">
              <div className="wrap">
                <div className="eyebrow">How it works</div>
                <h2>Four gentle steps</h2>
                <div className="cards">
                  {[
                    [
                      "Record",
                      "Speak or write a story. Whisper transcribes it on your own device.",
                      "#e8307f",
                    ],
                    [
                      "Confirm",
                      "A local Gemma model suggests foods, songs and sayings. You approve each one.",
                      "#12b5a5",
                    ],
                    [
                      "Keep the light",
                      "Each candle glows with the stories you add, and dims if someone goes unvisited.",
                      "#ff9f1c",
                    ],
                    [
                      "Ask",
                      "Answers come only from what you saved, always with a link to the source.",
                      "#7c3aed",
                    ],
                  ].map((s, i) => (
                    <div className="card" key={i}>
                      <div className="num">{i + 1}</div>
                      <h3>{s[0]}</h3>
                      <p>{s[1]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <div className="wrap">
                <div className="eyebrow">Why open models</div>
                <h2>A memory should outlive a service</h2>
                <div className="cards">
                  {[
                    [
                      "Private",
                      "Voices and photos of your family never reach a server you do not control.",
                      "mg",
                    ],
                    [
                      "Offline",
                      "Works at a family gathering with no signal at all.",
                      "bf",
                    ],
                    [
                      "Durable",
                      "Weights, database and files are yours. No shutdown can erase them.",
                      "sk",
                    ],
                    [
                      "Swappable",
                      "Change the model any time and compare how it answers.",
                      "bd",
                    ],
                  ].map((s, i) => (
                    <div className="card" key={i}>
                      <svg width="46" height="46">
                        <use href={`#${s[2]}`} width="46" height="46" />
                      </svg>
                      <h3 style={{ marginTop: "10px" }}>{s[0]}</h3>
                      <p>{s[1]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="scene" style={{ padding: "90px 0 0" }}>
              <div className="wrap">
                <h2>Begin with one person.</h2>
                <p style={{ marginBottom: "26px" }}>
                  I did not grow up with this tradition. I am learning it, and
                  this is how I honor the people in my own life.
                </p>
                <a className="btn" onClick={() => navigate("ofrenda")}>
                  Start remembering
                </a>
              </div>
              <Garland className="fl" />
            </div>
          </div>
        )}

        {/* VIEW: OFRENDA */}
        {currentRoute === "ofrenda" && (
          <div>
            <MiniHero
              eyebrow="Memorial altar"
              title="Your ofrenda"
              subtitle="Each candle shows how recently and how richly someone has been remembered."
            />

            <div className="scene" style={{ paddingTop: "50px" }}>
              <div className="altar">
                {/* Tier 1 */}
                <div className="tier t1">
                  <PapelPicado height={46} />
                  <svg className="dc" width="74" height="74">
                    <use href="#sk" width="74" height="74" />
                  </svg>
                  <div
                    className="c2"
                    onClick={() => navigate(`person-${people[0].id}`)}
                  >
                    <Candle glow={people[0].glow} />
                    <Portrait person={people[0]} width={120} />
                    <div className="nm">{people[0].name}</div>
                    <small>
                      {getStatus(people[0].glow)} · {people[0].last} days ago
                    </small>
                  </div>
                  <svg className="dc" width="74" height="74">
                    <use href="#sk" width="74" height="74" />
                  </svg>
                </div>

                {/* Tier 2 */}
                <div className="tier t2">
                  <PapelPicado height={46} />
                  <svg className="dc" width="86" height="86">
                    <use href="#bd" width="86" height="86" />
                  </svg>
                  <div
                    className="c2"
                    onClick={() => navigate(`person-${people[1].id}`)}
                  >
                    <Candle glow={people[1].glow} />
                    <Portrait person={people[1]} width={120} />
                    <div className="nm">{people[1].name}</div>
                    <small>
                      {getStatus(people[1].glow)} · {people[1].last} days ago
                    </small>
                  </div>
                  <div
                    className="c2"
                    onClick={() => navigate(`person-${people[2].id}`)}
                  >
                    <Candle glow={people[2].glow} />
                    <Portrait person={people[2]} width={120} />
                    <div className="nm">{people[2].name}</div>
                    <small>
                      {getStatus(people[2].glow)} · {people[2].last} days ago
                    </small>
                  </div>
                  <svg className="dc" width="86" height="86">
                    <use href="#bd" width="86" height="86" />
                  </svg>
                </div>

                {/* Tier 3 */}
                <div className="tier t3">
                  <PapelPicado height={46} />
                  <svg className="dc" width="84" height="84">
                    <use href="#mg" width="84" height="84" />
                  </svg>
                  <div
                    className="c2"
                    onClick={() => navigate(`person-${people[3].id}`)}
                  >
                    <Candle glow={people[3].glow} />
                    <Portrait person={people[3]} width={120} />
                    <div className="nm">{people[3].name}</div>
                    <small>
                      {getStatus(people[3].glow)} · {people[3].last} days ago
                    </small>
                  </div>
                  <svg className="dc" width="86" height="86">
                    <use href="#bd" width="86" height="86" />
                  </svg>
                  <svg className="dc" width="84" height="84">
                    <use href="#mg" width="84" height="84" />
                  </svg>
                </div>
              </div>
              <Garland className="fl" />
            </div>

            <div className="wrap" style={{ padding: "40px 24px 70px" }}>
              <div className="card row" style={{ justifyContent: "space-between" }}>
                <span>
                  <b
                    style={{
                      fontFamily: "var(--font-cormorant), serif",
                      fontSize: "1.6rem",
                    }}
                  >
                    {fadingRelative.name}
                  </b>{" "}
                  <span style={{ color: "var(--mut)" }}>
                    has not been visited in {fadingRelative.last} days, and her
                    candle is nearly out.
                  </span>
                </span>
                <a className="btn" onClick={() => navigate("add")}>
                  Add a story
                </a>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: PERSON DETAIL */}
        {currentRoute === "person" && (
          <div>
            <MiniHero
              eyebrow={`${activePerson.rel} · ${getStatus(activePerson.glow)}`}
              title={activePerson.name}
              subtitle={`${activePerson.stories.length} ${
                activePerson.stories.length === 1 ? "story" : "stories"
              } kept`}
            />

            <div
              className="wrap cols"
              style={{ padding: "56px 24px 80px" }}
            >
              <div>
                <div className="card" style={{ textAlign: "center", paddingTop: "44px" }}>
                  <Portrait person={activePerson} width={170} />
                  <div style={{ marginTop: "18px" }}>
                    <label
                      className="btn ghost noprint"
                      style={{
                        margin: 0,
                        color: "var(--ink)",
                        display: "inline-block",
                        padding: "11px 22px",
                        fontSize: "0.88rem",
                      }}
                    >
                      Add a photo
                      <input
                        type="file"
                        accept="image/*"
                        id="ph"
                        hidden
                        onChange={(e) => handlePhotoUpload(e, activePerson.id)}
                      />
                    </label>
                  </div>
                </div>

                <div className="card" style={{ marginTop: "22px" }}>
                  <div className="lbl" style={{ marginTop: 0 }}>
                    Foods
                  </div>
                  {activePerson.foods.length ? (
                    activePerson.foods.map((f, i) => (
                      <span
                        key={i}
                        className="chip"
                        style={{ border: "1px solid #ff9f1c", color: "var(--ink)" }}
                      >
                        {f}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: "var(--mut)", fontSize: "0.9rem" }}>
                      Nothing yet
                    </span>
                  )}

                  <div className="lbl">Songs</div>
                  {activePerson.songs.length ? (
                    activePerson.songs.map((s, i) => (
                      <span
                        key={i}
                        className="chip"
                        style={{ border: "1px solid #e8307f", color: "var(--ink)" }}
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: "var(--mut)", fontSize: "0.9rem" }}>
                      Nothing yet
                    </span>
                  )}

                  <div className="lbl">Sayings</div>
                  {activePerson.say.length ? (
                    activePerson.say.map((s, i) => (
                      <span
                        key={i}
                        className="chip"
                        style={{ border: "1px solid #12b5a5", color: "var(--ink)" }}
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: "var(--mut)", fontSize: "0.9rem" }}>
                      Nothing yet
                    </span>
                  )}
                </div>

                <div className="row" style={{ marginTop: "22px" }}>
                  <a className="btn" onClick={() => navigate("add")}>
                    Add memory
                  </a>
                  <a className="btn ghost" onClick={() => navigate("ask")}>
                    Ask
                  </a>
                </div>
              </div>

              <div>
                <h2>Stories</h2>
                {activePerson.stories.length ? (
                  activePerson.stories.map((s, i) => (
                    <div className="note" key={i}>
                      <svg className="nf" width="46" height="46">
                        <use href="#mg" width="46" height="46" />
                      </svg>
                      <h3 style={{ margin: 0 }}>{s.t}</h3>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--gold)",
                          fontWeight: 700,
                        }}
                      >
                        {s.d}
                      </div>
                      <p>{s.x}</p>
                    </div>
                  ))
                ) : (
                  <div className="note">
                    <p>
                      No stories yet. A single small memory is enough to light
                      the candle.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: ADD MEMORY */}
        {currentRoute === "add" && (
          <div>
            <MiniHero
              eyebrow="New memory"
              title="Add a memory"
              subtitle="Record or write a story. Everything is processed on your own device."
            />

            <div
              className="wrap cols"
              style={{ padding: "56px 24px 80px", gridTemplateColumns: "1.4fr 1fr" }}
            >
              <div className="card">
                <label style={{ marginTop: 0 }}>Who is this about?</label>
                <select
                  value={addWho}
                  onChange={(e) => setAddWho(e.target.value)}
                >
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <label>Title</label>
                <input
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  placeholder="Sunday mole"
                />

                <label>Story</label>
                <textarea
                  value={addStory}
                  onChange={(e) => setAddStory(e.target.value)}
                  placeholder="Write it here, or press Record…"
                />

                <div className="row" style={{ marginTop: "24px" }}>
                  <button
                    className="btn ghost"
                    style={{ color: "var(--ink)" }}
                    onClick={handleRecordDemo}
                  >
                    Record (demo)
                  </button>
                  <button
                    className="btn ghost"
                    style={{ color: "var(--ink)" }}
                    onClick={handleExtractFacts}
                  >
                    Extract facts
                  </button>
                  <button className="btn" onClick={handleSaveMemory}>
                    Save memory
                  </button>
                </div>
              </div>

              <div className="card">
                <h3>Proposed facts</h3>
                <p>
                  Nothing is saved until you approve it. A demo story is
                  prefilled: press Extract facts, then Save memory.
                </p>

                <div style={{ marginTop: "14px" }}>
                  {proposedFacts ? (
                    <div>
                      {proposedFacts.foods.length > 0 && (
                        <div>
                          <div className="lbl">Foods</div>
                          {proposedFacts.foods.map((f, i) => (
                            <span
                              key={i}
                              className="chip"
                              style={{
                                border: "1px solid #ff9f1c",
                                color: "var(--ink)",
                              }}
                            >
                              {f} ✓
                            </span>
                          ))}
                        </div>
                      )}

                      {proposedFacts.songs.length > 0 && (
                        <div>
                          <div className="lbl">Songs</div>
                          {proposedFacts.songs.map((s, i) => (
                            <span
                              key={i}
                              className="chip"
                              style={{
                                border: "1px solid #e8307f",
                                color: "var(--ink)",
                              }}
                            >
                              {s} ✓
                            </span>
                          ))}
                        </div>
                      )}

                      {proposedFacts.say.length > 0 && (
                        <div>
                          <div className="lbl">Sayings</div>
                          {proposedFacts.say.map((s, i) => (
                            <span
                              key={i}
                              className="chip"
                              style={{
                                border: "1px solid #12b5a5",
                                color: "var(--ink)",
                              }}
                            >
                              {s} ✓
                            </span>
                          ))}
                        </div>
                      )}

                      {proposedFacts.foods.length === 0 &&
                        proposedFacts.songs.length === 0 &&
                        proposedFacts.say.length === 0 && (
                          <p>No facts found. Try mentioning a dish or song.</p>
                        )}
                    </div>
                  ) : null}
                </div>

                <div className="lbl" style={{ marginTop: "26px" }}>
                  Local pipeline
                </div>
                <p>Whisper → Gemma → your SQLite file</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: ASK */}
        {currentRoute === "ask" && (
          <div>
            <MiniHero
              eyebrow="Search"
              title="Ask a memory"
              subtitle="Answers come only from stories you have saved. Nothing is invented."
            />

            <div
              className="wrap"
              style={{ maxWidth: "800px", padding: "56px 24px 80px" }}
            >
              <div className="card" style={{ padding: "18px" }}>
                <div className="row">
                  <select
                    style={{ width: "190px" }}
                    value={askWho}
                    onChange={(e) => setAskWho(e.target.value)}
                  >
                    <option value="all">Everyone</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <input
                    placeholder="What did Abuelo sing in the truck?"
                    style={{ flex: 1, minWidth: "200px" }}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                  />

                  <button className="btn" onClick={() => handleAsk()}>
                    Ask
                  </button>
                </div>
              </div>

              <div className="row" style={{ marginTop: "16px" }}>
                <span style={{ color: "var(--mut)" }}>Try:</span>
                {[
                  "What did Abuelo sing in the truck?",
                  "What did Abuela cook on Sundays?",
                  "What was Tío Chema’s workshop like?",
                  "What was Abuela’s favorite color?",
                ].map((sampleQ, idx) => (
                  <button
                    key={idx}
                    className="btn ghost"
                    style={{
                      color: "var(--ink)",
                      padding: "8px 16px",
                      fontSize: "0.82rem",
                    }}
                    onClick={() => handleAsk(sampleQ)}
                  >
                    {sampleQ}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: "20px" }}>
                {chatMessages.map((msg, index) => {
                  if (msg.type === "user") {
                    return (
                      <div key={index} className="msg you">
                        {msg.text}
                      </div>
                    );
                  }
                  if (msg.type === "answer") {
                    return (
                      <div key={index} className="msg">
                        {msg.text}
                        <div
                          className="cite"
                          onClick={() =>
                            navigate(`person-${msg.citation.personId}`)
                          }
                        >
                          SOURCE · {msg.citation.storyTitle} ·{" "}
                          {msg.citation.personName} →
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={index} className="msg">
                      I don’t have a memory of that yet.{" "}
                      <a
                        onClick={() => navigate("add")}
                        style={{ color: "var(--teal)", fontWeight: 700 }}
                      >
                        Add one →
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: KEEPSAKE (EXPORT) */}
        {currentRoute === "export" && (
          <div>
            <MiniHero
              eyebrow="Keepsake"
              title="Remembrance page"
              subtitle="A printable page to place beside the candle."
            />

            <div className="wrap" style={{ padding: "56px 24px 80px" }}>
              <div
                className="row noprint c"
                style={{ marginBottom: "28px" }}
              >
                <select
                  style={{ width: "240px" }}
                  value={activePerson.id}
                  onChange={(e) => setActivePersonId(e.target.value)}
                >
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button className="btn" onClick={() => window.print()}>
                  Print
                </button>
              </div>

              <div className="paper">
                <PapelPicado height={60} />
                <div style={{ paddingTop: "30px" }}>
                  <Portrait person={activePerson} width={130} />
                </div>
                <h2 style={{ margin: "18px 0 0" }}>{activePerson.name}</h2>
                <div style={{ color: "#6d5788", marginBottom: "20px" }}>
                  {activePerson.rel}
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontStyle: "italic",
                    fontWeight: 500,
                    fontSize: "1.7rem",
                    lineHeight: 1.4,
                  }}
                >
                  {activePerson.stories[0]
                    ? activePerson.stories[0].x
                    : "Their story is still waiting to be told."}
                </p>
                <p>
                  {[...activePerson.foods, ...activePerson.songs].map(
                    (f, i) => (
                      <span
                        key={i}
                        className="chip"
                        style={{ border: "1px solid #c9a15a" }}
                      >
                        {f}
                      </span>
                    )
                  )}
                </p>
                <div
                  style={{
                    color: "#6d5788",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    fontSize: "0.7rem",
                    marginTop: "26px",
                  }}
                >
                  Always in our memory
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer>
        <div className="wrap">
          Inspired by Día de los Muertos, offered with respect by someone still
          learning the tradition.
          <br />
          Prototype with sample data. Not affiliated with any film or studio.
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && <div className="toast">{toastMessage}</div>}
    </>
  );
}
