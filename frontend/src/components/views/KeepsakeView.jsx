import MiniHero from "../common/MiniHero";
import PapelPicado from "../common/PapelPicado";
import Portrait from "../common/Portrait";

export default function KeepsakeView({ people, activePersonId, onSelectPerson }) {
  const activePerson = people.find((p) => p.id === activePersonId) || people[0];

  return (
    <div>
      <MiniHero
        eyebrow="Keepsake"
        title="Remembrance page"
        subtitle="A printable page to place beside the candle."
      />

      <div className="wrap" style={{ padding: "56px 24px 80px" }}>
        <div className="row noprint c" style={{ marginBottom: "28px" }}>
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
          <button className="btn" onClick={() => window.print()}>
            Print
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
              : "Their story is still waiting to be told."}
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
            Always in our memory
          </div>
        </div>
      </div>
    </div>
  );
}
