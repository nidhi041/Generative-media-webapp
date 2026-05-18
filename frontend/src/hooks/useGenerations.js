import { useState, useEffect, useCallback } from "react";
import { fetchGenerations, generateImage, regenerate, deleteGeneration } from "../api/generations";
import toast from "react-hot-toast";

/**
 * Central data hook — owns all gallery state and exposes action methods.
 * Components stay purely presentational.
 */
export function useGenerations() {
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const loadGallery = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchGenerations();
      // Guarantee generations is always an array, even if API response shape is unexpected
      setGenerations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGallery(); }, [loadGallery]);

  return { generations, loading, error, reload: loadGallery };
}

/**
 * Hook for the generate form — handles submission, optimistic state,
 * and appending the new record to the gallery.
 */
export function useGenerator({ onSuccess } = {}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(async ({ prompt, style }) => {
    setIsGenerating(true);
    const toastId = toast.loading("Generating your image…");
    try {
      const record = await generateImage({ prompt, style });
      toast.success("Image created!", { id: toastId });
      onSuccess?.(record);
      return record;
    } catch (err) {
      toast.error(err.message, { id: toastId, duration: 5000 });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [onSuccess]);

  return { generate, isGenerating };
}

/**
 * Hook for the tweak/regenerate action on a gallery card.
 */
export function useRegenerate({ onSuccess } = {}) {
  const [regeneratingId, setRegeneratingId] = useState(null);

  const regen = useCallback(async (id, overrides = {}) => {
    setRegeneratingId(id);
    const toastId = toast.loading("Regenerating…");
    try {
      const record = await regenerate(id, overrides);
      toast.success("New image ready!", { id: toastId });
      onSuccess?.(record);
      return record;
    } catch (err) {
      toast.error(err.message, { id: toastId, duration: 5000 });
      return null;
    } finally {
      setRegeneratingId(null);
    }
  }, [onSuccess]);

  return { regen, regeneratingId };
}

/**
 * Hook for deleting a gallery card.
 */
export function useDeleteGeneration({ onSuccess } = {}) {
  const [deletingId, setDeletingId] = useState(null);

  const remove = useCallback(async (id) => {
    setDeletingId(id);
    try {
      await deleteGeneration(id);
      toast.success("Deleted");
      onSuccess?.(id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  }, [onSuccess]);

  return { remove, deletingId };
}
