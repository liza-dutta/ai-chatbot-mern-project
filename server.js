import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: "1mb" }));

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY || "not-configured",
  ...(process.env.AI_BASE_URL ? { baseURL: process.env.AI_BASE_URL } : {})
});

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true }
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, unique: true, index: true },
  messages: [messageSchema]
}, { timestamps: true });

const Conversation = mongoose.model("Conversation", conversationSchema);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    databaseConnected: mongoose.connection.readyState === 1,
    aiConfigured: Boolean(process.env.AI_API_KEY)
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = typeof req.body.message === "string" ? req.body.message.trim() : "";
    const conversationId = typeof req.body.conversationId === "string" ? req.body.conversationId.trim() : "";

    if (!message) return res.status(400).json({ error: "Please enter a message." });
    if (message.length > 8000) return res.status(400).json({ error: "Message is too long. Please keep it under 8,000 characters." });
    if (!process.env.AI_API_KEY) return res.status(503).json({ error: "The AI service is not configured yet. Add AI_API_KEY to server/.env." });

    let previousMessages = [];
    if (conversationId && mongoose.connection.readyState === 1) {
      const conversation = await Conversation.findOne({ conversationId }).lean();
      previousMessages = (conversation?.messages || []).slice(-20).map(({ role, content }) => ({ role, content }));
    }

    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful, clear, and friendly AI assistant. If you are unsure, say so." },
        ...previousMessages,
        { role: "user", content: message }
      ],
      temperature: 0.7
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("The AI provider returned an empty response.");

    if (conversationId && mongoose.connection.readyState === 1) {
      await Conversation.findOneAndUpdate(
        { conversationId },
        { $push: { messages: { $each: [
          { role: "user", content: message },
          { role: "assistant", content: reply }
        ], $slice: -100 } } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    res.json({ reply, conversationId, saved: mongoose.connection.readyState === 1 });
  } catch (error) {
    console.error("Chat request failed:", error.message);
    const status = error.status && Number.isInteger(error.status) ? error.status : 500;
    res.status(status).json({ error: status === 401 ? "The AI API key was rejected. Check your server configuration." : "Sorry, the AI request failed. Please try again." });
  }
});

app.get("/api/conversations/:id", async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Conversation history requires a MongoDB connection." });
  }
  try {
    const conversation = await Conversation.findOne({ conversationId: req.params.id }).lean();
    if (!conversation) return res.status(404).json({ error: "Conversation not found." });
    res.json({ conversationId: conversation.conversationId, messages: conversation.messages });
  } catch {
    res.status(500).json({ error: "Could not retrieve conversation history." });
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(projectRoot, "dist")));
  app.get("*", (_req, res) => res.sendFile(path.join(projectRoot, "dist", "index.html")));
}

async function start() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("MongoDB connected.");
    } catch (error) {
      console.error("MongoDB connection failed:", error.message);
    }
  } else {
    console.log("MONGODB_URI not set; chat history will not be saved.");
  }
  app.listen(PORT, () => console.log(`API server listening on port ${PORT}`));
}

start();