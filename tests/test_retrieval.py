import pytest
from src.domain.retrieval import (
    filter_retrieved_stories,
    validate_citations,
    get_refusal_answer,
    REFUSAL_ANSWER_EN,
    REFUSAL_ANSWER_ES,
)

def test_filter_retrieved_stories_by_threshold():
    stories = [
        ({"id": 1, "title": "A"}, 0.85),
        ({"id": 2, "title": "B"}, 0.36),
        ({"id": 3, "title": "C"}, 0.34),  # Below 0.35 threshold
        ({"id": 4, "title": "D"}, 0.10),  # Below threshold
    ]
    filtered = filter_retrieved_stories(stories, min_relevance=0.35, top_k=4)
    ids = [s["id"] for s in filtered]
    assert ids == [1, 2]

def test_validate_citations_strips_hallucinations():
    valid_memories = [
        {"id": 10, "person_id": "lupita", "title": "Sunday mole"},
        {"id": 11, "person_id": "lupita", "title": "Singing roses"},
    ]
    # LLM claimed memory 10 and hallucinated 999
    claimed = [10, 999, "invalid"]
    clean = validate_citations(claimed, valid_memories)

    assert len(clean) == 1
    assert clean[0]["story_id"] == 10
    assert clean[0]["person_id"] == "lupita"

def test_language_refusal_strings():
    # English question
    assert get_refusal_answer("Where did they go?") == REFUSAL_ANSWER_EN
    # Spanish questions
    assert get_refusal_answer("¿Qué cantaba el abuelo?") == REFUSAL_ANSWER_ES
    assert get_refusal_answer("cuál era la comida favorita?") == REFUSAL_ANSWER_ES

