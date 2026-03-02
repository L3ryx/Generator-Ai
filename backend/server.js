import express from "express";
import axios from "axios";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

/* ============================= */
/* APP SETUP */
/* ============================= */

const app = express();

app.use(cors());
app.use(express.json());

/* ============================= */
/* PATH CONFIG (IMPORTANT POUR FRONTEND) */
/* ============================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Servir le dossier public */
app.use(express.static(path.join(__dirname, "public")));

/* Route principale → Charge l’interface */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ============================= */
/* PORT RENDER */
/* ============================= */

const PORT = process.env.PORT || 10000;

/* ============================= */
/* 🦙 LLAMA VIA HUGGINGFACE ROUTER */
/* ============================= */

app.post("/optimize", async (req, res) => {

  try {

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt manquant" });
    }

    const response = await axios.post(
      "https://router.huggingface.co/v1/chat/completions",
      {
        model: "meta-llama/Meta-Llama-3-8B-Instruct:novita",
        messages: [
          {
            role: "user",
            content: `
You are a professional prompt engineer.
Optimize this prompt for cinematic image generation:

${prompt}
`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    const optimized = response.data?.choices?.[0]?.message?.content;

    res.json({ optimized });

  } catch (error) {

    console.error("❌ LLAMA ERROR:", error.response?.data || error.message);

    res.status(500).json({
      error: error.response?.data || error.message
    });
  }

});


/* ============================= */
/* 🎨 STABLE DIFFUSION XL */
/* ============================= */

app.post("/generate-image", async (req, res) => {

  try {

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt manquant" });
    }

    console.log("🖼 Génération image :", prompt);

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

    const base64 = Buffer.from(response.data).toString("base64");

    res.json({ image: base64 });

  } catch (error) {

    console.error("🚨 IMAGE ERROR:", error.response?.data || error.message);

    res.status(500).json({
      error: error.response?.data || error.message
    });
  }

});


/* ============================= */
/* START SERVER */
/* ============================= */

app.listen(PORT, () => {
  console.log("🔥 Server running on port", PORT);
});
