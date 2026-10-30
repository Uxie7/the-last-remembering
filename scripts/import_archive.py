"""
Restore a .ofrenda archive into the local DATA_DIR.
"""
import sys
import zipfile
from pathlib import Path

# Ensure project root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from src.config import DATA_DIR

def import_archive(archive_path: Path | str):
    archive_path = Path(archive_path)
    if not archive_path.exists():
        raise FileNotFoundError(f"Archive file not found: {archive_path}")

    print(f"Restoring archive from {archive_path} into {DATA_DIR}...")
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(archive_path, "r") as zipf:
        zipf.extractall(DATA_DIR)

    print(f"Archive successfully restored into: {DATA_DIR}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/import_archive.py <path_to_archive.ofrenda>")
        sys.exit(1)
    import_archive(sys.argv[1])

