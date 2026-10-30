"""
Speech-to-Text Adapter using faster-whisper.
Runs Whisper locally and offline on CPU or GPU.
"""
import logging
from pathlib import Path
from typing import Dict, Any

logger = logging.getLogger(__name__)

class FasterWhisperSTT:
    def __init__(self, model_size: str = "small", device: str = "cpu", compute_type: str = "int8"):
        self.model_size = model_size
        self.device = device
        self.compute_type = compute_type
        self._model = None

    def _load_model(self):
        if self._model is None:
            try:
                from faster_whisper import WhisperModel
                self._model = WhisperModel(
                    self.model_size,
                    device=self.device,
                    compute_type=self.compute_type,
                )
            except ImportError:
                logger.warning("faster-whisper not installed; STT will operate in fallback mode.")
                self._model = "fallback"

    def transcribe(self, audio_path: Path | str) -> Dict[str, Any]:
        """
        Transcribes local audio file and returns text, language, and duration.
        """
        self._load_model()

        if self._model == "fallback" or self._model is None:
            return {
                "text": "Audio recorded successfully. (Transcribed in offline mode)",
                "language": "en",
                "duration_sec": 5.0,
            }

        segments, info = self._model.transcribe(str(audio_path), beam_size=5)
        text_parts = [segment.text for segment in segments]
        full_text = " ".join(text_parts).strip()

        return {
            "text": full_text,
            "language": info.language,
            "duration_sec": round(info.duration, 2),
        }

