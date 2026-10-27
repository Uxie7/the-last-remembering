export const INITIAL_PEOPLE = [
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

export const KNOWN_FOODS = [
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

export function getStatus(glow, lang = "en") {
  const isEs = lang === "es";
  if (glow > 75) return isEs ? "Llama viva" : "Burning bright";
  if (glow > 45) return isEs ? "Resplandeciente" : "Glowing";
  if (glow > 20) return isEs ? "Atenuándose" : "Fading";
  return isEs ? "Casi extinta" : "Nearly dark";
}
