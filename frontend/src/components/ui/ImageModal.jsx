import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ZoomIn, Type } from "lucide-react";
import Draggable from "react-draggable";
import html2canvas from "html2canvas";

/**
 * Fullscreen image lightbox rendered via a React Portal with lightweight draggable editing.
 *
 * Props:
 *   isOpen    {boolean}          - Controls visibility
 *   onClose   {() => void}       - Called on backdrop click, close btn, or ESC
 *   imageUrl  {string}           - Base64 data-URI or hosted URL
 *   prompt    {string}           - Caption shown below the image
 *   style     {string}           - Style tag shown as a badge
 *   createdAt {string}           - ISO timestamp
 */
export default function ImageModal({ isOpen, onClose, imageUrl, prompt, style, createdAt }) {
  // ── Lightweight Draggable Editor State ─────────────────────────────────────
  const [isEditing, setIsEditing]       = useState(false);
  const [overlayText, setOverlayText]   = useState("");
  const [overlaySize, setOverlaySize]   = useState("medium"); // "small", "medium", "large", "xlarge"
  const [overlayColor, setOverlayColor] = useState("#ffffff"); // white, yellow, pink, purple, black
  const [dragPos, setDragPos]           = useState({ x: 0, y: 0 });
  const [isCapturing, setIsCapturing]   = useState(false);
  const nodeRef                         = useRef(null);

  // Reset editor state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsEditing(false);
      setOverlayText("");
      setOverlaySize("medium");
      setOverlayColor("#ffffff");
      setDragPos({ x: 0, y: 0 });
      setIsCapturing(false);
    }
  }, [isOpen]);

  // ── ESC key handler ────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll while modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  // ── Download helper with html2canvas Export ────────────────────────────────
  const handleDownload = async () => {
    if (!imageUrl) return;

    // If no overlay text, download directly
    if (!overlayText.trim()) {
      const a = document.createElement("a");
      a.href = imageUrl;
      a.download = `genmedia-${Date.now()}.jpg`;
      a.click();
      return;
    }

    // Use html2canvas to export the wrapper element containing the image and the dragged overlay
    const element = document.getElementById("export-image-wrapper");
    if (!element) return;

    try {
      setIsCapturing(true);
      // Wait a brief tick for React state to update the DOM (removing borders/backgrounds)
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2, // High-quality export
        logging: false,
      });

      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `genmedia-edited-${Date.now()}.jpg`;
      a.click();
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  // ── Stop propagation so inner panel click doesn't close modal ──────────────
  const stopPropagation = (e) => e.stopPropagation();

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleString("en-US", {
        month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "";

  const STYLE_LABELS = {
    none: null, cinematic: "Cinematic", anime: "Anime",
    "digital-art": "Digital Art", watercolor: "Watercolor", "3d-render": "3D Render",
  };

  // Render into body-level portal to escape any overflow/z-index constraints
  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        /* ── Backdrop ─────────────────────────────────────────────────── */
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          {/* ── Modal panel ─────────────────────────────────────────────── */}
          <motion.div
            key="modal-panel"
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={stopPropagation}
            style={{
              position: "relative",
              maxWidth: "min(900px, 95vw)",
              maxHeight: "90vh",
              width: "100%",
              borderRadius: "1.25rem",
              overflow: "hidden",
              background: "var(--color-surface)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.15)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* ── Top bar ───────────────────────────────────────────────── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.875rem 1.125rem",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ZoomIn size={15} color="var(--color-accent-2)" />
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text)" }}>
                  Image Preview
                </span>
                {style && style !== "none" && STYLE_LABELS[style] && (
                  <span className="badge">{STYLE_LABELS[style]}</span>
                )}
              </div>

              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                {/* Toggle Editor */}
                <button
                  onClick={() => setIsEditing((e) => !e)}
                  className="btn-ghost"
                  title="Add text overlay"
                  style={{
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.8rem",
                    background: isEditing ? "rgba(124,58,237,0.2)" : "transparent",
                    border: isEditing ? "1px solid rgba(124,58,237,0.5)" : "1px solid transparent",
                  }}
                >
                  <Type size={14} />
                  {isEditing ? "Hide Editor" : "Add Text"}
                </button>

                {/* Download */}
                <button
                  onClick={handleDownload}
                  className="btn-ghost"
                  title="Download image"
                  disabled={isCapturing}
                  style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", opacity: isCapturing ? 0.5 : 1 }}
                >
                  <Download size={14} />
                  {isCapturing ? "Saving…" : "Save"}
                </button>

                {/* Close */}
                <button
                  id="modal-close-btn"
                  onClick={onClose}
                  className="btn-ghost"
                  title="Close (ESC)"
                  style={{ padding: "0.4rem 0.625rem", fontSize: "0.8rem" }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ── Lightweight Editing Toolbar ───────────────────────────── */}
            <AnimatePresence>
              {isEditing && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{
                    padding: "0.75rem 1.125rem",
                    background: "var(--color-surface-2)",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                    alignItems: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <input
                    type="text"
                    className="input-base"
                    placeholder="Type overlay text here..."
                    value={overlayText}
                    onChange={(e) => setOverlayText(e.target.value)}
                    style={{ flex: "1 1 200px", padding: "0.45rem 0.75rem", fontSize: "0.85rem" }}
                  />

                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    <select
                      className="input-base"
                      value={overlaySize}
                      onChange={(e) => setOverlaySize(e.target.value)}
                      style={{ padding: "0.45rem 0.6rem", fontSize: "0.8rem" }}
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="xlarge">Extra Large</option>
                    </select>

                    <select
                      className="input-base"
                      value={overlayColor}
                      onChange={(e) => setOverlayColor(e.target.value)}
                      style={{ padding: "0.45rem 0.6rem", fontSize: "0.8rem" }}
                    >
                      <option value="#ffffff">White</option>
                      <option value="#facc15">Yellow</option>
                      <option value="#ec4899">Pink</option>
                      <option value="#a855f7">Purple</option>
                      <option value="#000000">Black</option>
                    </select>

                    {overlayText && (
                      <button
                        onClick={() => setDragPos({ x: 0, y: 0 })}
                        className="btn-ghost"
                        title="Reset drag position"
                        style={{ padding: "0.4rem 0.6rem", fontSize: "0.75rem" }}
                      >
                        Reset Pos
                      </button>
                    )}

                    <span style={{ fontSize: "0.75rem", color: "var(--color-accent-2)", marginLeft: "0.5rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      💡 Drag text on image to position
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Image & Overlay Wrapper ───────────────────────────────── */}
            <div
              style={{
                flex: 1,
                overflow: "hidden",
                background: "var(--color-surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 0,
                position: "relative",
              }}
            >
              <div
                id="export-image-wrapper"
                style={{
                  position: "relative",
                  display: "inline-block",
                  maxWidth: "100%",
                  maxHeight: "calc(90vh - 130px)",
                  margin: "0 auto",
                }}
              >
                <motion.img
                  src={imageUrl}
                  alt={prompt}
                  initial={{ scale: 1.04, filter: "blur(6px)" }}
                  animate={{ scale: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "calc(90vh - 130px)",
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                    display: "block",
                  }}
                  draggable={false}
                />

                {/* Live Draggable Text Overlay */}
                {overlayText && (
                  <Draggable
                    nodeRef={nodeRef}
                    bounds="parent"
                    onDrag={(e, data) => setDragPos({ x: data.x, y: data.y })}
                    position={dragPos}
                    disabled={isCapturing}
                  >
                    <div
                      ref={nodeRef}
                      style={{
                        position: "absolute",
                        top: "40%",
                        left: "20%",
                        cursor: isCapturing ? "default" : "move",
                        color: overlayColor,
                        fontSize: overlaySize === "small" ? "1.25rem" : overlaySize === "medium" ? "1.75rem" : overlaySize === "large" ? "2.5rem" : "3.25rem",
                        fontWeight: 700,
                        textShadow: overlayColor === "#000000" ? "0 2px 8px rgba(255,255,255,0.8)" : "0 2px 12px rgba(0,0,0,0.85), 0 0 4px rgba(0,0,0,0.6)",
                        userSelect: "none",
                        padding: "0.5rem 1rem",
                        border: isCapturing ? "1px solid transparent" : isEditing ? "1px dashed rgba(255,255,255,0.6)" : "1px solid transparent",
                        borderRadius: "0.5rem",
                        background: isCapturing ? "transparent" : isEditing ? "rgba(0,0,0,0.25)" : "transparent",
                        backdropFilter: isCapturing ? "none" : isEditing ? "blur(4px)" : "none",
                        maxWidth: "60%",
                        wordBreak: "break-word",
                        textAlign: "center",
                        zIndex: 20,
                        boxShadow: isCapturing ? "none" : isEditing ? "0 4px 12px rgba(0,0,0,0.3)" : "none",
                      }}
                    >
                      {overlayText}
                    </div>
                  </Draggable>
                )}
              </div>
            </div>

            {/* ── Caption ───────────────────────────────────────────────── */}
            <div
              style={{
                padding: "0.875rem 1.125rem",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                flexShrink: 0,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "0.875rem",
                  lineHeight: 1.55,
                  color: "var(--color-text)",
                  marginBottom: formattedDate ? "0.35rem" : 0,
                }}
              >
                {prompt}
              </p>
              {formattedDate && (
                <span style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
                  {formattedDate}
                </span>
              )}
            </div>
          </motion.div>

          {/* ── ESC hint ──────────────────────────────────────────────────── */}
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              position: "fixed",
              bottom: "1.25rem",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.3)",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            Press <kbd style={{ fontFamily: "monospace", background: "rgba(255,255,255,0.08)", padding: "0.1em 0.4em", borderRadius: "0.3em" }}>ESC</kbd> or click outside to close
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
