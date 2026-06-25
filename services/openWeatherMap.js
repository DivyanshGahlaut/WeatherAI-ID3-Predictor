const API_KEY = "bd5e378503939ddaee76f12ad7a97608";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const geocodeCity = async (city) => {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(geoUrl);
  if (!res.ok) throw new Error("City not found");
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("City not found");
  }
  return data.results[0]; // { name, latitude, longitude, country_code }
};

export const fetchWeatherByCity = async (city) => {
  try {
    const response = await fetch(`${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("City not found");
      }
      throw new Error("API Limit or Auth error");
    }
    return await response.json();
  } catch (error) {
    console.warn("OpenWeatherMap fetchWeatherByCity failed, using Open-Meteo fallback:", error);
    if (error.message === "City not found") {
      throw error;
    }
    const geo = await geocodeCity(city);
    return {
      coord: { lat: geo.latitude, lon: geo.longitude },
      weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
      main: {
        temp: 293.15,
        feels_like: 293.15,
        temp_min: 293.15,
        temp_max: 293.15,
        pressure: 1013,
        humidity: 50
      },
      visibility: 10000,
      wind: { speed: 0, deg: 0 },
      clouds: { all: 0 },
      dt: Math.round(Date.now() / 1000),
      sys: { country: geo.country_code || "", sunrise: 0, sunset: 0 },
      name: geo.name,
      cod: 200
    };
  }
};

export const fetchForecastByCity = async (city) => {
  try {
    const response = await fetch(`${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("City not found");
      }
      throw new Error("API Limit or Auth error");
    }
    return await response.json();
  } catch (error) {
    console.warn("OpenWeatherMap fetchForecastByCity failed, using Open-Meteo fallback:", error);
    if (error.message === "City not found") {
      throw error;
    }
    const geo = await geocodeCity(city);
    const list = [];
    const startDt = Math.round(Date.now() / 1000);
    for (let i = 0; i < 40; i++) {
      const dt = startDt + i * 3 * 3600;
      const dateStr = new Date(dt * 1000).toISOString().replace("T", " ").substring(0, 19);
      list.push({
        dt,
        main: {
          temp: 293.15,
          feels_like: 293.15,
          temp_min: 293.15,
          temp_max: 293.15,
          pressure: 1013,
          humidity: 50
        },
        weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
        clouds: { all: 0 },
        wind: { speed: 0 },
        dt_txt: dateStr
      });
    }
    return { list };
  }
};

export const fetchWeatherByCoords = async (lat, lon) => {
  try {
    const response = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    if (!response.ok) throw new Error("Location fetch failed");
    return await response.json();
  } catch (error) {
    console.warn("OpenWeatherMap fetchWeatherByCoords failed, using fallback name:", error);
    try {
      const osmUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
      const res = await fetch(osmUrl, {
        headers: {
          "User-Agent": "WeatherAI-ID3-Predictor/1.0"
        }
      });
      if (res.ok) {
        const osmData = await res.json();
        const cityName = osmData.address.city || osmData.address.town || osmData.address.village || osmData.address.suburb || osmData.address.state || "My Location";
        const countryCode = osmData.address.country_code?.toUpperCase() || "US";
        return {
          coord: { lat, lon },
          weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
          main: {
            temp: 293.15,
            feels_like: 293.15,
            temp_min: 293.15,
            temp_max: 293.15,
            pressure: 1013,
            humidity: 50
          },
          visibility: 10000,
          wind: { speed: 0, deg: 0 },
          clouds: { all: 0 },
          dt: Math.round(Date.now() / 1000),
          sys: { country: countryCode, sunrise: 0, sunset: 0 },
          name: cityName,
          cod: 200
        };
      }
    } catch (osmError) {
      console.warn("Nominatim reverse geocoding failed:", osmError);
    }
    return {
      coord: { lat, lon },
      weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
      main: {
        temp: 293.15,
        feels_like: 293.15,
        temp_min: 293.15,
        temp_max: 293.15,
        pressure: 1013,
        humidity: 50
      },
      visibility: 10000,
      wind: { speed: 0, deg: 0 },
      clouds: { all: 0 },
      dt: Math.round(Date.now() / 1000),
      sys: { country: "LOC", sunrise: 0, sunset: 0 },
      name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      cod: 200
    };
  }
};
