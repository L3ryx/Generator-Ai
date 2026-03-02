import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();

/* ============================= */
/* MIDDLEWARE */
/* ============================= */

app.use(cors());
app.use(express.json());
app.use(express.static("../public"));

/* ============================= */
/* PORT DYNAMIQUE RENDER */
/* ============================= */

const PORT = process.env.PORT || 3000;

/* ============================= */
/* 🔥 TEST ROUTE (Pour vérifier que le serveur fonctionne) */
/* ============================= */

app.get("/", (req, res) => {
  res.json({ message: "🔥 Nano Banana Backend Online" });
});

/* ============================= */
/* 🦙 OPTIMISER PROMPT AVEC LLAMA */
/* ============================= */

app.post("/optimize", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt manquant" });
    }

    console.log("🦙 Optimisation du prompt :", prompt);

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct",
      {
        inputs: `
You are a professional prompt engineer.

Optimize this prompt for cinematic image generation:

${prompt}
`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`
        }
      }
    );

    const result = response.data;

    res.json({
      optimized: result[0]?.generated_text || "Erreur optimisation"
    });

  } catch (error) {

    console.log("❌ ERROR LLAMA:");
    console.log(error.response?.data || error.message);

    res.status(500).json({
      error: error.response?.data || error.message
    });
  }
});

/* ============================= */
/* 🎨 GENERER IMAGE AVEC SDXL */
/* ============================= */

app.post("/generate-image", async (req, res) => {
  try {

    const prompt = req.body.prompt;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt manquant" });
    }

    console.log("🖼 Prompt envoyé à SDXL :", prompt);

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        inputs: prompt
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`
        },
        responseType: "arraybuffer"
      }
    );

    const base64Image = Buffer.from(response.data, "binary").toString("base64");

    res.json({
      image: base64Image
    });

  } catch (error) {

    console.log("🚨 ERROR IMAGE:");
    console.log(error.response?.data || error.message);

    res.status(500).json({
      error: error.response?.data || error.message
    });
  }
});

/* ============================= */
/* 🚀 LANCEMENT */
/* ============================= */

app.listen(PORT, () => {
  console.log("🔥 Server running on port", PORT);
});
