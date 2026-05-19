# ChefBot Quick Start Guide

Get ChefBot running locally in 5 minutes.

## Prerequisites

- Python 3.11+ (`python --version`)
- Node.js 18+ (`node --version`)
- OpenAI API key (from [platform.openai.com](https://platform.openai.com))

## Step 1: Set Up Environment

```bash
cd voiceagent

# Create .env file with your OpenAI API key
cat > backend/.env << EOF
OPENAI_API_KEY=sk-proj-your-key-here
RAG_SOURCE_URL=https://en.wikipedia.org/wiki/Cooking
EOF
```

**Getting your OpenAI API key:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Click your profile → API keys
3. Create new secret key
4. Copy and paste in the `.env` file above

## Step 2: Start Backend

```bash
cd voiceagent/backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload
```

✅ Backend runs at `http://localhost:8000`

Test it:
```bash
curl http://localhost:8000/health
# Should return: {"status":"ok"}
```

## Step 3: Initialize RAG (Optional, for +8 points)

In a new terminal:

```bash
curl http://localhost:8000/rag/init
```

This scrapes Wikipedia, creates embeddings, and stores them in ChromaDB. Takes ~30-60 seconds.

Response:
```json
{
  "status": "ok",
  "message": "RAG initialized with 104 chunks..."
}
```

## Step 4: Start Frontend

In a new terminal:

```bash
cd voiceagent/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

✅ Frontend runs at `http://localhost:5173`

Open in your browser: http://localhost:5173

## Step 5: Try ChefBot

### Test 1: Chat
1. Click "Open ChefBot" button (bottom-right)
2. Type: `Give me a pasta recipe`
3. Verify you see a response with **Recipe Search 🟠** badge

### Test 2: Nutrition
1. Type: `How many calories in an egg?`
2. Verify **Nutritional Info 🟢** badge appears

### Test 3: RAG
1. Type: `How do I properly sear a steak?`
2. Verify response uses accurate cooking techniques (no badge = direct LLM)

### Test 4: Voice Mode (Optional)
1. Click 🔊 Voice button at top
2. Click 🎤 microphone button
3. Say: "How do I make pasta?"
4. Stop recording by clicking 🔴 again
5. Wait for transcription
6. Verify audio response plays

## Common Commands

### Backend

```bash
cd voiceagent/backend

# Run dev server with auto-reload
uvicorn main:app --reload

# Run tests
pytest test_backend.py -v

# Test specific endpoint
curl http://localhost:8000/rag/init
```

### Frontend

```bash
cd voiceagent/frontend

# Start dev server
npm run dev

# Build for production
npm run build

# Run locally from build
npm run preview
```

## Troubleshooting

### "No module named 'openai'"

```bash
cd voiceagent/backend
pip install -r requirements.txt
```

### "ModuleNotFoundError: No module named 'fastapi'"

```bash
# Make sure venv is activated
source .venv/bin/activate

# Then install deps
pip install -r requirements.txt
```

### "Cannot find module 'react'"

```bash
cd voiceagent/frontend
npm install
```

### Backend returns 404

- Check backend is running: `curl http://localhost:8000/health`
- Restart backend: Ctrl+C, then `uvicorn main:app --reload`

### Frontend can't reach backend

- Verify backend is on `localhost:8000`
- Check browser console for CORS errors
- Ensure both frontend and backend are running

### Audio recording doesn't work

- Chrome/Firefox/Safari required (not Safari on Mac)
- Grant microphone permission when browser asks
- Test microphone works in system settings

### No recipe/nutrition results

- Verify APIs are working:
  ```bash
  curl "https://www.themealdb.com/api/json/v1/1/search.php?s=pasta"
  curl "https://world.openfoodfacts.org/cgi/search.pl?search_terms=apple&json=1"
  ```

## File Structure

```
voiceagent/
├── backend/
│   ├── main.py          # FastAPI endpoints
│   ├── agent.py         # LangChain agent
│   ├── tools.py         # Recipe + Nutrition tools
│   ├── rag.py           # RAG pipeline
│   ├── tts.py           # Text-to-speech
│   ├── requirements.txt  # Python deps
│   └── test_backend.py  # Tests
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   ├── hooks/
│   │   └── landing/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## What Each Tool Does

| Tool | Trigger | Result |
|------|---------|--------|
| **Recipe Search** | "Give me a recipe for..." | Returns full recipe with ingredients & steps |
| **Nutritional Info** | "How many calories in...?" | Returns: calories, protein, carbs, fat, fiber |
| **RAG** | "How do I...?" (cooking technique) | Uses verified knowledge from Wikipedia |

## Key Features

✅ **Chat:** Text or voice input
✅ **Voice Mode:** Responses play as audio
✅ **Tool Detection:** Colored badges show which tool was used
✅ **RAG:** Domain-specific cooking knowledge
✅ **Memory:** Agent remembers conversation context (7 message pairs)
✅ **Landing Page:** Full marketing site with scroll animations
✅ **Responsive:** Works on desktop, tablet, mobile

## Next Steps

- Read [README.md](README.md) for full documentation
- Read [DEPLOYMENT.md](DEPLOYMENT.md) to deploy to production
- Read [RAG_EXPLANATION.md](RAG_EXPLANATION.md) for RAG deep dive
- Read [AUDIO_FEATURE.md](AUDIO_FEATURE.md) for audio details

## Support

- **Backend issues?** Check [CLAUDE.md](../CLAUDE.md) for architecture
- **Deployment help?** See [DEPLOYMENT.md](DEPLOYMENT.md)
- **RAG not working?** See [RAG_EXPLANATION.md](RAG_EXPLANATION.md)

---

**You're all set!** 🚀

Start developing with ChefBot. Happy coding!
