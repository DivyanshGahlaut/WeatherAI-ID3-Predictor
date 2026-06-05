import { useState, useEffect, useCallback } from "react";

// ─── ID3 Decision Tree Implementation ────────────────────────────────────────
function entropy(data, attr) {
  const counts = {};
  data.forEach(d => { counts[d[attr]] = (counts[d[attr]] || 0) + 1; });
  return Object.values(counts).reduce((e, c) => {
    const p = c / data.length;
    return e - p * Math.log2(p);
  }, 0);
}

function infoGain(data, splitAttr, targetAttr) {
  const baseE = entropy(data, targetAttr);
  const vals = [...new Set(data.map(d => d[splitAttr]))];
  const weightedE = vals.reduce((acc, v) => {
    const subset = data.filter(d => d[splitAttr] === v);
    return acc + (subset.length / data.length) * entropy(subset, targetAttr);
  }, 0);
  return baseE - weightedE;
}

function buildTree(data, features, target, depth = 0) {
  if (!data.length || depth > 4) return null;
  const labels = data.map(d => d[target]);
  const counts = {};
  labels.forEach(l => { counts[l] = (counts[l] || 0) + 1; });
  const majorityLabel = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  if (Object.keys(counts).length === 1 || !features.length) return { leaf: true, label: majorityLabel, counts };
  const gains = features.map(f => ({ f, g: infoGain(data, f, target) }));
  const best = gains.sort((a, b) => b.g - a.g)[0].f;
  const vals = [...new Set(data.map(d => d[best]))];
  const branches = {};
  vals.forEach(v => {
    const subset = data.filter(d => d[best] === v);
    branches[v] = buildTree(subset, features.filter(f => f !== best), target, depth + 1);
  });
  return { feature: best, branches, majority: majorityLabel, counts };
}

function predictTree(tree, sample) {
  if (!tree || tree.leaf) return tree ? tree.label : "Unknown";
  const val = sample[tree.feature];
  if (val !== undefined && tree.branches[val]) return predictTree(tree.branches[val], sample);
  return tree.majority;
}

// Training data for weather prediction
const TRAINING_DATA = [
  { temp: "hot", humidity: "high", wind: "weak", pressure: "high", condition: "Sunny" },
  { temp: "hot", humidity: "high", wind: "strong", pressure: "high", condition: "Cloudy" },
  { temp: "mild", humidity: "high", wind: "weak", pressure: "low", condition: "Rainy" },
  { temp: "cool", humidity: "normal", wind: "weak", pressure: "normal", condition: "Sunny" },
  { temp: "cool", humidity: "normal", wind: "strong", pressure: "low", condition: "Cloudy" },
  { temp: "cool", humidity: "high", wind: "weak", pressure: "low", condition: "Rainy" },
  { temp: "mild", humidity: "normal", wind: "strong", pressure: "normal", condition: "Cloudy" },
  { temp: "hot", humidity: "normal", wind: "weak", pressure: "high", condition: "Sunny" },
  { temp: "hot", humidity: "normal", wind: "strong", pressure: "high", condition: "Sunny" },
  { temp: "mild", humidity: "high", wind: "strong", pressure: "low", condition: "Rainy" },
  { temp: "cool", humidity: "high", wind: "strong", pressure: "low", condition: "Rainy" },
  { temp: "mild", humidity: "normal", wind: "weak", pressure: "high", condition: "Sunny" },
  { temp: "hot", humidity: "high", wind: "strong", pressure: "low", condition: "Rainy" },
  { temp: "mild", humidity: "high", wind: "weak", pressure: "normal", condition: "Cloudy" },
  { temp: "mild", humidity: "normal", wind: "strong", pressure: "high", condition: "Sunny" },
  { temp: "cool", humidity: "normal", wind: "weak", pressure: "high", condition: "Sunny" },
  { temp: "hot", humidity: "normal", wind: "weak", pressure: "low", condition: "Cloudy" },
  { temp: "mild", humidity: "high", wind: "strong", pressure: "high", condition: "Cloudy" },
  { temp: "cool", humidity: "high", wind: "weak", pressure: "normal", condition: "Rainy" },
  { temp: "mild", humidity: "normal", wind: "weak", pressure: "normal", condition: "Sunny" },
  { temp: "hot", humidity: "high", wind: "weak", pressure: "normal", condition: "Cloudy" },
  { temp: "cool", humidity: "normal", wind: "strong", pressure: "high", condition: "Sunny" },
  { temp: "mild", humidity: "high", wind: "weak", pressure: "low", condition: "Rainy" },
  { temp: "hot", humidity: "normal", wind: "strong", pressure: "low", condition: "Cloudy" },
  { temp: "cool", humidity: "high", wind: "strong", pressure: "normal", condition: "Rainy" },
  { temp: "mild", humidity: "normal", wind: "weak", pressure: "low", condition: "Cloudy" },
  { temp: "cool", humidity: "normal", wind: "weak", pressure: "normal", condition: "Sunny" },
  { temp: "hot", humidity: "high", wind: "strong", pressure: "normal", condition: "Rainy" },
];

