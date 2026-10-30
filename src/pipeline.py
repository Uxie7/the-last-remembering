"""
Memory Pipeline - Orchestrates AI transcription, fact extraction, persistence, and grounded Q&A.
Enforces constraints C1-C8 from INTEGRATION_SPEC.md.
"""
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple

from src.domain.schemas import (
    FactItem,
    FactInput,
    PersonDetail,
    AskResponse,
    Citation,
)
from src.domain.prompts import (
    FACT_EXTRACTION_SYSTEM_PROMPT,
    GROUNDED_ANSWER_SYSTEM_PROMPT,
    build_fact_extraction_user_prompt,
    build_grounded_answer_user_prompt,
)
from src.domain.retrieval import (
    validate_fact_quote,
    validate_citations,
    get_refusal_answer,
)

class MemoryPipeline:
    def __init__(
        self,
        store,
        file_store,
        llm,
        embedder,
        stt,
        min_relevance: float = 0.35,
        top_k: int = 4,
    ):
        self.store = store
        self.file_store = file_store
        self.llm = llm
        self.embedder = embedder
        self.stt = stt
        self.min_relevance = min_relevance
        self.top_k = top_k

    def transcribe(self, audio_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Saves uploaded audio file and transcribes it locally via Whisper.
        """
        rel_url, abs_path = self.file_store.save_audio(audio_bytes, filename)
        result = self.stt.transcribe(abs_path)
        result["audio_url"] = rel_url
        return result

    def extract_facts(self, text: str, person_id: Optional[str] = None) -> List[FactItem]:
        """
        Extracts foods, songs, sayings, and places from text using local LLM.
        Enforces C5: drops any fact whose quote is not a verbatim substring.
        """
        if not text or not text.strip():
            return []

        user_prompt = build_fact_extraction_user_prompt(text)
        res = self.llm.chat_json(
            FACT_EXTRACTION_SYSTEM_PROMPT,
            user_prompt,
            fallback_default={"facts": []},
        )

        raw_facts = res.get("facts", [])
        verified_facts: List[FactItem] = []
        valid_kinds = {"food", "song", "saying", "place"}

        for item in raw_facts:
            kind = item.get("kind", "").lower()
            val = item.get("value", "").strip()
            quote = item.get("quote", "").strip()

            if kind not in valid_kinds or not val or not quote:
                continue

            # C5: Verbatim fact quotes
            if not validate_fact_quote(quote, text):
                continue

            verified_facts.append(
                FactItem(
                    person_id=person_id,
                    kind=kind,
                    value=val,
                    quote=quote,
                )
            )

        return verified_facts

    def save_memory(
        self,
        person_id: str,
        title: str,
        body: str,
        told_on: Optional[str] = None,
        audio_id: Optional[str] = None,
        facts: Optional[List[FactInput]] = None,
    ) -> Tuple[int, PersonDetail]:
        """
        Persists approved memory, inserts facts, generates embeddings,
        updates glow, and returns updated person.
        """
        facts = facts or []

        # Validate that quotes in approved facts still match the story text
        valid_facts = [
            f for f in facts
            if validate_fact_quote(f.quote, body)
        ]

        # 1. Insert story
        story_id = self.store.add_story(
            person_id=person_id,
            title=title,
            body=body,
            told_on=told_on,
            audio_path=audio_id,
        )

        # 2. Insert verified facts
        if valid_facts:
            self.store.add_facts(story_id, person_id, valid_facts)

        # 3. Generate embedding vector and store
        embed_text = f"{title}\n{body}".strip()
        vectors = self.embedder.embed([embed_text])
        if vectors and len(vectors) > 0:
            self.store.save_embedding(story_id, vectors[0])

        # 4. Touch person and re-read updated detail
        self.store.touch_person(person_id)
        person_detail = self.store.get_person(person_id)

        return story_id, person_detail

    def ask(self, question: str, person_id: Optional[str] = None) -> AskResponse:
        """
        Answers questions strictly from retrieved memories with citations.
        Enforces C2 (no impersonation) and C3 (grounded answers only).
        """
        clean_q = question.strip()
        refusal_text = get_refusal_answer(clean_q)

        # 1. Embed query
        vectors = self.embedder.embed([clean_q])
        if not vectors or len(vectors) == 0:
            return AskResponse(answer=refusal_text, grounded=False, citations=[])

        query_vector = vectors[0]

        # 2. Search similar stories
        scored_pairs = self.store.search_similar_stories(
            query_vector,
            top_k=self.top_k,
            person_id=person_id,
        )

        # 3. Filter by relevance threshold
        qualifying_stories = []
        with self.store._get_connection() as conn:
            for s_id, score in scored_pairs:
                if score >= self.min_relevance:
                    row = conn.execute(
                        """
                        SELECT s.id, s.person_id, s.title, s.body, p.name as person_name
                        FROM stories s
                        JOIN people p ON p.id = s.person_id
                        WHERE s.id = ?
                        """,
                        (s_id,),
                    ).fetchone()
                    if row:
                        qualifying_stories.append(dict(row))

        # If no stories meet threshold, refuse immediately (C3)
        if not qualifying_stories:
            return AskResponse(answer=refusal_text, grounded=False, citations=[])

        # 4. Prompt LLM for grounded answer
        user_prompt = build_grounded_answer_user_prompt(clean_q, qualifying_stories)
        res = self.llm.chat_json(
            GROUNDED_ANSWER_SYSTEM_PROMPT,
            user_prompt,
            fallback_default={"answer": refusal_text, "citations": []},
        )

        raw_answer = res.get("answer", "").strip()
        raw_citations = res.get("citations", [])

        # Validate citations
        valid_citations_data = validate_citations(raw_citations, qualifying_stories)

        # If LLM gave empty answer or cited zero memories, refuse (C3)
        if not raw_answer or not valid_citations_data or raw_answer.lower() == refusal_text.lower():
            return AskResponse(answer=refusal_text, grounded=False, citations=[])

        citations = [
            Citation(
                story_id=c["story_id"],
                person_id=c["person_id"],
                title=c["title"],
            )
            for c in valid_citations_data
        ]

        return AskResponse(
            answer=raw_answer,
            grounded=True,
            citations=citations,
        )

