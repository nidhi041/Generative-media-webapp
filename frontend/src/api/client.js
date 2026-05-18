import axios from "axios";

/**
 * Axios instance — all requests go through the Vite proxy (/api → :5000/api).
 * Swap the baseURL here when deploying to production.
 */
const api = axios.create({
  baseURL: "/api",
  timeout: 130_000, // HF models can be slow on cold starts
  headers: { "Content-Type": "application/json" },
});

// ─── Response interceptor ─────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Backend wraps errors as { success: false, error: string }
    const message =
      err.response?.data?.error ||
      err.message ||
      (err.code === "ECONNABORTED" ? "Request timed out" : "Network error");
    return Promise.reject(new Error(message));
  }
);

export default api;
