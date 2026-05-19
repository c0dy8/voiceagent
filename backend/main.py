import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agent import run_agent
from rag import initialize_rag
from tts import text_to_speech

app = FastAPI(title="ChefBot API")

_extra = [o.strip() for o in os.getenv("FRONTEND_URL", "").split(",") if o.strip()]
ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"] + _extra

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    session_id: str
    mode: str = "text"  # "text" or "voice"


class ChatResponse(BaseModel):
    response: str
    tool_used: str | None = None
    tool_name: str | None = None
    audio_b64: str | None = None


@app.get("/")
def root():
    return {"message": "ChefBot API is running. Open http://localhost:5173 in your browser."}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    result = run_agent(req.message, req.session_id)

    audio_b64 = None
    if req.mode == "voice":
        try:
            audio_b64 = text_to_speech(result["response"])
        except Exception as e:
            # Degrade gracefully: return text even if TTS fails
            print(f"TTS error: {e}")

    return ChatResponse(
        response=result["response"],
        tool_used=result["tool_used"],
        tool_name=result["tool_name"],
        audio_b64=audio_b64,
    )


@app.post("/chat/audio", response_model=ChatResponse)
async def chat_audio(
    file: UploadFile = File(...),
    session_id: str = Form(...),
    mode: str = Form(default="text"),
):
    import io
    from openai import OpenAI

    try:
        audio_data = await file.read()
        audio_file = io.BytesIO(audio_data)
        audio_file.name = file.filename or "audio.webm"

        client = OpenAI()
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
        )
        message = transcript.text.strip()
        if not message:
            raise HTTPException(status_code=400, detail="Could not transcribe audio.")

        result = run_agent(message, session_id)

        audio_b64 = None
        if mode == "voice":
            try:
                audio_b64 = text_to_speech(result["response"])
            except Exception as e:
                print(f"TTS error: {e}")

        return ChatResponse(
            response=result["response"],
            tool_used=result["tool_used"],
            tool_name=result["tool_name"],
            audio_b64=audio_b64,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/rag/init")
def rag_init():
    try:
        message = initialize_rag()
        return {"status": "ok", "message": message}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
