function MarigoldSymbol() {
  const layers = [
    [14, 30, 17, 8.5, "#f59e0b"],
    [11, 22, 14, 7, "#ff7a1a"],
    [8, 14, 10, 5.5, "#ffc233"],
  ];
  const ellipses = [];

  layers.forEach(([count, dist, ry, rx, fill], layerIndex) => {
    for (let i = 0; i < count; i++) {
      const angle = (i * 360) / count + (count === 11 ? 9 : 0);
      ellipses.push(
        <ellipse
          key={`${layerIndex}-${i}`}
          cx="50"
          cy={50 - dist}
          rx={rx}
          ry={ry}
          fill={fill}
          stroke="#7a3300"
          strokeOpacity="0.25"
          transform={`rotate(${angle} 50 50)`}
        />
      );
    }
  });

  return (
    <symbol id="mg" viewBox="0 0 100 100">
      {ellipses}
      <circle cx="50" cy="50" r="5" fill="#b45309" />
    </symbol>
  );
}

export default function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        <radialGradient id="gl">
          <stop offset="0" stopColor="#ffc94d" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffc94d" stopOpacity="0" />
        </radialGradient>

        <MarigoldSymbol />

        <symbol id="sk" viewBox="0 0 100 130">
          <path
            d="M50 4C24 4 9 25 9 50c0 14 6 25 15 31v14c0 6 5 10 11 10h30c6 0 11-4 11-10V81c9-6 15-17 15-31C91 25 76 4 50 4z"
            fill="#fff8ec"
            stroke="#2a1048"
            strokeWidth="2"
          />
          <use href="#mg" x="36" y="8" width="28" height="28" />
          <circle cx="31" cy="54" r="16" fill="#e8307f" />
          <circle
            cx="31"
            cy="54"
            r="16"
            fill="none"
            stroke="#ffc233"
            strokeWidth="3"
            strokeDasharray="3 3"
          />
          <circle cx="31" cy="54" r="10" fill="#fff8ec" />
          <circle cx="31" cy="54" r="6" fill="#2a1048" />
          <circle cx="69" cy="54" r="16" fill="#12b5a5" />
          <circle
            cx="69"
            cy="54"
            r="16"
            fill="none"
            stroke="#ffc233"
            strokeWidth="3"
            strokeDasharray="3 3"
          />
          <circle cx="69" cy="54" r="10" fill="#fff8ec" />
          <circle cx="69" cy="54" r="6" fill="#2a1048" />
          <path d="M50 68l-6 10h12z" fill="#2a1048" />
          <circle cx="19" cy="76" r="4" fill="#7c3aed" />
          <circle cx="81" cy="76" r="4" fill="#7c3aed" />
          <circle cx="15" cy="66" r="2.5" fill="#ff9f1c" />
          <circle cx="85" cy="66" r="2.5" fill="#ff9f1c" />
          <path d="M27 92q23 14 46 0" fill="none" stroke="#2a1048" strokeWidth="2.5" />
          <path
            d="M36 95v11M45 98v11M55 98v11M64 95v11"
            stroke="#2a1048"
            strokeWidth="2.5"
          />
        </symbol>

        <symbol id="bf" viewBox="0 0 60 40">
          <g stroke="#1a0b2e" strokeWidth="1.5" fill="#ff8a1f">
            <path d="M30 20C18 0 2 2 4 16c1 8 14 8 26 4z" />
            <path d="M30 22C20 24 10 32 16 38c6 3 14-6 14-16z" fill="#ffc233" />
            <g transform="translate(60 0) scale(-1 1)">
              <path d="M30 20C18 0 2 2 4 16c1 8 14 8 26 4z" />
              <path d="M30 22C20 24 10 32 16 38c6 3 14-6 14-16z" fill="#ffc233" />
            </g>
          </g>
          <circle cx="9" cy="12" r="1.6" fill="#fff" />
          <circle cx="51" cy="12" r="1.6" fill="#fff" />
          <rect x="29" y="12" width="2" height="22" rx="1" fill="#1a0b2e" />
        </symbol>

        <symbol id="bd" viewBox="0 0 60 40">
          <ellipse cx="30" cy="26" rx="27" ry="13" fill="#d98a3d" />
          <path
            d="M12 22q6-8 10 2M26 14q4 8 8 0M40 24q4-8 9 0"
            stroke="#f6cf8c"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="30" cy="12" r="6" fill="#f6cf8c" />
          <circle cx="18" cy="30" r="1.4" fill="#fff" />
          <circle cx="42" cy="31" r="1.4" fill="#fff" />
        </symbol>
      </defs>
    </svg>
  );
}
