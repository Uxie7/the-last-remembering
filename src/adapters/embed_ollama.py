"""
Ollama Embeddings Adapter.
Uses local nomic-embed-text via Ollama API.
"""
import logging
import httpx
from typing import List

logger = logging.getLogger(__name__)

class OllamaEmbeddings:
    def __init__(self, base_url: str = "http://localhost:11434/v1", model: str = "nomic-embed-text", timeout: float = 30.0):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout

    def embed(self, texts: List[str]) -> List[List[float]]:
        """
        Generates embedding vectors for a list of texts.
        """
        if not texts:
            return []

        url = f"{self.base_url}/embeddings"
        payload = {
            "model": self.model,
            "input": texts,
        }

        try:
            with httpx.Client(timeout=self.timeout) as client:
                res = client.post(url, json=payload)
                res.raise_for_status()
                data = res.json()
                # OpenAI format: data["data"][i]["embedding"]
                embeddings = [item["embedding"] for item in data.get("data", [])]
                if embeddings:
                    return embeddings
        except Exception as e:
            logger.warning(f"Ollama embeddings call failed: {e}. Generating fallback vectors.")

        # Fallback dummy embedding (768 dimensions) if Ollama not running
        return [[0.0] * 768 for _ in texts]

