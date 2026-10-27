import { useState } from "react";
import { toggleAmbientSound, isAmbientPlaying } from "../../utils/ambientSound";

export default function Navbar({ currentRoute, onNavigate, lang, onToggleLang, t }) {
  const [soundActive, setSoundActive] = useState(false);

  const handleSoundToggle = () => {
    const active = toggleAmbientSound();
    setSoundActive(active);
  };

  return (
    <nav>
      <div className="pill">
        <a className="logo" onClick={() => onNavigate("home")}>
          <svg width="26" height="26">
            <use href="#mg" width="26" height="26" />
          </svg>
          The Last Remembering
        </a>

        <a
          className={`l ${currentRoute === "home" ? "on" : ""}`}
          onClick={() => onNavigate("home")}
        >
          {t.nav.home}
        </a>
        <a
          className={`l ${
            currentRoute === "ofrenda" || currentRoute === "person" ? "on" : ""
          }`}
          onClick={() => onNavigate("ofrenda")}
        >
          {t.nav.ofrenda}
        </a>
        <a
          className={`l ${currentRoute === "add" ? "on" : ""}`}
          onClick={() => onNavigate("add")}
        >
          {t.nav.add}
        </a>
        <a
          className={`l ${currentRoute === "ask" ? "on" : ""}`}
          onClick={() => onNavigate("ask")}
        >
          {t.nav.ask}
        </a>
        <a
          className={`l ${currentRoute === "export" ? "on" : ""}`}
          onClick={() => onNavigate("export")}
        >
          {t.nav.keepsake}
        </a>

        {/* Ambient Candle Audio Toggle */}
        <button
          onClick={handleSoundToggle}
          title="Toggle ambient candle flicker sound"
          style={{
            background: soundActive ? "rgba(255, 176, 46, 0.2)" : "transparent",
            color: soundActive ? "#ffb02e" : "#d9c8ee",
            border: "1px solid",
            borderColor: soundActive ? "#ffb02e" : "rgba(255, 176, 46, 0.3)",
            borderRadius: "20px",
            padding: "5px 12px",
            fontSize: "0.72rem",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
            marginLeft: "auto",
            transition: "0.2s",
          }}
        >
          <span>{soundActive ? "🕯️" : "✨"}</span>
          <span>{soundActive ? t.nav.soundOn : t.nav.soundOff}</span>
        </button>

        {/* Language Toggle (EN / ES) */}
        <button
          onClick={onToggleLang}
          title="Switch language / Cambiar idioma"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            color: "#ffc94d",
            border: "1px solid rgba(255, 176, 46, 0.4)",
            borderRadius: "4px",
            padding: "4px 10px",
            fontWeight: 700,
            fontSize: "0.72rem",
            letterSpacing: "0.1em",
            cursor: "pointer",
            marginLeft: "8px",
          }}
        >
          {lang === "en" ? "ES" : "EN"}
        </button>
      </div>
    </nav>
  );
}
