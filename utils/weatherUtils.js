export const kelvinToCelsius = (k) => Math.round(k - 273.15);
export const kelvinToFahrenheit = (k) => Math.round((k - 273.15) * 9 / 5 + 32);
export const mpsToKmh = (s) => Math.round(s * 3.6);
export const metersToMiles = (m) => (m / 1609.34).toFixed(1);

export const getWeatherCategory = (temp, humidity, windSpeed, pressure) => {
  const t = temp > 30 ? "hot" : temp > 20 ? "mild" : "cool";
  const h = humidity > 65 ? "high" : "normal";
  const w = windSpeed > 20 ? "strong" : "weak";
  const p = pressure > 1013 ? "high" : pressure > 1005 ? "normal" : "low";
  return { temp: t, humidity: h, wind: w, pressure: p };
};

export const calculateOutdoorScore = (temp, humidity, windSpeed, condition, prediction = null) => {
  // 1. Current meteorological comfort score (100 is ideal comfort)
  let comfortScore = 100;
  
  // Temp penalties (Ideal is 18°C to 27°C)
  if (temp > 35 || temp < 5) comfortScore -= 35;
  else if (temp > 30 || temp < 15) comfortScore -= 15;
  
  // Humidity penalties (Ideal is 35% to 55%)
  if (humidity > 80 || humidity < 15) comfortScore -= 20;
  else if (humidity > 60 || humidity < 30) comfortScore -= 8;
  
  // Wind penalties (Ideal is < 15 km/h)
  if (windSpeed > 30) comfortScore -= 25;
  else if (windSpeed > 15) comfortScore -= 10;
  
  // Current condition penalties
  const condUpper = condition.toUpperCase();
  if (condUpper.includes("RAIN") || condUpper.includes("THUNDERSTORM") || condUpper.includes("SNOW")) {
    comfortScore -= 45;
  } else if (condUpper.includes("CLOUDS")) {
    comfortScore -= 5;
  }
  
  comfortScore = Math.max(0, comfortScore);
  
  // 2. Link directly to the ML prediction confidence (outlook weight)
  if (prediction) {
    // We construct an Outlook Weight from ML prediction probabilities:
    // Sunny/Clear: 1.0 weight
    // Cloudy: 0.75 weight
    // Rainy: 0.2 weight
    const outlookWeight = (prediction.Sunny * 1.0 + prediction.Cloudy * 0.75 + prediction.Rainy * 0.2) / 100;
    
    // Scale comfort score directly with the prediction outlook weight
    const score = comfortScore * outlookWeight;
    return Math.round(Math.max(0, Math.min(100, score)));
  }
  
  return Math.round(comfortScore);
};

export const getRecommendations = (score, condition) => {
  if (score > 80) return "Perfect for outdoor activities! Enjoy the weather.";
  if (score > 60) return "Good weather for a walk, but keep an eye on the sky.";
  if (score > 40) return "Average conditions. Maybe stay close to shelter.";
  if (condition.toUpperCase().includes("RAIN")) return "It's raining. Better stay indoors with a hot drink.";
  return "Conditions aren't ideal for outdoor plans today.";
};

export const generateLocalWeatherInsight = (current, prediction, outdoorScore) => {
  if (!current || !prediction) return "No insight available.";
  
  const tempC = Math.round(current.main.temp - 273.15); // convert kelvin to celsius
  const condition = current.weather[0].description;
  const city = current.name;
  
  let greeting = "";
  if (outdoorScore > 80) {
    greeting = `It's a beautiful day in ${city}!`;
  } else if (outdoorScore > 55) {
    greeting = `Conditions are moderate in ${city} today.`;
  } else {
    greeting = `Expect some less-than-ideal weather in ${city} today.`;
  }
  
  const currentAnalysis = `Currently, it's ${tempC}°C with ${condition}. The humidity is at ${current.main.humidity}% with winds of ${Math.round(current.wind.speed * 3.6)} km/h.`;
  
  let mlInsight = "";
  const domStr = prediction.dominant;
  const confidence = prediction[domStr];
  mlInsight = `Our Google-grade hybrid ensembled model predicts ${domStr.toLowerCase()} weather for tomorrow with a blended confidence of ${confidence}%. This combines local ID3 decision tree transitions (30% weight) with live professional meteorological models (70% weight).`;
  
  let tip = "";
  if (outdoorScore > 80) {
    tip = "It's the perfect opportunity for outdoor exercise, a jog, or a park visit.";
  } else if (outdoorScore > 50) {
    tip = "A brief walk or light outdoor activity is fine, but check the sky frequently.";
  } else {
    tip = "Staying indoors with a warm beverage or focusing on indoor projects is recommended.";
  }
  
  return `${greeting} ${currentAnalysis} ${mlInsight} ${tip}`;
};

