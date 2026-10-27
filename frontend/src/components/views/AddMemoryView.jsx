import { useState } from "react";
import MiniHero from "../common/MiniHero";
import { KNOWN_FOODS } from "../../data/initialPeople";

export default function AddMemoryView({ people, activePersonId, onSaveMemory, showToast }) {
  const [who, setWho] = useState(activePersonId || "xochitl");
  const [title, setTitle] = useState("Christmas Eve tamales");
  const [story, setStory] = useState(
    "Xóchitl and I spent every Christmas Eve folding tamales with Abuela Lupita. We sang Cielito Lindo, and she would say a full belly makes a happy heart."
  );
  const [proposedFacts, setProposedFacts] = useState(null);

  const handleRecordDemo = () => {
    setStory(
      "Xóchitl and I spent every Christmas Eve folding tamales with Abuela Lupita. We sang Cielito Lindo, and she would say a full belly makes a happy heart."
    );
    showToast("Transcribed locally with Whisper (demo)");
  };

  const handleExtractFacts = () => {
    const textLower = story.toLowerCase();
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

  const handleSubmit = () => {
    const trimmedStory = story.trim();
    if (!trimmedStory) {
      showToast("Write or record a story first");
      return;
    }

    onSaveMemory({
      personId: who,
      title: title.trim() || "Untitled",
      story: trimmedStory,
      facts: proposedFacts || { foods: [], songs: [], say: [] },
    });
  };

  return (
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
          <select value={who} onChange={(e) => setWho(e.target.value)}>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sunday mole"
          />

          <label>Story</label>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
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
            <button className="btn" onClick={handleSubmit}>
              Save memory
            </button>
          </div>
        </div>

        <div className="card">
          <h3>Proposed facts</h3>
          <p>
            Nothing is saved until you approve it. A demo story is prefilled:
            press Extract facts, then Save memory.
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
  );
}
