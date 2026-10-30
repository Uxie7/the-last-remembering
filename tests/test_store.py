import pytest
from src.adapters.store_sqlite import SqliteStore
from src.domain.schemas import FactInput

@pytest.fixture
def store():
    return SqliteStore(":memory:")

def test_person_crud(store):
    person = store.create_person(
        person_id="lupita",
        name="Abuela Lupita",
        relationship="Grandmother",
        color="#e8307f",
    )
    assert person.id == "lupita"
    assert person.name == "Abuela Lupita"
    assert person.glow == 20  # Base glow with 0 stories
    assert person.status == "Nearly dark"

    people = store.get_people()
    assert len(people) == 1
    assert people[0].id == "lupita"

def test_add_stories_and_facts_updates_glow(store):
    store.create_person(
        person_id="joaquin",
        name="Abuelo Joaquín",
        relationship="Grandfather",
    )

    s_id = store.add_story(
        person_id="joaquin",
        title="Wood chips and cedar",
        body="Whistled Boleros while sanding cedar chairs.",
        told_on="October 2025",
    )

    store.add_facts(
        s_id,
        "joaquin",
        [
            FactInput(kind="food", value="Pan dulce", quote="pan dulce"),
            FactInput(kind="song", value="Boleros", quote="whistled Boleros"),
        ],
    )

    detail = store.get_person("joaquin")
    assert detail is not None
    assert len(detail.stories) == 1
    assert "Pan dulce" in detail.foods
    assert "Boleros" in detail.songs
    # 20 base + 12 (1 story) + 4 (2 facts) = 36 -> "Fading"
    assert detail.glow == 36
    assert detail.status == "Fading"

def test_photo_update(store):
    store.create_person(
        person_id="chema",
        name="Tío Chema",
        relationship="Uncle",
    )
    store.update_photo("chema", "/files/photos/chema.jpg")
    p = store.get_person("chema")
    assert p.photo_url == "/files/photos/chema.jpg"

