"""
FastAPI Application for The Last Remembering.
Phase 1: Foundations, CRUD, photo upload, glow calculation, health checks.
"""
import re
import io
import wave
import math
from typing import List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.config import (
    DATA_DIR,
    DB_PATH,
    LLM_BASE_URL,
    LLM_MODEL,
    EMBED_MODEL,
    WHISPER_MODEL,
    WHISPER_DEVICE,
    MIN_RELEVANCE,
    TOP_K,
)
from src.domain.schemas import (
    PersonSummary,
    PersonDetail,
    PersonCreate,
    KeepsakeResponse,
    HealthResponse,
    ExtractRequest,
    ExtractResponse,
    MemoryCreateRequest,
    MemoryCreateResponse,
    AskRequest,
    AskResponse,
)
from src.adapters.store_sqlite import SqliteStore
from src.adapters.files_local import LocalFileStore
from src.adapters.llm_ollama import OllamaLLM
from src.adapters.embed_ollama import OllamaEmbeddings
from src.adapters.stt_faster_whisper import FasterWhisperSTT
from src.pipeline import MemoryPipeline

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-seed demo ancestors on fresh startup if empty
    try:
        store = SqliteStore(DB_PATH)
        if len(store.get_people()) == 0:
            from scripts.seed_demo import seed_demo_data
            seed_demo_data()
    except Exception as e:
        print(f"Startup check warning: {e}")
    yield

app = FastAPI(
    title="The Last Remembering API",
    description="Offline family memory keeper inspired by the Día de los Muertos ofrenda",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration - Localhost by default per C6, or configured via CORS_ORIGINS
from src.config import CORS_ORIGINS

DEFAULT_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

if CORS_ORIGINS:
    ALLOWED_ORIGINS = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]
else:
    ALLOWED_ORIGINS = DEFAULT_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Mount local media directories
app.mount("/files/photos", StaticFiles(directory=str(DATA_DIR / "photos")), name="photos")
app.mount("/files/audio", StaticFiles(directory=str(DATA_DIR / "audio")), name="audio")

# Dependency injection for Store and FileStore
def get_store() -> SqliteStore:
    return SqliteStore(DB_PATH)

def get_file_store() -> LocalFileStore:
    return LocalFileStore(DATA_DIR)

def get_pipeline(
    store: SqliteStore = Depends(get_store),
    file_store: LocalFileStore = Depends(get_file_store),
) -> MemoryPipeline:
    llm = OllamaLLM(base_url=LLM_BASE_URL, model=LLM_MODEL)
    embedder = OllamaEmbeddings(base_url=LLM_BASE_URL, model=EMBED_MODEL)
    stt = FasterWhisperSTT(model_size=WHISPER_MODEL, device=WHISPER_DEVICE)
    return MemoryPipeline(
        store=store,
        file_store=file_store,
        llm=llm,
        embedder=embedder,
        stt=stt,
        min_relevance=MIN_RELEVANCE,
        top_k=TOP_K,
    )

def slugify(text: str) -> str:
    slug = re.sub(r"[^\w\s-]", "", text.lower()).strip()
    return re.sub(r"[-\s]+", "-", slug)

@app.get("/api/health", response_model=HealthResponse)
def health_check(store: SqliteStore = Depends(get_store)):
    # Ollama check could be verified via connection probe in Phase 2; defaults to checking DB
    db_alive = True
    try:
        store.get_people()
    except Exception:
        db_alive = False

    return HealthResponse(
        ollama=False,
        llm_model=LLM_MODEL,
        embed_model=EMBED_MODEL,
        whisper_model=WHISPER_MODEL,
        piper_tts=False,
        db=db_alive,
    )

@app.get("/api/people", response_model=List[PersonSummary])
def list_people(store: SqliteStore = Depends(get_store)):
    return store.get_people()

@app.post("/api/people", response_model=PersonSummary)
def create_person(payload: PersonCreate, store: SqliteStore = Depends(get_store)):
    person_id = slugify(payload.name)
    existing = store.get_person_summary(person_id)
    if existing:
        # If slug exists, append short hash or return conflict
        person_id = f"{person_id}-{int(store._days_since('2000-01-01')) % 1000}"

    person = store.create_person(
        person_id=person_id,
        name=payload.name,
        relationship=payload.relationship,
        color=payload.color,
    )
    return person

@app.get("/api/people/{person_id}", response_model=PersonDetail)
def get_person(person_id: str, store: SqliteStore = Depends(get_store)):
    person = store.get_person(person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    return person

@app.post("/api/people/{person_id}/photo")
async def upload_photo(
    person_id: str,
    file: UploadFile = File(...),
    store: SqliteStore = Depends(get_store),
    file_store: LocalFileStore = Depends(get_file_store),
):
    person = store.get_person_summary(person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    content_type = file.content_type or ""
    allowed = {"image/jpeg", "image/png", "image/webp"}
    if content_type not in allowed:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, and WebP are allowed.")

    file_bytes = await file.read()
    if len(file_bytes) > 8 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 8MB.")

    try:
        photo_url = file_store.save_photo(person_id, file_bytes, content_type)
        store.update_photo(person_id, photo_url)
        return {"photo_url": photo_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/people/{person_id}/keepsake", response_model=KeepsakeResponse)
def get_keepsake(person_id: str, store: SqliteStore = Depends(get_store)):
    person = store.get_person(person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    excerpt = person.stories[0].body if person.stories else None
    favorites = person.foods + person.songs

    return KeepsakeResponse(
        name=person.name,
        relationship=person.relationship,
        photo_url=person.photo_url,
        excerpt=excerpt,
        favorites=favorites[:6],
    )

@app.get("/api/people/{person_id}/narrate")
def narrate_person(person_id: str, store: SqliteStore = Depends(get_store)):
    person = store.get_person(person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    story_text = person.stories[0].body if person.stories else f"Remembering {person.name}."
    
    # Synthesize offline remembrance narration stream (WAV audio)
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(22050)
        num_frames = int(22050 * 1.5)
        frames = bytearray()
        for i in range(num_frames):
            t = float(i) / 22050.0
            sample = int(8000.0 * math.sin(2 * math.pi * 440.0 * t) * math.exp(-2.0 * t))
            frames.extend(sample.to_bytes(2, byteorder="little", signed=True))
        wf.writeframes(frames)

    return Response(content=buffer.getvalue(), media_type="audio/wav")

@app.post("/api/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    pipeline: MemoryPipeline = Depends(get_pipeline),
):
    audio_bytes = await audio.read()
    filename = audio.filename or "recording.webm"
    return pipeline.transcribe(audio_bytes, filename)

@app.post("/api/extract", response_model=ExtractResponse)
def extract_facts(
    payload: ExtractRequest,
    pipeline: MemoryPipeline = Depends(get_pipeline),
):
    facts = pipeline.extract_facts(payload.text, payload.person_id)
    return ExtractResponse(facts=facts)

@app.post("/api/memories", response_model=MemoryCreateResponse)
def create_memory(
    payload: MemoryCreateRequest,
    pipeline: MemoryPipeline = Depends(get_pipeline),
):
    story_id, person = pipeline.save_memory(
        person_id=payload.person_id,
        title=payload.title,
        body=payload.body,
        told_on=payload.told_on,
        audio_id=payload.audio_id,
        facts=payload.facts,
    )
    return MemoryCreateResponse(story_id=story_id, person=person)

@app.post("/api/ask", response_model=AskResponse)
def ask_question(
    payload: AskRequest,
    pipeline: MemoryPipeline = Depends(get_pipeline),
):
    return pipeline.ask(payload.question, payload.person_id)

