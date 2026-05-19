import { useState, useRef, useCallback } from "react";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("No se pudo acceder al micrófono. Verifica los permisos.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setIsRecording(false);
        return audioBlob;
      };

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  }, [isRecording]);

  const sendAudio = useCallback(
    async (audioBlob, sessionId, mode, onSuccess, onError) => {
      setIsSending(true);
      try {
        const formData = new FormData();
        formData.append("file", audioBlob, "audio.webm");
        formData.append("session_id", sessionId);
        formData.append("mode", mode);

        const response = await fetch("http://localhost:8000/chat/audio", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setIsSending(false);
        onSuccess(data);
      } catch (error) {
        console.error("Error sending audio:", error);
        setIsSending(false);
        onError(error);
      }
    },
    []
  );

  const recordAndSend = useCallback(
    async (sessionId, mode, onSuccess, onError) => {
      if (!isRecording) {
        startRecording();
      } else {
        stopRecording();

        setTimeout(() => {
          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            sendAudio(audioBlob, sessionId, mode, onSuccess, onError);
          }
        }, 200);
      }
    },
    [isRecording, startRecording, stopRecording, sendAudio]
  );

  return {
    isRecording,
    isSending,
    startRecording,
    stopRecording,
    sendAudio,
    recordAndSend,
  };
}
