export default function Search({ search, setSearch, handleSearch, fetchByGeo, text, accent, card, cardBorder, loading }) {
  return (
    <form onSubmit={handleSearch} className="search-form">
      <input
        className="search-input"
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search any city…"
        disabled={loading}
        style={{ flex: 1, padding: "10px 16px", borderRadius: 24, border: `1px solid ${cardBorder}`, background: card, color: text, fontSize: 14, backdropFilter: "blur(10px)", opacity: loading ? 0.7 : 1, transition: "opacity 0.2s" }}
      />
      <button type="submit" disabled={loading} style={{ padding: "10px 20px", borderRadius: 24, border: "none", background: accent, color: "#fff", cursor: loading ? "default" : "pointer", fontSize: 14, fontWeight: 600, opacity: loading ? 0.7 : 1, transition: "opacity 0.2s" }} className="btn-glow">
        {loading ? "Searching..." : "Search"}
      </button>
      <button type="button" disabled={loading} onClick={fetchByGeo} title="Use my location" style={{ padding: "10px 14px", borderRadius: 24, border: `1px solid ${cardBorder}`, background: card, color: text, cursor: loading ? "default" : "pointer", fontSize: 16, opacity: loading ? 0.7 : 1, transition: "opacity 0.2s" }}>
        📍
      </button>
    </form>
  );
}
