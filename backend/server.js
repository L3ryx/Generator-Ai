import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

/* ========================= */
/* MIDDLEWARE */
/* ========================= */

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ========================= */
/* 🔥 CACHE + QUEUE */
/* ========================= */

const cache = new Map();
let queue = [];
let isProcessing = false;

function processQueue() {
  if (isProcessing || queue.length === 0) return;

  isProcessing = true;
  const { req, res, handler } = queue.shift();

  handler(req, res).finally(() => {
    isProcessing = false;
    processQueue();
  });
}

function addToQueue(req, res, handler) {
  queue.push({ req, res, handler });
  processQueue();
}

/* ========================= */
/* 🦙 LLM OPTIMISATION */
/* ========================= */

app.post("/optimize", (req, res) => {
  addToQueue(req, res, async (req, res) => {

    const prompt = req.body.prompt;
    if (!prompt) return res.status(400).json({ error: "Prompt manquant" });

    try {

      const response = await axios.post(
        "https://router.huggingface.co/v1/chat/completions",
        {
          model: "meta-llama/Meta-Llama-3-8B-Instruct",
          messages: [
            {
              role: "user",
              content: `Optimize this prompt for cinematic image generation:\n\n${prompt}`
            }
          ],
          stream: false
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`
          }
        }
      );

      const optimized = response.data.choices?.[0]?.message?.content;

      res.json({ optimized });

    } catch (err) {

      console.log("LLAMA ERROR:", err.response?.data || err.message);
      res.status(500).json({ error: "LLAMA ERROR" });

    }
  });
});

/* ========================= */
/* 🎨 IMAGE GENERATION */
/* ========================= */

app.post("/generate-image", (req, res) => {

  addToQueue(req, res, async (req, res) => {

    const prompt = req.body.prompt;
    if (!prompt) return res.status(400).json({ error: "Prompt manquant" });

    /* 🔥 CACHE */
    if (cache.has(prompt)) {
      console.log("⚡ Image from cache");
      return res.json({ image: cache.get(prompt) });
    }

    try {

      const response = await axios.post(
        "https://router.huggingface.co/models/stable-diffusion-v1-5/stable-diffusion-v1-5",
        { inputs: prompt },
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`
          },
          responseType: "arraybuffer"
        }
      );

      const base64 = Buffer.from(response.data).toString("base64");

      cache.set(prompt, base64);

      res.json({ image: base64 });

    } catch (err) {

      console.log("IMAGE ERROR:", err.response?.data || err.message);
      res.status(500).json({ error: "IMAGE GENERATION FAILED" });

    }
  });

});

/* ========================= */
/* SERVER START */
/* ========================= */

app.listen(PORT, () => {
  console.log("🔥 Server running on port", PORT);
});
