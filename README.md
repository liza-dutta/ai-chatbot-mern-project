# AI Chatbot — MERN Portfolio Project

A full-stack AI chatbot portfolio project built with MongoDB, Express, React, and Node.js. It includes a responsive chat interface, server-side AI requests, optional MongoDB chat history, loading/error states, and a clear setup guide.

## Features
- React + Vite chat interface
- Express REST API
- AI provider key kept on the backend (never expose it in React)
- Optional MongoDB persistence for conversations
- Clear chat, responsive layout, typing indicator, error handling
- `.env.example` and beginner-friendly setup instructions

## Requirements
- Node.js 18+
- An AI API key compatible with the OpenAI Chat Completions API
- MongoDB connection string (optional; without it, chat works but history is not saved)

## Run locally
1. Install Node.js.
2. Copy `server/.env.example` to `server/.env`.
3. Add your AI API key to `AI_API_KEY`. Add a MongoDB connection string to `MONGODB_URI` if you want saved chat history.
4. In the project root run:
   ```bash
   npm install
   npm run install:all
   npm run dev
   ```
5. Open the Vite URL shown in the terminal (normally http://localhost:5173).

## Environment variables
See `server/.env.example`. Never commit `.env` or put your API key in frontend code.

## API
- `GET /api/health` — server status
- `POST /api/chat` — body: `{ "message": "Hello", "conversationId": "optional-id" }`
- `GET /api/conversations/:id` — retrieve saved messages (MongoDB required)

## Suggested GitHub description
A full-stack MERN AI chatbot with a React chat UI, Express API, secure server-side AI integration, and optional MongoDB conversation history.

## Before publishing
- Add your own screenshots to `screenshots/`.
- Update this README with your name and screenshots.
- Test the project locally.
- Do not upload `.env`, API keys, or private credentials.
- Be honest in interviews about which parts you built and understand.
