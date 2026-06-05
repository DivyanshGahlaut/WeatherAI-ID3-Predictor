import { SunIcon, MoonIcon } from "./Icons";

export default function Header({ time, days, months, unit, setUnit, dark, setDark, text, muted, card, cardBorder, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: text }}>
          ⛅ WeatherAI
        </h1>
        <p style={{ margin: 0, fontSize: 12, color: muted, marginTop: 2 }}>
          {days[time.getDay()]}, {time.getDate()} {months[time.getMonth()]} · ID3 Predictions
        </p>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ background: card, border: `1px solid ${cardBorder}`, borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: accent, fontVariantNumeric: "tabular-nums" }}>
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
        </div>
        <button onClick={() => setUnit(u => u === "C" ? "F" : "C")} style={{ background: card, border: `1px solid ${cardBorder}`, borderRadius: 20, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: text }}>
          °{unit}
        </button>
        <button onClick={() => setDark(d => !d)} style={{ background: card, border: `1px solid ${cardBorder}`, borderRadius: 20, padding: "6px 12px", cursor: "pointer", fontSize: 13, color: text, display: "flex", alignItems: "center", gap: 4 }}>
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </div>
  );
}
