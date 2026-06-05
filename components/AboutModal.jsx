import React, { useEffect } from "react";

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function AboutModal({ isOpen, onClose, dark, text, muted, card, cardBorder, accent }) {
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-card {
          animation: modalFadeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .modal-body::-webkit-scrollbar {
          width: 5px;
        }
        .modal-body::-webkit-scrollbar-thumb {
          background: ${accent}30;
          border-radius: 4px;
        }
        .modal-body::-webkit-scrollbar-thumb:hover {
          background: ${accent}50;
        }
        .social-btn {
          transition: all 0.2s ease;
        }
        .social-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px ${accent}25;
        }
        .tech-badge {
          display: inline-block;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 12px;
          background: ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"};
          border: 1px solid ${cardBorder};
          color: ${text};
        }
        @media (max-width: 480px) {
          .modal-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .modal-footer-btns {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .social-btn {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>

      <div 
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: dark 
            ? "linear-gradient(135deg, rgba(17, 24, 39, 0.92) 0%, rgba(30, 27, 75, 0.92) 100%)" 
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(243, 244, 246, 0.95) 100%)",
          border: `1px solid ${cardBorder}`,
          borderRadius: "24px",
          width: "100%",
          maxWidth: "540px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: dark 
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.6)" 
            : "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
          color: text,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 24px 16px",
          borderBottom: `1px solid ${cardBorder}`,
        }}>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: "20px", 
              fontFamily: "'Space Grotesk', sans-serif", 
              fontWeight: 700, 
              display: "flex", 
              alignItems: "center", 
              gap: "8px" 
            }}>
              ⛅ WeatherAI Dashboard
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
              <span style={{ 
                background: `${accent}15`, 
                color: accent, 
                border: `1px solid ${accent}30`, 
                padding: "2px 8px", 
                borderRadius: "12px", 
                fontSize: "11px", 
                fontWeight: 600,
              }}>
                Version 1.0
              </span>
              <span style={{ fontSize: "12px", color: muted }}>
                by Divyansh Gahlaut
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: muted,
              cursor: "pointer",
              padding: "6px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";
              e.currentTarget.style.color = text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = muted;
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable Body */}
        <div 
          className="modal-body"
          style={{
            padding: "24px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* About description */}
          <div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 600, textTransform: "uppercase", color: accent, letterSpacing: "0.05em" }}>
              About
            </h3>
            <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.6", color: text }}>
              WeatherAI is an intelligent weather forecasting and analytics platform built using React, Vite, OpenWeatherMap, Open-Meteo, and Machine Learning.
            </p>
          </div>

          {/* Developed By */}
          <div style={{
            background: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
            border: `1px solid ${cardBorder}`,
            borderRadius: "16px",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", color: muted, letterSpacing: "0.05em", fontWeight: 600 }}>
                Developer
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, marginTop: "2px" }}>
                Divyansh Gahlaut
              </div>
            </div>
            <div style={{ fontSize: "24px" }}>💻</div>
          </div>

          {/* Grid: Features & Technologies */}
          <div 
            className="modal-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: "24px",
            }}
          >
            {/* Features */}
            <div>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: 600, textTransform: "uppercase", color: accent, letterSpacing: "0.05em" }}>
                Features
              </h3>
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "13px", color: text, display: "flex", flexDirection: "column", gap: "8px" }}>
                <li>Real-time Weather Monitoring</li>
                <li>6-Day Forecast</li>
                <li>ID3 Decision Tree Predictions</li>
                <li>Outdoor Activity Score</li>
                <li>AI Weather Insights</li>
                <li>Responsive Desktop & Mobile Design</li>
              </ul>
            </div>

            {/* Technologies */}
            <div>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: 600, textTransform: "uppercase", color: accent, letterSpacing: "0.05em" }}>
                Technologies
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                <span className="tech-badge">React.js</span>
                <span className="tech-badge">Vite</span>
                <span className="tech-badge">OpenWeatherMap API</span>
                <span className="tech-badge">Open-Meteo API</span>
                <span className="tech-badge">JavaScript</span>
                <span className="tech-badge">Machine Learning (ID3)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "18px 24px 22px",
          borderTop: `1px solid ${cardBorder}`,
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          alignItems: "center",
          background: dark ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.01)",
        }}>
          {/* Action Buttons */}
          <div 
            className="modal-footer-btns"
            style={{
              display: "flex",
              gap: "12px",
              width: "100%",
            }}
          >
            <a 
              href="https://github.com/DivyanshGahlaut" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-btn"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                border: `1px solid ${cardBorder}`,
                borderRadius: "14px",
                padding: "10px 16px",
                color: text,
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              <GitHubIcon />
              GitHub Profile
            </a>
            <a 
              href="https://www.linkedin.com/in/divyansh-gahlaut-89812a355" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-btn"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: "#0077b5",
                borderRadius: "14px",
                padding: "10px 16px",
                color: "#ffffff",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              <LinkedInIcon />
              LinkedIn Profile
            </a>
          </div>

          <div style={{ fontSize: "11px", color: muted, textAlign: "center" }}>
            © 2026 Divyansh Gahlaut · All Rights Reserved
          </div>
        </div>
      </div>
    </div>
  );
}
