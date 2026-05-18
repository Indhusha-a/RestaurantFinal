import os
from typing import Any

from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer


EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
QDRANT_URL = os.getenv("QDRANT_URL", "http://qdrant:6333")
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "products")

model = SentenceTransformer(EMBEDDING_MODEL)
qdrant = QdrantClient(url=QDRANT_URL)


def retrieve_context(query: str, top_k: int = 5, score_threshold: float = 0.45) -> list[dict[str, Any]]:
    vector = model.encode(query).tolist()
    results = qdrant.search(
        collection_name=QDRANT_COLLECTION,
        query_vector=vector,
        limit=top_k,
        score_threshold=score_threshold,
    )

    payloads: list[dict[str, Any]] = []
    for hit in results:
        payload = dict(hit.payload or {})
        payload["_score"] = hit.score
        payloads.append(payload)
    return payloads


def build_context_string(chunks: list[dict[str, Any]]) -> str:
    lines: list[str] = []
    for c in chunks:
        # Prefer prebuilt chunk text from ingestion when available.
        if c.get("chunk_text"):
            lines.append(f"- {c['chunk_text']}")
            continue

        name = c.get("name", "Unknown")
        price = c.get("price", "N/A")
        category = c.get("category", "N/A")
        description = c.get("description", "")

        lines.append(
            f"- {name} costs {price} LKR, category: {category}, description: {description}"
        )
    return "\n".join(lines)
