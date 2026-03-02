import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("../public"));

const PORT = process.env.PORT || 3000;

/* ===================== */
/* ROUTE TEST */
/* ===================== */

app.get("/", (req, res) => {
  res.json({ status: "Nano Banana Backend Running 🚀" });
});

/* ===================== */
/* OPTIMIZE */
/* ===================== */

app.post("/optimize", async (req, res) => {
  try {

    const prompt = req.body.prompt;
    if (!prompt) return res.status(400).json({ error: "No prompt" });

    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/meta-llama/Meta-Llama-3-8B-Instruct",
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`
        }
      }
    );

    res.json({
      optimized: response.data[0]?.generated_text || "Error"
    });

  } catch (err) {
    console.log("LLAMA ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ===================== */
/* GENERATE IMAGE */
/* ===================== */

app.post("/generate-image", async (req, res) => {
  try {

    const prompt = req.body.prompt;
    if (!prompt) return res.status(400).json({ error: "No prompt" });

    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/runwayml/stable-diffusion-v1-5",
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`
        },
        responseType: "arraybuffer"
      }
    );

    const base64 = Buffer.from(response.data, "binary").toString("base64");

    res.json({ image: base64 });

  } catch (err) {
    console.log("IMAGE ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ===================== */
/* START SERVER */
/* ===================== */

app.listen(PORT, () => {
  console.log("🔥 Server running on port", PORT);
});
