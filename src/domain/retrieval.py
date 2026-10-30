"""
Retrieval rules, citation validation, and verbatim quote checking.
Enforces constraints C2, C3, C5 from INTEGRATION_SPEC.md.
"""
import re
from typing import List, Dict, Any, Tuple
from src.domain.prompts import REFUSAL_ANSWER_EN, REFUSAL_ANSWER_ES

def normalize_text(text: str) -> str:
    """Normalizes whitespace and converts to lower case."""
    return re.sub(r"\s+", " ", text.strip().lower())

def validate_fact_quote(quote: str, story_text: str) -> bool:
    """
    Enforces C5: Every extracted fact must carry a quote that is a literal
    substring of the story (whitespace-normalized, case-insensitive).
    """
    if not quote or not story_text:
        return False
    norm_quote = normalize_text(quote)
    norm_story = normalize_text(story_text)
    return norm_quote in norm_story

def is_spanish_text(text: str) -> bool:
    """Heuristic to detect if question/text is in Spanish."""
    spanish_indicators = [
        "¿", "qué", "que", "cómo", "como", "quién", "quien",
        "cuándo", "cuando", "dónde", "donde", "cuál", "abuela",
        "abuelo", "tío", "tia", "prima", "recuerdo", "canción"
    ]
    t = text.lower()
    return any(indicator in t for indicator in spanish_indicators)

def get_refusal_answer(question: str) -> str:
    """Returns the grounded refusal string based on detected language."""
    if is_spanish_text(question):
        return REFUSAL_ANSWER_ES
    return REFUSAL_ANSWER_EN

def filter_retrieved_stories(
    scored_stories: List[Tuple[Dict[str, Any], float]],
    min_relevance: float = 0.35,
    top_k: int = 4,
) -> List[Dict[str, Any]]:
    """
    Filters retrieved stories by min_relevance threshold and returns up to top_k stories.
    """
    filtered = []
    for story, score in scored_stories:
        if score >= min_relevance:
            filtered.append(story)
        if len(filtered) >= top_k:
            break
    return filtered

def validate_citations(
    claimed_ids: List[int | str],
    valid_stories: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Validates citations returned by the LLM:
    - Strips hallucinated IDs that were not in the provided memories
    - Formats valid citations as Citation dicts
    """
    valid_lookup = {s["id"]: s for s in valid_stories}
    clean_citations = []
    seen = set()

    for cid in claimed_ids:
        try:
            cid_int = int(cid)
        except (ValueError, TypeError):
            continue

        if cid_int in valid_lookup and cid_int not in seen:
            seen.add(cid_int)
            st = valid_lookup[cid_int]
            clean_citations.append({
                "story_id": cid_int,
                "person_id": st["person_id"],
                "title": st["title"],
            })

    return clean_citations

