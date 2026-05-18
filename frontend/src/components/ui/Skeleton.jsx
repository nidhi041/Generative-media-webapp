import React from "react";

/**
 * A simple card skeleton used while the gallery is loading.
 */
export function CardSkeleton() {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div className="skeleton" style={{ width: "100%", paddingBottom: "70%", display: "block" }} />
      <div style={{ padding: "1rem" }}>
        <div className="skeleton" style={{ height: 14, width: "80%", marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 12, width: "50%" }} />
      </div>
    </div>
  );
}

/**
 * Full-width content skeleton (hero area loading placeholder).
 */
export function ContentSkeleton({ lines = 3 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: 14, width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}
