import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/generate", async (req, res) => {
  const userPrompt = req.body.prompt;

  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct",
      {
        inputs: `
        You are a professional prompt engineer.
        Improve and optimize this prompt for high-end cinematic image generation:

        ${userPrompt}
        `
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Server running"));
