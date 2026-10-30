import pytest
from src.domain.glow import compute_glow, status

@pytest.mark.parametrize(
    "stories,facts,days,expected_glow",
    [
        # Baseline with 0 stories, 0 facts, 0 days
        (0, 0, 0, 20),
        # 1 story (+12), 0 facts, 0 days
        (1, 0, 0, 32),
        # 5 stories (+60), 0 facts, 0 days
        (5, 0, 0, 80),
        # 6 stories (capped at 5 -> +60), 0 facts, 0 days
        (6, 0, 0, 80),
        # 5 stories (+60), 10 facts (+20), 0 days -> 20 + 60 + 20 = 100
        (5, 10, 0, 100),
        # 10 stories, 20 facts (both capped) -> 100 max
        (10, 20, 0, 100),
        # 2 stories (+24), 3 facts (+6), 2 days (-1) -> 20 + 24 + 6 - 1 = 49
        (2, 3, 2, 49),
        # Decay past zero -> clamped at 0
        (0, 0, 100, 0),
        # Negative days treated as 0
        (1, 0, -5, 32),
    ],
)
def test_compute_glow_table(stories, facts, days, expected_glow):
    assert compute_glow(stories, facts, days) == expected_glow

@pytest.mark.parametrize(
    "glow,expected_status",
    [
        (100, "Burning bright"),
        (76, "Burning bright"),
        (75, "Glowing"),
        (46, "Glowing"),
        (45, "Fading"),
        (21, "Fading"),
        (20, "Nearly dark"),
        (0, "Nearly dark"),
    ],
)
def test_status_thresholds(glow, expected_status):
    assert status(glow) == expected_status

