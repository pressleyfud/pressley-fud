const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per minute
  message: { error: "Pressley is busy. Please slow down." }
});

app.use("/api/", limiter);

// Example of a cache system
const cache = new Map();
let requestCount = 0;

// Endpoint to generate a fake meme from a real headline
app.post("/api/generate-fud-meme", async (req, res) => {
  const { headline, isRealHeadline } = req.body;

  if (!headline) {
    return res.status(400).json({ error: "Headline is required." });
  }

  if (cache.has(headline)) {
    return res.json({ memeText: cache.get(headline) });
  }

  try {
    // Simulate meme generation with real headlines (or fake ones)
    let memeText = `Meme: ${headline}`;

    if (!isRealHeadline) {
      memeText += " - This is a fake headline!";
    }

    cache.set(headline, memeText);
    requestCount++;

    console.log(`Image generated. Total today: ${requestCount}`);
    res.json({ memeText });
  } catch (error) {
    console.error("Error generating meme:");
    console.error(error.message);
    res.status(500).json({ error: "Meme generation failed." });
  }
});

// Test endpoint to check if the server is running
app.get("/test", (req, res) => {
  res.send("Server is running!");
});

// Start the server
app.listen(3000, "0.0.0.0", () => {
  console.log("🚀 Pressley Meme Generator running on port 3000 (IPv4 forced)");
});
