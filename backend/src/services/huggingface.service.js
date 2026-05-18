const axios = require("axios");

// FLUX.1-schnell and modern HF models are served via the router endpoint
const HF_API_BASE = "https://router.huggingface.co/hf-inference/models";

const styleModifiers = {
  none: "",
  cinematic: "cinematic lighting, photorealistic, ultra detailed, film still,",
  anime: "anime style, studio ghibli, vibrant colors, illustrated,",
  "digital-art": "digital art, concept art, artstation trending, highly detailed,",
  watercolor: "watercolor painting, artistic brush strokes, soft colors,",
  "3d-render": "3D render, octane render, ultra realistic, subsurface scattering,",
};

function buildPrompt(prompt, style) {
  const prefix = styleModifiers[style] || "";
  return prefix ? `${prefix} ${prompt}` : prompt;
}

/**
 * Generate image using Hugging Face Inference API.
 * Returns a base64 data-URI string.
 */
async function generateImage(prompt, style = "none") {
  const model = process.env.HF_MODEL || "black-forest-labs/FLUX.1-schnell";
  const apiKey = process.env.HF_API_KEY;

  if (!apiKey || apiKey === "your_huggingface_api_key_here") {
    throw new Error("HF_API_KEY is missing. Add your Hugging Face token in backend/.env");
  }

  const enhancedPrompt = buildPrompt(prompt, style);

  console.log("====================================");
  console.log("🎨 Generating Image");
  console.log("   Model  :", model);
  console.log("   Style  :", style);
  console.log("   Prompt :", enhancedPrompt.slice(0, 120));
  console.log("====================================");

  try {
    const response = await axios.post(
      `${HF_API_BASE}/${model}`,
      { inputs: enhancedPrompt },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "image/jpeg",
        },
        responseType: "arraybuffer",
        timeout: 120_000,
      }
    );

    const contentType = response.headers["content-type"] || "image/png";

    // If HF returned JSON instead of binary (e.g. error wrapped in 200), detect it
    if (contentType.includes("application/json")) {
      const json = JSON.parse(Buffer.from(response.data).toString());
      const msg = json?.error || json?.message || "Unknown HF error";
      throw new Error(`HF API returned JSON error: ${msg}`);
    }

    const base64 = Buffer.from(response.data).toString("base64");
    console.log("✅ Image generated successfully");
    return `data:${contentType};base64,${base64}`;

  } catch (error) {
    // Log full HF error body for debugging
    if (error.response) {
      console.error("❌ HF API Error — Status:", error.response.status);
      try {
        const body = Buffer.from(error.response.data).toString();
        console.error("   Body:", body.slice(0, 400));
      } catch (_) { /* non-parsable body */ }

      const status = error.response.status;
      if (status === 401) throw new Error("Invalid Hugging Face API key. Check your token.");
      if (status === 403) throw new Error("Permission denied. Enable inference permissions for your HF token.");
      if (status === 404) throw new Error("Model not found. Check HF_MODEL in .env.");
      if (status === 503) throw new Error("Model is loading. Please wait a few seconds and try again.");
      if (status === 429) throw new Error("Rate limit reached. Try again in a moment.");
    }

    if (error.code === "ECONNABORTED") {
      throw new Error("Image generation timed out. Hugging Face free tier may be slow — try again.");
    }

    // Re-throw already-formatted messages (JSON-in-200 case above)
    throw new Error(error.message || "Failed to generate image.");
  }
}

module.exports = { generateImage };
