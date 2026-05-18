const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { generateImage } = require("../services/huggingface.service");
const store = require("../data/store");

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────

const VALID_STYLES = [
  "none",
  "cinematic",
  "anime",
  "digital-art",
  "watercolor",
  "3d-render",
];

function validateGenerateBody(body) {
  const errors = [];

  if (!body.prompt || typeof body.prompt !== "string" || !body.prompt.trim()) {
    errors.push("Prompt is required.");
  }

  if (body.prompt && body.prompt.length > 1000) {
    errors.push("Prompt must be under 1000 characters.");
  }

  if (body.style && !VALID_STYLES.includes(body.style)) {
    errors.push(`Invalid style. Allowed: ${VALID_STYLES.join(", ")}`);
  }

  return errors;
}

// ─────────────────────────────────────────────────────────────
// POST /api/generate
// ─────────────────────────────────────────────────────────────

router.post("/generate", async (req, res) => {
  console.log("🔥 /api/generate route hit");
  console.log("📦 Request Body:", req.body);

  const errors = validateGenerateBody(req.body);

  if (errors.length) {
    console.log("❌ Validation Error:", errors);
    return res.status(400).json({
      success: false,
      error: errors.join("; "),
    });
  }

  const { prompt, style = "none" } = req.body;
  const id = uuidv4();

  store.create({
    id,
    prompt: prompt.trim(),
    style,
    imageUrl: null,
    status: "pending",
    error: null,
    createdAt: new Date().toISOString(),
  });

  try {
    console.log("🧠 Calling Hugging Face API...");

    const imageUrl = await generateImage(prompt.trim(), style);

    console.log("✅ Image generated successfully");

    const updatedRecord = store.update(id, {
      imageUrl,
      status: "success",
      error: null,
    });

    return res.status(201).json({
      success: true,
      data: updatedRecord,
    });
  } catch (error) {
    console.error("❌ GENERATION ERROR — Message:", error.message);

    let statusCode = 502;
    let message = "Image generation failed.";

    if (error.message.includes("Invalid Hugging Face API key")) {
      statusCode = 401;
      message = error.message;
    } else if (error.message.includes("Permission denied")) {
      statusCode = 403;
      message = error.message;
    } else if (error.message.includes("Model is loading")) {
      statusCode = 503;
      message = error.message;
    } else if (error.message.includes("timed out")) {
      statusCode = 504;
      message = error.message;
    } else if (error.message.includes("Model not found")) {
      statusCode = 404;
      message = error.message;
    }

    store.update(id, { status: "error", error: message });

    return res.status(statusCode).json({
      success: false,
      error: message,
      id,
    });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/generations
// ─────────────────────────────────────────────────────────────

router.get("/generations", (req, res) => {
  console.log("📚 Fetching all generations");
  const generations = store.getAll();
  return res.json({
    success: true,
    data: generations,
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/generations/:id
// ─────────────────────────────────────────────────────────────

router.get("/generations/:id", (req, res) => {
  const record = store.getById(req.params.id);

  if (!record) {
    return res.status(404).json({ success: false, error: "Generation not found" });
  }

  return res.json({ success: true, data: record });
});

// ─────────────────────────────────────────────────────────────
// POST /api/generations/:id/regenerate
// ─────────────────────────────────────────────────────────────

router.post("/generations/:id/regenerate", async (req, res) => {
  console.log("🔄 Regeneration route hit");

  const original = store.getById(req.params.id);

  if (!original) {
    return res.status(404).json({ success: false, error: "Generation not found" });
  }

  const prompt = (req.body.prompt || original.prompt).trim();
  const style = req.body.style || original.style;

  const errors = validateGenerateBody({ prompt, style });
  if (errors.length) {
    return res.status(400).json({ success: false, error: errors.join("; ") });
  }

  const id = uuidv4();
  store.create({
    id,
    prompt,
    style,
    imageUrl: null,
    status: "pending",
    error: null,
    createdAt: new Date().toISOString(),
  });

  try {
    console.log("🧠 Regenerating image...");

    const imageUrl = await generateImage(prompt, style);

    console.log("✅ Regenerated successfully");

    const updatedRecord = store.update(id, {
      imageUrl,
      status: "success",
      error: null,
    });

    return res.status(201).json({ success: true, data: updatedRecord });
  } catch (error) {
    console.error("❌ REGENERATE ERROR — Message:", error.message);

    store.update(id, { status: "error", error: error.message });

    return res.status(502).json({
      success: false,
      error: error.message,
      id,
    });
  }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/generations/:id
// ─────────────────────────────────────────────────────────────

router.delete("/generations/:id", (req, res) => {
  console.log("🗑️ Delete route hit");

  const deleted = store.remove(req.params.id);

  if (!deleted) {
    return res.status(404).json({ success: false, error: "Generation not found" });
  }

  return res.status(204).send();
});

module.exports = router;
