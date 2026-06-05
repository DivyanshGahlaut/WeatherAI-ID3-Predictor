export const WeatherIcon = ({ condition, size = 48 }) => {
  const icons = {
    Clear: (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="10" fill="#F59E0B" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
          <line
            key={i}
            x1={24 + 14 * Math.cos((a * Math.PI) / 180)}
            y1={24 + 14 * Math.sin((a * Math.PI) / 180)}
            x2={24 + 20 * Math.cos((a * Math.PI) / 180)}
            y2={24 + 20 * Math.sin((a * Math.PI) / 180)}
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ))}
      </svg>
    ),
    Clouds: (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="20" cy="26" r="8" fill="#94A3B8" />
        <circle cx="28" cy="28" r="7" fill="#94A3B8" />
        <circle cx="24" cy="22" r="7" fill="#CBD5E1" />
        <circle cx="30" cy="23" r="6" fill="#CBD5E1" />
        <rect x="13" y="26" width="22" height="9" rx="2" fill="#94A3B8" />
      </svg>
    ),
    Rain: (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="20" cy="20" r="7" fill="#64748B" />
        <circle cx="28" cy="22" r="6" fill="#64748B" />
        <circle cx="24" cy="17" r="6" fill="#94A3B8" />
        <rect x="14" y="20" width="20" height="8" rx="2" fill="#64748B" />
        {[[17, 34], [22, 38], [27, 34], [32, 38]].map(([x, y], i) => (
          <line key={i} x1={x} y1={y - 4} x2={x - 2} y2={y} stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
        ))}
      </svg>
    ),
    Snow: (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="20" cy="20" r="7" fill="#94A3B8" />
        <circle cx="28" cy="22" r="6" fill="#94A3B8" />
        <rect x="14" y="20" width="20" height="8" rx="2" fill="#94A3B8" />
        {[[17, 35], [22, 39], [27, 35], [32, 39]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2" fill="#BFDBFE" />
        ))}
      </svg>
    ),
    Thunderstorm: (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="20" cy="18" r="7" fill="#4B5563" />
        <circle cx="28" cy="20" r="6" fill="#4B5563" />
        <rect x="14" y="18" width="20" height="8" rx="2" fill="#374151" />
        <path d="M26 28L21 36H25L20 44L29 32H25L28 28Z" fill="#FDE68A" />
      </svg>
    ),
    Drizzle: (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="20" cy="20" r="7" fill="#94A3B8" />
        <circle cx="28" cy="22" r="6" fill="#94A3B8" />
        <rect x="14" y="20" width="20" height="8" rx="2" fill="#94A3B8" />
        {[[17, 34], [22, 37], [27, 34], [32, 37], [19, 39], [25, 39]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.5" fill="#93C5FD" />
        ))}
      </svg>
    ),
    Mist: (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        {[14, 18, 22, 26, 30].map((y, i) => (
          <line
            key={i}
            x1="8"
            y1={y}
            x2="40"
            y2={y}
            stroke="#CBD5E1"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity={0.5 + i * 0.1}
          />
        ))}
      </svg>
    ),
  };
  const key = Object.keys(icons).find((k) => condition?.includes(k)) || "Clear";
  return icons[key] || icons.Clear;
};

export const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="currentColor"
      opacity="0.8"
    />
  </svg>
);

export const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
      <line
        key={i}
        x1={12 + 8 * Math.cos((a * Math.PI) / 180)}
        y1={12 + 8 * Math.sin((a * Math.PI) / 180)}
        x2={12 + 11 * Math.cos((a * Math.PI) / 180)}
        y2={12 + 11 * Math.sin((a * Math.PI) / 180)}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    ))}
  </svg>
);
