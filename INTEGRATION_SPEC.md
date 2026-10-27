# The Last Remembering: Build & Integration Spec

> **How to use this document.** Give this file to an AI coding assistant together with `index.html` (the interface prototype). It describes the product, every component, the data model, API contracts, prompts, and the exact places in the prototype that must be replaced with real calls. Follow the build phases in order and verify each phase against its acceptance criteria before moving on.

---

## 1. Goal

Turn the existing front-end prototype into a working **local-first** application:

1. Record or type a family story, transcribe audio locally.
2. Extract foods, songs, sayings, and places from the story, with human approval.
3. Save stories and facts, compute a per-person "glow" score.
4. Answer questions strictly from saved stories, with citations.
5. Keep everything offline, using open-weight models only.

## 2. Hard Constraints (never violate)

| # | Constraint |
|---|---|
| C1 | **No cloud calls at runtime.** No OpenAI, Anthropic, Google, or any hosted API. Only `localhost` services. |
| C2 | **No impersonation.** The model must never speak as a person or role-play a deceased relative. It answers *about* them from saved stories. |
| C3 | **Grounded answers only.** If retrieved memories do not answer the question, return exactly `I don't have a memory of that yet.` |
| C4 | **Human approval.** Transcripts and extracted facts are drafts. Nothing is persisted until the user confirms. |
| C5 | **Verbatim fact quotes.** Every extracted fact must carry a quote that is a literal substring of the story. Drop facts that fail this check. |
| C6 | **Privacy.** Bind the server to `127.0.0.1`. No telemetry. Restrict CORS to the local frontend origin. User data lives only in `DATA_DIR`. |
| C7 | **No third-party IP.** Do not use characters, names, songs, or art from any film or studio. Use traditional imagery only. |
| C8 | **Open-weight models only** (Gemma, Whisper, nomic-embed-text, or other open-weight equivalents). |

---

## 3. Current State of the Frontend

**File:** `index.html`, a single file with inline CSS and JS, hash-based routing, no build step.

### Routes (hash tokens)

| Hash | View | Purpose |
|---|---|---|
| `#home` | Landing | Marketing and explanation |
| `#ofrenda` | Altar | Three-tier altar showing every person and candle |
| `#person-<id>` | Person | Portrait, facts, stories, photo upload |
| `#add` | Add memory | Form: person, title, story, record, extract, save |
| `#ask` | Ask | Question box with sample question chips |
| `#export` | Keepsake | Printable remembrance card |

### In-memory data shape (replace with API data)

```js
const P = [{
  id: "lupita",            // string slug
  c: "#e8307f",            // portrait accent color
  name: "Abuela Lupita",
  rel: "Grandmother",
  glow: 92,                // 0-100
  last: 2,                 // days since last touch
  foods: ["Mole negro"],
  songs: ["Cielito Lindo"],
  say:   ["A full belly makes a happy heart"],
  img: "data:image/..." ,  // optional, set by photo upload
  stories: [{ t: "Sunday mole", d: "March 2026", x: "story text..." }]
}];
```

### Mocked behaviors that must become real

| Prototype location | Current (fake) behavior | Replace with |
|---|---|---|
| `bind("add")` → `#rec` click | Writes a hard-coded sample transcript | Record via `MediaRecorder`, `POST /api/transcribe`, fill textarea with the result |
| `bind("add")` → `#ext` click | Matches a short list of food words | `POST /api/extract`, render returned facts with checkboxes |
| `bind("add")` → `#sv` click | Pushes into in-memory array, adds +25 glow | `POST /api/memories` with only the **approved** facts, then reload person |
| `bind("ask")` → `#go` click | Keyword overlap against in-memory stories | `POST /api/ask`, render `answer` and `citations` |
| `bind("person")` → `#ph` change | Reads file into a data URL in memory | `POST /api/people/{id}/photo` (multipart), then use returned URL |
| `P` constant | Hard-coded sample people | `GET /api/people` on load, `GET /api/people/{id}` for detail |
| `status()` / glow values | Computed client-side from sample | Use `glow` and `status` returned by the API |

### UI behaviors to preserve

- Candle brightness and flicker scale with `glow`.
- Hash-routing tokens contain only letters, digits, and hyphens (`person-<id>`).
- Ask page shows a source link per answer that navigates to `#person-<id>`.
- Empty states: person with no stories shows an invitation to add one.
- Remove the prefilled demo story and the "Record (demo)" label once real recording works. Keep demo data behind a `?demo=1` query flag if desired.

---

## 4. Components

