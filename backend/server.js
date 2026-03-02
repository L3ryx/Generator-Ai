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
/* PORT (RENDER) */
/* ============================= */

const PORT = process.env.PORT || 10000;

/* ===================================================== */
/* 🔥 ROUTE TEST */
/* ===================================================== */

app.get("/", (req, res) => {
  res.json({
    message: "🔥 Nano Banana Backend Online"
  });
});

/* ===================================================== */
/* 🦙 LLAMA → OPTIMISATION PROMPT */
/* ===================================================== */

app.post("/optimize", async (req, res) => {

  try {

    const prompt = req.body.prompt;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt manquant" });
    }

    console.log("🦙 Optimisation :", prompt);

    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/meta-llama/Meta-Llama-3-8B-Instruct",
      {
        inputs: `
You are a professional prompt engineer.

Optimize this prompt for cinematic AI image generation:

${prompt}
`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`
        }
      }
    );

    res.json({
      optimized: response.data?.[0]?.generated_text || "Erreur optimisation"
    });

  } catch (error) {

    console.log("❌ ERROR LLAMA");
    console.log(error.response?.data || error.message);

    res.status(500).json({
      error: error.response?.data || error.message
    });
  }

});


/* ===================================================== */
/* 🎨 IMAGE GENERATION (SDXL VIA ROUTER) */
/* ===================================================== */

app.post("/generate-image", async (req, res) => {

  try {

    const prompt = req.body.prompt;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt manquant" });
    }

    console.log("🖼 Prompt envoyé :", prompt);

    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
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

    const base64Image = Buffer.from(response.data).toString("base64");

    res.json({
      image: base64Image
    });

  } catch (error) {

    console.log("🚨 IMAGE ERROR");
    console.log(error.response?.data || error.message);

    res.status(500).json({
      error: error.response?.data || error.message
    });
  }

});


/* ===================================================== */
/* 🚀 LANCEMENT */
/* ===================================================== */

app.listen(PORT, () => {
  console.log("🔥 Server running on port", PORT);
});
