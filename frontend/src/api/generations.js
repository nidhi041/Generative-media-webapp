import api from "./client";

/**
 * Generate a new image.
 * Backend now returns { success: true, data: GenerationRecord }
 * @param {{ prompt: string, style?: string }} payload
 * @returns {Promise<GenerationRecord>}
 */
export const generateImage = (payload) =>
  api.post("/generate", payload).then((r) => r.data.data);

/**
 * Fetch all past generations, newest first.
 * Backend returns { success: true, data: GenerationRecord[] }
 * @returns {Promise<GenerationRecord[]>}
 */
export const fetchGenerations = () =>
  api.get("/generations").then((r) => r.data.data);

/**
 * Regenerate from an existing record (optionally with tweaks).
 * @param {string} id
 * @param {{ prompt?: string, style?: string }} overrides
 * @returns {Promise<GenerationRecord>}
 */
export const regenerate = (id, overrides = {}) =>
  api.post(`/generations/${id}/regenerate`, overrides).then((r) => r.data.data);

/**
 * Delete a generation by id.
 * @param {string} id
 * @returns {Promise<void>}
 */
export const deleteGeneration = (id) =>
  api.delete(`/generations/${id}`);
