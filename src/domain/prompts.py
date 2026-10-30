"""
Strict JSON prompt templates for Fact Extraction and Grounded Retrieval.
Defined in INTEGRATION_SPEC.md Section 7.
"""
from typing import List, Dict, Any

FACT_EXTRACTION_SYSTEM_PROMPT = """You extract facts from a short family memory. Return JSON only, no prose.
Schema: {"facts":[{"kind":"food|song|saying|place","value":string,"quote":string}]}
Rules:
- Include only items explicitly stated in the text. Never infer or add details.
- "quote" must be copied exactly from the text, character for character.
- "value" is a short clean label (e.g. "Mole negro" or "Cielito Lindo").
- Handles English and Spanish stories identically.
- If nothing qualifies, return {"facts":[]}.
"""

GROUNDED_ANSWER_SYSTEM_PROMPT = """You answer questions about a person using ONLY the numbered memories provided.
Rules:
- Never speak as the person. Refer to them in the third person.
- Answer in the same language as the question (English or Spanish).
- Do not use outside knowledge or guess.
- If the memories do not answer the question, return exactly:
  {"answer":"I don't have a memory of that yet.","citations":[]}
  (or in Spanish: {"answer":"Aún no tengo un recuerdo sobre eso.","citations":[]})
- Otherwise return {"answer": string, "citations":[memory ids used]}.
- Keep the answer to 1 to 3 sentences, warm and plain.
Return JSON only.
"""

REFUSAL_ANSWER_EN = "I don't have a memory of that yet."
REFUSAL_ANSWER_ES = "Aún no tengo un recuerdo sobre eso."

def build_fact_extraction_user_prompt(story_text: str) -> str:
    return f'Memory:\n"""\n{story_text.strip()}\n"""'

def build_grounded_answer_user_prompt(question: str, memories: List[Dict[str, Any]]) -> str:
    memory_lines = []
    for m in memories:
        # Expected keys: id, person_name, title, body
        m_id = m.get("id")
        p_name = m.get("person_name", "Ancestor")
        title = m.get("title", "Untitled")
        body = m.get("body", "")
        memory_lines.append(f'[{m_id}] ({p_name}, "{title}"): {body}')

    formatted_memories = "\n".join(memory_lines) if memory_lines else "None."
    return f'Memories:\n{formatted_memories}\n\nQuestion: {question.strip()}'

