const ARCH_PATH = "M10 188V68C10 30 38 6 70 6s60 24 60 62v120z";

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
      viewBox="-12 -14 164 218"
      width={width}
      style={{ overflow: "visible", display: "inline-block" }}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={ARCH_PATH} />
        </clipPath>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={person.c} />
          <stop offset="100%" stopColor="#1e0b36" />
        </linearGradient>
      </defs>

      {/* Frame backing / velvet background */}
      <path d={ARCH_PATH} fill={`url(#${gradId})`} />

      {/* Picture content: uploaded photo or dignified silhouette */}
      {person.img ? (
        <image
          href={person.img}
          x="10"
          y="6"
          width="120"
          height="182"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      ) : (
        <g clipPath={`url(#${clipId})`}>
          <circle cx="70" cy="88" r="25" fill="#fff7e6" opacity="0.94" />
          <path
            d="M22 188c0-36 22-54 48-54s48 18 48 54z"
            fill="#fff7e6"
            opacity="0.94"
          />
        </g>
      )}

      {/* Golden inner highlight border */}
      <path
        d={ARCH_PATH}
        fill="none"
        stroke="#ffd54f"
        strokeWidth="2"
        opacity="0.75"
      />

      {/* Heavy gilded picture frame arch */}
      <path
        d={ARCH_PATH}
        fill="none"
        stroke="#ffcf5a"
        strokeWidth="5"
      />

      {/* Standing plinth/base of the picture frame resting on the shelf */}
      <rect
        x="4"
        y="184"
        width="132"
        height="8"
        rx="2"
        fill="#c9700a"
        stroke="#ffcf5a"
        strokeWidth="2"
      />

      {/* Decorative Cempasúchil (Marigold) arch wreath */}
      {marigoldBorder}
    </svg>
  );
}
