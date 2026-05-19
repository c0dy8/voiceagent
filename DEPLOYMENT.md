# ChefBot Deployment Checklist

This guide provides step-by-step instructions to deploy ChefBot to production.

## Pre-Deployment Checklist

- [ ] All tests pass locally: `pytest test_backend.py -v`
- [ ] Frontend builds successfully: `npm run build`
- [ ] No hardcoded API keys or secrets in code
- [ ] `.env` file is in `.gitignore`
- [ ] `chroma_db/` is in `.gitignore` (RAG vector store shouldn't be committed)
- [ ] GitHub repository created and code pushed
- [ ] OpenAI API key is active and has quota

## Deployment Summary

```
┌──────────────────────────────────────────────────────────────┐
│                    CHEFBOT ARCHITECTURE                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  User's Browser                                             │
│       │                                                     │
│       ├─→ Vercel (Frontend)                               │
│       │   ├─ React + Vite (SPA)                           │
│       │   └─ Landing page + Chat widget                   │
│       │                                                     │
│       └─→ API Calls ──→ Render (Backend)                 │
│                        ├─ FastAPI server                  │
│                        ├─ LangChain agent                 │
│                        ├─ Tool integrations               │
│                        ├─ OpenAI Whisper/TTS/LLM         │
│                        └─ ChromaDB (RAG)                  │
│                                                            │
└──────────────────────────────────────────────────────────────┘
```

## Phase 1: GitHub Repository Setup

### 1.1 Initialize Git Repository

```bash
cd voiceagent
git init
git config user.email "your-email@example.com"
git config user.name "Your Name"
```

### 1.2 Create .gitignore

```bash
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Node
node_modules/
npm-debug.log
yarn-error.log
dist/
build/

# Environment
.env
.env.local
.env.production.local
.env.development.local
.env.test.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# ChromaDB (RAG vector store)
chroma_db/

# Session/cache
.pytest_cache/
.coverage
htmlcov/
EOF
```

### 1.3 Commit and Push

```bash
git add .
git commit -m "Initial ChefBot commit"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/voiceagent.git
git push -u origin main
```

## Phase 2: Frontend Deployment to Vercel

### 2.1 Sign Up and Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Select your `voiceagent` repository
5. Click "Import"

### 2.2 Configure Build Settings

When Vercel auto-detects, set these values:

| Field | Value |
|-------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `voiceagent/frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 2.3 Add Environment Variables

In Vercel project settings → Environment Variables:

```
Name:  VITE_API_URL
Value: https://chefbot-backend.onrender.com
Environments: Production, Preview, Development
```

**Note:** Replace `chefbot-backend.onrender.com` with your actual Render backend URL after Step 3.

### 2.4 Deploy Frontend

Click "Deploy" and wait for completion (~2 minutes).

Your frontend will be live at: `https://<project-name>.vercel.app`

### 2.5 Update Frontend Code for Production

Edit `voiceagent/frontend/src/hooks/useChat.js`:

```javascript
// At the top of the file
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function useChat() {
  const sendMessage = async (message, mode = "text") => {
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          session_id: sessionId,
          mode,
        }),
      });
      // ... rest of function
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  // ... rest of code
}
```

Similarly update audio endpoint:

```javascript
// In useAudioRecorder or audio sending function
const response = await fetch(`${API_URL}/chat/audio`, {
  method: "POST",
  body: formData,
});
```

Commit and push:

```bash
git add voiceagent/frontend/src/hooks/useChat.js
git commit -m "Update API URL to use environment variable"
git push origin main
```

Vercel will auto-redeploy. ✅

## Phase 3: Backend Deployment to Render

### 3.1 Sign Up on Render

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

### 3.2 Create Backend Web Service

1. Click "New +"
2. Select "Web Service"
3. Select your `voiceagent` repository
4. Click "Connect"

### 3.3 Configure Web Service

Set these fields:

| Field | Value |
|-------|-------|
| **Name** | `chefbot-backend` |
| **Environment** | `Python 3` |
| **Build Command** | `pip install -r voiceagent/backend/requirements.txt` |
| **Start Command** | `cd voiceagent/backend && uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Root Directory** | (leave empty) |
| **Plan** | Free (or Starter+ for reliability) |

### 3.4 Add Environment Variables

Click "Environment" → add these variables:

```
Name: OPENAI_API_KEY
Value: sk-proj-...your-key-here...
Type: Secret
```

```
Name: RAG_SOURCE_URL
Value: https://en.wikipedia.org/wiki/Cooking
Type: Regular
```

### 3.5 Add Persistent Disk (for RAG)

Click "Disks" → add:

| Field | Value |
|-------|-------|
| **Name** | `chroma-db` |
| **Mount Path** | `/chroma_db` |
| **Size** | 1 GB |

This preserves the RAG vector store across redeploys.

### 3.6 Deploy Backend

Click "Create Web Service" and wait for build/deployment (~5 minutes).

Your backend will be live at: `https://chefbot-backend.onrender.com`

### 3.7 Update Backend CORS Settings

Edit `voiceagent/backend/main.py` to add your Vercel domain:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local dev
        "https://<your-vercel-domain>.vercel.app",  # Your Vercel URL
        "https://chefbot-frontend-riwi.vercel.app",  # Update this
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push:

```bash
git add voiceagent/backend/main.py
git commit -m "Update CORS for production domains"
git push origin main
```

Render will auto-redeploy. ✅

## Phase 4: Initialize RAG on Production

After backend is deployed, initialize the RAG pipeline once:

```bash
curl https://chefbot-backend.onrender.com/rag/init
```

Expected response:

```json
{
  "status": "ok",
  "message": "RAG initialized with 104 chunks from https://en.wikipedia.org/wiki/Cooking"
}
```

This scrapes Wikipedia, chunks the content, generates embeddings, and stores them in ChromaDB. Takes ~30-60 seconds.

With persistent disk, this is **one-time only**. Without it, you'll need to call this after every redeploy.

## Phase 5: Update Vercel with Correct Backend URL

Once Render backend is live:

1. Go to Vercel project → Settings → Environment Variables
2. Update `VITE_API_URL` to your actual Render URL
3. Trigger a redeployment (or push a commit)

Vercel will rebuild with the correct backend URL.

## Testing Production

### Test Backend

```bash
curl https://chefbot-backend.onrender.com/health

# Send a test message
curl -X POST https://chefbot-backend.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Give me a pasta recipe",
    "session_id": "test-user",
    "mode": "text"
  }'
```

### Test Frontend

1. Open `https://<your-vercel-domain>.vercel.app`
2. Click "Open ChefBot" button
3. Type: "How many calories in an apple?"
4. Verify response appears with **Nutritional Info** badge
5. Try voice mode: toggle to 🔊, record audio, verify transcription and response

## Troubleshooting

### Frontend can't reach backend

**Symptom:** Network errors in browser console

**Solution:**
1. Check Vercel env var `VITE_API_URL` is correct
2. Check Render backend is running (check status in dashboard)
3. Update CORS in `main.py` if needed
4. Try calling `/health` endpoint directly in browser

### CORS errors

**Symptom:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Go to `voiceagent/backend/main.py`
2. Add your Vercel domain to `allow_origins` list
3. Commit and push
4. Render will auto-redeploy

### RAG not working

**Symptom:** Responses don't use cooking knowledge

**Solution:**
1. Call `https://chefbot-backend.onrender.com/rag/init` again
2. Check persistent disk is mounted (Render dashboard)
3. Check `chroma_db/` directory exists and has files

### Slow first response (Render)

**Symptom:** First request takes 30+ seconds, subsequent requests are fast

**Cause:** Render free tier has "cold starts" (container spins down after inactivity)

**Solution:**
- Upgrade to "Starter+" plan for always-on container
- Or add monitoring service that pings `/health` every 15 minutes

### Audio transcription fails

**Symptom:** `Error: Failed to transcribe audio`

**Solution:**
1. Verify `OPENAI_API_KEY` is correct in Render env vars
2. Check API key has Whisper access (account level)
3. Test with a simple audio file (2 seconds, clear speech)
4. Check file size is under 25 MB

## Post-Deployment Checklist

- [ ] Frontend loads at Vercel URL
- [ ] Backend health check passes
- [ ] Text chat works end-to-end
- [ ] Tool badges appear correctly
- [ ] Voice mode works (if available)
- [ ] Audio recording works (browser permission granted)
- [ ] RAG context is retrieved (try "How do I sear a steak?")
- [ ] Landing page animations are smooth
- [ ] No console errors
- [ ] Mobile responsive (test on phone)

## Performance Monitoring

### Vercel Analytics

- Go to Vercel dashboard → Analytics
- Monitor Core Web Vitals
- Check build times

### Render Metrics

- Go to Render dashboard → your service → Metrics
- Monitor CPU, memory, requests/sec
- Check error rates

## Scaling and Upgrades

| Metric | Free | Starter+ | Standard |
|--------|------|----------|----------|
| **Render uptime** | ~99% | 99.95% | 99.99% |
| **Cold starts** | Yes (30-60s) | No | No |
| **Concurrent requests** | Limited | 10+ | 100+ |
| **Annual cost** | Free | ~$12-36 | ~$80+ |

When to upgrade Render:
- Daily active users > 100
- Response time too slow
- Service goes down frequently

## Maintenance

### Weekly
- Monitor error logs in Render dashboard
- Test critical flows (recipe search, nutrition, audio)

### Monthly
- Review analytics
- Update dependencies: `npm audit`, `pip --outdated`
- Check OpenAI API usage and costs

### Quarterly
- Review and update RAG source if needed
- Audit security: no secrets in logs, CORS is tight
- Performance optimization: database indexes, caching

## Support

For deployment issues:
- [Vercel docs](https://vercel.com/docs)
- [Render docs](https://render.com/docs)
- [FastAPI deployment](https://fastapi.tiangolo.com/deployment/)
- [OpenAI API docs](https://platform.openai.com/docs/)

---

**Deployment completed!** 🎉

Your ChefBot is now live. Share the Vercel URL with users.
