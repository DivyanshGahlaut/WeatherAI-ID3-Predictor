import { useState } from "react";
import { generateLocalWeatherInsight } from "../utils/weatherUtils";
import TreeVisualization from "./TreeVisualization";

/**
 * IntelligencePanel Component
 * 
 * Consolidates all predictive model results, machine learning structures,
 * outdoor scores, and localized insights (both local and optional Claude AI).
 */
export default function IntelligencePanel({
  prediction,
  outdoorScore,
  recommendation,
  tree,
  current,
  dark,
  text,
  muted,
  accent,
  card,
  cardBorder,
  condGrad,
  trainedOnHistorical = false,
  hasApiKey = false,
  aiLoading = false,
  aiInsight = "",
  showAI = false,
  getAIInsight = () => {}
}) {
  const [activeTab, setActiveTab] = useState("prediction");

  if (!prediction) return null;

  const localInsight = generateLocalWeatherInsight(current, prediction, outdoorScore);

  return (
    <div style={{
      background: card,
      backdropFilter: "blur(20px)",
      border: `1px solid ${cardBorder}`,
      borderRadius: 24,
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: 20,
      animation: "fadeUp 0.5s ease"
    }}>
      {/* Panel Header */}
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: text, display: "flex", alignItems: "center", gap: 8 }}>
          ✨ Weather Intelligence Hub
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: muted }}>
          ID3 Decision Tree & Predictive Insights
        </p>
      </div>

      {/* 1. Intelligence Insight */}
      <div style={{
        background: dark ? "rgba(99, 102, 241, 0.08)" : "rgba(99, 102, 241, 0.04)",
        border: `1px solid ${dark ? "rgba(99, 102, 241, 0.25)" : "rgba(99, 102, 241, 0.15)"}`,
        borderRadius: 16,
        padding: "16px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 4,
          height: "100%",
          background: `linear-gradient(to bottom, ${accent}, #8b5cf6)`
        }} />
        <h4 style={{ margin: "0 0 6px 6px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: accent }}>
          🧠 Intelligence Insight
        </h4>
        <p style={{ margin: "0 0 0 6px", fontSize: 13, color: text, lineHeight: 1.6, fontWeight: 500 }}>
          {localInsight}
        </p>
      </div>

      {/* 2. Outdoor Activity Score */}
      <div style={{
        background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        border: `1px solid ${cardBorder}`,
        borderRadius: 16,
        padding: "16px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: text, display: "flex", alignItems: "center", gap: 6 }}>
            🏃 Outdoor Activity Score
          </h4>
          <span style={{
            fontSize: 18,
            fontWeight: 800,
            color: outdoorScore > 75 ? "#22c55e" : outdoorScore > 45 ? "#f59e0b" : "#ef4444"
          }}>
            {outdoorScore}/100
          </span>
        </div>
        <div style={{ height: 8, background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
          <div style={{
            height: "100%",
            width: `${outdoorScore}%`,
            background: outdoorScore > 75 ? "#22c55e" : outdoorScore > 45 ? "#f59e0b" : "#ef4444",
            borderRadius: 4,
            transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)"
          }} />
        </div>
        <p style={{ margin: 0, fontSize: 12, color: muted, lineHeight: 1.5 }}>
          {recommendation}
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: cardBorder }} />

      {/* 3. Predictive Analytics (Tabs) */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 6, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", borderRadius: 24, padding: 4 }}>
            {["prediction", "tree"].map(tab => (
              <button
                key={tab}
                className="tab-btn"
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? accent : "transparent",
                  color: activeTab === tab ? "#fff" : muted,
                  border: "none",
                  borderRadius: 20,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {tab === "prediction" ? "🤖 AI Predict" : "🌳 ML Structure"}
              </button>
            ))}
          </div>

          <span style={{
            fontSize: 10,
            background: trainedOnHistorical
              ? "rgba(34, 197, 94, 0.15)"
              : "rgba(245, 158, 11, 0.15)",
            color: trainedOnHistorical ? "#4ade80" : "#fbbf24",
            padding: "4px 8px",
            borderRadius: 12,
            fontWeight: 600,
            border: `1px solid ${trainedOnHistorical ? "rgba(34, 197, 94, 0.2)" : "rgba(245, 158, 11, 0.2)"}`
          }}>
            {trainedOnHistorical ? "● 90-Day Local Data" : "● Nagpur Historical Data"}
          </span>
        </div>

        {activeTab === "prediction" ? (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: text, fontWeight: 600 }}>Google-Grade Hybrid Prediction:</span>
              <div style={{
                background: condGrad[prediction.dominant] || accent,
                padding: "6px 14px",
                borderRadius: 16,
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}>
                {prediction.dominant === "Sunny" ? "☀" : prediction.dominant === "Rainy" ? "🌧" : "☁"} {prediction.dominant}
              </div>
            </div>

            {/* Probability Bars */}
            {[
              { label: "☀ Sunny", val: prediction.Sunny, color: "#f59e0b" },
              { label: "☁ Cloudy", val: prediction.Cloudy, color: "#8b5cf6" },
              { label: "🌧 Rainy", val: prediction.Rainy, color: "#3b82f6" },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: text }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>{val}%</span>
                </div>
                <div style={{ height: 8, background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", borderRadius: 10, overflow: "hidden" }}>
                  <div className="prob-bar" style={{
                    height: "100%",
                    width: `${val}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}88)`,
                    borderRadius: 10,
                    transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)"
                  }} />
                </div>
              </div>
            ))}

            {/* Explainer card */}
            <div style={{
              background: dark ? "rgba(99, 102, 241, 0.08)" : "rgba(99, 102, 241, 0.04)",
              border: `1px dashed ${dark ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.15)"}`,
              borderRadius: 12,
              padding: "10px 12px",
              fontSize: 11,
              color: muted,
              lineHeight: 1.4,
              marginTop: 16,
              marginBottom: 16
            }}>
              ℹ️ <strong>Ensembled Forecast:</strong> Combines local ID3 Decision Tree statistical transition patterns (30% weight) with live professional Numerical Weather Prediction (NWP) model outputs (70% weight) to achieve Google-grade accuracy.
            </div>

            {/* Sub-models comparison */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 16
            }}>
              {/* ID3 Decision Tree Sub-model */}
              <div style={{
                background: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                border: `1px solid ${cardBorder}`,
                borderRadius: 16,
                padding: "12px",
              }}>
                <h5 style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: accent }}>
                  🌳 Local ID3 Tree (30%)
                </h5>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: muted }}>Outlook:</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: text }}>{prediction.id3?.dominant}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {["Sunny", "Cloudy", "Rainy"].map(cond => (
                    <div key={cond} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: muted }}>
                      <span>{cond === "Sunny" ? "☀" : cond === "Rainy" ? "🌧" : "☁"} {cond}</span>
                      <span style={{ fontWeight: 600 }}>{prediction.id3?.[cond] || 0}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* OWM Forecast Sub-model */}
              <div style={{
                background: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                border: `1px solid ${cardBorder}`,
                borderRadius: 16,
                padding: "12px",
              }}>
                <h5 style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#3b82f6" }}>
                  🌐 NWP Forecast (70%)
                </h5>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: muted }}>Outlook:</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: text }}>{prediction.forecast?.dominant}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {["Sunny", "Cloudy", "Rainy"].map(cond => (
                    <div key={cond} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: muted }}>
                      <span>{cond === "Sunny" ? "☀" : cond === "Rainy" ? "🌧" : "☁"} {cond}</span>
                      <span style={{ fontWeight: 600 }}>{prediction.forecast?.[cond] || 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature categorization matrix header */}
            <div style={{ fontSize: 10, fontWeight: 700, color: muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Today's Discretized Input Features
            </div>

            {/* Feature categorization matrix */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
              padding: "12px",
              background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              borderRadius: 12
            }}>
              {Object.entries(prediction.sample).map(([k, v]) => (
                <div key={k} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: muted, marginBottom: 3, textTransform: "capitalize" }}>{k}</div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: accent,
                    background: dark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)",
                    padding: "3px 6px",
                    borderRadius: 8,
                    textTransform: "capitalize"
                  }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ animation: "fadeUp 0.3s ease", maxHeight: "350px", overflowY: "auto", paddingRight: 4 }}>
            <TreeVisualization
              tree={tree}
              text={text}
              muted={muted}
              accent={accent}
              card="transparent"
              cardBorder="transparent"
            />
          </div>
        )}
      </div>

      {/* 4. Claude AI Insight (Only visible when hasApiKey is true) */}
      {hasApiKey && (
        <>
          <div style={{ height: 1, background: cardBorder }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: text, display: "flex", alignItems: "center", gap: 6 }}>
                  ✨ Claude AI Insight
                </h4>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: muted }}>
                  Retrieve weather analysis from Claude
                </p>
              </div>
              <button
                onClick={getAIInsight}
                disabled={aiLoading}
                className="btn-glow"
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: `1px solid ${accent}`,
                  background: aiLoading ? "transparent" : accent,
                  color: aiLoading ? accent : "#fff",
                  cursor: aiLoading ? "default" : "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.2s"
                }}
              >
                {aiLoading ? "Thinking..." : "Get Insight"}
              </button>
            </div>
            
            {showAI && (
              <div style={{
                background: dark ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.05)",
                border: `1px solid ${dark ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.1)"}`,
                borderRadius: 12,
                padding: "12px 14px",
                animation: "fadeUp 0.3s ease"
              }}>
                {aiLoading ? (
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: accent,
                        animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
                      }} />
                    ))}
                    <span style={{ fontSize: 12, color: muted }}>Analyzing weather data...</span>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: 13, color: text, lineHeight: 1.6 }}>
                    {aiInsight}
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
