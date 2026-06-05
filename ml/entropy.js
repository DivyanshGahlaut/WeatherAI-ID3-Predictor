export function entropy(data, attr) {
  const counts = {};
  data.forEach(d => { counts[d[attr]] = (counts[d[attr]] || 0) + 1; });
  return Object.values(counts).reduce((e, c) => {
    const p = c / data.length;
    return e - p * Math.log2(p);
  }, 0);
}
