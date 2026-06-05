import { entropy } from "./entropy.js";

export function infoGain(data, splitAttr, targetAttr) {
  const baseE = entropy(data, targetAttr);
  const vals = [...new Set(data.map(d => d[splitAttr]))];
  const weightedE = vals.reduce((acc, v) => {
    const subset = data.filter(d => d[splitAttr] === v);
    return acc + (subset.length / data.length) * entropy(subset, targetAttr);
  }, 0);
  return baseE - weightedE;
}
