import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Images, AlertCircle } from "lucide-react";
import GalleryCard from "./GalleryCard";
import { CardSkeleton } from "../../components/ui/Skeleton";

const SKELETON_COUNT = 6;

/**
 * Gallery grid section.
 */
export default function Gallery({ generations: generationsProp, loading, error, onRegenerate, onDelete, regeneratingId, deletingId }) {
  // Normalize to array unconditionally — prevents any .length / .map crash
  const generations = Array.isArray(generationsProp) ? generationsProp : [];

  if (loading) {
    return (
      <GallerySection>
        <div style={gridStyle}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </GallerySection>
    );
  }

  if (error) {
    return (
      <GallerySection>
        <div style={emptyStyle}>
          <AlertCircle size={36} color="var(--color-error)" />
          <p style={{ color: "var(--color-error)", fontWeight: 500 }}>{error}</p>
          <p style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
            Make sure the backend server is running on port 5000.
          </p>
        </div>
      </GallerySection>
    );
  }

  if (generations.length === 0) {
    return (
      <GallerySection>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={emptyStyle}
        >
          <Images size={48} color="var(--color-muted)" />
          <p style={{ fontSize: "1.0625rem", fontWeight: 600, margin: "0.5rem 0 0.25rem" }}>
            Your gallery is empty
          </p>
          <p style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
            Generate your first image above to get started.
          </p>
        </motion.div>
      </GallerySection>
    );
  }

  return (
    <GallerySection count={generations.length}>
      <motion.div layout style={gridStyle}>
        <AnimatePresence>
          {generations.map((g) => (
            <GalleryCard
              key={g.id}
              record={g}
              onRegenerate={onRegenerate}
              onDelete={onDelete}
              regeneratingId={regeneratingId}
              deletingId={deletingId}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </GallerySection>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function GallerySection({ children, count }) {
  return (
    <section
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "2.5rem 1.5rem 4rem",
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1.5rem",
      }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
          Your Generations
        </h2>
        {count != null && (
          <span className="badge">{count} image{count !== 1 ? "s" : ""}</span>
        )}
      </div>
      {children}
    </section>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "1.25rem",
};

const emptyStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "5rem 1rem",
  textAlign: "center",
  gap: "0.75rem",
};
