"""
Export the local private archive into a portable .ofrenda file.
Packages remembering.db, photos, and audio so memories can be moved
to any machine and remain private and permanent.
"""
import sys
import zipfile
from pathlib import Path
from datetime import datetime, timezone

# Ensure project root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from src.config import DATA_DIR

def export_archive(output_path: Path | str | None = None) -> Path:
    if output_path is None:
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        output_path = Path.cwd() / f"family_archive_{timestamp}.ofrenda"
    else:
        output_path = Path(output_path)

    print(f"Packaging archive from {DATA_DIR} into {output_path}...")

    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for file in DATA_DIR.rglob("*"):
            if file.is_file():
                rel_path = file.relative_to(DATA_DIR)
                zipf.write(file, arcname=rel_path)

    print(f"Archive successfully exported to: {output_path}")
    return output_path

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else None
    export_archive(out)

