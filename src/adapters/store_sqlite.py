"""
SQLite store adapter for people, stories, facts, and embeddings.
Supports standard SQLite with graceful fallback for vector search
if sqlite-vec is not compiled/available.
"""
import sqlite3
import json
import math
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional, Tuple, Dict, Any

from src.domain.glow import compute_glow, status
from src.domain.schemas import (
    PersonSummary,
    PersonDetail,
    StoryDetail,
    FactInput,
)

class SqliteStore:
    def __init__(self, db_path: Path | str = ":memory:"):
        self.db_path = str(db_path)
        self.has_vec = False
        self._mem_conn = None
        if self.db_path == ":memory:":
            self._mem_conn = sqlite3.connect(":memory:", check_same_thread=False)
            self._mem_conn.row_factory = sqlite3.Row
            self._mem_conn.execute("PRAGMA foreign_keys = ON;")
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        if self._mem_conn is not None:
            return self._mem_conn
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            conn.execute("""
            CREATE TABLE IF NOT EXISTS people (
                id            TEXT PRIMARY KEY,
                name          TEXT NOT NULL,
                relationship  TEXT NOT NULL,
                color         TEXT NOT NULL DEFAULT '#ff9f1c',
                photo_path    TEXT,
                last_touched  TEXT NOT NULL,
                created_at    TEXT NOT NULL
            );
            """)

            conn.execute("""
            CREATE TABLE IF NOT EXISTS stories (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                person_id   TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
                title       TEXT NOT NULL,
                body        TEXT NOT NULL,
                audio_path  TEXT,
                told_on     TEXT,
                created_at  TEXT NOT NULL
            );
            """)

            conn.execute("""
            CREATE TABLE IF NOT EXISTS facts (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                story_id  INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
                person_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
                kind      TEXT NOT NULL CHECK (kind IN ('food','song','saying','place')),
                value     TEXT NOT NULL,
                quote     TEXT NOT NULL
            );
            """)

            # Fallback embedding table (stores JSON array of floats)
            conn.execute("""
            CREATE TABLE IF NOT EXISTS story_embeddings (
                story_id    INTEGER PRIMARY KEY REFERENCES stories(id) ON DELETE CASCADE,
                embedding   TEXT NOT NULL
            );
            """)

            # Try loading sqlite-vec if available
            try:
                import sqlite_vec
                conn.enable_load_extension(True)
                sqlite_vec.load(conn)
                conn.execute("""
                CREATE VIRTUAL TABLE IF NOT EXISTS story_vec USING vec0(
                    story_id integer primary key,
                    embedding float[768]
                );
                """)
                self.has_vec = True
            except Exception:
                self.has_vec = False

    def create_person(
        self,
        person_id: str,
        name: str,
        relationship: str,
        color: str = "#ff9f1c",
        photo_path: Optional[str] = None,
        last_touched: Optional[str] = None,
        created_at: Optional[str] = None,
    ) -> PersonSummary:
        now_iso = datetime.now(timezone.utc).isoformat()
        last_touched = last_touched or now_iso
        created_at = created_at or now_iso

        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO people (id, name, relationship, color, photo_path, last_touched, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (person_id, name, relationship, color, photo_path, last_touched, created_at),
            )

        return self.get_person_summary(person_id)

    def _days_since(self, iso_str: str) -> float:
        try:
            dt = datetime.fromisoformat(iso_str)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)
            diff = (now - dt).total_seconds() / 86400.0
            return max(0.0, diff)
        except Exception:
            return 0.0

    def get_people(self) -> List[PersonSummary]:
        with self._get_connection() as conn:
            rows = conn.execute("""
                SELECT 
                    p.id, p.name, p.relationship, p.color, p.photo_path, p.last_touched,
                    COUNT(DISTINCT s.id) as story_count,
                    COUNT(DISTINCT f.id) as fact_count
                FROM people p
                LEFT JOIN stories s ON s.person_id = p.id
                LEFT JOIN facts f ON f.person_id = p.id
                GROUP BY p.id
                ORDER BY p.name ASC;
            """).fetchall()

            result = []
            for r in rows:
                days = self._days_since(r["last_touched"])
                glow_val = compute_glow(
                    stories=r["story_count"],
                    facts=r["fact_count"],
                    days_since_touch=days,
                )
                result.append(
                    PersonSummary(
                        id=r["id"],
                        name=r["name"],
                        relationship=r["relationship"],
                        color=r["color"],
                        photo_url=r["photo_path"],
                        glow=glow_val,
                        status=status(glow_val),
                        days_since_touch=int(math.floor(days)),
                        story_count=r["story_count"],
                    )
                )
            return result

    def get_person_summary(self, person_id: str) -> Optional[PersonSummary]:
        with self._get_connection() as conn:
            row = conn.execute("""
                SELECT 
                    p.id, p.name, p.relationship, p.color, p.photo_path, p.last_touched,
                    COUNT(DISTINCT s.id) as story_count,
                    COUNT(DISTINCT f.id) as fact_count
                FROM people p
                LEFT JOIN stories s ON s.person_id = p.id
                LEFT JOIN facts f ON f.person_id = p.id
                WHERE p.id = ?
                GROUP BY p.id;
            """, (person_id,)).fetchone()

            if not row:
                return None

            days = self._days_since(row["last_touched"])
            glow_val = compute_glow(
                stories=row["story_count"],
                facts=row["fact_count"],
                days_since_touch=days,
            )
            return PersonSummary(
                id=row["id"],
                name=row["name"],
                relationship=row["relationship"],
                color=row["color"],
                photo_url=row["photo_path"],
                glow=glow_val,
                status=status(glow_val),
                days_since_touch=int(math.floor(days)),
                story_count=row["story_count"],
            )

    def get_person(self, person_id: str) -> Optional[PersonDetail]:
        summary = self.get_person_summary(person_id)
        if not summary:
            return None

        with self._get_connection() as conn:
            story_rows = conn.execute("""
                SELECT id, title, body, told_on, audio_path, created_at
                FROM stories
                WHERE person_id = ?
                ORDER BY id DESC;
            """, (person_id,)).fetchall()

            stories = [
                StoryDetail(
                    id=sr["id"],
                    title=sr["title"],
                    body=sr["body"],
                    told_on=sr["told_on"],
                    audio_path=sr["audio_path"],
                    created_at=sr["created_at"],
                )
                for sr in story_rows
            ]

            fact_rows = conn.execute("""
                SELECT kind, value
                FROM facts
                WHERE person_id = ?;
            """, (person_id,)).fetchall()

            foods, songs, sayings, places = [], [], [], []
            for fr in fact_rows:
                k, val = fr["kind"], fr["value"]
                if k == "food" and val not in foods:
                    foods.append(val)
                elif k == "song" and val not in songs:
                    songs.append(val)
                elif k == "saying" and val not in sayings:
                    sayings.append(val)
                elif k == "place" and val not in places:
                    places.append(val)

            return PersonDetail(
                id=summary.id,
                name=summary.name,
                relationship=summary.relationship,
                color=summary.color,
                photo_url=summary.photo_url,
                glow=summary.glow,
                status=summary.status,
                days_since_touch=summary.days_since_touch,
                story_count=summary.story_count,
                foods=foods,
                songs=songs,
                sayings=sayings,
                places=places,
                stories=stories,
            )

    def update_photo(self, person_id: str, photo_url: str):
        with self._get_connection() as conn:
            conn.execute("UPDATE people SET photo_path = ? WHERE id = ?", (photo_url, person_id))

    def touch_person(self, person_id: str):
        now_iso = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            conn.execute("UPDATE people SET last_touched = ? WHERE id = ?", (now_iso, person_id))

    def add_story(
        self,
        person_id: str,
        title: str,
        body: str,
        told_on: Optional[str] = None,
        audio_path: Optional[str] = None,
    ) -> int:
        now_iso = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO stories (person_id, title, body, audio_path, told_on, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (person_id, title, body, audio_path, told_on, now_iso),
            )
            story_id = cursor.lastrowid
            conn.execute("UPDATE people SET last_touched = ? WHERE id = ?", (now_iso, person_id))
            return story_id

    def add_facts(self, story_id: int, person_id: str, facts: List[FactInput]):
        with self._get_connection() as conn:
            for f in facts:
                conn.execute(
                    """
                    INSERT INTO facts (story_id, person_id, kind, value, quote)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (story_id, person_id, f.kind, f.value, f.quote),
                )

    def save_embedding(self, story_id: int, vector: List[float]):
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO story_embeddings (story_id, embedding)
                VALUES (?, ?)
                """,
                (story_id, json.dumps(vector)),
            )

            if self.has_vec:
                try:
                    conn.execute(
                        "INSERT OR REPLACE INTO story_vec(story_id, embedding) VALUES (?, ?)",
                        (story_id, vector),
                    )
                except Exception:
                    pass

    def search_similar_stories(
        self,
        query_vector: List[float],
        top_k: int = 4,
        person_id: Optional[str] = None,
    ) -> List[Tuple[int, float]]:
        """
        Calculates cosine similarity and returns top_k (story_id, similarity_score).
        """
        with self._get_connection() as conn:
            query = """
                SELECT se.story_id, se.embedding, s.person_id
                FROM story_embeddings se
                JOIN stories s ON s.id = se.story_id
            """
            params = []
            if person_id:
                query += " WHERE s.person_id = ?"
                params.append(person_id)

            rows = conn.execute(query, params).fetchall()
            scored = []

            for r in rows:
                try:
                    doc_vec = json.loads(r["embedding"])
                    # Cosine similarity
                    dot = sum(a * b for a, b in zip(query_vector, doc_vec))
                    norm_q = math.sqrt(sum(a * a for a in query_vector))
                    norm_d = math.sqrt(sum(b * b for b in doc_vec))
                    if norm_q > 0 and norm_d > 0:
                        sim = dot / (norm_q * norm_d)
                    else:
                        sim = 0.0
                    scored.append((r["story_id"], sim))
                except Exception:
                    continue

            scored.sort(key=lambda x: x[1], reverse=True)
            return scored[:top_k]
