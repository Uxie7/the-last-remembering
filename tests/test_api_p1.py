import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from src.api import app, get_store, get_file_store
from src.adapters.store_sqlite import SqliteStore
from src.adapters.files_local import LocalFileStore

@pytest.fixture
def client(tmp_path):
    test_db = tmp_path / "test.db"
    store = SqliteStore(test_db)
    file_store = LocalFileStore(tmp_path)

    app.dependency_overrides[get_store] = lambda: store
    app.dependency_overrides[get_file_store] = lambda: file_store

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()

def test_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["db"] is True
    assert "llm_model" in data

def test_create_and_list_people(client):
    # Initial list is empty
    res = client.get("/api/people")
    assert res.status_code == 200
    assert res.json() == []

    # Create person
    create_res = client.post(
        "/api/people",
        json={"name": "Abuela Lupita", "relationship": "Grandmother", "color": "#e8307f"},
    )
    assert create_res.status_code == 200
    data = create_res.json()
    assert data["id"] == "abuela-lupita"
    assert data["name"] == "Abuela Lupita"
    assert data["glow"] == 20

    # Retrieve person detail
    detail_res = client.get("/api/people/abuela-lupita")
    assert detail_res.status_code == 200
    assert detail_res.json()["name"] == "Abuela Lupita"

def test_photo_upload_validates_and_resizes(client):
    # Create person first
    client.post(
        "/api/people",
        json={"name": "Lupita", "relationship": "Grandmother"},
    )

    # 1. Invalid mime type should fail with 400
    bad_file = io.BytesIO(b"not an image text")
    res_bad = client.post(
        "/api/people/lupita/photo",
        files={"file": ("test.txt", bad_file, "text/plain")},
    )
    assert res_bad.status_code == 400

    # 2. Valid image should succeed
    img = Image.new("RGB", (2000, 1000), color="red")
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="JPEG")
    img_byte_arr.seek(0)

    res_good = client.post(
        "/api/people/lupita/photo",
        files={"file": ("portrait.jpg", img_byte_arr, "image/jpeg")},
    )
    assert res_good.status_code == 200
    assert "photo_url" in res_good.json()
    assert res_good.json()["photo_url"].startswith("/files/photos/")

    # Check that person detail now reflects the photo_url
    person = client.get("/api/people/lupita").json()
    assert person["photo_url"] == res_good.json()["photo_url"]

