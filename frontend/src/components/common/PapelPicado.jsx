export default function PapelPicado({ height = 80 }) {
  const colors = ["#e8307f", "#ff9f1c", "#12b5a5", "#ffd23f", "#7c3aed", "#ff6b6b"];
  const flags = [];

  for (let i = 0; i < 24; i++) {
    const y = Math.sin((Math.PI * i) / 24) * 8;
    flags.push(
      <g key={i} transform={`translate(${i * 60 + 4} ${y})`}>
        <path
          d="M0 8h52v44l-13 10-13-10-13 10-13-10z"
          fill={colors[i % 6]}
        />
        <path d="M26 18l9 10-9 10-9-10z" fill="#150726" opacity="0.45" />
        <circle cx="10" cy="14" r="3" fill="#150726" opacity="0.45" />
        <circle cx="42" cy="14" r="3" fill="#150726" opacity="0.45" />
        <circle cx="26" cy="47" r="3" fill="#150726" opacity="0.45" />
      </g>
    );
  }

  return (
    <svg
      className="pp"
      viewBox="0 0 1440 80"
      preserveAspectRatio="xMidYMin slice"
      height={height}
    >
      <path d="M0 8Q720 24 1440 8" stroke="#ffcf5a" fill="none" strokeWidth="2" />
      {flags}
    </svg>
  );
}
