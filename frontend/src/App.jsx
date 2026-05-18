import React, { useCallback } from "react";
import Navbar from "./components/ui/Navbar";
import GeneratorForm from "./features/generator/GeneratorForm";
import Gallery from "./features/gallery/Gallery";
import {
  useGenerations,
  useGenerator,
  useRegenerate,
  useDeleteGeneration,
} from "./hooks/useGenerations";

export default function App() {
  const { generations, loading, error, reload } = useGenerations();

  /** Prepend a new record to the local list without a re-fetch */
  const handleNewRecord = useCallback((record) => {
    // Reload to get the freshest sorted state from the store
    reload();
  }, [reload]);

  const { generate, isGenerating } = useGenerator({ onSuccess: handleNewRecord });
  const { regen, regeneratingId }  = useRegenerate({ onSuccess: handleNewRecord });
  const { remove, deletingId }     = useDeleteGeneration({
    onSuccess: (deletedId) => {
      // Optimistic remove — no re-fetch needed
      reload();
    },
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <Navbar />

      <main>
        {/* Hero / Generator */}
        <GeneratorForm onGenerate={generate} isGenerating={isGenerating} />

        {/* Divider */}
        <div style={{
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)",
          margin: "0 1.5rem",
        }} />

        {/* Gallery */}
        <Gallery
          generations={generations}
          loading={loading}
          error={error}
          onRegenerate={regen}
          onDelete={remove}
          regeneratingId={regeneratingId}
          deletingId={deletingId}
        />
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: "center",
        padding: "1.5rem",
        color: "var(--color-muted)",
        fontSize: "0.8125rem",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}>
        GenMedia · Built with Hugging Face Inference API
      </footer>
    </div>
  );
}
