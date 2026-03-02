import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("../public"));

/* ============================= */
/* 🔥 PORT DYNAMIQUE RENDER */
/* ============================= */

const PORT = process.env.PORT || 3000;

/* ============================= */
/* 🦙 LLAMA → OPTIMISER PROMPT */
/* ============================= */

app.post("/optimize", async (req, res) => {

  try {

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct",
      {
        inputs: `
You are a professional prompt engineer.

Optimize this prompt for cinematic image generation:

${req.body.prompt}
`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`
        }
      }
    );

    res.json({
      optimized: response.data[0]?.generated_text
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});


/* ============================= */
/* 🎨 STABLE DIFFUSION → IMAGE */
/* ============================= */

app.post("/generate-image", async (req, res) => {

  try {

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
      {
        inputs: req.body.prompt
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

    res.status(500).json({
      error: error.message
    });

  }

});


/* ============================= */
/* 🚀 LANCEMENT DU SERVEUR */
/* ============================= */

app.listen(PORT, () => {
  console.log("🔥 Server running on port " + PORT);
});