### 4.1 Backend (FastAPI), `src/api.py`
Thin HTTP layer. Validates input with Pydantic, calls the pipeline, returns JSON. Serves the `frontend/` folder as static files so the whole app runs from one port.

### 4.2 Pipeline, `src/pipeline.py`
Orchestrates use cases: `transcribe`, `extract_facts`, `save_memory`, `ask`, `recompute_glow`. Contains no direct I/O. It receives adapters through constructor injection so tests can substitute fakes.

### 4.3 Domain (pure, no I/O), `src/domain/`

| Module | Responsibility |
|---|---|
| `schemas.py` | Pydantic models: `Person`, `Story`, `Fact`, `ExtractRequest`, `ExtractResponse`, `AskRequest`, `AskResponse`, `Citation` |
| `glow.py` | `compute_glow(stories, facts, days_since_touch, cfg) -> int` and `status(glow) -> str` |
| `prompts.py` | System and user prompt builders for extraction and grounded answering |
| `retrieval.py` | Rank filtering, relevance threshold, refusal rule, citation validation |

### 4.4 Adapters (I/O boundaries), `src/adapters/`

| Adapter | Interface | Implementation |
|---|---|---|
| `SpeechToText` | `transcribe(audio_path) -> str` | `faster-whisper`, model from `WHISPER_MODEL`, CPU int8 by default |
| `LLM` | `chat_json(system, user, schema) -> dict` | Ollama OpenAI-compatible endpoint; retry once on invalid JSON, then repair |
| `Embedder` | `embed(texts) -> list[list[float]]` | Ollama `/v1/embeddings` with `EMBED_MODEL` |
| `Store` | CRUD for people, stories, facts; `search(embedding, k, person_id?)` | SQLite plus `sqlite-vec` |
| `FileStore` | `save_audio`, `save_photo`, `url_for` | Local folders under `DATA_DIR` |

### 4.5 Frontend adapter, `frontend/api.js` (new)
A small wrapper around `fetch` exposing: `getPeople`, `getPerson`, `createPerson`, `uploadPhoto`, `transcribe`, `extractFacts`, `saveMemory`, `ask`, `health`. The view code calls only this module, never `fetch` directly.

---

## 5. Data Model (SQLite)

```sql
CREATE TABLE people (
  id            TEXT PRIMARY KEY,          -- slug, e.g. "lupita"
  name          TEXT NOT NULL,
  relationship  TEXT NOT NULL,
  color         TEXT NOT NULL DEFAULT '#ff9f1c',
  photo_path    TEXT,
  last_touched  TEXT NOT NULL,             -- ISO timestamp
  created_at    TEXT NOT NULL
);

CREATE TABLE stories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id   TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  audio_path  TEXT,
  told_on     TEXT,                        -- optional display date, e.g. "March 2026"
  created_at  TEXT NOT NULL
);

CREATE TABLE facts (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  story_id  INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  person_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  kind      TEXT NOT NULL CHECK (kind IN ('food','song','saying','place')),
  value     TEXT NOT NULL,
  quote     TEXT NOT NULL                  -- verbatim substring of stories.body
);

-- vec0 virtual table from sqlite-vec; rowid matches stories.id
CREATE VIRTUAL TABLE story_vec USING vec0(embedding float[768]);
```

**Notes:** `float[768]` matches `nomic-embed-text`. If the embedding model changes, store the dimension in a `settings` table and rebuild `story_vec`.

---

## 6. API Contracts

All bodies are JSON unless marked multipart. All endpoints are under `/api`.

### `GET /people`
```json
[{
  "id": "lupita", "name": "Abuela Lupita", "relationship": "Grandmother",
  "color": "#e8307f", "photo_url": null,
  "glow": 92, "status": "Burning bright", "days_since_touch": 2,
  "story_count": 2
}]
```

### `GET /people/{id}`
Same fields as above plus:
```json
{ "foods": ["Mole negro"], "songs": ["Cielito Lindo"], "sayings": ["..."],
  "stories": [{ "id": 1, "title": "Sunday mole", "told_on": "March 2026", "body": "..." }] }
```

### `POST /people`
```json
// request
{ "name": "Abuela Lupita", "relationship": "Grandmother", "color": "#e8307f" }
// response: the created person (same shape as GET /people item)
```

### `POST /people/{id}/photo` (multipart, field `file`)
Accept `image/jpeg|png|webp`, max 8 MB. Re-encode to max 1024 px on the long edge. Response: `{ "photo_url": "/files/photos/lupita.jpg" }`.

