import io
import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from PIL import Image

from src.api import app, get_store, get_file_store, get_pipeline
from src.adapters.store_sqlite import SqliteStore
from src.adapters.files_local import LocalFileStore
from src.pipeline import MemoryPipeline

class E2EFakeLLM:
    def chat_json(self, system_prompt, user_prompt, fallback_default=None):
        if "extract facts" in system_prompt.lower():
            return {
                "facts": [
                    {"kind": "food", "value": "Mole negro", "quote": "ground pasilla chiles for mole negro"},
                    {"kind": "song", "value": "Cielito Lindo", "quote": "sang Cielito Lindo by the stove"},
                    {"kind": "saying", "value": "A full belly makes a happy heart", "quote": "A full belly makes a happy heart"},
                    {"kind": "place", "value": "Oaxaca", "quote": "an invented quote not in text"},  # Will be dropped (C5)
                ]
            }
        elif "answer questions" in system_prompt.lower():
            if "cook" in user_prompt.lower() or "mole" in user_prompt.lower():
                return {
                    "answer": "Abuela cooked mole negro by grinding pasilla chiles on the metate.",
                    "citations": [1],
                }
            return {
                "answer": "I don't have a memory of that yet.",
                "citations": [],
            }
        return fallback_default or {}

class E2EFakeEmbedder:
    def embed(self, texts):
        vectors = []
        for t in texts:
            vec = [0.0] * 768
            if "mole" in t.lower() or "chiles" in t.lower() or "cook" in t.lower():
                vec[0] = 1.0
            else:
                vec[1] = 0.5
            vectors.append(vec)
        return vectors

class E2EFakeSTT:
    def transcribe(self, audio_path):
        return {
            "text": "Every Sunday morning Abuela Lupita ground pasilla chiles for mole negro and sang Cielito Lindo by the stove. She would say A full belly makes a happy heart.",
            "language": "en",
            "duration_sec": 14.5,
        }

@pytest.fixture
def e2e_client(tmp_path):
    store = SqliteStore(tmp_path / "e2e.db")
    file_store = LocalFileStore(tmp_path)
    llm = E2EFakeLLM()
    embedder = E2EFakeEmbedder()
    stt = E2EFakeSTT()

    pipeline = MemoryPipeline(
        store=store,
        file_store=file_store,
        llm=llm,
        embedder=embedder,
        stt=stt,
        min_relevance=0.35,
        top_k=4,
    )

    app.dependency_overrides[get_store] = lambda: store
    app.dependency_overrides[get_file_store] = lambda: file_store
    app.dependency_overrides[get_pipeline] = lambda: pipeline

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()

def test_full_memory_lifecycle_e2e(e2e_client):
    # 1. Create person on altar
    p_res = e2e_client.post(
        "/api/people",
        json={"name": "Abuela Lupita", "relationship": "Grandmother", "color": "#e8307f"},
    )
    assert p_res.status_code == 200
    person = p_res.json()
    p_id = person["id"]
    assert p_id == "abuela-lupita"
    assert person["glow"] == 20
    assert person["status"] == "Nearly dark"

    # 2. Upload photo
    img = Image.new("RGB", (800, 800), color="purple")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    photo_res = e2e_client.post(
        f"/api/people/{p_id}/photo",
        files={"file": ("lupita.jpg", buf, "image/jpeg")},
    )
    assert photo_res.status_code == 200
    assert photo_res.json()["photo_url"].startswith("/files/photos/")

    # 3. Transcribe audio recording
    fake_audio = io.BytesIO(b"RIFFdummywavebytes")
    trans_res = e2e_client.post(
        "/api/transcribe",
        files={"audio": ("rec.webm", fake_audio, "audio/webm")},
    )
    assert trans_res.status_code == 200
    trans_data = trans_res.json()
    assert "mole negro" in trans_data["text"]

    # 4. Extract facts with quote verification
    ext_res = e2e_client.post(
        "/api/extract",
        json={"text": trans_data["text"], "person_id": p_id},
    )
    assert ext_res.status_code == 200
    extracted = ext_res.json()["facts"]
    # 3 valid facts in text, 1 hallucinated quote dropped (C5)
    assert len(extracted) == 3
    kinds = [f["kind"] for f in extracted]
    assert "food" in kinds
    assert "song" in kinds
    assert "saying" in kinds

    # 5. User approves 2 of the facts and saves memory (C4)
    approved = [extracted[0], extracted[1]]
    save_res = e2e_client.post(
        "/api/memories",
        json={
            "person_id": p_id,
            "title": "Sunday mole and singing",
            "body": trans_data["text"],
            "told_on": "March 2026",
            "facts": approved,
        },
    )
    assert save_res.status_code == 200
    saved = save_res.json()
    updated_person = saved["person"]
    # 20 base + 12 (1 story) + 4 (2 facts) = 36 glow -> "Fading"
    assert updated_person["glow"] == 36
    assert updated_person["status"] == "Fading"
    assert len(updated_person["stories"]) == 1

    # 6. Ask question grounded in the memory
    ask_res = e2e_client.post(
        "/api/ask",
        json={"question": "What did Abuela cook on Sundays?", "person_id": p_id},
    )
    assert ask_res.status_code == 200
    ask_data = ask_res.json()
    assert ask_data["grounded"] is True
    assert "mole negro" in ask_data["answer"].lower()
    assert len(ask_data["citations"]) == 1
    assert ask_data["citations"][0]["story_id"] == 1
    assert ask_data["citations"][0]["person_id"] == p_id

    # 7. Ask question with no saved memory -> Refusal returned
    unknown_res = e2e_client.post(
        "/api/ask",
        json={"question": "What was her favorite car?", "person_id": p_id},
    )
    assert unknown_res.status_code == 200
    unknown_data = unknown_res.json()
    assert unknown_data["grounded"] is False
    assert unknown_data["answer"] == "I don't have a memory of that yet."
    assert unknown_data["citations"] == []

    # 8. Check Keepsake Remembrance Data
    keep_res = e2e_client.get(f"/api/people/{p_id}/keepsake")
    assert keep_res.status_code == 200
    keep_data = keep_res.json()
    assert keep_data["name"] == "Abuela Lupita"
    assert "Mole negro" in keep_data["favorites"]

    # 9. Offline Narration
    narrate_res = e2e_client.get(f"/api/people/{p_id}/narrate")
    assert narrate_res.status_code == 200
    assert narrate_res.headers["content-type"] == "audio/wav"

