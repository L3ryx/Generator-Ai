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
/* PORT */
/* ============================= */

const PORT = process.env.PORT || 3000;

/* ============================= */
/* TEST ROUTE */
/* ============================= */

app.get("/", (req, res) => {
  res.json({ message: "🔥 Nano Banana Backend Online" });
});

/* ============================= */
/* OPTIMIZE PROMPT */
/* ============================= */

app.post("/optimize", async (req, res) => {
  try {

    const prompt = req.body.prompt;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt manquant" });
    }

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

    console.log("❌ ERROR LLAMA:", error.response?.data || error.message);

    res.status(500).json({
      error: error.response?.data || error.message
    });

  }
});

/* ============================= */
/* GENERATE IMAGE */
/* ============================= */

app.post("/generate-image", async (req, res) => {
  try {

    const prompt = req.body.prompt;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt manquant" });
    }

    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/runwayml/stable-diffusion-v1-5",
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

    console.log("🚨 ERROR IMAGE:", error.response?.data || error.message);

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
