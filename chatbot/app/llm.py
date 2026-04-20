import os
from typing import Any

from openai import OpenAI


DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

SYSTEM_PROMPT = """You are an AI assistant connected to a product database.
Answer user questions accurately using ONLY the provided context.
If the answer isn't in the context, say: "I couldn't find that information."
Be concise, helpful, and conversational. Do not mention vectors or databases."""


def _normalize_history(history: list[dict[str, Any]]) -> list[dict[str, str]]:
    normalized: list[dict[str, str]] = []
    for item in history:
        role = str(item.get("role", "")).strip().lower()
        content = str(item.get("content", "")).strip()
        if role not in {"user", "assistant"} or not content:
            continue
        normalized.append({"role": role, "content": content})
    return normalized


def ask_llm(user_query: str, context: str, history: list[dict[str, Any]]) -> str:
    if not DEEPSEEK_API_KEY:
        return "I couldn't find that information."

    client = OpenAI(
        api_key=DEEPSEEK_API_KEY,
        base_url=DEEPSEEK_BASE_URL,
    )

    messages = _normalize_history(history)

    # Add system prompt
    messages.insert(0, {
        "role": "system",
        "content": SYSTEM_PROMPT
    })

    # Add user query with context
    messages.append({
        "role": "user",
        "content": f"Context:\n{context}\n\nQuestion: {user_query}"
    })

    response = client.chat.completions.create(
        model=DEEPSEEK_MODEL,
        messages=messages,
        max_tokens=1000,
        temperature=0.3,
    )

    if not DEEPSEEK_API_KEY:
        return f"[DEBUG MODE]\n\nContext:\n{context}"

    return response.choices[0].message.content