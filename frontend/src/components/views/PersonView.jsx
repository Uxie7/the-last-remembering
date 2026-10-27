import MiniHero from "../common/MiniHero";
import Portrait from "../common/Portrait";
import { getStatus } from "../../data/initialPeople";

export default function PersonView({ person, onPhotoUpload, onNavigate }) {
  if (!person) return null;

  return (
    <div>
      <MiniHero
        eyebrow={`${person.rel} · ${getStatus(person.glow)}`}
        title={person.name}
        subtitle={`${person.stories.length} ${
          person.stories.length === 1 ? "story" : "stories"
        } kept`}
      />

      <div className="wrap cols" style={{ padding: "56px 24px 80px" }}>
        <div>
          <div className="card" style={{ textAlign: "center", paddingTop: "44px" }}>
            <Portrait person={person} width={170} />
            <div style={{ marginTop: "18px" }}>
              <label
                className="btn ghost noprint"
                style={{
                  margin: 0,
                  color: "var(--ink)",
                  display: "inline-block",
                  padding: "11px 22px",
                  fontSize: "0.88rem",
                }}
              >
                Add a photo
                <input
                  type="file"
                  accept="image/*"
                  id="ph"
                  hidden
                  onChange={(e) => onPhotoUpload(e, person.id)}
                />
              </label>
            </div>
          </div>

          <div className="card" style={{ marginTop: "22px" }}>
            <div className="lbl" style={{ marginTop: 0 }}>
              Foods
            </div>
            {person.foods.length ? (
              person.foods.map((f, i) => (
                <span
                  key={i}
                  className="chip"
                  style={{ border: "1px solid #ff9f1c", color: "var(--ink)" }}
                >
                  {f}
                </span>
              ))
            ) : (
              <span style={{ color: "var(--mut)", fontSize: "0.9rem" }}>
                Nothing yet
              </span>
            )}

            <div className="lbl">Songs</div>
            {person.songs.length ? (
              person.songs.map((s, i) => (
                <span
                  key={i}
                  className="chip"
                  style={{ border: "1px solid #e8307f", color: "var(--ink)" }}
                >
                  {s}
                </span>
              ))
            ) : (
              <span style={{ color: "var(--mut)", fontSize: "0.9rem" }}>
                Nothing yet
              </span>
            )}

            <div className="lbl">Sayings</div>
            {person.say.length ? (
              person.say.map((s, i) => (
                <span
                  key={i}
                  className="chip"
                  style={{ border: "1px solid #12b5a5", color: "var(--ink)" }}
                >
                  {s}
                </span>
              ))
            ) : (
              <span style={{ color: "var(--mut)", fontSize: "0.9rem" }}>
                Nothing yet
              </span>
            )}
          </div>

          <div className="row" style={{ marginTop: "22px" }}>
            <a className="btn" onClick={() => onNavigate("add")}>
              Add memory
            </a>
            <a className="btn ghost" onClick={() => onNavigate("ask")}>
              Ask
            </a>
          </div>
        </div>

        <div>
          <h2>Stories</h2>
          {person.stories.length ? (
            person.stories.map((s, i) => (
              <div className="note" key={i}>
                <svg className="nf" width="46" height="46">
                  <use href="#mg" width="46" height="46" />
                </svg>
                <h3 style={{ margin: 0 }}>{s.t}</h3>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--gold)",
                    fontWeight: 700,
                  }}
                >
                  {s.d}
                </div>
                <p>{s.x}</p>
              </div>
            ))
          ) : (
            <div className="note">
              <p>
                No stories yet. A single small memory is enough to light
                the candle.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
