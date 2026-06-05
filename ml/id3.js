import { infoGain } from "./informationGain.js";

export function buildTree(data, features, target, depth = 0, maxDepth = 4) {
  if (!data.length) return null;
  
  const labels = data.map(d => d[target]);
  const counts = {};
  labels.forEach(l => { counts[l] = (counts[l] || 0) + 1; });
  const majorityLabel = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  
  if (depth >= maxDepth || Object.keys(counts).length === 1 || !features.length) {
    return { leaf: true, label: majorityLabel, counts };
  }
  
  const gains = features.map(f => ({ f, g: infoGain(data, f, target) }));
  const best = gains.sort((a, b) => b.g - a.g)[0].f;
  const vals = [...new Set(data.map(d => d[best]))];
  const branches = {};
  
  vals.forEach(v => {
    const subset = data.filter(d => d[best] === v);
    branches[v] = buildTree(subset, features.filter(f => f !== best), target, depth + 1, maxDepth);
  });
  
  return { feature: best, branches, majority: majorityLabel, counts };
}
