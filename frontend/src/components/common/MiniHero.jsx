import PapelPicado from "./PapelPicado";

export default function MiniHero({ eyebrow, title, subtitle }) {
  return (
    <div className="scene mini">
      <PapelPicado height={64} />
      <div className="wrap">
        <div className="eyebrow">{eyebrow}</div>
        <h1 style={{ fontSize: "clamp(2.8rem, 6.5vw, 4.6rem)" }}>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <svg
        className="sk"
        style={{ right: "6%", bottom: "-22px" }}
        width="120"
        height="156"
      >
        <use href="#sk" width="120" height="156" />
      </svg>
      <svg
        className="bf"
        style={{ right: "24%", top: "110px" }}
        width="54"
        height="36"
      >
        <use href="#bf" width="54" height="36" />
      </svg>
    </div>
  );
}
