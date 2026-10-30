"""
Glow Engine - Pure domain logic for candle score and status.
Formula:
    glow = clamp( 20 + 12 * min(stories, 5) + 2 * min(facts, 10) - 0.5 * days_since_touch, 0, 100 )
"""
from typing import Optional, TypedDict

class GlowConfig(TypedDict, total=False):
    base: float
    story_weight: float
    story_cap: int
    fact_weight: float
    fact_cap: int
    decay_rate: float
    min_glow: int
    max_glow: int

DEFAULT_GLOW_CONFIG: GlowConfig = {
    "base": 20.0,
    "story_weight": 12.0,
    "story_cap": 5,
    "fact_weight": 2.0,
    "fact_cap": 10,
    "decay_rate": 0.5,
    "min_glow": 0,
    "max_glow": 100,
}

def compute_glow(
    stories: int,
    facts: int,
    days_since_touch: float,
    cfg: Optional[GlowConfig] = None,
) -> int:
    """
    Computes a clamped integer glow score [0, 100] based on story count,
    fact count, and days elapsed since the person was last visited or touched.
    """
    config = {**DEFAULT_GLOW_CONFIG, **(cfg or {})}

    stories = max(0, int(stories))
    facts = max(0, int(facts))
    days = max(0.0, float(days_since_touch))

    story_bonus = config["story_weight"] * min(stories, config["story_cap"])
    fact_bonus = config["fact_weight"] * min(facts, config["fact_cap"])
    decay = config["decay_rate"] * days

    raw_score = config["base"] + story_bonus + fact_bonus - decay
    clamped = max(config["min_glow"], min(config["max_glow"], round(raw_score)))
    return int(clamped)

def status(glow: int) -> str:
    """
    Returns the descriptive status string corresponding to a glow level:
    - 76 - 100: 'Burning bright'
    - 46 - 75: 'Glowing'
    - 21 - 45: 'Fading'
    - 0 - 20: 'Nearly dark'
    """
    if glow >= 76:
        return "Burning bright"
    elif glow >= 46:
        return "Glowing"
    elif glow >= 21:
        return "Fading"
    else:
        return "Nearly dark"

