"""
Local file store adapter for photos and audio.
Enforces constraints:
- Max 8MB photo size
- Accept jpeg, png, webp
- Resize image to max 1024px on long edge
"""
import io
import os
import uuid
from pathlib import Path
from typing import Tuple
from PIL import Image

class LocalFileStore:
    def __init__(self, data_dir: Path | str):
        self.data_dir = Path(data_dir)
        self.photos_dir = self.data_dir / "photos"
        self.audio_dir = self.data_dir / "audio"
        self.photos_dir.mkdir(parents=True, exist_ok=True)
        self.audio_dir.mkdir(parents=True, exist_ok=True)

    def save_photo(self, person_id: str, file_bytes: bytes, content_type: str) -> str:
        """
        Validates, resizes to <=1024px long edge, saves photo, and returns relative URL.
        """
        allowed_types = {"image/jpeg", "image/png", "image/webp"}
        if content_type not in allowed_types:
            raise ValueError(f"Invalid image type {content_type}. Allowed: {allowed_types}")

        if len(file_bytes) > 8 * 1024 * 1024:
            raise ValueError("Photo exceeds 8MB maximum size limit.")

        image = Image.open(io.BytesIO(file_bytes))
        image = image.convert("RGB")

        max_dimension = 1024
        orig_width, orig_height = image.size
        if orig_width > max_dimension or orig_height > max_dimension:
            if orig_width > orig_height:
                new_width = max_dimension
                new_height = int(orig_height * (max_dimension / orig_width))
            else:
                new_height = max_dimension
                new_width = int(orig_width * (max_dimension / orig_height))
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)

        filename = f"{person_id}_{uuid.uuid4().hex[:8]}.jpg"
        target_path = self.photos_dir / filename
        image.save(target_path, "JPEG", quality=88, optimize=True)

        return f"/files/photos/{filename}"

    def save_audio(self, audio_bytes: bytes, filename: str) -> Tuple[str, Path]:
        """
        Saves raw audio bytes and returns relative URL and absolute Path.
        """
        clean_name = f"{uuid.uuid4().hex[:8]}_{Path(filename).name}"
        target_path = self.audio_dir / clean_name
        with open(target_path, "wb") as f:
            f.write(audio_bytes)
        return f"/files/audio/{clean_name}", target_path

