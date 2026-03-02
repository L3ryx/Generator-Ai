import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("public"));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ============================= */
/* 🦙 LLAMA OPTIMISATION */
/* ============================= */

app.post("/optimize", async (req, res) => {
  const userPrompt = req.body.prompt;

  try {
    const llamaResponse = await axios.post(
      "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct",
      {
        inputs: `
You are a professional cinematic prompt engineer.
Optimize this prompt for ultra realistic image generation:

${userPrompt}
`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`
        }
      }
    );

    const optimized = llamaResponse.data[0]?.generated_text;

    res.json({ optimized });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ============================= */
/* 🍌 NANO BANANA IMAGE */
/* ============================= */

app.post("/generate-image", async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      size: "1024x1024"
    });

    res.json({ image: result.data[0
