import requests
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import io
import os

app = FastAPI(title="ElevenLabs TTS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (safe for this use case)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔐 Use ENV variables (REQUIRED for Render)
ELEVEN_LABS_KEY = os.getenv("ELEVEN_LABS_KEY")
VOICE_ID = os.getenv("VOICE_ID", "8kxYoTsEIq8PCMNXlxkS")

@app.post("/tts")
def text_to_speech(text: str):
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text is required")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"

    headers = {
        "xi-api-key": ELEVEN_LABS_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
    }

    payload = {
        "text": text,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.5
        }
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.text
        )

    audio_stream = io.BytesIO(response.content)

    return StreamingResponse(
        audio_stream,
        media_type="audio/mpeg",
        headers={
            "Content-Disposition": "attachment; filename=tts.mp3"
        }
    )
