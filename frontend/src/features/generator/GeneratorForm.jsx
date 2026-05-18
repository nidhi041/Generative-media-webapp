import React, { useState } from "react";
import { motion } from "framer-motion";
import { Wand2, ChevronDown } from "lucide-react";

const STYLES = [
  { value: "none",        label: "No style" },
  { value: "cinematic",   label: "Cinematic" },
  { value: "anime",       label: "Anime" },
  { value: "digital-art", label: "Digital Art" },
  { value: "watercolor",  label: "Watercolor" },
  { value: "3d-render",   label: "3D Render" },
];

/**
 * Hero generator form.
 * @param {{ onGenerate: (payload: {prompt, style}) => Promise<void>, isGenerating: boolean }} props
 */
export default function GeneratorForm({ onGenerate, isGenerating }) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle]   = useState("none");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    await onGenerate({ prompt: prompt.trim(), style });
  };

  return (
    <section
      className="hero-bg"
      style={{
        padding: "5rem 1.5rem 4rem",
        textAlign: "center",
      }}
    >
      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <div className="badge" style={{ marginBottom: "1.25rem", display: "inline-flex" }}>
          ✦ AI-Powered Image Generation
        </div>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: "1rem",
          }}
        >
          Turn words into&nbsp;
          <span
            style={{
              background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            stunning visuals
          </span>
        </h1>
        <p
          style={{
            color: "var(--color-muted)",
            fontSize: "1.0625rem",
            maxWidth: 520,
            margin: "0 auto 2.5rem",
            lineHeight: 1.7,
          }}
        >
          Describe what you imagine. Our AI will generate a high-quality image in seconds.
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
        className="glass"
        style={{
          maxWidth: 680,
          margin: "0 auto",
          borderRadius: "1.25rem",
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <label
          htmlFor="prompt-input"
          style={{
            textAlign: "left",
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "var(--color-muted)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Your Prompt
        </label>

        <textarea
          id="prompt-input"
          className="input-base"
          placeholder="A futuristic cityscape at night, neon lights reflecting on wet streets, ultra-detailed…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          maxLength={1000}
          disabled={isGenerating}
        />

        {/* Bottom row: style dropdown + generate button */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          {/* Style select */}
          <div style={{ position: "relative", flex: "0 0 auto" }}>
            <select
              id="style-select"
              className="input-base"
              style={{ paddingRight: "2.25rem", minWidth: 150 }}
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              disabled={isGenerating}
            >
              {STYLES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <ChevronDown
              size={16}
              style={{
                position: "absolute",
                right: "0.625rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-muted)",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Char count */}
          <span style={{ color: "var(--color-muted)", fontSize: "0.8125rem", flex: 1, textAlign: "left" }}>
            {prompt.length}/1000
          </span>

          {/* Generate */}
          <button
            id="generate-btn"
            type="submit"
            className="btn-primary"
            disabled={isGenerating || !prompt.trim()}
            style={{ flex: "0 0 auto" }}
          >
            {isGenerating ? (
              <>
                <span className="spinner" />
                Generating…
              </>
            ) : (
              <>
                <Wand2 size={17} />
                Generate
              </>
            )}
          </button>
        </div>

        {/* Generating progress hint */}
        {isGenerating && (
          <p style={{ color: "var(--color-muted)", fontSize: "0.8125rem", textAlign: "center", margin: 0 }}>
            ⏳ This may take 20–60 seconds on first run while the model loads…
          </p>
        )}
      </motion.form>
    </section>
  );
}
