import pytest
from src.adapters.store_sqlite import SqliteStore
from src.adapters.files_local import LocalFileStore
from src.pipeline import MemoryPipeline
from src.domain.schemas import FactInput

class FakeLLM:
    def __init__(self, responses=None):
        self.responses = responses or {}
        self.last_user_prompt = ""

    def chat_json(self, system_prompt, user_prompt, fallback_default=None):
        self.last_user_prompt = user_prompt
        if "extract facts" in system_prompt.lower():
            return self.responses.get("extract", fallback_default or {})
        for key, resp in self.responses.items():
            if key in user_prompt:
                return resp
        return fallback_default or {}

class FakeEmbedder:
    def embed(self, texts):
        # Deterministic dummy vector based on keywords
        vectors = []
        for t in texts:
            vec = [0.0] * 768
            if "mole" in t.lower() or "chiles" in t.lower():
                vec[0] = 1.0
            elif "truck" in t.lower() or "radio" in t.lower():
                vec[1] = 1.0
            else:
                vec[2] = 0.5
            vectors.append(vec)
        return vectors

class FakeSTT:
    def transcribe(self, audio_path):
        return {
            "text": "Abuela sang Cielito Lindo in the morning.",
            "language": "en",
            "duration_sec": 12.4,
        }

@pytest.fixture
def pipeline(tmp_path):
    store = SqliteStore(":memory:")
    file_store = LocalFileStore(tmp_path)
    llm = FakeLLM({
        "extract": {
            "facts": [
                {"kind": "food", "value": "Mole negro", "quote": "ground chiles on the metate"},
                {"kind": "song", "value": "Fake Song", "quote": "this quote is not in the text"},  # Will be dropped (C5)
            ]
        },
        "Question: What did she cook": {
            "answer": "She ground chiles on the metate to make mole negro.",
            "citations": [1],
        },
    })
    embedder = FakeEmbedder()
    stt = FakeSTT()

    # Pre-create person
    store.create_person("lupita", "Abuela Lupita", "Grandmother")

    return MemoryPipeline(
        store=store,
        file_store=file_store,
        llm=llm,
        embedder=embedder,
        stt=stt,
        min_relevance=0.35,
        top_k=4,
    )

def test_transcribe(pipeline):
    res = pipeline.transcribe(b"fake audio bytes", "test.webm")
    assert "Abuela sang" in res["text"]
    assert res["language"] == "en"
    assert res["audio_url"].startswith("/files/audio/")

def test_extract_facts_drops_invalid_quote(pipeline):
    story = "Sunday mole. She ground chiles on the metate for dinner."
    facts = pipeline.extract_facts(story, person_id="lupita")

    # Only the verified fact with verbatim quote should survive
    assert len(facts) == 1
    assert facts[0].value == "Mole negro"
    assert facts[0].quote == "ground chiles on the metate"

def test_save_memory_lifecycle(pipeline):
    # Save memory with 1 approved fact
    approved_facts = [
        FactInput(kind="food", value="Mole negro", quote="ground chiles on the metate")
    ]
    story_id, person = pipeline.save_memory(
        person_id="lupita",
        title="Sunday mole",
        body="She ground chiles on the metate for Sunday mole.",
        told_on="March 2026",
        facts=approved_facts,
    )

    assert story_id == 1
    assert len(person.stories) == 1
    assert "Mole negro" in person.foods
    # 20 base + 12 (1 story) + 2 (1 fact) = 34
    assert person.glow == 34
    assert person.status == "Fading"

def test_save_memory_with_zero_approved_facts(pipeline):
    story_id, person = pipeline.save_memory(
        person_id="lupita",
        title="Quiet afternoon",
        body="Just sitting by the window watching the rain.",
        facts=[],
    )
    assert story_id == 1
    assert len(person.stories) == 1
    # 20 base + 12 (1 story) = 32
    assert person.glow == 32

def test_grounded_ask_matching_memory(pipeline):
    # First save a memory
    pipeline.save_memory(
        person_id="lupita",
        title="Sunday mole",
        body="She ground chiles on the metate for Sunday mole.",
        facts=[],
    )

    # Ask question that matches embedding
    res = pipeline.ask("What did she cook with chiles?")
    assert res.grounded is True
    assert "chiles" in res.answer.lower()
    assert len(res.citations) == 1
    assert res.citations[0].story_id == 1
    assert res.citations[0].person_id == "lupita"

def test_grounded_ask_unmatched_memory_returns_refusal(pipeline):
    # No memories saved about airplanes
    res = pipeline.ask("Did anyone fly airplanes?")
    assert res.grounded is False
    assert res.answer == "I don't have a memory of that yet."
    assert res.citations == []
