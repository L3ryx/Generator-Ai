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
/* 🔥 TEST ROUTE */
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
      "https://router.huggingface.co/hf-inference/models/meta-llama/Meta-Llama-3-8B-Instruct",
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
