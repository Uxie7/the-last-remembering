import MiniHero from "../common/MiniHero";
import PapelPicado from "../common/PapelPicado";
import Garland from "../common/Garland";
import Candle from "../common/Candle";
import Portrait from "../common/Portrait";
import { getStatus } from "../../data/initialPeople";

export default function OfrendaView({ people, onNavigate }) {
  const fadingRelative = people[3] || people[0];

  return (
    <div>
      <MiniHero
        eyebrow="Memorial altar"
        title="Your ofrenda"
        subtitle="Each candle shows how recently and how richly someone has been remembered."
      />

      <div className="scene" style={{ paddingTop: "50px" }}>
        <div className="altar">
          {/* Tier 1 */}
          <div className="tier t1">
            <PapelPicado height={46} />
            <svg className="dc" width="74" height="74">
              <use href="#sk" width="74" height="74" />
            </svg>
            <div
              className="c2"
              onClick={() => onNavigate(`person-${people[0].id}`)}
            >
              <Candle glow={people[0].glow} />
              <Portrait person={people[0]} width={120} />
              <div className="nm">{people[0].name}</div>
              <small>
                {getStatus(people[0].glow)} · {people[0].last} days ago
              </small>
            </div>
            <svg className="dc" width="74" height="74">
              <use href="#sk" width="74" height="74" />
            </svg>
          </div>

          {/* Tier 2 */}
          <div className="tier t2">
            <PapelPicado height={46} />
            <svg className="dc" width="86" height="86">
              <use href="#bd" width="86" height="86" />
            </svg>
            <div
              className="c2"
              onClick={() => onNavigate(`person-${people[1].id}`)}
            >
              <Candle glow={people[1].glow} />
              <Portrait person={people[1]} width={120} />
              <div className="nm">{people[1].name}</div>
              <small>
                {getStatus(people[1].glow)} · {people[1].last} days ago
              </small>
            </div>
            <div
              className="c2"
              onClick={() => onNavigate(`person-${people[2].id}`)}
            >
              <Candle glow={people[2].glow} />
              <Portrait person={people[2]} width={120} />
              <div className="nm">{people[2].name}</div>
              <small>
                {getStatus(people[2].glow)} · {people[2].last} days ago
              </small>
            </div>
            <svg className="dc" width="86" height="86">
              <use href="#bd" width="86" height="86" />
            </svg>
          </div>

          {/* Tier 3 */}
          <div className="tier t3">
            <PapelPicado height={46} />
            <svg className="dc" width="84" height="84">
              <use href="#mg" width="84" height="84" />
            </svg>
            <div
              className="c2"
              onClick={() => onNavigate(`person-${people[3].id}`)}
            >
              <Candle glow={people[3].glow} />
              <Portrait person={people[3]} width={120} />
              <div className="nm">{people[3].name}</div>
              <small>
                {getStatus(people[3].glow)} · {people[3].last} days ago
              </small>
            </div>
            <svg className="dc" width="86" height="86">
              <use href="#bd" width="86" height="86" />
            </svg>
            <svg className="dc" width="84" height="84">
              <use href="#mg" width="84" height="84" />
            </svg>
          </div>
        </div>
        <Garland className="fl" />
      </div>

      <div className="wrap" style={{ padding: "40px 24px 70px" }}>
        <div className="card row" style={{ justifyContent: "space-between" }}>
          <span>
            <b
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: "1.6rem",
              }}
            >
              {fadingRelative.name}
            </b>{" "}
            <span style={{ color: "var(--mut)" }}>
              has not been visited in {fadingRelative.last} days, and her
              candle is nearly out.
            </span>
          </span>
          <a className="btn" onClick={() => onNavigate("add")}>
            Add a story
          </a>
        </div>
      </div>
    </div>
  );
}
