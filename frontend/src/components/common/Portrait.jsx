const ARCH_PATH = "M10 190V70C10 30 40 6 70 6s60 24 60 64v120z";

export default function Portrait({ person, width = 120 }) {
  const clipId = `clip-${person.id}`;
  const gradId = `grad-${person.id}`;

  const marigoldBorder = [
    [-4, 62],
    [2, 34],
    [22, 10],
    [52, -4],
    [82, -4],
    [108, 10],
    [128, 34],
    [134, 62],
  ].map(([x, y], idx) => (
    <use key={idx} href="#mg" x={x} y={y} width="28" height="28" />
  ));

  return (
    <svg
      viewBox="-10 -14 160 214"
      width={width}
      style={{ overflow: "visible", display: "inline-block" }}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={ARCH_PATH} />
        </clipPath>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={person.c} />
          <stop offset="1" stopColor="#2a1048" />
        </linearGradient>
      </defs>

      <path d={ARCH_PATH} fill={`url(#${gradId})`} />

      {person.img ? (
        <image
          href={person.img}
          x="10"
          y="6"
          width="120"
          height="184"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      ) : (
        <g clipPath={`url(#${clipId})`}>
          <circle cx="70" cy="88" r="25" fill="#fff4de" opacity="0.92" />
          <path
            d="M22 190c0-36 22-54 48-54s48 18 48 54z"
            fill="#fff4de"
            opacity="0.92"
          />
        </g>
      )}

      <path
        d={ARCH_PATH}
        fill="none"
        stroke="#ffcf5a"
        strokeWidth="5"
      />
      {marigoldBorder}
    </svg>
  );
}
