import { useState } from "react";
import MiniHero from "../common/MiniHero";
import PapelPicado from "../common/PapelPicado";
import Portrait from "../common/Portrait";

export default function KeepsakeView({
  people,
  activePersonId,
  onSelectPerson,
  lang,
  t,
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const activePerson = people.find((p) => p.id === activePersonId) || people[0];

  const handleSpeak = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const storyText = activePerson.stories[0]?.x || t.keepsake.defaultExcerpt;
    const utterance = new SpeechSynthesisUtterance(storyText);
    utterance.lang = lang === "es" ? "es-MX" : "en-US";
    utterance.rate = 0.92; // warm, gentle storytelling tempo

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div>
      <MiniHero
        eyebrow={t.keepsake.eyebrow}
        title={t.keepsake.title}
        subtitle={t.keepsake.subtitle}
      />

      <div className="wrap" style={{ padding: "56px 24px 80px" }}>
        <div
          className="row noprint c"
          style={{ marginBottom: "28px", gap: "14px" }}
        >
          <select
            style={{ width: "240px" }}
            value={activePerson.id}
            onChange={(e) => onSelectPerson(e.target.value)}
          >
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Local Piper TTS Voice Narration Demo */}
          <button
            className="btn ghost"
            style={{
              color: isSpeaking ? "#ff5fa2" : "var(--ink)",
              borderColor: isSpeaking ? "#ff5fa2" : "currentColor",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onClick={handleSpeak}
          >
            <span>{isSpeaking ? "🔊" : "🎙️"}</span>
            <span>{isSpeaking ? t.keepsake.listeningBtn : t.keepsake.listenBtn}</span>
          </button>

          <button className="btn" onClick={() => window.print()}>
            {t.keepsake.printBtn}
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
              : t.keepsake.defaultExcerpt}
          </p>
          <p>
            {[...activePerson.foods, ...activePerson.songs].map((f, i) => (
              <span
                key={i}
                className="chip"
                style={{ border: "1px solid #c9a15a" }}
              >
                {f}
              </span>
            ))}
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
            {t.keepsake.alwaysInMemory}
          </div>
        </div>
      </div>
    </div>
  );
}
