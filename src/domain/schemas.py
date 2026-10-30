"""
Pydantic schemas for The Last Remembering.
Contracts defined in INTEGRATION_SPEC.md.
"""
from typing import List, Optional, Literal
from pydantic import BaseModel, Field

# --- Fact schemas ---
FactKind = Literal["food", "song", "saying", "place"]

class FactItem(BaseModel):
    id: Optional[int] = None
    story_id: Optional[int] = None
    person_id: Optional[str] = None
    kind: FactKind
    value: str
    quote: str

class FactInput(BaseModel):
    kind: FactKind
    value: str
    quote: str

# --- Story schemas ---
class StoryDetail(BaseModel):
    id: int
    title: str
    body: str
    told_on: Optional[str] = None
    audio_path: Optional[str] = None
    created_at: Optional[str] = None

# --- Person schemas ---
class PersonCreate(BaseModel):
    name: str = Field(..., min_length=1)
    relationship: str = Field(..., min_length=1)
    color: str = Field(default="#ff9f1c")

class PersonSummary(BaseModel):
    id: str
    name: str
    relationship: str
    color: str
    photo_url: Optional[str] = None
    glow: int
    status: str
    days_since_touch: int
    story_count: int

class PersonDetail(PersonSummary):
    foods: List[str] = Field(default_factory=list)
    songs: List[str] = Field(default_factory=list)
    sayings: List[str] = Field(default_factory=list)
    places: List[str] = Field(default_factory=list)
    stories: List[StoryDetail] = Field(default_factory=list)

# --- Extraction schemas ---
class ExtractRequest(BaseModel):
    text: str
    person_id: Optional[str] = None

class ExtractResponse(BaseModel):
    facts: List[FactItem] = Field(default_factory=list)

# --- Memory creation schemas ---
class MemoryCreateRequest(BaseModel):
    person_id: str
    title: str
    body: str
    told_on: Optional[str] = None
    audio_id: Optional[str] = None
    facts: List[FactInput] = Field(default_factory=list)

class MemoryCreateResponse(BaseModel):
    story_id: int
    person: PersonDetail

# --- Q&A / Ask schemas ---
class AskRequest(BaseModel):
    question: str
    person_id: Optional[str] = None

class Citation(BaseModel):
    story_id: int
    person_id: str
    title: str

class AskResponse(BaseModel):
    answer: str
    grounded: bool
    citations: List[Citation] = Field(default_factory=list)

# --- Keepsake schema ---
class KeepsakeResponse(BaseModel):
    name: str
    relationship: str
    photo_url: Optional[str] = None
    excerpt: Optional[str] = None
    favorites: List[str] = Field(default_factory=list)

# --- Health check schema ---
class HealthResponse(BaseModel):
    ollama: bool
    llm_model: str
    embed_model: str
    whisper_model: str
    piper_tts: bool = False
    db: bool

