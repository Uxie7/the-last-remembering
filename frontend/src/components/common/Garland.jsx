export default function Garland({ className = "" }) {
  const marigolds = [];
  for (let i = 0; i < 30; i++) {
    const z = 66 + ((i * 7) % 5) * 9;
    const x = i * 48 - 20;
    const y = 36 + ((i * 5) % 4) * 10;
    marigolds.push(
      <use key={i} href="#mg" x={x} y={y} width={z} height={z} />
    );
  }

  return (
    <svg
      className={`gar ${className}`}
      viewBox="0 0 1400 150"
      preserveAspectRatio="xMidYMax slice"
    >
      {marigolds}
    </svg>
  );
}
