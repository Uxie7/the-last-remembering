import io
import pytest
from pathlib import Path
from fastapi.testclient import TestClient
from src.api import app, get_store, get_file_store
from src.adapters.store_sqlite import SqliteStore
from src.adapters.files_local import LocalFileStore
from scripts.export_archive import export_archive
from scripts.import_archive import import_archive

@pytest.fixture
def client(tmp_path):
    store = SqliteStore(tmp_path / "test.db")
    file_store = LocalFileStore(tmp_path)
    app.dependency_overrides[get_store] = lambda: store
    app.dependency_overrides[get_file_store] = lambda: file_store
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

def test_offline_narration_audio_stream(client):
    client.post("/api/people", json={"name": "Abuela Lupita", "relationship": "Grandmother"})
    res = client.get("/api/people/abuela-lupita/narrate")
    assert res.status_code == 200
    assert res.headers["content-type"] == "audio/wav"
    assert len(res.content) > 100
    # Check WAV magic header 'RIFF' and 'WAVE'
    assert res.content[:4] == b"RIFF"
    assert res.content[8:12] == b"WAVE"

def test_archive_export_and_import(tmp_path, monkeypatch):
    data_dir = tmp_path / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    (data_dir / "sample.txt").write_text("Hello ancestor memory")

    monkeypatch.setattr("scripts.export_archive.DATA_DIR", data_dir)
    archive_file = tmp_path / "test.ofrenda"
    export_archive(archive_file)
    assert archive_file.exists()

    restore_dir = tmp_path / "restored_data"
    monkeypatch.setattr("scripts.import_archive.DATA_DIR", restore_dir)
    import_archive(archive_file)
    assert (restore_dir / "sample.txt").exists()
    assert (restore_dir / "sample.txt").read_text() == "Hello ancestor memory"

