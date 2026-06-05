import { WeatherIcon } from "./Icons";
import { getDayLabel } from "../utils/dateUtils";

export default function Forecast({ forecast, toTemp, accent, text, muted, cardBorder, card }) {
  return (
    <div style={{ background: card, backdropFilter: "blur(20px)", border: `1px solid ${cardBorder}`, borderRadius: 20, padding: "20px", marginBottom: 16 }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        6-Day Forecast
      </h3>
      {forecast.map((d, i) => (
        <div key={d.dt} className="card-hover" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 0", borderBottom: i < forecast.length - 1 ? `1px solid ${cardBorder}` : "none"
        }}>
          <div style={{ width: 110, fontSize: 14, fontWeight: 500, color: i === 0 ? accent : text }}>
            {i === 0 ? "Today" : i === 1 ? "Tomorrow" : getDayLabel(i)}
          </div>
          <WeatherIcon condition={d.weather.main} size={32} />
          <div style={{ fontSize: 12, color: muted, width: 70, textAlign: "center", textTransform: "capitalize" }}>
            {d.weather.description}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b" }}>{toTemp(d.tempMax)}°</span>
            <span style={{ fontSize: 12, color: muted }}>{toTemp(d.tempMin)}°</span>
          </div>
          <div style={{ fontSize: 12, color: muted }}>💧{d.humidity}%</div>
        </div>
      ))}
    </div>
  );
}
