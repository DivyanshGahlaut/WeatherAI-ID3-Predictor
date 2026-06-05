import { useState, useEffect, useCallback } from "react";

// Services
import { fetchWeatherByCity, fetchForecastByCity, fetchWeatherByCoords } from "./services/openWeatherMap";
import { fetchHistoricalData, fetchAccurateWeatherData } from "./services/openMeteo";

// ML
import { TRAINING_DATA, FEATURES } from "./ml/dataset";
import { buildTree } from "./ml/id3";
import { predictTree, getProbabilities, getForecastProbabilities, getHybridPrediction } from "./ml/prediction";

// Utils
import { 
  kelvinToCelsius, 
  mpsToKmh, 
  getWeatherCategory, 
  calculateOutdoorScore, 
  getRecommendations 
} from "./utils/weatherUtils";
import { DAYS, MONTHS, formatTime } from "./utils/dateUtils";

// Components
import Header from "./components/Header";
import Search from "./components/Search";
import WeatherCard from "./components/WeatherCard";
import Forecast from "./components/Forecast";
import IntelligencePanel from "./components/IntelligencePanel";
import { WeatherIcon } from "./components/Icons";
import { Component as RaycastBackground } from "./components/ui/raycast-animated-background";

const transitionTrainingData = [];
for (let i = 0; i < TRAINING_DATA.length - 1; i++) {
  transitionTrainingData.push({
    ...TRAINING_DATA[i],
    condition: TRAINING_DATA[i + 1].condition
  });
}
const decisionTree = buildTree(transitionTrainingData, FEATURES, "condition");

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
  const [csvFallbackTree, setCsvFallbackTree] = useState(decisionTree);
  const [customTree, setCustomTree] = useState(decisionTree);
  const [trainedOnHistorical, setTrainedOnHistorical] = useState(false);
  const [aiInsight, setAiInsight] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const toTemp = (k) => unit === "C" ? kelvinToCelsius(k) : Math.round((k - 273.15) * 9/5 + 32);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const loadCSVDataset = async () => {
      try {
        const response = await fetch("/historical_weather.csv");
        if (!response.ok) throw new Error("CSV fetch failed");
        const csvText = await response.text();
        
        // Parse CSV
        const lines = csvText.trim().split("\n");
        const headers = lines[0].split(",");
        const parsedData = lines.slice(1)
          .filter(line => line.trim() !== "")
          .map(line => {
            const values = line.split(",");
            return headers.reduce((obj, header, idx) => {
              obj[header.trim()] = (values[idx] || "").trim();
              return obj;
            }, {});
          });
        
        const transitionParsedData = [];
        for (let i = 0; i < parsedData.length - 1; i++) {
          transitionParsedData.push({
            ...parsedData[i],
            condition: parsedData[i + 1].condition
          });
        }
        const csvTree = buildTree(transitionParsedData, FEATURES, "condition", 0, 2);
        setCsvFallbackTree(csvTree);
        setCustomTree(csvTree);
      } catch (err) {
        console.error("Failed to load CSV Nagpur historical dataset, using JS fallback:", err);
      }
    };
    loadCSVDataset();
  }, []);

  const fetchWeather = useCallback(async (q) => {
    setLoading(true);
    setError(null);
    try {
      const [w, f] = await Promise.all([
        fetchWeatherByCity(q),
        fetchForecastByCity(q)
      ]);
      
      // Fetch high-accuracy weather data from Open-Meteo for coordinates
      try {
        const accurateData = await fetchAccurateWeatherData(w.coord.lat, w.coord.lon);
        
        // Override current weather (w) with accurate Open-Meteo data
        if (accurateData.current) {
          const cur = accurateData.current;
          w.main.temp = cur.temperature_2m + 273.15;
          w.main.humidity = cur.relative_humidity_2m;
          w.wind.speed = cur.wind_speed_10m / 3.6; // km/h to m/s
          w.main.pressure = cur.surface_pressure;
          w.main.feels_like = (cur.apparent_temperature !== undefined ? cur.apparent_temperature : cur.temperature_2m) + 273.15;
          
          if (accurateData.daily) {
            w.main.temp_max = (accurateData.daily.temperature_2m_max[0] !== undefined ? accurateData.daily.temperature_2m_max[0] : cur.temperature_2m) + 273.15;
            w.main.temp_min = (accurateData.daily.temperature_2m_min[0] !== undefined ? accurateData.daily.temperature_2m_min[0] : cur.temperature_2m) + 273.15;
            
            if (accurateData.daily.sunrise && accurateData.daily.sunrise[0]) {
              w.sys.sunrise = Math.round(new Date(accurateData.daily.sunrise[0]).getTime() / 1000);
            }
            if (accurateData.daily.sunset && accurateData.daily.sunset[0]) {
              w.sys.sunset = Math.round(new Date(accurateData.daily.sunset[0]).getTime() / 1000);
            }
          }
          
          // Map weather code to text/main condition
          const code = cur.weather_code;
          if (code === 0 || code === 1) {
            w.weather[0].main = "Clear";
            w.weather[0].description = "clear sky";
          } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) {
            w.weather[0].main = "Rain";
            w.weather[0].description = "rain";
          } else {
            w.weather[0].main = "Clouds";
            w.weather[0].description = code === 2 ? "few clouds" : code === 3 ? "broken clouds" : "overcast clouds";
          }
        }
        
        // Override forecast list (f.list) with accurate Open-Meteo hourly data
        if (accurateData.hourly && accurateData.hourly.time) {
          const hourly = accurateData.hourly;
          f.list.forEach(item => {
            const targetMs = item.dt * 1000;
            let bestIdx = 0;
            let minDiff = Infinity;
            for (let i = 0; i < hourly.time.length; i++) {
              const tMs = new Date(hourly.time[i]).getTime();
              const diff = Math.abs(tMs - targetMs);
              if (diff < minDiff) {
                minDiff = diff;
                bestIdx = i;
              }
            }
            
            const tempCelsius = hourly.temperature_2m[bestIdx];
            item.main.temp = tempCelsius + 273.15;
            item.main.temp_max = tempCelsius + 273.15;
            item.main.temp_min = tempCelsius + 273.15;
            item.main.humidity = hourly.relative_humidity_2m[bestIdx];
            item.main.pressure = hourly.surface_pressure[bestIdx];
            item.wind.speed = hourly.wind_speed_10m[bestIdx] / 3.6;
            
            const code = hourly.weather_code[bestIdx];
            if (code === 0 || code === 1) {
              item.weather[0].main = "Clear";
              item.weather[0].description = "clear sky";
            } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) {
              item.weather[0].main = "Rain";
              item.weather[0].description = "rain";
            } else {
              item.weather[0].main = "Clouds";
              item.weather[0].description = "cloudy";
            }
          });
        }
      } catch (err) {
        console.warn("Failed to override with accurate Open-Meteo data:", err);
      }
      
      setCurrent(w);
      setCity(w.name);
      setHourly(f.list.slice(0, 8));

      // Group forecast by day
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
        humidity: Math.round(items.reduce((a, i) => a + i.main.humidity, 0) / items.length),
      }));
      setForecast(dailyArr);

      // ML Prediction
      const sample = getWeatherCategory(
        kelvinToCelsius(w.main.temp),
        w.main.humidity,
        mpsToKmh(w.wind.speed),
        w.main.pressure
      );

      // Fetch historical data and train custom ID3 tree dynamically
      let activeTree = csvFallbackTree;
      try {
        const histData = await fetchHistoricalData(w.coord.lat, w.coord.lon);
        // Build the tree with depth limit 2 to generalize well and output smooth probabilities
        activeTree = buildTree(histData, FEATURES, "condition", 0, 2);
        setCustomTree(activeTree);
        setTrainedOnHistorical(true);
      } catch (histError) {
        console.warn("Failed to train ID3 on historical data, falling back to CSV dataset:", histError);
        setCustomTree(csvFallbackTree);
        setTrainedOnHistorical(false);
      }

      // 1. Get local statistical ID3 predictions
      const id3Probs = getProbabilities(activeTree, sample);
      const id3Dom = predictTree(activeTree, sample);
      const id3Prediction = { ...id3Probs, dominant: id3Dom };

      // 2. Get professional meteorological forecast predictions for tomorrow
      const forecastProbs = getForecastProbabilities(f.list);
      const forecastDom = Object.keys(forecastProbs).reduce((a, b) => forecastProbs[a] > forecastProbs[b] ? a : b);
      const forecastPrediction = { ...forecastProbs, dominant: forecastDom };

      // 3. Ensemble them to get the Hybrid Prediction (weight: 30% ID3, 70% OWM forecast)
      const hybridPrediction = getHybridPrediction(id3Probs, forecastProbs, 0.3);

      setPrediction({
        ...hybridPrediction,
        sample,
        id3: id3Prediction,
        forecast: forecastPrediction
      });

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
          const d = await fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
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

  const hasApiKey = !!import.meta.env.VITE_ANTHROPIC_API_KEY;

  const getAIInsight = async () => {
    if (!current || aiLoading) return;
    setAiLoading(true);
    setShowAI(true);
    setAiInsight("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "dangerouslyAllowBrowser": "true"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-latest",
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { fetchWeather(search.trim()); setSearch(""); }
  };



  const styles = {
    bg: dark ? "linear-gradient(135deg, rgba(15, 23, 42, 0.45) 0%, rgba(30, 27, 75, 0.45) 50%, rgba(15, 23, 42, 0.45) 100%)" : "linear-gradient(135deg, rgba(219, 234, 254, 0.45) 0%, rgba(224, 231, 255, 0.45) 50%, rgba(219, 234, 254, 0.45) 100%)",
    card: dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.75)",
    cardBorder: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)",
    text: dark ? "#f8fafc" : "#1e293b",
    muted: dark ? "#94a3b8" : "#64748b",
    accent: "#6366f1",
    condGrad: {
      Sunny: "linear-gradient(135deg, #f59e0b, #ef4444)",
      Cloudy: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      Rainy: "linear-gradient(135deg, #3b82f6, #06b6d4)",
    }
  };

  if (loading && !current) return (
    <div style={{ minHeight: 600, background: styles.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <div style={{ width: 64, height: 64, border: "3px solid rgba(99,102,241,0.3)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <p style={{ color: "#94a3b8", fontSize: 15 }}>Loading weather data…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const outdoorScore = current ? calculateOutdoorScore(kelvinToCelsius(current.main.temp), current.main.humidity, mpsToKmh(current.wind.speed), current.weather[0].main, prediction) : 0;
  const recommendation = current ? getRecommendations(outdoorScore, current.weather[0].main) : "";

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Inter', sans-serif", boxSizing: "border-box", position: "relative" }}>
      {/* Raycast Animated Background */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
        pointerEvents: "none",
        overflow: "hidden"
      }}>
        <RaycastBackground />
      </div>

      {/* Main Overlay & Content */}
      <div style={{
        position: "relative",
        zIndex: 2,
        minHeight: "100vh",
        background: styles.bg,
        padding: "20px 40px"
      }}>
      {loading && current && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "3px",
          zIndex: 9999,
          overflow: "hidden",
          background: "rgba(99, 102, 241, 0.2)"
        }}>
          <div style={{
            height: "100%",
            background: "#6366f1",
            animation: "loadingBar 1.5s infinite ease-in-out"
          }} />
          <style>{`
            @keyframes loadingBar {
              0% { width: 0%; left: 0%; }
              50% { width: 50%; left: 25%; }
              100% { width: 100%; left: 100%; }
            }
          `}</style>
        </div>
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .card-hover:hover { transform: translateY(-2px); transition: transform 0.2s; }
        .btn-glow:hover { box-shadow: 0 0 20px rgba(99,102,241,0.4); }
        .tab-btn { background:none; border:none; cursor:pointer; padding:8px 18px; border-radius:20px; font-size:13px; font-weight:500; transition:all 0.2s; }
        .search-input:focus { outline:none; border-color:#6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        .prob-bar { transition: width 0.8s cubic-bezier(0.34,1.56,0.64,1); }
        .dashboard-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; max-width: 1600px; margin: 0 auto; }
        @media (max-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ maxWidth: 1600, margin: "0 auto" }}>
        <Header 
          time={time} days={DAYS} months={MONTHS} unit={unit} setUnit={setUnit} 
          dark={dark} setDark={setDark} text={styles.text} muted={styles.muted} 
          card={styles.card} cardBorder={styles.cardBorder} accent={styles.accent} 
        />

        <Search 
          search={search} setSearch={setSearch} handleSearch={handleSearch} 
          fetchByGeo={fetchByGeo} text={styles.text} accent={styles.accent} 
          card={styles.card} cardBorder={styles.cardBorder} loading={loading}
        />

        {error && (
          <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "10px 16px", color: "#f87171", fontSize: 14, marginBottom: 16 }}>
            ⚠ {error}
          </div>
        )}

        {current && (
          <div className="dashboard-grid" style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.3s ease" }}>
            {/* Left Column: Current & Forecast */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <WeatherCard 
                current={current} toTemp={toTemp} dark={dark} text={styles.text} 
                muted={styles.muted} card={styles.card} cardBorder={styles.cardBorder} 
              />
              
              <div style={{ background: styles.card, border: `1px solid ${styles.cardBorder}`, borderRadius: 20, padding: "20px" }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "rgba(0,0,0,0.05)", borderRadius: 24, padding: 4, width: "fit-content" }}>
                  {["today", "forecast"].map(tab => (
                    <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)}
                      style={{ background: activeTab === tab ? styles.accent : "transparent", color: activeTab === tab ? "#fff" : styles.muted }}>
                      {tab === "today" ? "⏱ Hourly" : "📅 6-Day Forecast"}
                    </button>
                  ))}
                </div>

                {activeTab === "today" ? (
                  <div style={{ animation: "fadeUp 0.3s ease" }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: styles.muted, textTransform: "uppercase" }}>Next 24 Hours</h3>
                    <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10 }}>
                      {hourly.map((h, i) => (
                        <div key={h.dt} className="card-hover" style={{
                          minWidth: 78, background: i === 0 ? styles.accent : (dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"),
                          borderRadius: 16, padding: "14px 8px", textAlign: "center", flexShrink: 0,
                          border: i === 0 ? "none" : `1px solid ${styles.cardBorder}`
                        }}>
                          <div style={{ fontSize: 11, color: i === 0 ? "rgba(255,255,255,0.8)" : styles.muted, marginBottom: 8 }}>
                            {i === 0 ? "Now" : formatTime(h.dt)}
                          </div>
                          <WeatherIcon condition={h.weather[0]?.main} size={28} />
                          <div style={{ fontSize: 15, fontWeight: 600, color: i === 0 ? "#fff" : styles.text, marginTop: 8 }}>{toTemp(h.main.temp)}°</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Forecast 
                    forecast={forecast} toTemp={toTemp} accent={styles.accent} 
                    text={styles.text} muted={styles.muted} cardBorder={styles.cardBorder} card="transparent" 
                  />
                )}
              </div>
            </div>

            {/* Right Column: Intelligence Hub */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <IntelligencePanel
                prediction={prediction}
                outdoorScore={outdoorScore}
                recommendation={recommendation}
                tree={customTree}
                current={current}
                dark={dark}
                text={styles.text}
                muted={styles.muted}
                accent={styles.accent}
                card={styles.card}
                cardBorder={styles.cardBorder}
                condGrad={styles.condGrad}
                trainedOnHistorical={trainedOnHistorical}
                hasApiKey={hasApiKey}
                aiLoading={aiLoading}
                aiInsight={aiInsight}
                showAI={showAI}
                getAIInsight={getAIInsight}
              />
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
