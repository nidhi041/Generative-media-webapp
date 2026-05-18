/**
 * In-memory store for generation metadata.
 * Swap this module for a database adapter (e.g. MongoDB, SQLite) later
 * without touching any route or service code.
 */

/** @type {Array<GenerationRecord>} */
let generations = [];

/**
 * @typedef {Object} GenerationRecord
 * @property {string}  id        - UUID
 * @property {string}  prompt    - User prompt text
 * @property {string}  style     - Optional style modifier
 * @property {string}  imageUrl  - Base64 data-URI or hosted URL
 * @property {string}  status    - 'success' | 'error'
 * @property {string|null} error - Error message if status === 'error'
 * @property {string}  createdAt - ISO timestamp
 */

const store = {
  /** Return all records, newest first */
  getAll() {
    return [...generations].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },

  /** Return a single record by id */
  getById(id) {
    return generations.find((g) => g.id === id) || null;
  },

  /** Insert a new record */
  create(record) {
    generations.push(record);
    return record;
  },

  /** Replace a record by id (used for regeneration) */
  update(id, updates) {
    const idx = generations.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    generations[idx] = { ...generations[idx], ...updates };
    return generations[idx];
  },

  /** Delete a record by id */
  remove(id) {
    const before = generations.length;
    generations = generations.filter((g) => g.id !== id);
    return generations.length < before;
  },
};

module.exports = store;
