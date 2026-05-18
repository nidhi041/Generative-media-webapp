import React from "react";
import { Sparkles } from "lucide-react";

/**
 * Top navigation bar.
 */
export default function Navbar() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.5rem",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "0.5rem",
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: "1.125rem", letterSpacing: "-0.02em" }}>
            Gen<span style={{ color: "#a855f7" }}>Media</span>
          </span>
        </div>

        {/* Tagline */}
        <span
          className="badge"
          style={{ display: "none" }}
          id="nav-badge"
        >
          Powered by Hugging Face
        </span>
      </div>

      {/* Show badge on wider screens via inline media query workaround */}
      <style>{`@media(min-width:640px){#nav-badge{display:inline-flex}}`}</style>
    </header>
  );
}
