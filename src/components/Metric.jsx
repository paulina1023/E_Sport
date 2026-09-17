export default function Metric({ label, value, note, accent }) {
  return (
    <div className="metric">
      <span className={`metric-icon ${accent}`}>↗️</span>
      <span className="metric-label">{label}</span>
      <strong>{value}</strong>
      <small className={accent === "pink" ? "muted" : ""}>{note}</small>
    </div>
  );
}
