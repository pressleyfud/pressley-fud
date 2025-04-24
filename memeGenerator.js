require("dotenv").config();
const axios = require("axios");
const { Configuration, OpenAIApi } = require("openai");

const CP_API_URL = "https://cryptopanic.com/api/v1/posts";

// Fetch top 10 real headlines from CryptoPanic, with error fallback
async function getRealHeadlines() {
  const apiKey = process.env.CRYPTOPANIC_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ CRYPTOPANIC_API_KEY is missing, returning empty real headlines list");
    return [];
  }
  try {
    const resp = await axios.get(CP_API_URL, {
      params: { auth_token: apiKey, public: true }
    });
    const posts = resp.data.results || [];
    return posts.slice(0, 10).map(p => p.title);
  } catch (err) {
    console.error("🔴 Error fetching real headlines:", err.message);
    return [];
  }
}

// Stub for custom headlines (you can wire up a DB or file here)
function getCustomHeadlines() {
  return [];
}

// Generate a short meme caption via GPT-4
async function generateMemeText(headline) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing");

  const config = new Configuration({ apiKey });
  const client = new OpenAIApi(config);

  const system = "You are a witty crypto meme generator. Keep it under 60 tokens.";
  const user   = `Create a short, humorous meme caption based on this headline:\n"${headline}"`;

  const res = await client.createChatCompletion({
    model: "gpt-4",
    messages: [
      { role: "system", content: system },
      { role: "user",   content: user }
    ],
    temperature: 0.7,
    max_tokens: 60
  });

  return res.data.choices[0].message.content.trim();
}

module.exports = { getRealHeadlines, getCustomHeadlines, generateMemeText };
