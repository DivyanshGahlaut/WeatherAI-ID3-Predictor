import { SunIcon, MoonIcon } from "./Icons";

const InfoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 2 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export default function Header({ time, days, months, unit, setUnit, dark, setDark, text, muted, card, cardBorder, accent, onAboutClick }) {
  return (
    <div className="header-container">
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: text }}>
          ⛅ WeatherAI
        </h1>
        <p style={{ margin: 0, fontSize: 12, color: muted, marginTop: 2 }}>
          {days[time.getDay()]}, {time.getDate()} {months[time.getMonth()]} · ID3 Predictions
        </p>
      </div>
      <div className="header-actions">
        <div style={{ background: card, border: `1px solid ${cardBorder}`, borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: accent, fontVariantNumeric: "tabular-nums" }}>
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
        </div>
        <button onClick={() => setUnit(u => u === "C" ? "F" : "C")} style={{ background: card, border: `1px solid ${cardBorder}`, borderRadius: 20, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: text }}>
          °{unit}
        </button>
        <button onClick={() => setDark(d => !d)} style={{ background: card, border: `1px solid ${cardBorder}`, borderRadius: 20, padding: "6px 12px", cursor: "pointer", fontSize: 13, color: text, display: "flex", alignItems: "center", gap: 4 }}>
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
        <button onClick={onAboutClick} style={{ background: card, border: `1px solid ${cardBorder}`, borderRadius: 20, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontWeight: 500, color: text, display: "flex", alignItems: "center", gap: 4 }}>
          <InfoIcon /> About
        </button>
      </div>
    </div>
  );
}

