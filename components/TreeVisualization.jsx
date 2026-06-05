export default function TreeVisualization({ tree, text, muted, accent, card, cardBorder }) {
  if (!tree) return null;

  const renderNode = (node, depth = 0) => {
    if (!node) return null;
    if (node.leaf) {
      return (
        <div style={{ padding: "8px 12px", background: "rgba(34, 197, 94, 0.1)", borderRadius: 8, border: "1px solid rgba(34, 197, 94, 0.2)", fontSize: 13, color: "#22c55e" }}>
          Result: <strong>{node.label}</strong>
        </div>
      );
    }

    return (
      <div style={{ marginLeft: depth * 20, borderLeft: `1px dashed ${accent}`, paddingLeft: 12, marginTop: 8 }}>
        <div style={{ padding: "6px 10px", background: "rgba(99, 102, 241, 0.1)", borderRadius: 8, fontSize: 13, color: accent, fontWeight: 600 }}>
          Split on: {node.feature}
        </div>
        <div style={{ marginTop: 6 }}>
          {Object.entries(node.branches).map(([val, child]) => (
            <div key={val} style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: muted }}>if {val} →</span>
              {renderNode(child, depth + 1)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: card, backdropFilter: "blur(20px)", border: `1px solid ${cardBorder}`, borderRadius: 20, padding: "20px", marginBottom: 16 }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: text }}>🌳 ID3 Decision Tree Structure</h3>
      <div style={{ overflowX: "auto" }}>
        {renderNode(tree)}
      </div>
    </div>
  );
}
