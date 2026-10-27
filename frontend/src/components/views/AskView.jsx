import { useState, useEffect } from "react";
import MiniHero from "../common/MiniHero";

export default function AskView({ people, onNavigate }) {
  const [askWho, setAskWho] = useState("all");
  const [question, setQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

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

  useEffect(() => {
    if (chatMessages.length === 0) {
      handleAsk("What did Abuelo sing in the truck?");
    }
  }, []);

  return (
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
                    onClick={() => onNavigate(`person-${msg.citation.personId}`)}
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
                  onClick={() => onNavigate("add")}
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
  );
}
