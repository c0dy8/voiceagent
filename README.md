# ChefBot — AI Cooking Assistant VoiceAgent

A **multimodal conversational web app** built with React + FastAPI. Users can chat with ChefBot, an AI cooking expert, by:
- 📝 Typing text messages
- 🎤 Recording audio (speech-to-text via Whisper)
- 🔊 Receiving voice responses (text-to-speech via TTS-1)

The agent uses **real tools** and the UI clearly shows when a tool is invoked with colored badges.

## Use Case

ChefBot helps users with cooking-related questions: finding recipes, getting nutritional information, and providing cooking technique guidance. The agent knows when to search for recipes vs. look up nutritional data, and responds intelligently based on context.

## Architecture

```
┌─────────────────────────────────┐
│ Frontend (React + Vite)         │
├─────────────────────────────────┤
│ • Landing page (GSAP anims)     │
│ • Chat widget (floating)        │
│ • Text input + Audio recording  │
│ • Voice mode toggle             │
└──────────────┬──────────────────┘
               │ HTTP (CORS)
               ↓
┌──────────────────────────────────────────────┐
│ Backend (FastAPI + LangChain)                │
├──────────────────────────────────────────────┤
│ • LLM: GPT-4o-mini                           │
│ • Tools:                                     │
│   - Recipe Search (TheMealDB API)            │
│   - Nutritional Info (USDA FoodData)         │
│ • RAG: Wikipedia → ChromaDB → Retrieval      │
│ • Whisper: Audio → Text transcription        │
│ • TTS-1: Text → Audio synthesis              │
│ • Memory: Session-based (last 14 messages)   │
└──────────────────────────────────────────────┘
```

## Tools

