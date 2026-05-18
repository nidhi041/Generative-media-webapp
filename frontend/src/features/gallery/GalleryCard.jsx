import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Trash2, Clock, Wand2, X, Check, Expand } from "lucide-react";
import ImageModal from "../../components/ui/ImageModal";

/**
 * Format ISO timestamp to readable relative or absolute string.
 */
function formatDate(iso) {
  const date = new Date(iso);
  const now  = Date.now();
  const diff = now - date.getTime();

  if (diff < 60_000)  return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const STYLE_LABELS = {
  none: "No style", cinematic: "Cinematic", anime: "Anime",
  "digital-art": "Digital Art", watercolor: "Watercolor", "3d-render": "3D Render",
};

/**
 * Inline tweak panel shown when "Tweak" button is clicked.
 */
function TweakPanel({ original, onRegenerate, onClose, isLoading }) {
  const [prompt, setPrompt] = useState(original.prompt);
  const [style, setStyle]   = useState(original.style);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onRegenerate({ prompt: prompt.trim(), style });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{
        padding: "0.875rem",
        background: "rgba(0,0,0,0.35)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        gap: "0.625rem",
      }}
    >
      <textarea
        className="input-base"
        style={{ minHeight: 72, fontSize: "0.8125rem", padding: "0.625rem 0.75rem" }}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        maxLength={1000}
        disabled={isLoading}
      />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <select
          className="input-base"
          style={{ flex: 1, padding: "0.5rem", fontSize: "0.8rem" }}
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          disabled={isLoading}
        >
          {Object.entries(STYLE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <button type="submit" className="btn-primary" disabled={isLoading || !prompt.trim()}
          style={{ padding: "0.5rem 0.875rem", fontSize: "0.8rem" }}>
          {isLoading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Check size={14} />}
          {isLoading ? "…" : "Apply"}
        </button>
        <button type="button" className="btn-ghost" onClick={onClose}
          style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem" }}>
          <X size={14} />
        </button>
      </div>
    </motion.form>
  );
}

/**
 * Single gallery card.
 */
export default function GalleryCard({ record, onRegenerate, onDelete, regeneratingId, deletingId }) {
  const [tweakOpen, setTweakOpen]   = useState(false);
  const [imgLoaded, setImgLoaded]   = useState(false);
  const [modalOpen, setModalOpen]   = useState(false);
  const [hovered, setHovered]       = useState(false);

  const isRegenerating = regeneratingId === record.id;
  const isDeleting     = deletingId === record.id;

  const handleRegenerate = async (overrides) => {
    await onRegenerate(record.id, overrides);
    setTweakOpen(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="card"
    >
      {/* Image — clickable to open lightbox */}
      <div
        style={{ position: "relative", background: "var(--color-surface-2)", cursor: record.imageUrl ? "zoom-in" : "default" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => { if (record.imageUrl && imgLoaded) setModalOpen(true); }}
      >
        {!imgLoaded && record.imageUrl && (
          <div className="skeleton" style={{ position: "absolute", inset: 0 }} />
        )}
        {record.imageUrl ? (
          <img
            src={record.imageUrl}
            alt={record.prompt}
            onLoad={() => setImgLoaded(true)}
            style={{
              width: "100%",
              aspectRatio: "4/3",
              objectFit: "cover",
              display: "block",
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 0.3s, transform 0.35s cubic-bezier(0.4,0,0.2,1)",
              transform: hovered && imgLoaded ? "scale(1.03)" : "scale(1)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              aspectRatio: "4/3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "0.5rem",
              color: "var(--color-muted)",
              fontSize: "0.8125rem",
            }}
          >
            {record.status === "error" ? (
              <>
                <span style={{ fontSize: "1.5rem" }}>⚠️</span>
                <span>{record.error || "Generation failed"}</span>
              </>
            ) : (
              <>
                <span className="spinner" />
                <span>Generating…</span>
              </>
            )}
          </div>
        )}

        {/* Style badge overlay */}
        {record.style && record.style !== "none" && (
          <span className="badge" style={{
            position: "absolute", top: "0.5rem", left: "0.5rem",
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          }}>
            {STYLE_LABELS[record.style] || record.style}
          </span>
        )}

        {/* Hover zoom-in hint overlay */}
        {imgLoaded && (
          <motion.div
            initial={false}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.32)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(124,58,237,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(124,58,237,0.5)",
            }}>
              <Expand size={20} color="#fff" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Lightbox modal */}
      <ImageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        imageUrl={record.imageUrl}
        prompt={record.prompt}
        style={record.style}
        createdAt={record.createdAt}
      />

      {/* Card body */}
      <div style={{ padding: "0.875rem 1rem" }}>
        <p style={{
          fontSize: "0.875rem",
          lineHeight: 1.5,
          color: "var(--color-text)",
          margin: "0 0 0.5rem",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}>
          {record.prompt}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--color-muted)" }}>
            <Clock size={12} />
            {formatDate(record.createdAt)}
          </span>

          <div style={{ display: "flex", gap: "0.375rem" }}>
            {/* Tweak button */}
            <button
              id={`tweak-btn-${record.id}`}
              className="btn-ghost"
              style={{ padding: "0.35rem 0.625rem", fontSize: "0.75rem" }}
              onClick={() => setTweakOpen((o) => !o)}
              disabled={isRegenerating || isDeleting}
              title="Tweak & regenerate"
            >
              <Wand2 size={13} />
              Tweak
            </button>

            {/* Regenerate button (same prompt) */}
            <button
              id={`regen-btn-${record.id}`}
              className="btn-ghost"
              style={{ padding: "0.35rem 0.625rem", fontSize: "0.75rem" }}
              onClick={() => onRegenerate(record.id)}
              disabled={isRegenerating || isDeleting}
              title="Regenerate with same prompt"
            >
              {isRegenerating
                ? <span className="spinner" style={{ width: 12, height: 12 }} />
                : <RefreshCw size={13} />
              }
            </button>

            {/* Delete button */}
            <button
              id={`delete-btn-${record.id}`}
              className="btn-ghost"
              style={{ padding: "0.35rem 0.625rem", fontSize: "0.75rem", color: "var(--color-error)" }}
              onClick={() => onDelete(record.id)}
              disabled={isRegenerating || isDeleting}
              title="Delete"
            >
              {isDeleting
                ? <span className="spinner" style={{ width: 12, height: 12 }} />
                : <Trash2 size={13} />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Tweak panel */}
      <AnimatePresence>
        {tweakOpen && (
          <TweakPanel
            original={record}
            onRegenerate={handleRegenerate}
            onClose={() => setTweakOpen(false)}
            isLoading={isRegenerating}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
