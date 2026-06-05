import { getWeatherCategory } from "../utils/weatherUtils";

/**
 * Fetches the past 90 days of daily and hourly historical weather data for a location
 * and parses it into classified training samples for the ID3 model using actual data.
 * 
 * @param {number} lat Latitude
 * @param {number} lon Longitude
 * @returns {Promise<Array<object>>} Formatted training samples
 */
export const fetchHistoricalData = async (lat, lon) => {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 1); // Yesterday
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90); // Past 90 days
  
  const formatDate = (date) => date.toISOString().split("T")[0];
  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);
  
  // Query daily temperatures and wind along with hourly humidity and MSL pressure
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startStr}&end_date=${endStr}&daily=temperature_2m_mean,wind_speed_10m_max,weather_code&hourly=relative_humidity_2m,pressure_msl&timezone=auto`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch historical weather data");
  
  const data = await response.json();
  const daily = data.daily;
  const hourly = data.hourly;
  if (!daily || !daily.time || !hourly || !hourly.relative_humidity_2m || !hourly.pressure_msl) {
    throw new Error("Missing daily or hourly parameters in Open-Meteo response");
  }
  
  const trainingData = daily.time.map((time, idx) => {
    const tempMean = daily.temperature_2m_mean[idx];
    const windSpeedMax = daily.wind_speed_10m_max[idx];
    const code = daily.weather_code[idx];
    
    // Each day has 24 hourly readings
    const startHourIdx = idx * 24;
    const endHourIdx = (idx + 1) * 24;
    
    const dayHumidities = hourly.relative_humidity_2m.slice(startHourIdx, endHourIdx);
    const dayPressures = hourly.pressure_msl.slice(startHourIdx, endHourIdx);
    
    const humidityMean = dayHumidities.length > 0 
      ? dayHumidities.reduce((sum, val) => sum + val, 0) / dayHumidities.length 
      : 50;
      
    const pressureMean = dayPressures.length > 0 
      ? dayPressures.reduce((sum, val) => sum + val, 0) / dayPressures.length 
      : 1013;
    
    // Map WMO weather codes to Sunny, Cloudy, Rainy
    let condition = "Cloudy";
    if (code === 0 || code === 1) {
      condition = "Sunny";
    } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) {
      condition = "Rainy";
    } else if (code >= 71 && code <= 77) {
      condition = "Rainy"; // Group snow under Rainy
    }
    
    // Convert numerical values to categorized features using getWeatherCategory
    const cat = getWeatherCategory(tempMean, humidityMean, windSpeedMax, pressureMean);
    return {
      temp: cat.temp,
      humidity: cat.humidity,
      wind: cat.wind,
      pressure: cat.pressure,
      condition: condition
    };
  });
  
  return trainingData;
};
