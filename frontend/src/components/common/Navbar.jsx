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
          <svg width="26" height="26" style={{ flexShrink: 0 }}>
            <use href="#mg" width="26" height="26" />
          </svg>
          <span className="logo-text">The Last Remembering</span>
        </a>

        <div className="nav-links">
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
        </div>

        <div className="nav-actions">
          {/* Ambient Candle Audio Toggle */}
          <button
            onClick={handleSoundToggle}
            className="sound-btn"
            title="Toggle ambient candle flicker sound"
            style={{
              background: soundActive ? "rgba(255, 176, 46, 0.22)" : "rgba(255, 255, 255, 0.06)",
              color: soundActive ? "#ffb02e" : "#e8dbf8",
              border: `1px solid ${soundActive ? "#ffb02e" : "rgba(255, 176, 46, 0.45)"}`,
            }}
          >
            <span>{soundActive ? "🕯️" : "✨"}</span>
            <span className="sound-label">{soundActive ? t.nav.soundOn : t.nav.soundOff}</span>
          </button>

          {/* Language Toggle (EN / ES) */}
          <button
            onClick={onToggleLang}
            className="lang-btn"
            title="Switch language / Cambiar idioma"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              color: "#ffc94d",
              border: "1px solid rgba(255, 176, 46, 0.45)",
            }}
          >
            {lang === "en" ? "ES" : "EN"}
          </button>
        </div>
      </div>
    </nav>
  );
}
