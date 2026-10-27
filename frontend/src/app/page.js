"use client";

import { useState, useEffect, useRef } from "react";
import { INITIAL_PEOPLE } from "../data/initialPeople";

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
  const toastTimeoutRef = useRef(null);

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

  // Save Memory handler
  const handleSaveMemory = ({ personId, title, story, facts }) => {
    setPeople((prev) =>
      prev.map((p) => {
        if (p.id !== personId) return p;

        const newStories = [
          {
            t: title,
            d: "Today",
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

    showToast("Saved. The candle burns brighter.");
    navigate(`person-${personId}`);
  };

  const activePerson = people.find((p) => p.id === activePersonId) || people[0];

  return (
    <>
      <SvgDefs />
      <Navbar currentRoute={currentRoute} onNavigate={navigate} />

      <main id="app">
        {currentRoute === "home" && <HomeView onNavigate={navigate} />}

        {currentRoute === "ofrenda" && (
          <OfrendaView people={people} onNavigate={navigate} />
        )}

        {currentRoute === "person" && (
          <PersonView
            person={activePerson}
            onPhotoUpload={handlePhotoUpload}
            onNavigate={navigate}
          />
        )}

        {currentRoute === "add" && (
          <AddMemoryView
            people={people}
            activePersonId={activePersonId}
            onSaveMemory={handleSaveMemory}
            showToast={showToast}
          />
        )}

        {currentRoute === "ask" && (
          <AskView people={people} onNavigate={navigate} />
        )}

        {currentRoute === "export" && (
          <KeepsakeView
            people={people}
            activePersonId={activePersonId}
            onSelectPerson={setActivePersonId}
          />
        )}
      </main>

      <Footer />
      <Toast message={toastMessage} />
    </>
  );
}
