const express = require("express");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();
app.use(express.json()); // To parse JSON bodies

// Apply rate limiting to API routes
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per minute
  message: { error: "Pressley is busy. Please slow down." }
});
app.use("/api/", limiter);

// Initialize cache and request count
const cache = new Map();
let requestCount = 0;

// Test route to verify server is running
app.get("/test", (req, res) => {
  res.send("Server is running!");
});

// Endpoint to generate a meme from a real or fake headline
app.post("/api/generate-fud-meme", (req, res) => {
  const { headline, isRealHeadline } = req.body;

  if (!headline) {
    return res.status(400).json({ error: "Headline is required." });
  }

  // Check if the meme has already been generated
  if (cache.has(headline)) {
    return res.json({ memeText: cache.get(headline) });
  }

  // Generate meme
  let memeText = `Meme: ${headline}`;
  if (!isRealHeadline) {
    memeText += " - This is a fake headline!";
  }

  // Cache the meme
  cache.set(headline, memeText);
  requestCount++;

  console.log(`Image generated. Total today: ${requestCount}`);
  res.json({ memeText });
});

// Start the server
app.listen(3000, () => {
  console.log("🚀 Pressley Meme Generator running on port 3000");
});
