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

/* ============================= */
/* TEST ROUTE */
/* ============================= */

app.get("/", (req, res) => {
  res.json({ message: "🔥 Nano Banana Backend Online" });
});

/* ===================================================== */
/* 🦙 LLAMA - OPTIMISATION PROMPT VIA ROUTER HUGGINGFACE */
/* ===================================================== */

app.post("/optimize", async (req, res) => {

  try {

    const prompt = req.body.prompt;

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
            content: "You are a professional prompt engineer."
          },
          {
            role: "user",
            content: `Optimize this prompt for cinematic image generation:\n\n${prompt}`
          }
        ],
        max_tokens: 500
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      optimized: response.data.choices[0].message.content
    });

  } catch (error) {

    console.log("❌ ERROR LLAMA", error.response?.data || error.message);

    res.status(500).json({
      error: error.response?.data || error.message
    });
  }

});


/* ===================================================== */
/* 🎨 STABLE DIFFUSION v1.5 - IMAGE GENERATION */
/* ===================================================== */

app.post("/generate-image", async (req, res) => {

  try {

    const prompt = req.body.prompt;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt manquant" });
    }

    console.log("🖼 Génération image :", prompt);

    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/stable-diffusion-v1-5/stable-diffusion-v1-5",
      {
        inputs: prompt,
        parameters: {
          width: 512,
          height: 512
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      }
    );

    const base64Image = Buffer.from(response.data).toString("base64");

    res.json({
      image: base64Image
    });

  } catch (error) {

    console.log("🚨 ERROR IMAGE", error.response?.data || error.message);

    res.status(500).json({
      error: error.response?.data || error.message
    });
  }

});


/* ============================= */
/* LANCEMENT */
/* ============================= */

app.listen(PORT, () => {
  console.log("🔥 Server running on port", PORT);
});
