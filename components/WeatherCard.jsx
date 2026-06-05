import { WeatherIcon } from "./Icons";
import { mpsToKmh, metersToMiles } from "../utils/weatherUtils";
import { formatTime } from "../utils/dateUtils";

export default function WeatherCard({ current, toTemp, dark, text, muted, card, cardBorder }) {
  return (
    <div style={{ background: card, backdropFilter: "blur(20px)", border: `1px solid ${cardBorder}`, borderRadius: 20, padding: "24px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 20 }}>📍</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: text, fontFamily: "'Space Grotesk',sans-serif" }}>
              {current.name}, {current.sys?.country}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginTop: 8 }}>
            <span style={{ fontSize: 72, fontWeight: 300, color: text, lineHeight: 1, fontFamily: "'Space Grotesk',sans-serif" }}>
              {toTemp(current.main.temp)}°
            </span>
            <div style={{ paddingBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 16, color: muted, textTransform: "capitalize" }}>{current.weather[0]?.description}</p>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: muted }}>
                Feels {toTemp(current.main.feels_like)}° · H:{toTemp(current.main.temp_max)}° L:{toTemp(current.main.temp_min)}°
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <WeatherIcon condition={current.weather[0]?.main} size={80} />
          <span style={{ fontSize: 12, color: muted, background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", padding: "3px 10px", borderRadius: 10 }}>
            {current.weather[0]?.main}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 10, marginTop: 20 }}>
        {[
          { icon: "💧", label: "Humidity", val: `${current.main.humidity}%` },
          { icon: "💨", label: "Wind", val: `${mpsToKmh(current.wind.speed)} km/h` },
          { icon: "👁", label: "Visibility", val: `${metersToMiles(current.visibility)} mi` },
          { icon: "🌡", label: "Pressure", val: `${current.main.pressure} hPa` },
          { icon: "🌅", label: "Sunrise", val: formatTime(current.sys.sunrise) },
          { icon: "🌇", label: "Sunset", val: formatTime(current.sys.sunset) },
        ].map(({ icon, label, val }) => (
          <div key={label} className="card-hover" style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", borderRadius: 14, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: text }}>{val}</div>
            <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
