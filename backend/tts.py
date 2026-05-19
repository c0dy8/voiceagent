import base64
from openai import OpenAI

client = OpenAI()


def text_to_speech(text: str, voice: str = "alloy") -> str:
    """Convert text to speech using OpenAI TTS and return base64-encoded audio.

    Args:
        text: The text to synthesize.
        voice: The voice to use (alloy, echo, fable, onyx, nova, shimmer).

    Returns:
        Base64-encoded MP3 audio string.
    """
    response = client.audio.speech.create(
        model="tts-1",
        voice=voice,
        input=text,
    )
    audio_bytes = response.read()
    return base64.b64encode(audio_bytes).decode("utf-8")
