import PapelPicado from "../common/PapelPicado";
import Garland from "../common/Garland";

export default function HomeView({ onNavigate, t }) {
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
          <div className="eyebrow">{t.home.eyebrow}</div>
          <h1>
            {t.home.heroTitle1}
            <br />
            <em>{t.home.heroTitle2}</em>
          </h1>
          <p>{t.home.heroDesc}</p>
          <div className="row c hero-btns">
            <a className="btn" onClick={() => onNavigate("ofrenda")}>
              {t.home.visitOfrenda}
            </a>
            <a className="btn ghost" onClick={() => onNavigate("add")}>
              {t.home.addMemory}
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
            <div className="eyebrow">{t.home.traditionEyebrow}</div>
            <h2>{t.home.traditionTitle}</h2>
            <p style={{ color: "var(--mut)" }}>{t.home.traditionP1}</p>
            <p style={{ color: "var(--mut)" }}>{t.home.traditionP2}</p>
          </div>
        </div>
      </section>

      <section className="alt">
        <div className="wrap">
          <div className="eyebrow">{t.home.howTitle}</div>
          <h2>{t.home.howTitle}</h2>
          <div className="cards">
            {t.home.steps.map((s, i) => (
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
          <div className="eyebrow">{t.home.whyOpenTitle}</div>
          <h2>{t.home.whyOpenTitle}</h2>
          <div className="cards">
            {t.home.whyOpenItems.map((s, i) => (
              <div className="card" key={i}>
                <svg width="46" height="46">
                  <use href={`#${["mg", "bf", "sk", "bd"][i]}`} width="46" height="46" />
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
          <h2>{t.home.bottomTitle}</h2>
          <p style={{ marginBottom: "26px" }}>{t.home.bottomDesc}</p>
          <a className="btn" onClick={() => onNavigate("ofrenda")}>
            {t.home.startBtn}
          </a>
        </div>
        <Garland className="fl" />
      </div>
    </div>
  );
}
