require("dotenv").config();

const express = require("express");
const cors = require("cors");

const generationRoutes = require("./src/routes/generation.routes");
const {
errorHandler,
notFound,
} = require("./src/middleware/errorHandler");

const app = express();

const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────────────────────
// CORS CONFIGURATION
// ─────────────────────────────────────────────────────────────

const allowedOrigins = [
"http://localhost:5173",
"https://generative-media-webapp-6fe4.vercel.app",
];

app.use(
cors({
origin: function (origin, callback) {
// Allow requests with no origin (Postman, mobile apps, curl, etc.)
if (!origin) return callback(null, true);


  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  return callback(new Error("CORS policy violation"));
},

methods: ["GET", "POST", "DELETE"],

allowedHeaders: ["Content-Type"],

credentials: true,


})
);

// ─────────────────────────────────────────────────────────────
// BODY PARSING
// ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: "1mb" }));

// ─────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────

app.get("/health", (req, res) => {
res.json({
status: "ok",
timestamp: new Date().toISOString(),
});
});

// ─────────────────────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────────────────────

app.use("/api", generationRoutes);

// ─────────────────────────────────────────────────────────────
// FALLBACKS
// ─────────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
console.log(`\n🚀 Generative Media API running on port ${PORT}`);
console.log(`🌐 Health Check: /health`);
console.log(
`⚙️ Environment: ${process.env.NODE_ENV || "development"}\n`
);
});