const FEATURES = ["temp", "humidity", "wind", "pressure"];
const decisionTree = buildTree(TRAINING_DATA, FEATURES, "condition");

function getWeatherCategory(temp, humidity, windSpeed, pressure) {
  const t = temp > 30 ? "hot" : temp > 20 ? "mild" : "cool";
  const h = humidity > 65 ? "high" : "normal";
  const w = windSpeed > 20 ? "strong" : "weak";
  const p = pressure > 1013 ? "high" : pressure > 1005 ? "normal" : "low";
  return { temp: t, humidity: h, wind: w, pressure: p };
}

function getProbabilities(tree, sample) {
  function collectCounts(node, sample) {
    if (!node) return {};
    if (node.leaf) return node.counts;
    const val = sample[node.feature];
    if (val !== undefined && node.branches[val]) return collectCounts(node.branches[val], sample);
    return node.counts;
  }
  const counts = collectCounts(tree, sample);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (!total) return { Sunny: 0.33, Cloudy: 0.33, Rainy: 0.34 };
  return {
    Sunny: Math.round(((counts.Sunny || 0) / total) * 100),
    Cloudy: Math.round(((counts.Cloudy || 0) / total) * 100),
    Rainy: Math.round(((counts.Rainy || 0) / total) * 100),
  };
}

