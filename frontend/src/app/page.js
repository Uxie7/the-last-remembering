"use client";

import { useState, useEffect, useRef } from "react";
import { INITIAL_PEOPLE } from "../data/initialPeople";
import { translations } from "../data/translations";
import { getPeople, getPerson, uploadPhoto, checkHealth, saveMemory } from "../utils/api";

// Common UI components
import SvgDefs from "../components/common/SvgDefs";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import Toast from "../components/common/Toast";

// View components
import HomeView from "../components/views/HomeView";
import OfrendaView from "../components/views/OfrendaView";
import PersonView from "../components/views/PersonView";
import AddMemoryView from "../components/views/AddMemoryView";
import AskView from "../components/views/AskView";
import KeepsakeView from "../components/views/KeepsakeView";

export default function App() {
  const [people, setPeople] = useState(INITIAL_PEOPLE);
  const [currentRoute, setCurrentRoute] = useState("home");
  const [activePersonId, setActivePersonId] = useState("lupita");
  const [toastMessage, setToastMessage] = useState("");
  const [lang, setLang] = useState("en");
  const toastTimeoutRef = useRef(null);

  const t = translations[lang];

  const showToast = (msg) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage("");
    }, 2500);
  };

  const handleToggleLang = () => {
    const nextLang = lang === "en" ? "es" : "en";
    setLang(nextLang);
    showToast(nextLang === "es" ? "Idioma cambiado a Español" : "Language switched to English");
  };

  // Load live people from API
  useEffect(() => {
    async function loadData() {
      try {
        const apiPeople = await getPeople();
        if (apiPeople && apiPeople.length > 0) {
          const fullPeople = await Promise.all(
            apiPeople.map(async (p) => {
              try {
                const detail = await getPerson(p.id);
                return {
                  ...detail,
                  c: detail.color,
                  rel: detail.relationship,
                  last: detail.days_since_touch,
                  img: detail.photo_url,
                  say: detail.sayings || [],
                  stories: (detail.stories || []).map((s) => ({
                    t: s.title,
                    d: s.told_on || "Recent",
                    x: s.body,
                  })),
                };
              } catch {
                return {
                  ...p,
                  c: p.color,
                  rel: p.relationship,
                  last: p.days_since_touch,
                  img: p.photo_url,
                  foods: [],
                  songs: [],
                  say: [],
                  stories: [],
                };
              }
            })
          );
          setPeople(fullPeople);
        }
      } catch (err) {
        console.warn("Backend not detected, falling back to local demo state:", err);
      }
    }
    loadData();
  }, []);

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
  const handlePhotoUpload = async (e, personId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadPhoto(personId, file);
      const photoUrl = res.photo_url.startsWith("http")
        ? res.photo_url
        : `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}${res.photo_url}`;
      setPeople((prev) =>
        prev.map((p) => (p.id === personId ? { ...p, img: photoUrl, photo_url: photoUrl } : p))
      );
      showToast(t.person.photoSaved);
    } catch {
      // Fallback to in-browser FileReader if backend is unreachable
      const reader = new FileReader();
      reader.onload = () => {
        setPeople((prev) =>
          prev.map((p) => (p.id === personId ? { ...p, img: reader.result } : p))
        );
        showToast(t.person.photoSaved);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Memory handler
  const handleSaveMemory = async ({ personId, title, story, facts }) => {
    // Format approved facts for backend
    const approvedFactInputs = [];
    if (facts.rawFacts && facts.rawFacts.length > 0) {
      facts.rawFacts.forEach((rf) =>
        approvedFactInputs.push({ kind: rf.kind, value: rf.value, quote: rf.quote })
      );
    } else {
      (facts.foods || []).forEach((f) => approvedFactInputs.push({ kind: "food", value: f, quote: f }));
      (facts.songs || []).forEach((s) => approvedFactInputs.push({ kind: "song", value: s, quote: s }));
      (facts.say || []).forEach((s) => approvedFactInputs.push({ kind: "saying", value: s, quote: s }));
    }

    try {
      const res = await saveMemory({
        person_id: personId,
        title: title,
        body: story,
        told_on: lang === "es" ? "Hoy" : "Today",
        facts: approvedFactInputs,
      });

      if (res && res.person) {
        const updated = res.person;
        setPeople((prev) =>
          prev.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  ...updated,
                  c: updated.color || p.c,
                  rel: updated.relationship || p.rel,
                  last: updated.days_since_touch,
                  img: updated.photo_url || p.img,
                  say: updated.sayings || p.say,
                  stories: (updated.stories || []).map((s) => ({
                    t: s.title,
                    d: s.told_on || "Recent",
                    x: s.body,
                  })),
                }
              : p
          )
        );
        showToast(t.add.savedSuccess);
        navigate(`person-${personId}`);
        return;
      }
    } catch (err) {
      console.warn("Backend saveMemory failed, using client-side fallback:", err);
    }

    setPeople((prev) =>
      prev.map((p) => {
        if (p.id !== personId) return p;

        const newStories = [
          {
            t: title,
            d: lang === "es" ? "Hoy" : "Today",
            x: story,
          },
          ...p.stories,
        ];

        const updatedFoods = [...p.foods];
        (facts.foods || []).forEach((f) => {
          if (!updatedFoods.includes(f)) updatedFoods.push(f);
        });

        const updatedSongs = [...p.songs];
        (facts.songs || []).forEach((s) => {
          if (!updatedSongs.includes(s)) updatedSongs.push(s);
        });

        const updatedSay = [...p.say];
        (facts.say || []).forEach((s) => {
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

    showToast(t.add.savedSuccess);
    navigate(`person-${personId}`);
  };

  const activePerson = people.find((p) => p.id === activePersonId) || people[0];

  return (
    <>
      <SvgDefs />
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigate}
        lang={lang}
        onToggleLang={handleToggleLang}
        t={t}
      />

      <main id="app">
        {currentRoute === "home" && (
          <HomeView onNavigate={navigate} t={t} />
        )}

        {currentRoute === "ofrenda" && (
          <OfrendaView
            people={people}
            onNavigate={navigate}
            lang={lang}
            t={t}
          />
        )}

        {currentRoute === "person" && (
          <PersonView
            person={activePerson}
            onPhotoUpload={handlePhotoUpload}
            onNavigate={navigate}
            lang={lang}
            t={t}
          />
        )}

        {currentRoute === "add" && (
          <AddMemoryView
            people={people}
            activePersonId={activePersonId}
            onSaveMemory={handleSaveMemory}
            showToast={showToast}
            lang={lang}
            t={t}
          />
        )}

        {currentRoute === "ask" && (
          <AskView
            people={people}
            onNavigate={navigate}
            lang={lang}
            t={t}
          />
        )}

        {currentRoute === "export" && (
          <KeepsakeView
            people={people}
            activePersonId={activePersonId}
            onSelectPerson={setActivePersonId}
            lang={lang}
            t={t}
          />
        )}
      </main>

      <Footer />
      <Toast message={toastMessage} />
    </>
  );
}
