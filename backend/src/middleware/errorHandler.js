/**
 * Global error handler — must be the last middleware registered.
 */
function errorHandler(err, req, res, next) {
  console.error("[unhandled]", err);
  res.status(500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { detail: err.message }),
  });
}

/**
 * 404 handler for undefined routes.
 */
function notFound(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
}

module.exports = { errorHandler, notFound };
