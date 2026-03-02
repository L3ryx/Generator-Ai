import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();

/* ============================= */
/* MIDDLEWARE */
/* ============================= */

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ============================= */
/* PORT RENDER */
/* ============================= */

const PORT = process.env.PORT || 10000;

/* ===================================================== */
/* 🟢 ROUTE TEST */
/* ===================================================== */

app.get("/", (req, res) => {
  res.json({ message: "🔥 Nano Banana Backend Online" });
});

/* ===================================================== */
/* 🦙 LLAMA VIA HUGGINGFACE ROUTER (VERSION OFFICIELLE) */
/* ===================================================== */

app.post("/optimize", async (req, res) => {

  try {

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt manquant" });
    }

    console.log("🦙 Optimisation :", prompt);

    const response = await axios.post(
      "https://router.huggingface.co/v1/chat/completions",
      {
        model: "meta-llama/Meta-Llama-3-8B-Instruct",
        messages: [
          {
            role: "system",
            content: "You are a professional prompt engineer. Optimize for cinematic image generation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 512
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    const optimized = response.data?.choices?.[0]?.message?.content;

    res.json({
      optimized: optimized || "Erreur optimisation"
    });

  } catch (err) {

    console.error("🚨 ERROR LLAMA :", err.response?.data || err.message);

    res.status(500).json({
      error: err.response?.data || err.message
    });
  }

});


/* ===================================================== */
/* 🎨 STABLE DIFFUSION XL VIA ROUTER (PLUS STABLE) */
/* ===================================================== */

app.post("/generate-image", async (req, res) => {

  try {

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt manquant" });
    }

    console.log("🖼 Génération image :", prompt);

    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        inputs: prompt,
        parameters: {
          negative_prompt: "blurry, low quality, distorted, ugly"
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer",
        timeout: 180000
      }
    );

    if (!response.data) {
      return res.status(500).json({ error: "Image vide reçue" });
    }

    const base64Image = Buffer.from(response.data).toString("base64");

    res.json({
      image: base64Image
    });

  } catch (err) {

    console.error("🚨 IMAGE ERROR :", err.response?.data || err.message);

    res.status(500).json({
      error: err.response?.data || err.message
    });
  }

});


/* ===================================================== */
/* 🚀 LANCEMENT */
/* ===================================================== */

app.listen(PORT, () => {
  console.log("🔥 Server running on port", PORT);
});
