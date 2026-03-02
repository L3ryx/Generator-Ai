import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("../public"));

/* ============================= */
/* 🦙 Llama → Optimiser Prompt */
/* ============================= */

app.post("/optimize", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3",
        prompt: `
You are a professional prompt engineer.
Optimize this for cinematic image generation:

${prompt}
        `,
        stream: false
      }
    );

    res.json({ optimized: response.data.response });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================= */
/* 🎨 Stable Diffusion → Image */
/* ============================= */

app.post("/generate-image", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      "http://localhost:7860/sdapi/v1/txt2img",
      {
        prompt: prompt,
        steps: 25
      }
    );

    const image = response.data.images[0];

    res.json({ image });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () =>
  console.log("🔥 Server running on port 3000")
);
