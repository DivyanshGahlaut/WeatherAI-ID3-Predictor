export default function OutdoorScoreCard({ score, recommendation, text, muted, card, cardBorder, accent }) {
  return (
    <div style={{ background: card, backdropFilter: "blur(10px)", border: `1px solid ${cardBorder}`, borderRadius: 16, padding: "16px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: text }}>🏃 Outdoor Activity Score</h3>
        <div style={{ fontSize: 24, fontWeight: 800, color: score > 70 ? "#22c55e" : score > 40 ? "#f59e0b" : "#ef4444" }}>
          {score}/100
        </div>
      </div>
      <div style={{ height: 8, background: "rgba(0,0,0,0.05)", borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ height: "100%", width: `${score}%`, background: score > 70 ? "#22c55e" : score > 40 ? "#f59e0b" : "#ef4444", transition: "width 1s ease-out" }} />
      </div>
      <p style={{ margin: 0, fontSize: 13, color: muted, lineHeight: 1.5 }}>{recommendation}</p>
    </div>
  );
}
