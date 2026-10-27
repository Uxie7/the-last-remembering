export default function Candle({ glow = 50 }) {
  return (
    <svg className="cd" viewBox="0 0 24 70">
      <circle
        cx="12"
        cy="16"
        r={10 + glow / 4}
        fill="url(#gl)"
        opacity={0.4 + glow / 160}
      />
      <path
        className="fm"
        d="M12 4c6 7 6 12 0 17-6-5-6-10 0-17z"
        fill="#ffc94d"
        opacity={0.45 + glow / 180}
      />
      <path d="M12 11c3 4 3 7 0 9-3-2-3-5 0-9z" fill="#fff" />
      <rect x="7" y="22" width="10" height="46" rx="3" fill="#fff3dc" />
    </svg>
  );
}
