export default function PredictionCard({ prediction, dark, text, muted, accent, card, cardBorder, condGrad }) {
  if (!prediction) return null;

  return (
    <div style={{ background: card, backdropFilter: "blur(20px)", border: `1px solid ${cardBorder}`, borderRadius: 20, padding: "24px", marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: text, fontFamily: "'Space Grotesk',sans-serif" }}>
            🤖 ID3 Decision Tree Prediction
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: muted }}>Tomorrow · Based on current atmospheric conditions</p>
        </div>
        <div style={{
          background: condGrad[prediction.dominant] || accent,
          padding: "8px 18px", borderRadius: 20, fontSize: 13, fontWeight: 700, color: "#fff"
        }}>
          {prediction.dominant === "Sunny" ? "☀" : prediction.dominant === "Rainy" ? "🌧" : "☁"} {prediction.dominant}
        </div>
      </div>

      {[
        { label: "☀ Sunny", val: prediction.Sunny, color: "#f59e0b" },
        { label: "☁ Cloudy", val: prediction.Cloudy, color: "#8b5cf6" },
        { label: "🌧 Rainy", val: prediction.Rainy, color: "#3b82f6" },
      ].map(({ label, val, color }) => (
        <div key={label} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: text }}>{label}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color }}>{val}%</span>
          </div>
          <div style={{ height: 10, background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", borderRadius: 10, overflow: "hidden" }}>
            <div className="prob-bar" style={{ height: "100%", width: `${val}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 10 }} />
          </div>
        </div>
      ))}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 16, padding: "14px", background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderRadius: 12 }}>
        {Object.entries(prediction.sample).map(([k, v]) => (
          <div key={k} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: muted, marginBottom: 3, textTransform: "capitalize" }}>{k}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: accent, background: dark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)", padding: "3px 8px", borderRadius: 8, textTransform: "capitalize" }}>{v}</div>
          </div>
        ))}
      </div>
      <p style={{ margin: "12px 0 0", fontSize: 11, color: muted, lineHeight: 1.5 }}>
        ℹ The ID3 algorithm splits on information gain across temperature, humidity, wind, and pressure features trained on historical patterns.
      </p>
    </div>
  );
}