### `POST /transcribe` (multipart, field `audio`)
Accept `audio/webm|ogg|wav|mp4`. Response:
```json
{ "text": "draft transcript...", "language": "en", "duration_sec": 41.2 }
```

### `POST /extract`
```json
// request
{ "text": "story text", "person_id": "lupita" }
// response
{ "facts": [
  { "kind": "food", "value": "Mole negro", "quote": "ground the chiles for mole negro" },
  { "kind": "song", "value": "Cielito Lindo", "quote": "hummed Cielito Lindo" }
]}
```
Server-side check (C5): drop any fact whose `quote` is not a substring of `text` (case-insensitive, whitespace-normalized).

### `POST /memories`
```json
// request (only user-approved facts)
{ "person_id": "lupita", "title": "Sunday mole", "body": "story text",
  "told_on": "March 2026", "audio_id": null,
  "facts": [{ "kind": "food", "value": "Mole negro", "quote": "..." }] }
// response
{ "story_id": 7, "person": { /* updated person with new glow */ } }
```
Steps: validate → insert story and facts → embed `title + body` → insert into `story_vec` → set `last_touched = now` → return updated person.

### `POST /ask`
```json
// request
{ "question": "What did Abuelo sing in the truck?", "person_id": null }
// response (grounded)
{ "answer": "He sang Sabor a Mí...", "grounded": true,
  "citations": [{ "story_id": 3, "person_id": "joaquin", "title": "Songs in the truck" }] }
// response (nothing found)
{ "answer": "I don't have a memory of that yet.", "grounded": false, "citations": [] }
```
`person_id` is optional and filters retrieval to one person.

### `GET /people/{id}/keepsake`
```json
{ "name": "...", "relationship": "...", "photo_url": null,
  "excerpt": "first story body", "favorites": ["Mole negro", "Cielito Lindo"] }
```

### `GET /people/{id}/narrate`
Generate offline speech for the person's keepsake story using local Piper TTS (`.wav` audio stream). Accepts optional query param `?lang=en|es` (defaults to detected language). Returns `audio/wav`.

### `GET /health`
```json
{ "ollama": true, "llm_model": "gemma3:4b", "embed_model": "nomic-embed-text",
  "whisper_model": "small", "piper_tts": true, "db": true }
```
If a model is missing, return which one and the exact `ollama pull ...` command so the UI can show it.

### Error format
```json
{ "error": { "code": "MODEL_UNAVAILABLE", "message": "Run: ollama pull gemma3:4b" } }
```

---

## 7. Prompts & Multilingual Handling

### 7.1 Fact extraction (Bilingual EN/ES)

**System**
```text
You extract facts from a short family memory. Return JSON only, no prose.
Schema: {"facts":[{"kind":"food|song|saying|place","value":string,"quote":string}]}
Rules:
- Include only items explicitly stated in the text. Never infer or add details.
- "quote" must be copied exactly from the text, character for character.
- "value" is a short clean label (e.g. "Mole negro" or "Cielito Lindo").
- Handles English and Spanish stories identically.
- If nothing qualifies, return {"facts":[]}.
```
**User**
```text
Memory:
"""
{story_text}
"""
```
Use temperature 0 to 0.2, `format: json` or JSON-mode where supported.

### 7.2 Grounded answering (Bilingual EN/ES)

**System**
```text
You answer questions about a person using ONLY the numbered memories provided.
Rules:
- Never speak as the person. Refer to them in the third person.
- Answer in the same language as the question (English or Spanish).
- Do not use outside knowledge or guess.
- If the memories do not answer the question, return exactly:
  {"answer":"I don't have a memory of that yet.","citations":[]}
  (or in Spanish: {"answer":"Aún no tengo un recuerdo sobre eso.","citations":[]})
- Otherwise return {"answer": string, "citations":[memory ids used]}.
- Keep the answer to 1 to 3 sentences, warm and plain.
Return JSON only.
```
**User**
```text
Memories:
[{id}] ({person_name}, "{title}"): {body}
[{id}] ...

Question: {question}
```

---

## 10. The 3-Phase Build Plan (Post-Frontend)

The remaining development is organized into 3 coherent, production-ready phases:

