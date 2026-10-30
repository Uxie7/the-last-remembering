import io
import pytest
from fastapi.testclient import TestClient
from src.api import app, get_store, get_file_store
from src.adapters.store_sqlite import SqliteStore
from src.adapters.files_local import LocalFileStore

@pytest.fixture
def client(tmp_path):
    store = SqliteStore(":memory:")
    file_store = LocalFileStore(tmp_path)
    app.dependency_overrides[get_store] = lambda: store
    app.dependency_overrides[get_file_store] = lambda: file_store
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

def test_cors_rejects_foreign_origin(client):
    # Foreign origin request
    res = client.options(
        "/api/people",
        headers={
            "Origin": "https://malicious-tracker.com",
            "Access-Control-Request-Method": "GET",
        },
    )
    # FastAPI CORSMiddleware does not include Access-Control-Allow-Origin for untrusted origins
    allow_origin = res.headers.get("access-control-allow-origin")
    assert allow_origin != "https://malicious-tracker.com"

def test_cors_allows_local_origin(client):
    res = client.options(
        "/api/people",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert res.headers.get("access-control-allow-origin") == "http://localhost:3000"

def test_upload_rejects_oversized_photo(client):
    # Pre-create person
    client.post("/api/people", json={"name": "Lupita", "relationship": "Grandmother"})

    # Create dummy bytes > 8MB
    big_file = io.BytesIO(b"x" * (8 * 1024 * 1024 + 10))
    res = client.post(
        "/api/people/lupita/photo",
        files={"file": ("huge.jpg", big_file, "image/jpeg")},
    )
    assert res.status_code == 400
    assert "large" in res.json()["detail"].lower() or "limit" in res.json()["detail"].lower()

def test_upload_rejects_disallowed_mimetype(client):
    client.post("/api/people", json={"name": "Lupita", "relationship": "Grandmother"})
    fake_exe = io.BytesIO(b"MZ\x90\x00...")
    res = client.post(
        "/api/people/lupita/photo",
        files={"file": ("virus.exe", fake_exe, "application/octet-stream")},
    )
    assert res.status_code == 400
    assert "Invalid file type" in res.json()["detail"]

