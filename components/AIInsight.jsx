export default function AIInsight({ showAI, aiLoading, aiInsight, getAIInsight, dark, text, muted, accent, card, cardBorder }) {
  return (
    <div style={{ background: card, backdropFilter: "blur(20px)", border: `1px solid ${cardBorder}`, borderRadius: 20, padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showAI ? 14 : 0 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: text }}>✨ Claude AI Insight</h3>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: muted }}>Personalized weather analysis powered by Claude</p>
        </div>
        <button onClick={getAIInsight} disabled={aiLoading} className="btn-glow"
          style={{ padding: "9px 18px", borderRadius: 20, border: `1px solid ${accent}`, background: aiLoading ? (dark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)") : accent, color: aiLoading ? accent : "#fff", cursor: aiLoading ? "default" : "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          {aiLoading ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Thinking…</> : "Get Insight"}
        </button>
      </div>
      {showAI && (
        <div style={{ background: dark ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.06)", border: `1px solid rgba(99,102,241,0.2)`, borderRadius: 14, padding: "14px 16px" }}>
          {aiLoading ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: accent, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
              <span style={{ fontSize: 13, color: muted }}>Generating personalized insight…</span>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: text, lineHeight: 1.7 }}>{aiInsight}</p>
          )}
        </div>
      )}
    </div>
  );
}