| Tool | Description | Parameters | API |
|------|-------------|------------|-----|
| `recipe_search` | Searches for recipes by dish name or main ingredient | `query: str` | [TheMealDB](https://www.themealdb.com/api.php) (free, no auth) |
| `nutritional_info` | Returns calories, protein, carbs, fat, fiber | `ingredient: str` | [Open Food Facts](https://world.openfoodfacts.org/) (free, no auth) |

### How tools work

When you ask ChefBot a question:
1. The LLM reads the user query and the list of available tools
2. If the query matches a tool's purpose, the agent **automatically invokes** that tool
3. The tool's result is injected back into the agent's context
4. The LLM generates the final response using both tool data and RAG context
5. The UI shows a **colored badge** on the message indicating which tool was used:
   - 🟠 **Recipe Search** badge (orange)
   - 🟢 **Nutritional Info** badge (green)
   - ⚪ No badge = response without tool invocation

## RAG (Retrieval-Augmented Generation)

ChefBot is enhanced with **domain-specific cooking knowledge** via RAG. This allows it to answer technique questions with verified information.

**Source:** `https://en.wikipedia.org/wiki/Cooking` (configurable via `RAG_SOURCE_URL` env var)

**How it works:**
1. Scrapes Wikipedia article on cooking
2. Splits content into 104 chunks (500 chars each, 50-char overlap)
3. Generates embeddings using OpenAI's `text-embedding-3-small`
4. Stores embeddings in ChromaDB (persistent local database)
5. On each query, retrieves top-3 most-relevant chunks
6. Injects context into the agent's system prompt

**Example:** When asked "How do I properly sear a steak?", the RAG system retrieves cooking technique passages and injects them as context, ensuring the LLM gives accurate, verified guidance.

For detailed RAG documentation, see [RAG_EXPLANATION.md](RAG_EXPLANATION.md).

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- An OpenAI API key

### 1. Clone and configure environment

```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 2. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env       # then edit .env with your OPENAI_API_KEY
uvicorn main:app --reload
# Server runs at http://localhost:8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

### 4. Initialize RAG (optional, for bonus cooking knowledge)

```bash
curl http://localhost:8000/rag/init
```

## Usage

1. **Open the app:** `http://localhost:5173` in your browser
2. **Send a message:**
   - **Text:** Type in the input field and press **Enter** or click **Send**
   - **Audio:** Click the **🎤** microphone button, speak your question, click again to stop
3. **Toggle modes:**
   - **📝 Text mode:** Receive text responses
   - **🔊 Voice mode:** Responses auto-play as audio
4. **View tool usage:** Colored badges appear on messages showing which tool was invoked

### Example prompts

| Prompt | Tool Used | Result |
|--------|-----------|--------|
| `"Give me a recipe for pasta carbonara"` | Recipe Search 🟠 | Returns full recipe with ingredients & steps |
| `"How many calories in an avocado?"` | Nutritional Info 🟢 | Returns: calories, protein, carbs, fat, fiber |
| `"How do I properly sear a steak?"` | None (RAG) | Uses cooking knowledge base for accurate technique |
| `"What can I cook with chicken?"` | None | General cooking advice from LLM |

### Audio Recording Feature

Record questions with your microphone instead of typing:

1. Click the **🎤** button to start recording
2. Speak your question clearly
3. Click **🔴** to stop recording
4. Audio is transcribed using OpenAI Whisper API
5. Response is generated and optionally played as audio if in Voice mode

For detailed audio feature documentation, see [AUDIO_FEATURE.md](AUDIO_FEATURE.md).

## API Endpoints

### Backend (FastAPI at `http://localhost:8000`)

| Method | Endpoint | Purpose | Request | Response |
|--------|----------|---------|---------|----------|
| `POST` | `/chat` | Send text message | `{message, session_id, mode}` | `{response, tool_used, tool_name, audio_b64}` |
| `POST` | `/chat/audio` | Send audio recording | FormData: `{file, session_id, mode}` | `{response, tool_used, tool_name, audio_b64}` |
| `GET` | `/rag/init` | Initialize RAG pipeline | — | `{status, message, chunks_count}` |
| `GET` | `/health` | Health check | — | `{status: "ok"}` |

**Note:** Set `mode` to `"text"` for text-only responses or `"voice"` to get audio synthesis in response.

## Project Structure

```
voiceagent/
├── backend/
│   ├── main.py              # FastAPI app, CORS, endpoints
│   ├── agent.py             # LangChain agent, session memory
│   ├── tools.py             # recipe_search, nutritional_info
│   ├── rag.py               # RAG: scrape, chunk, embed, retrieve
│   ├── tts.py               # OpenAI TTS-1 wrapper
│   ├── requirements.txt
│   └── test_backend.py      # Unit tests (pytest)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx          # Main router + landing page
│   │   ├── components/
│   │   │   ├── Hero.jsx
│   │   │   ├── Story.jsx    # "ChefBot vs Generic AI" comparison
│   │   │   ├── Features.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── Mockups.jsx
│   │   │   ├── UseCases.jsx
│   │   │   ├── FinalCTA.jsx
│   │   │   ├── ChatMessage.jsx    # Chat message with tool badge
│   │   │   ├── ChatInput.jsx
│   │   │   └── ModeToggle.jsx
│   │   ├── hooks/
│   │   │   ├── useChat.js         # State & API calls
│   │   │   └── useAudioRecorder.js # Microphone recording
│   │   ├── landing/
│   │   │   └── Landing.css        # All styling + animations
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
├── .env.example
├── RAG_EXPLANATION.md       # Detailed RAG documentation
├── AUDIO_FEATURE.md         # Audio recording feature guide
└── README.md                # This file
```

## Environment Variables

Create a `.env` file in `voiceagent/backend/` with:

```env
OPENAI_API_KEY=sk-proj-...your-key-here...
RAG_SOURCE_URL=https://en.wikipedia.org/wiki/Cooking
```

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key (GPT-4o-mini, Whisper, TTS-1, embeddings) | Yes | — |
| `RAG_SOURCE_URL` | URL to scrape for RAG knowledge base | No | Wikipedia Cooking |

### Getting an OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to **API keys**
4. Click **Create new secret key**
5. Copy the key and add to `.env`

## Testing

### Backend Unit Tests

Run the test suite:
```bash
cd voiceagent/backend
pytest test_backend.py -v
```

Coverage includes:
- Recipe search tool (success, not found, API errors)
- Nutritional info tool (success, not found, API errors)
- RAG pipeline (scraping, chunking, retrieval)
- All HTTP endpoints (`/chat`, `/chat/audio`, `/rag/init`, `/health`)
- CORS configuration
- Integration tests
- Performance benchmarks

**Target:** 70%+ code coverage

### Frontend Landing Page

The frontend ships with a full marketing landing page featuring:
- **Hero section** with animated headline
- **Story section** comparing ChefBot vs generic AI
- **Features grid** showcasing capabilities
- **How It Works** step-by-step guide
- **App mockups** showing UI states
- **Use cases** with real examples
- **Final CTA** to try ChefBot
- **Floating widget** (Intercom-style) accessible from any page

**Animations:** Built with GSAP + ScrollTrigger, respects `prefers-reduced-motion` for accessibility.

## Deployment

### Architecture

```
Vercel (Frontend)    ←→  Render (Backend API)
React + Vite             FastAPI + LangChain
                         ChromaDB (persistent disk)
```

### Step 1: Prepare for Deployment

#### Create GitHub repository
```bash
git init
git add .
git commit -m "Initial ChefBot release"
git remote add origin https://github.com/<your-user>/voiceagent.git
git push -u origin main
```

#### Create `.gitignore`
```bash
cat > .gitignore << 'EOF'
node_modules/
.venv/
__pycache__/
*.pyc
.env
.env.local
.DS_Store
chroma_db/
dist/
EOF
git add .gitignore && git commit -m "Add gitignore"
```

### Step 2: Deploy Frontend to Vercel

1. **Sign up** at [vercel.com](https://vercel.com)
2. **Import repository** → select your GitHub repo
3. **Configure:**
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Root directory: `voiceagent/frontend`
4. **Add environment variable:**
   - Name: `VITE_API_URL`
   - Value: `https://chefbot-backend.onrender.com` (or your Render backend URL)
5. **Deploy!**

#### Update frontend to use env variable

Edit `frontend/src/hooks/useChat.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const sendMessage = async (message, mode) => {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id, mode }),
  });
  // ...
};

export const useAudioRecorder = () => {
  // In sendAudio function:
  const response = await fetch(`${API_URL}/chat/audio`, {
    method: "POST",
    body: formData,
  });
  // ...
};
```

### Step 3: Deploy Backend to Render

1. **Sign up** at [render.com](https://render.com)
2. **Create Web Service:**
   - Connect GitHub repo
   - Name: `chefbot-backend`
   - Environment: `Python 3`
   - Build command: `pip install -r voiceagent/backend/requirements.txt`
   - Start command: `cd voiceagent/backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Root directory: (leave empty or set to `voiceagent/backend`)

3. **Add environment variables:**
   - `OPENAI_API_KEY`: Your OpenAI API key (secret)
   - `RAG_SOURCE_URL`: `https://en.wikipedia.org/wiki/Cooking`

4. **Add persistent disk (optional, for RAG):**
   - Mount path: `/chroma_db`
   - Size: 1 GB (free tier)
   - This preserves the RAG vector store across redeploys

5. **Deploy!**

#### Update backend CORS for Vercel domain

Edit `voiceagent/backend/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://<your-vercel-domain>.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Step 4: Initialize RAG on Render

After backend deploys, call the RAG init endpoint once:
```bash
curl https://chefbot-backend.onrender.com/rag/init
```

Response should be:
```json
{
  "status": "ok",
  "message": "RAG initialized with 104 chunks from https://en.wikipedia.org/wiki/Cooking"
}
```

If you don't mount a persistent disk, you'll need to call this after every redeploy. With persistent disk, it's one-time only.

### Troubleshooting Deployment

| Issue | Solution |
|-------|----------|
| Frontend can't reach backend | Check `VITE_API_URL` env var, ensure backend URL is correct |
| CORS errors | Update `allow_origins` in `main.py` to include your Vercel domain |
| RAG not working | Call `/rag/init` endpoint, ensure persistent disk is mounted |
| Slow first response | Render free tier has cold starts; upgrade to paid for reliability |
| Audio transcription fails | Check `OPENAI_API_KEY` is set, valid, and has Whisper access |

## Documentation

- **[RAG_EXPLANATION.md](RAG_EXPLANATION.md)** — Deep dive into the RAG pipeline, embedding model, ChromaDB setup, and how context is retrieved and injected
- **[AUDIO_FEATURE.md](AUDIO_FEATURE.md)** — Complete guide to the audio recording feature, including browser compatibility, error handling, and performance notes
- **[CLAUDE.md](../CLAUDE.md)** — Development guidelines and architecture overview for future contributors

## Quick Reference

### Common Commands

```bash
# Backend
cd voiceagent/backend
uvicorn main:app --reload          # Start dev server (port 8000)
curl http://localhost:8000/health  # Test backend
curl http://localhost:8000/rag/init # Initialize RAG

# Frontend
cd voiceagent/frontend
npm run dev                         # Start dev server (port 5173)
npm run build                       # Production build

# Tests
cd voiceagent/backend
pytest test_backend.py -v          # Run all tests
pytest test_backend.py -v --cov    # With coverage report
```

### API Calls (Examples)

```bash
# Send text message
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Give me a pasta recipe","session_id":"user1","mode":"text"}'

# Send audio file
curl -X POST http://localhost:8000/chat/audio \
  -F "file=@recording.webm" \
  -F "session_id=user1" \
  -F "mode=voice"

# Initialize RAG
curl http://localhost:8000/rag/init
```

### Environment Setup (One-Time)

```bash
# 1. Get OpenAI API key from platform.openai.com
# 2. Create .env in voiceagent/backend/
echo 'OPENAI_API_KEY=sk-proj-...' > voiceagent/backend/.env

# 3. Install backend deps
cd voiceagent/backend
pip install -r requirements.txt

# 4. Install frontend deps
cd ../frontend
npm install
```

## Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | Web UI + landing page |
| **Styling** | CSS 3 + GSAP | Animations + responsive design |
| **Audio (browser)** | Web Audio API | Microphone recording |
| **Backend** | FastAPI + Uvicorn | REST API server |
| **LLM** | OpenAI GPT-4o-mini | Conversational AI |
| **Speech-to-text** | OpenAI Whisper | Audio transcription |
| **Text-to-speech** | OpenAI TTS-1 | Audio synthesis |
| **Agent** | LangChain | Tool orchestration |
| **Memory** | Python dict | Session state |
| **RAG** | ChromaDB + text-embedding-3-small | Domain knowledge retrieval |
| **APIs** | TheMealDB, Open Food Facts | Recipe & nutrition data |

## License

This project is built as a performance evaluation (RIWI). Feel free to use and modify for educational purposes.
