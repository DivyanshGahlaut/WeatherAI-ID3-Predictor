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
