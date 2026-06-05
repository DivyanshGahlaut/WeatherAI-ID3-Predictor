export function predictTree(tree, sample) {
  if (!tree || tree.leaf) return tree ? tree.label : "Unknown";
  const val = sample[tree.feature];
  if (val !== undefined && tree.branches[val]) {
    return predictTree(tree.branches[val], sample);
  }
  return tree.majority;
}

export function getProbabilities(tree, sample) {
  function collectCounts(node, sample) {
    if (!node) return {};
    if (node.leaf) return node.counts;
    const val = sample[node.feature];
    if (val !== undefined && node.branches[val]) {
      return collectCounts(node.branches[val], sample);
    }
    return node.counts;
  }
  
  const counts = collectCounts(tree, sample);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  
  // Laplace (additive) smoothing to prevent 100% or 0% probability predictions
  const classes = ["Sunny", "Cloudy", "Rainy"];
  const smoothedTotal = total + classes.length;
  
  const probs = {
    Sunny: Math.round(((counts.Sunny || 0) + 1) / smoothedTotal * 100),
    Cloudy: Math.round(((counts.Cloudy || 0) + 1) / smoothedTotal * 100),
    Rainy: Math.round(((counts.Rainy || 0) + 1) / smoothedTotal * 100),
  };

  // Ensure sum is 100
  const sum = probs.Sunny + probs.Cloudy + probs.Rainy;
  if (sum !== 100 && sum > 0) {
    const diff = 100 - sum;
    const maxKey = Object.keys(probs).reduce((a, b) => probs[a] > probs[b] ? a : b);
    probs[maxKey] += diff;
  }
  
  return probs;
}

/**
 * Parses tomorrow's forecast items from the 5-day / 3-hour forecast list
 * and calculates the forecast probability distribution.
 */
export function getForecastProbabilities(forecastList) {
  if (!forecastList || !forecastList.length) {
    return { Sunny: 33, Cloudy: 33, Rainy: 34 };
  }

  // Determine tomorrow's date string (local user date + 1 day)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toDateString();

  // Filter list items that fall on tomorrow (local timezone based on date string)
  const tomorrowSlots = forecastList.filter(item => {
    const itemDate = new Date(item.dt * 1000).toDateString();
    return itemDate === tomorrowStr;
  });

  // If no slots match tomorrow (e.g. timezone mismatch/late query), take slots 8-16 (tomorrow approx)
  const slotsToUse = tomorrowSlots.length > 0 ? tomorrowSlots : forecastList.slice(8, 16);

  const counts = { Sunny: 0, Cloudy: 0, Rainy: 0 };
  
  slotsToUse.forEach(item => {
    if (!item.weather || !item.weather[0]) return;
    const mainWeather = item.weather[0].main.toLowerCase();
    
    // Map OWM conditions to Sunny, Cloudy, Rainy
    if (mainWeather.includes("clear") || mainWeather.includes("sun")) {
      counts.Sunny += 1;
    } else if (mainWeather.includes("rain") || mainWeather.includes("drizzle") || mainWeather.includes("thunderstorm") || mainWeather.includes("snow")) {
      counts.Rainy += 1;
    } else {
      // Cloud, mist, fog, haze, smoke, dust, etc.
      counts.Cloudy += 1;
    }
  });

  const total = slotsToUse.length;
  if (total === 0) {
    return { Sunny: 33, Cloudy: 33, Rainy: 34 };
  }

  const probs = {
    Sunny: Math.round((counts.Sunny / total) * 100),
    Cloudy: Math.round((counts.Cloudy / total) * 100),
    Rainy: Math.round((counts.Rainy / total) * 100),
  };

  // Adjust to sum to 100
  const sum = probs.Sunny + probs.Cloudy + probs.Rainy;
  if (sum !== 100 && sum > 0) {
    const diff = 100 - sum;
    const maxKey = Object.keys(probs).reduce((a, b) => probs[a] > probs[b] ? a : b);
    probs[maxKey] += diff;
  }

  return probs;
}

/**
 * Combines ID3 prediction probabilities and OWM forecast probabilities
 * using a weighted ensemble average.
 */
export function getHybridPrediction(id3Probs, forecastProbs, id3Weight = 0.3) {
  const owmWeight = 1.0 - id3Weight;
  
  const probs = {
    Sunny: Math.round(id3Probs.Sunny * id3Weight + forecastProbs.Sunny * owmWeight),
    Cloudy: Math.round(id3Probs.Cloudy * id3Weight + forecastProbs.Cloudy * owmWeight),
    Rainy: Math.round(id3Probs.Rainy * id3Weight + forecastProbs.Rainy * owmWeight),
  };

  // Adjust to sum to 100
  const sum = probs.Sunny + probs.Cloudy + probs.Rainy;
  if (sum !== 100 && sum > 0) {
    const diff = 100 - sum;
    const maxKey = Object.keys(probs).reduce((a, b) => probs[a] > probs[b] ? a : b);
    probs[maxKey] += diff;
  }

  // Find dominant
  const dominant = Object.keys(probs).reduce((a, b) => probs[a] > probs[b] ? a : b);

  return {
    ...probs,
    dominant
  };
}
