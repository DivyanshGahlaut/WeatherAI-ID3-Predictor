const API_KEY = "bd5e378503939ddaee76f12ad7a97608";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export const fetchWeatherByCity = async (city) => {
  const response = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}`);
  if (!response.ok) throw new Error("City not found");
  return response.json();
};

export const fetchForecastByCity = async (city) => {
  const response = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}`);
  if (!response.ok) throw new Error("Forecast failed");
  return response.json();
};

export const fetchWeatherByCoords = async (lat, lon) => {
  const response = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
  if (!response.ok) throw new Error("Location fetch failed");
  return response.json();
};
