"""
Seed script to populate SQLite with the prototype sample ancestors and memories.
"""
import sys
from pathlib import Path

# Ensure project root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from datetime import datetime, timezone, timedelta
from src.config import DB_PATH
from src.adapters.store_sqlite import SqliteStore
from src.domain.schemas import FactInput

def seed_demo_data():
    store = SqliteStore(DB_PATH)
    now = datetime.now(timezone.utc)

    # 1. Abuela Lupita (visited 2 days ago)
    lupita_date = (now - timedelta(days=2)).isoformat()
    store.create_person(
        person_id="lupita",
        name="Abuela Lupita",
        relationship="Grandmother",
        color="#e8307f",
        last_touched=lupita_date,
    )
    s1 = store.add_story(
        person_id="lupita",
        title="Sunday mole",
        body="She woke at dawn to grind chiles on the metate. The whole house smelled of toasted pasilla and Mexican chocolate.",
        told_on="March 2026",
    )
    store.add_facts(s1, "lupita", [
        FactInput(kind="food", value="Mole negro", quote="ground chiles on the metate"),
        FactInput(kind="song", value="Cielito Lindo", quote="hummed Cielito Lindo while cooking"),
        FactInput(kind="saying", value="A full belly makes a happy heart", quote="A full belly makes a happy heart"),
    ])

    s2 = store.add_story(
        person_id="lupita",
        title="Singing to the roses",
        body="Every morning with the watering can, singing Cielito Lindo to make the petals open.",
        told_on="January 2026",
    )
    # Re-touch to 2 days ago so glow matches
    with store._get_connection() as conn:
        conn.execute("UPDATE people SET last_touched = ? WHERE id = 'lupita'", (lupita_date,))

    # 2. Abuelo Joaquín (visited 19 days ago)
    joaquin_date = (now - timedelta(days=19)).isoformat()
    store.create_person(
        person_id="joaquin",
        name="Abuelo Joaquín",
        relationship="Grandfather",
        color="#088395",
        last_touched=joaquin_date,
    )
    s3 = store.add_story(
        person_id="joaquin",
        title="Wood chips and cedar",
        body="He could fix any radio with a piece of copper wire and whistled Boleros while sanding cedar chairs.",
        told_on="October 2025",
    )
    store.add_facts(s3, "joaquin", [
        FactInput(kind="food", value="Pan dulce", quote="dipped conchas in black coffee"),
        FactInput(kind="song", value="Sabor a Mí", quote="whistled Boleros"),
        FactInput(kind="saying", value="Measure twice, cut once", quote="measure twice, cut once"),
    ])
    with store._get_connection() as conn:
        conn.execute("UPDATE people SET last_touched = ? WHERE id = 'joaquin'", (joaquin_date,))

    # 3. Tío Chema (visited 48 days ago)
    chema_date = (now - timedelta(days=48)).isoformat()
    store.create_person(
        person_id="chema",
        name="Tío Chema",
        relationship="Uncle",
        color="#6d2fd1",
        last_touched=chema_date,
    )
    s4 = store.add_story(
        person_id="chema",
        title="The old blue pickup",
        body="Always wore his yellow wool cap and drove a beat up Chevy that coughed blue smoke through the hills.",
        told_on="August 2025",
    )
    store.add_facts(s4, "chema", [
        FactInput(kind="food", value="Carnitas", quote="bought carnitas on Saturdays"),
        FactInput(kind="song", value="El Rey", quote="blasted El Rey from the truck radio"),
    ])
    with store._get_connection() as conn:
        conn.execute("UPDATE people SET last_touched = ? WHERE id = 'chema'", (chema_date,))

    # 4. Prima Xóchitl (visited 96 days ago)
    xochitl_date = (now - timedelta(days=96)).isoformat()
    store.create_person(
        person_id="xochitl",
        name="Prima Xóchitl",
        relationship="Cousin",
        color="#f39c12",
        last_touched=xochitl_date,
    )
    s5 = store.add_story(
        person_id="xochitl",
        title="Daisies in the hair",
        body="She collected wildflower seeds in paper envelopes and danced folk dances in the school courtyard.",
        told_on="June 2025",
    )
    store.add_facts(s5, "xochitl", [
        FactInput(kind="food", value="Mango with chile", quote="mango with chile"),
    ])
    with store._get_connection() as conn:
        conn.execute("UPDATE people SET last_touched = ? WHERE id = 'xochitl'", (xochitl_date,))

    print("Successfully seeded demo people and stories.")

if __name__ == "__main__":
    seed_demo_data()
