import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.getenv("DATA_DIR", "./data"))
if not DATA_DIR.is_absolute():
    DATA_DIR = BASE_DIR / DATA_DIR

DATA_DIR.mkdir(parents=True, exist_ok=True)
(DATA_DIR / "photos").mkdir(parents=True, exist_ok=True)
(DATA_DIR / "audio").mkdir(parents=True, exist_ok=True)

DB_PATH = DATA_DIR / "remembering.db"

LLM_BASE_URL = os.getenv("LLM_BASE_URL", "http://localhost:11434/v1")
LLM_API_KEY = os.getenv("LLM_API_KEY", "ollama")
LLM_MODEL = os.getenv("LLM_MODEL", "gemma3:4b")
EMBED_MODEL = os.getenv("EMBED_MODEL", "nomic-embed-text")
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "small")
WHISPER_DEVICE = os.getenv("WHISPER_DEVICE", "cpu")
TOP_K = int(os.getenv("TOP_K", "4"))
MIN_RELEVANCE = float(os.getenv("MIN_RELEVANCE", "0.35"))
HOST = os.getenv("HOST", "0.0.0.0" if os.getenv("RENDER") else "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "")

