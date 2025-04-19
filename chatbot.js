// routes/chatbot.js
const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const authenticateToken = require("../middleware/auth");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/chat", authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    console.log("📝 Incoming message:", message);

    if (!message) return res.status(400).json({ error: "Message is required" });

    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // ✅ supported in latest SDK

    const result = await model.generateContent([ { role: "user", parts: [{ text: message }] } ]);
    const response = await result.response;
    const reply = response.text();

    console.log("✅ Gemini replied:", reply);
    res.json({ reply });
  } catch (err) {
    console.error("❌ Gemini AI error:", err.message);
    res.status(500).json({ error: "Something went wrong with Gemini AI" });
  }
});

module.exports = router;