// ─── API CONFIG ───────────────────────────────────────────────────────────────
const API_KEY = "bd5e378503939ddaee76f12ad7a97608";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const WeatherIcon = ({ condition, size = 48 }) => {
  const icons = {
    Clear: <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="10" fill="#F59E0B" />
      {[0,45,90,135,180,225,270,315].map((a, i) => (
        <line key={i} x1={24 + 14 * Math.cos(a * Math.PI/180)} y1={24 + 14 * Math.sin(a * Math.PI/180)}
          x2={24 + 20 * Math.cos(a * Math.PI/180)} y2={24 + 20 * Math.sin(a * Math.PI/180)}
          stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      ))}
    </svg>,
    Clouds: <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="20" cy="26" r="8" fill="#94A3B8" />
      <circle cx="28" cy="28" r="7" fill="#94A3B8" />
      <circle cx="24" cy="22" r="7" fill="#CBD5E1" />
      <circle cx="30" cy="23" r="6" fill="#CBD5E1" />
      <rect x="13" y="26" width="22" height="9" rx="2" fill="#94A3B8" />
    </svg>,
    Rain: <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="20" cy="20" r="7" fill="#64748B" />
      <circle cx="28" cy="22" r="6" fill="#64748B" />
      <circle cx="24" cy="17" r="6" fill="#94A3B8" />
      <rect x="14" y="20" width="20" height="8" rx="2" fill="#64748B" />
      {[[17,34],[22,38],[27,34],[32,38]].map(([x,y],i) => (
        <line key={i} x1={x} y1={y-4} x2={x-2} y2={y} stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
      ))}
    </svg>,
    Snow: <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="20" cy="20" r="7" fill="#94A3B8" />
      <circle cx="28" cy="22" r="6" fill="#94A3B8" />
      <rect x="14" y="20" width="20" height="8" rx="2" fill="#94A3B8" />
      {[[17,35],[22,39],[27,35],[32,39]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="#BFDBFE" />
      ))}
    </svg>,
    Thunderstorm: <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="20" cy="18" r="7" fill="#4B5563" />
      <circle cx="28" cy="20" r="6" fill="#4B5563" />
      <rect x="14" y="18" width="20" height="8" rx="2" fill="#374151" />
      <path d="M26 28L21 36H25L20 44L29 32H25L28 28Z" fill="#FDE68A" />
    </svg>,
    Drizzle: <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="20" cy="20" r="7" fill="#94A3B8" />
      <circle cx="28" cy="22" r="6" fill="#94A3B8" />
      <rect x="14" y="20" width="20" height="8" rx="2" fill="#94A3B8" />
      {[[17,34],[22,37],[27,34],[32,37],[19,39],[25,39]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="1.5" fill="#93C5FD" />
      ))}
    </svg>,
    Mist: <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {[14,18,22,26,30].map((y,i) => (
        <line key={i} x1="8" y1={y} x2="40" y2={y} stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" opacity={0.5+i*0.1}/>
      ))}
    </svg>,
  };
  const key = Object.keys(icons).find(k => condition?.includes(k)) || "Clear";
  return icons[key] || icons.Clear;
};

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" opacity="0.8"/>
  </svg>
);

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
    {[0,45,90,135,180,225,270,315].map((a,i)=>(
      <line key={i} x1={12+8*Math.cos(a*Math.PI/180)} y1={12+8*Math.sin(a*Math.PI/180)}
        x2={12+11*Math.cos(a*Math.PI/180)} y2={12+11*Math.sin(a*Math.PI/180)}
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    ))}
  </svg>
);

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────
const kelvinToCelsius = k => Math.round(k - 273.15);
const kelvinToFahrenheit = k => Math.round((k - 273.15) * 9/5 + 32);
const mpsToKmh = s => Math.round(s * 3.6);
const metersToMiles = m => (m / 1609.34).toFixed(1);
const formatTime = ts => new Date(ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const getDay = offset => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function WeatherDashboard() {
  const [dark, setDark] = useState(true);
  const [unit, setUnit] = useState("C");
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("Delhi");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [time, setTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("today");
  const [aiInsight, setAiInsight] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const toTemp = k => unit === "C" ? kelvinToCelsius(k) : kelvinToFahrenheit(k);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchWeather = useCallback(async (q) => {
    setLoading(true);
    setError(null);
    try {
      const [wRes, fRes] = await Promise.all([
        fetch(`${BASE_URL}/weather?q=${q}&appid=${API_KEY}`),
        fetch(`${BASE_URL}/forecast?q=${q}&appid=${API_KEY}`)
      ]);
      if (!wRes.ok) throw new Error("City not found");
      const [w, f] = await Promise.all([wRes.json(), fRes.json()]);
      setCurrent(w);
      setCity(w.name);

      // Hourly (next 24h)
      setHourly(f.list.slice(0, 8));

      // Daily forecast (group by day)
      const days = {};
      f.list.forEach(item => {
        const d = new Date(item.dt * 1000).toDateString();
        if (!days[d]) days[d] = [];
        days[d].push(item);
      });
      const dailyArr = Object.values(days).slice(0, 6).map(items => ({
        dt: items[0].dt,
        tempMax: Math.max(...items.map(i => i.main.temp_max)),
        tempMin: Math.min(...items.map(i => i.main.temp_min)),
        weather: items[Math.floor(items.length/2)].weather[0],
        humidity: Math.round(items.reduce((a,i)=>a+i.main.humidity,0)/items.length),
      }));
      setForecast(dailyArr);

      // ID3 Prediction for tomorrow
      const sample = getWeatherCategory(
        kelvinToCelsius(w.main.temp),
        w.main.humidity,
        mpsToKmh(w.wind.speed),
        w.main.pressure
      );
      const probs = getProbabilities(decisionTree, sample);
      const dom = predictTree(decisionTree, sample);
      setPrediction({ ...probs, dominant: dom, sample });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByGeo = useCallback(() => {
    if (!navigator.geolocation) { fetchWeather("Delhi"); return; }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const r = await fetch(`${BASE_URL}/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${API_KEY}`);
          const d = await r.json();
          fetchWeather(d.name);
        } catch { fetchWeather("Delhi"); }
      },
      () => fetchWeather("Delhi"),
      { timeout: 6000 }
    );
  }, [fetchWeather]);

  useEffect(() => { fetchByGeo(); }, [fetchByGeo]);

  useEffect(() => {
    if (!current) return;
    const interval = setInterval(() => fetchWeather(city), 600000);
    return () => clearInterval(interval);
  }, [current, city, fetchWeather]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { fetchWeather(search.trim()); setSearch(""); }
  };

  const getAIInsight = async () => {
    if (!current || aiLoading) return;
    setAiLoading(true);
    setShowAI(true);
    setAiInsight("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a friendly weather assistant. Give a short, engaging 3-4 sentence weather insight for: ${current.name}, ${current.sys.country}. Current conditions: ${Math.round(kelvinToCelsius(current.main.temp))}°C, ${current.weather[0].description}, humidity ${current.main.humidity}%, wind ${mpsToKmh(current.wind.speed)} km/h. Tomorrow prediction: ${prediction?.dominant} (${prediction?.Sunny}% sunny, ${prediction?.Cloudy}% cloudy, ${prediction?.Rainy}% rainy). Include a practical tip. Keep it warm and conversational.`
          }]
        })
      });
      const data = await res.json();
      setAiInsight(data.content?.[0]?.text || "Unable to generate insight.");
    } catch {
      setAiInsight("Could not load AI insight at this time.");
    }
    setAiLoading(false);
  };

  const bg = dark
    ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)"
    : "linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #dbeafe 100%)";

  const card = dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.75)";
  const cardBorder = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";
  const text = dark ? "#f8fafc" : "#1e293b";
  const muted = dark ? "#94a3b8" : "#64748b";
  const accent = "#6366f1";

  const condGrad = {
    Sunny: "linear-gradient(135deg, #f59e0b, #ef4444)",
    Cloudy: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    Rainy: "linear-gradient(135deg, #3b82f6, #06b6d4)",
  };

  if (loading) return (
    <div style={{ minHeight: 600, background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <div style={{ width: 64, height: 64, border: "3px solid rgba(99,102,241,0.3)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <p style={{ color: "#94a3b8", fontSize: 15 }}>Loading weather data…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Inter', sans-serif", padding: "20px 16px", boxSizing: "border-box" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes shimmer { 0%{opacity:0.6} 50%{opacity:1} 100%{opacity:0.6} }
        .card-hover:hover { transform: translateY(-2px); transition: transform 0.2s; }
        .btn-glow:hover { box-shadow: 0 0 20px rgba(99,102,241,0.4); }
        .tab-btn { background:none; border:none; cursor:pointer; padding:8px 18px; border-radius:20px; font-size:13px; font-weight:500; transition:all 0.2s; }
        .search-input:focus { outline:none; border-color:#6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        input { font-family: inherit; }
        .prob-bar { transition: width 0.8s cubic-bezier(0.34,1.56,0.64,1); }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, animation: "fadeUp 0.5s ease" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: text }}>
            ⛅ WeatherAI
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: muted, marginTop: 2 }}>
            {DAYS[time.getDay()]}, {time.getDate()} {MONTHS[time.getMonth()]} · ID3 Predictions
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

      {/* Search */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 20, animation: "fadeUp 0.5s ease 0.1s both" }}>
        <input
          className="search-input"
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search any city…"
          style={{ flex: 1, padding: "10px 16px", borderRadius: 24, border: `1px solid ${cardBorder}`, background: card, color: text, fontSize: 14, backdropFilter: "blur(10px)" }}
        />
        <button type="submit" style={{ padding: "10px 20px", borderRadius: 24, border: "none", background: accent, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }} className="btn-glow">
          Search
        </button>
        <button type="button" onClick={fetchByGeo} title="Use my location" style={{ padding: "10px 14px", borderRadius: 24, border: `1px solid ${cardBorder}`, background: card, color: text, cursor: "pointer", fontSize: 16 }}>
          📍
        </button>
      </form>

      {error && <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "10px 16px", color: "#f87171", fontSize: 14, marginBottom: 16, animation: "fadeUp 0.3s ease" }}>⚠ {error}</div>}

      {current && (
        <>
          {/* Main Current Weather Card */}
          <div style={{ background: card, backdropFilter: "blur(20px)", border: `1px solid ${cardBorder}`, borderRadius: 20, padding: "24px", marginBottom: 16, animation: "fadeUp 0.5s ease 0.15s both" }}>
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

            {/* Stats Grid */}
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

          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16, background: card, backdropFilter: "blur(10px)", border: `1px solid ${cardBorder}`, borderRadius: 24, padding: 4, width: "fit-content", animation: "fadeUp 0.5s ease 0.2s both" }}>
            {["today", "forecast", "prediction"].map(tab => (
              <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)}
                style={{ background: activeTab === tab ? accent : "transparent", color: activeTab === tab ? "#fff" : muted }}>
                {tab === "today" ? "⏱ Hourly" : tab === "forecast" ? "📅 7-Day" : "🤖 AI Predict"}
              </button>
            ))}
          </div>

          {/* Hourly Tab */}
          {activeTab === "today" && (
            <div style={{ background: card, backdropFilter: "blur(20px)", border: `1px solid ${cardBorder}`, borderRadius: 20, padding: "20px", marginBottom: 16, animation: "fadeUp 0.4s ease" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Next 24 Hours
              </h3>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                {hourly.map((h, i) => {
                  const hr = new Date(h.dt * 1000);
                  const isNow = i === 0;
                  return (
                    <div key={h.dt} className="card-hover" style={{
                      minWidth: 78, background: isNow ? accent : (dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"),
                      borderRadius: 16, padding: "14px 8px", textAlign: "center", flexShrink: 0,
                      border: isNow ? "none" : `1px solid ${cardBorder}`
                    }}>
                      <div style={{ fontSize: 11, color: isNow ? "rgba(255,255,255,0.8)" : muted, marginBottom: 8, fontWeight: 500 }}>
                        {isNow ? "Now" : hr.getHours().toString().padStart(2,"0") + ":00"}
                      </div>
                      <WeatherIcon condition={h.weather[0]?.main} size={28} />
                      <div style={{ fontSize: 15, fontWeight: 600, color: isNow ? "#fff" : text, marginTop: 8 }}>
                        {toTemp(h.main.temp)}°
                      </div>
                      <div style={{ fontSize: 11, color: isNow ? "rgba(255,255,255,0.7)" : muted, marginTop: 4 }}>
                        💧{h.main.humidity}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Forecast Tab */}
          {activeTab === "forecast" && (
            <div style={{ background: card, backdropFilter: "blur(20px)", border: `1px solid ${cardBorder}`, borderRadius: 20, padding: "20px", marginBottom: 16, animation: "fadeUp 0.4s ease" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                6-Day Forecast
              </h3>
              {forecast.map((d, i) => (
                <div key={d.dt} className="card-hover" style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 0", borderBottom: i < forecast.length-1 ? `1px solid ${cardBorder}` : "none"
                }}>
                  <div style={{ width: 110, fontSize: 14, fontWeight: 500, color: i === 0 ? accent : text }}>
                    {i === 0 ? "Today" : i === 1 ? "Tomorrow" : getDay(i)}
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
          )}

          {/* Prediction Tab */}
          {activeTab === "prediction" && prediction && (
            <div style={{ marginBottom: 16, animation: "fadeUp 0.4s ease" }}>
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

                {/* Probability Bars */}
                {[
                  { label: "☀ Sunny", val: prediction.Sunny, color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
                  { label: "☁ Cloudy", val: prediction.Cloudy, color: "#8b5cf6", bg: "rgba(139,92,246,0.15)" },
                  { label: "🌧 Rainy", val: prediction.Rainy, color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
                ].map(({ label, val, color, bg: pbg }) => (
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

                {/* Feature Inputs Used */}
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

              {/* AI Insight Panel */}
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
                        {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: accent, animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                        <span style={{ fontSize: 13, color: muted }}>Generating personalized insight…</span>
                      </div>
                    ) : (
                      <p style={{ margin: 0, fontSize: 14, color: text, lineHeight: 1.7 }}>{aiInsight}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Quick Stats */}
          {activeTab === "today" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: 16, animation: "fadeUp 0.5s ease 0.3s both" }}>
              {[
                { label: "UV Index", val: "Moderate", icon: "☀", color: "#f59e0b" },
                { label: "Air Quality", val: "Good", icon: "🌿", color: "#22c55e" },
                { label: "Dew Point", val: `${Math.round(kelvinToCelsius(current.main.temp) - ((100 - current.main.humidity) / 5))}°${unit}`, icon: "💦", color: "#3b82f6" },
                { label: "Wind Dir", val: `${current.wind.deg || 0}°`, icon: "🧭", color: "#8b5cf6" },
              ].map(({ label, val, icon, color }) => (
                <div key={label} className="card-hover" style={{ background: card, backdropFilter: "blur(10px)", border: `1px solid ${cardBorder}`, borderRadius: 16, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 700, color }}>{val}</p>
                    </div>
                    <span style={{ fontSize: 22 }}>{icon}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
