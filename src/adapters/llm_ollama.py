"""
Ollama LLM Adapter.
Communicates with local Ollama instance (localhost:11434).
Features:
- JSON mode enforcement
- Automatic retry with repair prompt on invalid JSON
- Safe fallback if Ollama service is unavailable
"""
import json
import logging
import httpx
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class OllamaLLM:
    def __init__(self, base_url: str = "http://localhost:11434/v1", model: str = "gemma3:4b", timeout: float = 45.0):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout

    def chat_json(
        self,
        system_prompt: str,
        user_prompt: str,
        fallback_default: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Sends chat completion request in JSON mode.
        Retries once on malformed JSON with a repair reminder.
        """
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        def call_endpoint(msgs):
            url = f"{self.base_url}/chat/completions"
            payload = {
                "model": self.model,
                "messages": msgs,
                "temperature": 0.1,
                "response_format": {"type": "json_object"},
            }
            with httpx.Client(timeout=self.timeout) as client:
                res = client.post(url, json=payload)
                res.raise_for_status()
                data = res.json()
                return data["choices"][0]["message"]["content"]

        try:
            content = call_endpoint(messages)
            return json.loads(content)
        except (json.JSONDecodeError, KeyError):
            # Retry once with explicit formatting instruction
            logger.warning("Malformed JSON from LLM, attempting retry with repair prompt...")
            repair_messages = list(messages) + [
                {"role": "assistant", "content": "```json"},
                {"role": "user", "content": "Invalid JSON received. Please output valid, parseable JSON only matching the schema exactly."},
            ]
            try:
                content = call_endpoint(repair_messages)
                # Strip potential markdown formatting if returned
                clean_content = content.strip().removeprefix("```json").removesuffix("```").strip()
                return json.loads(clean_content)
            except Exception as e:
                logger.error(f"Failed JSON repair: {e}")
                return fallback_default or {}
        except Exception as e:
            logger.error(f"Ollama connection error: {e}")
            return fallback_default or {}

