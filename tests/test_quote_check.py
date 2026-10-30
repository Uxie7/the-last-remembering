import pytest
from src.domain.retrieval import validate_fact_quote

def test_verbatim_quote_exact_match():
    story = "She ground the chiles on the metate for mole negro."
    quote = "ground the chiles on the metate"
    assert validate_fact_quote(quote, story) is True

def test_quote_case_insensitivity():
    story = "She ground the chiles on the metate for Mole Negro."
    quote = "MOLE NEGRO"
    assert validate_fact_quote(quote, story) is True

def test_quote_whitespace_tolerance():
    story = "She ground the chiles on the metate\n   and cooked all afternoon."
    quote = "chiles on the metate and cooked"
    assert validate_fact_quote(quote, story) is True

def test_altered_quote_rejected():
    story = "She made hot chocolate on Sunday mornings."
    # Altered words not in story
    quote = "She made sweet Mexican hot chocolate"
    assert validate_fact_quote(quote, story) is False

def test_empty_quote_or_story_rejected():
    assert validate_fact_quote("", "Some story") is False
    assert validate_fact_quote("Some quote", "") is False

