export default function Candle({ glow = 50 }) {
  return (
    <svg
      className="cd"
      viewBox="0 0 32 64"
      width="28"
      height="56"
      aria-hidden="true"
      style={{ overflow: "visible", display: "block" }}
    >
      <defs>
        {/* Veladora glass reflection gradient */}
        <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="25%" stopColor="#fef3c7" stopOpacity="0.1" />
          <stop offset="75%" stopColor="#d97706" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
        </linearGradient>
        {/* Wax candle body gradient */}
        <linearGradient id="waxGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffdfa" />
          <stop offset="50%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
      </defs>

      {/* Ambient warm candlelight aura */}
      <circle
        cx="16"
        cy="14"
        r={14 + glow / 5}
        fill="url(#gl)"
        opacity={0.4 + glow / 160}
      />

      {/* Flickering veladora flame */}
      <g className="fm" style={{ transformOrigin: "16px 16px" }}>
        {/* Outer amber flame glow */}
        <path
          d="M16 2c4 5 5 10 0 16-5-6-4-11 0-16z"
          fill="#ff9f1c"
          opacity={0.9}
        />
        {/* Inner bright yellow flame */}
        <path
          d="M16 5c2.5 4 3 7 0 11-3-4-2.5-7 0-11z"
          fill="#ffc94d"
        />
        {/* Pure white hot core */}
        <ellipse cx="16" cy="13.5" rx="1.8" ry="3" fill="#ffffff" />
      </g>

      {/* Burning wick */}
      <line x1="16" y1="15" x2="16" y2="20" stroke="#3d1403" strokeWidth="1.5" strokeLinecap="round" />

      {/* Glass Veladora Tumbler with wax */}
      <rect
        x="6"
        y="20"
        width="20"
        height="38"
        rx="2"
        fill="url(#waxGrad)"
        stroke="#d97706"
        strokeWidth="1"
      />
      {/* Glass reflections */}
      <rect
        x="6"
        y="20"
        width="20"
        height="38"
        rx="2"
        fill="url(#glassGrad)"
      />
      {/* Heavy glass tumbler base rim */}
      <rect x="5" y="56" width="22" height="3" rx="1.5" fill="#92400e" opacity="0.85" />
    </svg>
  );
}