| Phase | Focus | Deliverables | Verification / Acceptance |
|---|---|---|---|
| **Phase 1: Backend Foundation & Persistence** | Data Layer & API Server | FastAPI app (`src/api.py`), Pydantic schemas (`src/domain/schemas.py`), SQLite + sqlite-vec store (`src/adapters/store_sqlite.py`), local file store for photos/audio (`src/adapters/files_local.py`), Glow Engine with unit tests (`src/domain/glow.py`). | Database migrations run cleanly, `pytest tests/test_glow.py` passes, CRUD for people & photo uploads work from frontend. |
| **Phase 2: Open-Weight AI Pipelines** | Whisper, Gemma, Embeddings & Piper | `faster-whisper` adapter for audio transcription (`POST /api/transcribe`), Ollama Gemma adapter for bilingual quote-verified fact extraction (`POST /api/extract`), `nomic-embed-text` vector search + retrieval refuse rules (`POST /api/ask`), and local Piper TTS narration (`GET /api/people/{id}/narrate`). | Real spoken audio transcribes locally in <15s, facts extract with strict verbatim quotes, Q&A retrieves answers with citations or returns refusal string, Piper generates audio offline. |
| **Phase 3: End-to-End Integration & Verification** | Full System Integration & Offline Hardening | Connect Next.js frontend to FastAPI backend, test complete memory lifecycle from browser voice record to altar candle glow, run end-to-end integration tests (`pytest tests/test_e2e.py`), verify 100% offline functionality with Wi-Fi disabled, and package `.ofrenda` archive export/import. | App runs with 0 internet connection, all tests pass, submission post draft with DevRelay session ready for Hacktoberfest. |

---

## 11. Acceptance Criteria

**Functional**
- With the network disabled (after models are downloaded), every feature works.
- Asking "What did Abuelo sing in the truck?" returns an answer citing the matching story.
- Asking something with no matching memory returns `I don't have a memory of that yet.` and no citations.
- Extracted facts whose quote is not in the story are discarded.
- Saving a memory with zero approved facts still saves the story.
- Glow rises after saving a memory and falls as days pass (verified by unit tests with injected dates).

**Non-functional**
- Extraction on a 200-word story completes in under 20 s on a modern laptop CPU with a 4B model.
- Server refuses connections from non-local origins.
- Data folder can be copied to another machine and the app opens with all memories intact.
- No outbound network requests during normal use (verify with a network monitor).

---

## 12. Testing Plan

| Area | Test |
|---|---|
| Glow | Table-driven tests for caps, decay, clamping, status thresholds |
| Quote check | Facts with altered or missing quotes are rejected; whitespace and case differences are tolerated |
| Retrieval | Below-threshold results trigger refusal without calling the LLM |
| Citations | Hallucinated citation ids are stripped; empty citations force refusal |
| API | Contract tests using a `FakeLLM`, `FakeEmbedder`, and in-memory SQLite |
| Adapters | Ollama adapter retries once on malformed JSON, then raises a clear error |
| Security | CORS rejects foreign origins; uploads reject wrong types and oversize files |

---

## 13. Error Handling

| Situation | Behavior |
|---|---|
| Ollama not running | `MODEL_UNAVAILABLE`; UI shows "Start Ollama, then retry" |
| Model not pulled | Error includes the exact `ollama pull` command |
| Invalid JSON from LLM | Retry once with a stricter reminder; on second failure return an empty fact list or the refusal string, never raw model text |
| Empty or silent audio | Return empty text with a hint to try again |
| Very long story | Chunk by paragraph for extraction and merge facts, dropping duplicates |
| Duplicate fact | De-duplicate by `(person_id, kind, lowercase value)` |

---

## 14. Non-Goals

- No voice cloning, and no "talking as" a deceased person.
- No user accounts, cloud sync, or sharing links.
- No mobile app (responsive web only).
- No analytics or crash reporting that leaves the machine.

---

## 15. Optional Add-Ons (only if time allows)

| Add-on | Notes |
|---|---|
| Local narration | Piper TTS to read a remembrance aloud, fully offline |
| Cloud narration | A hosted voice service would break constraint C1; keep it clearly opt-in and off by default if ever added |
| Deployment | For a public demo only, host the static frontend with sample data. Real family data should stay local |
| Observability | Local-only timing logs for model latency; no external reporting |

---

## 16. Prompt to Give Your AI Assistant

```text
You are helping me build "The Last Remembering", a local-first, offline family memory app.
I am attaching index.html (a working UI prototype with sample data) and this spec.

Follow INTEGRATION_SPEC.md exactly. Work phase by phase starting at Phase 1.
After each phase: list the files you created or changed, show how to run and test it,
and wait for my confirmation before starting the next phase.

Hard rules: no cloud APIs, bind to 127.0.0.1, answers must be grounded in saved stories with
citations, extracted facts must contain verbatim quotes, nothing is saved without my approval,
and the model must never impersonate a person. Keep domain logic free of I/O and put all
external services behind adapters so tests can use fakes.
```
