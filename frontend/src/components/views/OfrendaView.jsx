import MiniHero from "../common/MiniHero";
import PapelPicado from "../common/PapelPicado";
import Garland from "../common/Garland";
import AltarNiche from "../common/AltarNiche";

export default function OfrendaView({ people, onNavigate, lang, t }) {
  const fadingRelative = people[3] || people[0];

  return (
    <div className="ofrenda-page">
      <MiniHero
        eyebrow={t.ofrenda.eyebrow}
        title={t.ofrenda.title}
        subtitle={t.ofrenda.subtitle}
      />

      {/* Main Sacred Altar */}
      <div className="scene altar-scene">
        <div className="altar">
          {/* TIER 1 - TOP SHELF (El Cielo - Heaven) */}
          <div className="tier t1">
            <PapelPicado height={46} />
            <div className="tier-content">
              <AltarNiche
                person={people[0]}
                onNavigate={onNavigate}
                lang={lang}
                t={t}
                width={128}
              />
            </div>
            <div className="shelf-lip" />
          </div>

          {/* TIER 2 - MIDDLE SHELF (La Tierra - Earth) */}
          <div className="tier t2">
            <PapelPicado height={46} />
            <div className="tier-content">
              <div className="tier-row">
                <AltarNiche
                  person={people[1]}
                  onNavigate={onNavigate}
                  lang={lang}
                  t={t}
                  width={116}
                />
                <AltarNiche
                  person={people[2]}
                  onNavigate={onNavigate}
                  lang={lang}
                  t={t}
                  width={116}
                />
              </div>
            </div>
            <div className="shelf-lip" />
          </div>

          {/* TIER 3 - BASE SHELF (El Recuerdo - Memory) */}
          <div className="tier t3">
            <PapelPicado height={46} />
            <div className="tier-content">
              <AltarNiche
                person={people[3]}
                onNavigate={onNavigate}
                lang={lang}
                t={t}
                width={120}
              />
            </div>
            <div className="shelf-lip" />
          </div>
        </div>

        {/* Golden Cempasúchil garland base */}
        <Garland className="fl" />
      </div>

      {/* Fading Relative Call-to-action Banner */}
      <div className="wrap" style={{ padding: "40px 24px 70px" }}>
        <div className="card row fading-card">
          <div className="fading-card-text">
            <span className="fading-icon" aria-hidden="true">🕯️</span>
            <div>
              <b className="fading-name">{fadingRelative.name}</b>{" "}
              <span className="fading-desc">
                {t.ofrenda.unvisitedAlert} <strong>{fadingRelative.last}</strong> {t.ofrenda.unvisitedAlertEnd}
              </span>
            </div>
          </div>
          <a className="btn" onClick={() => onNavigate("add")}>
            {t.ofrenda.addStory}
          </a>
        </div>
      </div>
    </div>
  );
}
