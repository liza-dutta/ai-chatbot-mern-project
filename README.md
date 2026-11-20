# AI Chatbot — MERN Portfolio Project

A full-stack AI chatbot portfolio project built with MongoDB, Express, React, and Node.js. The React/Vite interface talks to an Express API. The AI key stays on the server. MongoDB conversation storage is optional.

## Features
- React + Vite responsive chat interface
- Express REST API
- OpenAI-compatible Chat Completions API integration
- AI provider key kept on the backend
- Optional MongoDB persistence for conversations
- Loading and error states, clear chat, and health endpoint

## Requirements
- Node.js 18+
- An API key for an OpenAI-compatible Chat Completions provider
- MongoDB connection string (optional)

## Run locally
1. Install Node.js.
2. In the project root, run `npm install`.
3. Run `npm --prefix server install`.
4. Copy `server/.env.example` to `server/.env`.
5. Add your AI key to `AI_API_KEY`. Add `MONGODB_URI` if you want saved history.
6. From the project root run `npm run dev`.
7. Open `http://localhost:5173`.

## Environment variables
The server reads `server/.env`:
- `AI_API_KEY` — required for AI replies
- `AI_MODEL` — defaults to `gpt-4o-mini`
- `AI_BASE_URL` — optional provider-compatible API base URL
- `MONGODB_URI` — optional MongoDB connection
- `PORT` — defaults to `5000`
- `CLIENT_ORIGIN` — local frontend origin, defaults to `http://localhost:5173`

Never commit `.env`, API keys, or private credentials.

## API
- `GET /api/health` — server status and configuration indicators
- `POST /api/chat` — JSON body: `{ "message": "Hello", "conversationId": "optional-id" }`
- `GET /api/conversations/:id` — retrieve saved messages (MongoDB required)

## Production build
Run `npm install`, `npm --prefix server install`, then `npm run build`. Set `NODE_ENV=production` and the server environment variables on your hosting provider, then start with `npm start`. The Express server serves the built frontend and API from the same service.

## Before publishing
- Configure the AI key as a hosting-provider secret, not in frontend code.
- Configure MongoDB Atlas network access and credentials if using persistence.
- Test the deployed `/api/health` endpoint and a real chat request.
- Add your own screenshots and update this README with your project details.
- Be prepared to explain the code and which parts you built.
