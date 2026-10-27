import PapelPicado from "../common/PapelPicado";
import Garland from "../common/Garland";

export default function HomeView({ onNavigate }) {
  return (
    <div>
      <div className="scene big">
        <PapelPicado height={90} />

        <svg
          className="sk"
          style={{
            left: "5%",
            bottom: "60px",
            transform: "rotate(-8deg)",
          }}
          width="150"
          height="195"
        >
          <use href="#sk" width="150" height="195" />
        </svg>
        <svg
          className="sk"
          style={{
            right: "5%",
            bottom: "60px",
            transform: "rotate(8deg)",
          }}
          width="150"
          height="195"
        >
          <use href="#sk" width="150" height="195" />
        </svg>

        <svg
          className="bf"
          style={{ left: "22%", top: "230px" }}
          width="64"
          height="43"
        >
          <use href="#bf" width="64" height="43" />
        </svg>
        <svg
          className="bf"
          style={{ right: "20%", top: "190px", animationDelay: "-2s" }}
          width="52"
          height="35"
        >
          <use href="#bf" width="52" height="35" />
        </svg>

        <div className="wrap">
          <div className="eyebrow">Inspired by the Day of the Dead</div>
          <h1>
            Keep their light
            <br />
            <em>burning.</em>
          </h1>
          <p>
            A private place to keep the stories of the people you love,
            their voices, recipes, songs and sayings, on an ofrenda that
            glows brighter each time you remember them.
          </p>
          <div className="row c">
            <a className="btn" onClick={() => onNavigate("ofrenda")}>
              Visit the ofrenda
            </a>
            <a className="btn ghost" onClick={() => onNavigate("add")}>
              Add a memory
            </a>
          </div>
        </div>
        <Garland />
      </div>

      <section>
        <div className="wrap two">
          <div className="panel">
            <svg width="230" height="300">
              <use href="#sk" width="230" height="300" />
            </svg>
            <svg
              style={{ position: "absolute", left: "14px", bottom: "10px" }}
              width="80"
              height="80"
            >
              <use href="#mg" width="80" height="80" />
            </svg>
            <svg
              style={{ position: "absolute", right: "10px", top: "10px" }}
              width="64"
              height="64"
            >
              <use href="#mg" width="64" height="64" />
            </svg>
            <svg
              style={{
                position: "absolute",
                right: "30px",
                bottom: "16px",
              }}
              width="70"
              height="46"
            >
              <use href="#bf" width="70" height="46" />
            </svg>
          </div>
          <div>
            <div className="eyebrow">The tradition</div>
            <h2>An altar made of love</h2>
            <p style={{ color: "var(--mut)" }}>
              Each year on November 1 and 2, families welcome back loved
              ones with an ofrenda: marigolds to guide them, candles to light
              the way, their favorite foods, and photographs. As long as
              someone remembers them, they are never truly gone.
            </p>
            <p style={{ color: "var(--mut)" }}>
              The Last Remembering brings that idea home all year,
              privately and offline.
            </p>
          </div>
        </div>
      </section>

      <section className="alt">
        <div className="wrap">
          <div className="eyebrow">How it works</div>
          <h2>Four gentle steps</h2>
          <div className="cards">
            {[
              [
                "Record",
                "Speak or write a story. Whisper transcribes it on your own device.",
                "#e8307f",
              ],
              [
                "Confirm",
                "A local Gemma model suggests foods, songs and sayings. You approve each one.",
                "#12b5a5",
              ],
              [
                "Keep the light",
                "Each candle glows with the stories you add, and dims if someone goes unvisited.",
                "#ff9f1c",
              ],
              [
                "Ask",
                "Answers come only from what you saved, always with a link to the source.",
                "#7c3aed",
              ],
            ].map((s, i) => (
              <div className="card" key={i}>
                <div className="num">{i + 1}</div>
                <h3>{s[0]}</h3>
                <p>{s[1]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="eyebrow">Why open models</div>
          <h2>A memory should outlive a service</h2>
          <div className="cards">
            {[
              [
                "Private",
                "Voices and photos of your family never reach a server you do not control.",
                "mg",
              ],
              [
                "Offline",
                "Works at a family gathering with no signal at all.",
                "bf",
              ],
              [
                "Durable",
                "Weights, database and files are yours. No shutdown can erase them.",
                "sk",
              ],
              [
                "Swappable",
                "Change the model any time and compare how it answers.",
                "bd",
              ],
            ].map((s, i) => (
              <div className="card" key={i}>
                <svg width="46" height="46">
                  <use href={`#${s[2]}`} width="46" height="46" />
                </svg>
                <h3 style={{ marginTop: "10px" }}>{s[0]}</h3>
                <p>{s[1]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="scene" style={{ padding: "90px 0 0" }}>
        <div className="wrap">
          <h2>Begin with one person.</h2>
          <p style={{ marginBottom: "26px" }}>
            I did not grow up with this tradition. I am learning it, and
            this is how I honor the people in my own life.
          </p>
          <a className="btn" onClick={() => onNavigate("ofrenda")}>
            Start remembering
          </a>
        </div>
        <Garland className="fl" />
      </div>
    </div>
  );
}
