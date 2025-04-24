// server.js
require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const { OpenAI } = require('openai');

const app = express();
app.use(express.json());

// rate-limit all /api routes to 10 calls per minute
app.use('/api/', rateLimit({
  windowMs: 60_000,
  max: 10,
  message: { error: "Slow down a bit, please." }
}));

// CryptoPanic and OpenAI clients
const cryptoPanicKey = process.env.CRYPTOPANIC_API_KEY;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 1) GET /api/headlines → { real: [..10 titles..], custom: [] }
app.get('/api/headlines', async (req, res) => {
  try {
    const r = await axios.get(
      `https://cryptopanic.com/api/v1/posts/`,
      { params: { auth_token: cryptoPanicKey, filter: 'hot' } }
    );
    const real = (r.data.results || [])
      .slice(0, 10)
      .map(p => p.title);
    return res.json({ real, custom: [] });
  } catch (err) {
    console.error('🔴 CryptoPanic error:', err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to fetch headlines." });
  }
});

// 2) POST /api/generate-fud-meme
//    body: { headline: string, isRealHeadline: boolean }
app.post('/api/generate-fud-meme', async (req, res) => {
  const { headline, isRealHeadline } = req.body;
  if (typeof headline !== 'string') {
    return res.status(400).json({ error: "headline must be a string." });
  }

  // Build the system + user prompt
  const system = "You are Pressley FUD, a snarky crypto‐frog who turns headlines into one-liner memes.";
  let user;
  if (isRealHeadline) {
    user = `Turn this REAL news headline into a funny meme caption (just a single quip):\n\n"${headline}"`;
  } else {
    user = `Create a brand-new crypto meme caption using these keywords (single quip):\n\n"${headline}"`;
  }

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",        // or "gpt-4" / "gpt-3.5-turbo"
      messages: [
        { role: "system", content: system },
        { role: "user",   content: user }
      ],
      temperature: 0.8,
      max_tokens: 60
    });

    const memeText = chat.choices[0].message.content.trim();
    return res.json({ memeText });

  } catch (err) {
    console.error('🔴 OpenAI error:', err);
    return res.status(500).json({ error: "Failed to generate meme text." });
  }
});

// start up
app.listen(3000, '0.0.0.0', () => {
  console.log('🚀 Pressley Meme Generator running on port 3000');
});
