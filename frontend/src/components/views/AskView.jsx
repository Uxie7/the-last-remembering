import { useState, useEffect } from "react";
import MiniHero from "../common/MiniHero";

export default function AskView({ people, onNavigate, lang, t }) {
  const [askWho, setAskWho] = useState("all");
  const [question, setQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const sampleQuestions =
    lang === "es"
      ? [
          "¿Qué cantaba el Abuelo en la camioneta?",
          "¿Qué cocinaba la Abuela los domingos?",
          "¿Cómo era el taller de carpintería del Tío Chema?",
          "¿Cuál era el color favorito de la Abuela?",
        ]
      : [
          "What did Abuelo sing in the truck?",
          "What did Abuela cook on Sundays?",
          "What was Tío Chema’s workshop like?",
          "What was Abuela’s favorite color?",
        ];

  const handleAsk = (queryText) => {
    const q = (queryText || question).trim();
    if (!q) return;

    const stopWords = "what did was the his her and with that for from about like que cantaba era el la en los las con del".split(
      " "
    );
    const synonyms = {
      sing: ["sang", "song", "cantar", "cantaba"],
      cook: ["served", "ground", "mole", "cocinaba", "tamales", "preparaba"],
      cantaba: ["sang", "cielito", "sabor a mí", "canción", "truck", "camioneta"],
      cocinaba: ["mole", "tamales", "domingo", "chiles", "sunday"],
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
            text: t.ask.notFound,
          },
    ]);

    setQuestion("");
  };

  useEffect(() => {
    if (chatMessages.length === 0) {
      handleAsk(
        lang === "es"
          ? "¿Qué cantaba el Abuelo en la camioneta?"
          : "What did Abuelo sing in the truck?"
      );
    }
  }, [lang]);

  return (
    <div>
      <MiniHero
        eyebrow={t.ask.eyebrow}
        title={t.ask.title}
        subtitle={t.ask.subtitle}
      />

      <div
        className="wrap"
        style={{ maxWidth: "800px", padding: "56px 24px 80px" }}
      >
        <div className="card" style={{ padding: "18px" }}>
          <div className="row" style={{ alignItems: "stretch" }}>
            <select
              style={{ flex: "1 1 150px", minWidth: "140px" }}
              value={askWho}
              onChange={(e) => setAskWho(e.target.value)}
            >
              <option value="all">{t.ask.everyone}</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <input
              placeholder={t.ask.placeholder}
              style={{ flex: "3 1 220px", minWidth: "180px" }}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            />

            <button
              className="btn"
              style={{ flex: "0 1 auto" }}
              onClick={() => handleAsk()}
            >
              {t.ask.askBtn}
            </button>
          </div>
        </div>

        <div className="row" style={{ marginTop: "16px" }}>
          <span style={{ color: "var(--mut)" }}>{t.ask.tryLabel}</span>
          {sampleQuestions.map((sampleQ, idx) => (
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
                    onClick={() => onNavigate(`person-${msg.citation.personId}`)}
                  >
                    {t.ask.source} · {msg.citation.storyTitle} ·{" "}
                    {msg.citation.personName} →
                  </div>
                </div>
              );
            }
            return (
              <div key={index} className="msg">
                {t.ask.notFound}{" "}
                <a
                  onClick={() => onNavigate("add")}
                  style={{ color: "var(--teal)", fontWeight: 700 }}
                >
                  {t.ask.addOne}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
