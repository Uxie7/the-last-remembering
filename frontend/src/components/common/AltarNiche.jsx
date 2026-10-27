import Portrait from "./Portrait";
import Candle from "./Candle";
import { getStatus } from "../../data/initialPeople";

export default function AltarNiche({ person, onNavigate, lang, t, width = 120 }) {
  if (!person) return null;
  const statusText = getStatus(person.glow, lang);
  const glowLevel = person.glow;

  const dotColor =
    glowLevel > 75
      ? "#ffb02e"
      : glowLevel > 45
      ? "#2fd6c5"
      : glowLevel > 20
      ? "#ff5fa2"
      : "#a778ff";

  return (
    <div
      className="altar-station"
      onClick={() => onNavigate(`person-${person.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onNavigate(`person-${person.id}`);
        }
      }}
      aria-label={`View remembrance of ${person.name}`}
    >
      {/* Altar shelf display: Food tray left + Framed portrait center + Veladora candle right */}
      <div className="station-display">
        {/* Soft atmospheric halo behind the frame */}
        <div
          className="station-glow"
          style={{
            background: `radial-gradient(circle, ${dotColor}44 0%, transparent 70%)`,
            opacity: Math.max(0.2, glowLevel / 100),
          }}
        />

        {/* Left Corner: Food Tray offering (Pan de Muerto) resting on the shelf */}
        <div className="station-food-tray" title="Traditional offering (Ofrenda)">
          <svg viewBox="0 0 60 40" width="44" height="28" aria-hidden="true">
            <use href="#bd" width="60" height="40" />
          </svg>
        </div>

        {/* Center: Gilded Framed Portrait standing on the shelf plinth */}
        <div className="station-portrait">
          <Portrait person={person} width={width} />
        </div>

        {/* Right Corner: Veladora candle resting on the shelf with warm flickering flame */}
        <div className="station-candle">
          <Candle glow={person.glow} />
        </div>
      </div>

      {/* Altar Shelf Brass Nameplate & Remembrance Status */}
      <div className="station-meta">
        <div className="station-name">{person.name}</div>
        <div className="station-status">
          <span
            className="status-dot"
            style={{
              backgroundColor: dotColor,
              boxShadow: glowLevel > 45 ? `0 0 8px ${dotColor}` : "none",
            }}
          />
          <span>{statusText}</span>
          <span className="station-sep">·</span>
          <span>
            {person.last} {t.ofrenda.daysAgo}
          </span>
        </div>
      </div>
    </div>
  );
}
