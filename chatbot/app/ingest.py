import os
from typing import Any

import mysql.connector
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams
from sentence_transformers import SentenceTransformer


load_dotenv()


def _env(name: str, default: str | None = None) -> str:
    value = os.getenv(name, default)
    if value is None:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


# ------------------------------------------------------------------
# Price → human-readable budget label
# Helps match queries like "cheap", "budget", "affordable", "luxury"
# ------------------------------------------------------------------
def _price_label(price: Any) -> str:
    try:
        p = float(price)
    except (TypeError, ValueError):
        return ""
    if p < 500:
        return "very cheap, budget-friendly, affordable"
    if p < 1000:
        return "moderately priced, mid-range"
    if p < 2000:
        return "slightly expensive, premium"
    return "expensive, luxury, fine dining"


# ------------------------------------------------------------------
# Budget range → human-readable label
# Maps your budget_range column (e.g. "LOW", "MID", "HIGH") to
# natural language so "cheap" queries hit "LOW" entries reliably.
# ------------------------------------------------------------------
def _budget_label(budget_range: Any) -> str:
    mapping = {
        "LOW":    "cheap, budget-friendly, affordable, inexpensive",
        "MID":    "moderate, mid-range, reasonable price",
        "HIGH":   "expensive, premium, upscale",
        "LUXURY": "luxury, fine dining, high-end",
    }
    if not budget_range:
        return ""
    return mapping.get(str(budget_range).strip().upper(), str(budget_range))


# ------------------------------------------------------------------
# Category → synonyms
# Helps match "lunch" → "Mains", "starter" → "Appetizers", etc.
# Add more mappings as your menu grows.
# ------------------------------------------------------------------
CATEGORY_SYNONYMS: dict[str, str] = {
    "mains":       "main course, lunch, dinner, entree",
    "appetizers":  "starter, snack, small plate, finger food",
    "desserts":    "sweet, pudding, after meal, confection",
    "beverages":   "drinks, juice, cocktail, soft drink, refreshment",
    "breakfast":   "morning meal, brunch",
    "seafood":     "fish, prawn, crab, ocean food",
    "vegetarian":  "veg, plant-based, meatless",
    "vegan":       "plant-based, dairy-free, egg-free",
    "rice":        "rice dish, rice meal, steamed rice",
}

def _category_synonyms(category: str) -> str:
    key = category.strip().lower()
    return CATEGORY_SYNONYMS.get(key, "")


# ------------------------------------------------------------------
# Core text builder — now richer, more query-friendly
# ------------------------------------------------------------------
def _build_text(row: dict[str, Any]) -> str:
    name        = str(row.get("name", "")).strip()
    price       = row.get("price")
    budget_range = row.get("budget_range") or row.get("category")
    category    = str(row.get("category", "")).strip()
    description = str(row.get("description", "")).strip()
    address     = str(row.get("address", "")).strip()
    phone       = str(row.get("phone", "")).strip()
    approval    = str(row.get("approval_status", "")).strip()
    tags        = row.get("tags") or []
    specialities = row.get("specialities") or []

    # ---- restaurant row (has address / phone) ----------------------
    if name and (address or phone or budget_range):
        parts = [f"{name} is a restaurant."]

        if budget_range:
            label = _budget_label(budget_range)
            parts.append(f"Budget range: {budget_range}. It is {label}.")

        if description:
            parts.append(description)

        if address:
            parts.append(f"Located at {address}.")

        if phone:
            parts.append(f"Contact: {phone}.")

        if tags:
            parts.append(f"Tags: {', '.join(str(t) for t in tags)}.")

        if specialities:
            parts.append(f"Specialities: {', '.join(str(s) for s in specialities)}.")

        if approval:
            parts.append(f"Approval status: {approval}.")

        return " ".join(parts).strip()

    # ---- menu item / product row -----------------------------------
    if name and (price is not None or category or description):
        parts = [f"{name} is a menu item."]

        if price is not None:
            price_lbl = _price_label(price)
            parts.append(f"It costs {price} LKR. It is {price_lbl}.")

        if category:
            synonyms = _category_synonyms(category)
            cat_str = f"Category: {category}"
            if synonyms:
                cat_str += f" (also known as: {synonyms})"
            parts.append(cat_str + ".")

        if description:
            parts.append(description)

        if tags:
            parts.append(f"Tags: {', '.join(str(t) for t in tags)}.")

        if specialities:
            parts.append(f"Specialities: {', '.join(str(s) for s in specialities)}.")

        return " ".join(parts).strip()

    # ---- generic fallback for any other table shape ----------------
    ordered_keys = sorted(row.keys())
    return ". ".join(f"{k}: {row[k]}" for k in ordered_keys if row[k] is not None)


# ------------------------------------------------------------------
# Qdrant point ID helper — unchanged
# ------------------------------------------------------------------
def _build_point_id(raw_id: Any, fallback_index: int) -> Any:
    if raw_id is None:
        return fallback_index
    if isinstance(raw_id, int):
        return raw_id
    try:
        return int(raw_id)
    except (TypeError, ValueError):
        return str(raw_id)


# ------------------------------------------------------------------
# Tag / speciality enrichment — unchanged
# ------------------------------------------------------------------
def _fetch_restaurant_tags(cursor) -> dict[Any, list[str]]:
    queries = [
        """
        SELECT rt.restaurant_id AS restaurant_id, t.tag_name AS tag_name
        FROM restaurant_tags rt
        JOIN tags t ON t.tag_id = rt.tag_id
        ORDER BY rt.restaurant_id, t.tag_name
        """,
        """
        SELECT rt.restaurant_id AS restaurant_id, t.tagName AS tag_name
        FROM restaurant_tags rt
        JOIN tags t ON t.tag_id = rt.tag_id
        ORDER BY rt.restaurant_id, t.tagName
        """,
    ]
    last_exc: Exception | None = None
    for query in queries:
        try:
            cursor.execute(query)
            rows = cursor.fetchall()
            break
        except Exception as exc:
            last_exc = exc
            rows = []
    else:
        raise RuntimeError(f"Failed to read tags mapping: {last_exc}")

    tag_map: dict[Any, list[str]] = {}
    for rec in rows:
        rid = rec.get("restaurant_id")
        tag_name = rec.get("tag_name")
        if rid is None or not tag_name:
            continue
        tag_map.setdefault(rid, []).append(str(tag_name))
    return tag_map


def _fetch_restaurant_specialities(cursor) -> dict[Any, list[str]]:
    cursor.execute(
        """
        SELECT rs.restaurant_id AS restaurant_id, s.name AS speciality_name
        FROM restaurant_specialities rs
        JOIN specialities s ON s.speciality_id = rs.speciality_id
        ORDER BY rs.restaurant_id, s.name
        """
    )
    speciality_map: dict[Any, list[str]] = {}
    for rec in cursor.fetchall():
        rid = rec.get("restaurant_id")
        speciality_name = rec.get("speciality_name")
        if rid is None or not speciality_name:
            continue
        speciality_map.setdefault(rid, []).append(str(speciality_name))
    return speciality_map


def _enrich_rows_with_restaurant_metadata(cursor, rows: list[dict[str, Any]]) -> None:
    if not rows or "id" not in rows[0]:
        return
    try:
        tag_map = _fetch_restaurant_tags(cursor)
        speciality_map = _fetch_restaurant_specialities(cursor)
    except Exception as exc:
        print(f"Skipping tag/speciality enrichment: {exc}")
        return
    for row in rows:
        rid = row.get("id")
        row["tags"] = tag_map.get(rid, [])
        row["specialities"] = speciality_map.get(rid, [])


# ------------------------------------------------------------------
# Main ingestion runner — unchanged
# ------------------------------------------------------------------
def run_ingestion() -> int:
    embedding_model_name = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    qdrant_url = _env("QDRANT_URL", "http://qdrant:6333")
    collection_name = _env("QDRANT_COLLECTION", "products")
    recreate_collection = os.getenv("INGEST_RECREATE_COLLECTION", "false").lower() == "true"
    sql_query = os.getenv(
        "INGEST_SQL",
        "SELECT id, name, price, category, description FROM products",
    )

    mysql_host = _env("MYSQL_HOST")
    mysql_port = int(_env("MYSQL_PORT", "3306"))
    mysql_db = _env("MYSQL_DATABASE")
    mysql_user = _env("MYSQL_USER")
    mysql_password = _env("MYSQL_PASSWORD")

    print(f"Loading embedding model: {embedding_model_name}")
    model = SentenceTransformer(embedding_model_name)
    vector_size = model.get_sentence_embedding_dimension()

    print(f"Connecting to Qdrant: {qdrant_url}")
    qdrant = QdrantClient(url=qdrant_url)

    if recreate_collection:
        print(f"Recreating collection: {collection_name}")
        qdrant.recreate_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
        )
    else:
        try:
            qdrant.get_collection(collection_name=collection_name)
            print(f"Collection already exists: {collection_name}")
        except Exception:
            print(f"Creating collection: {collection_name}")
            qdrant.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
            )

    print(f"Connecting to MySQL: {mysql_host}:{mysql_port}/{mysql_db}")
    conn = mysql.connector.connect(
        host=mysql_host,
        port=mysql_port,
        user=mysql_user,
        password=mysql_password,
        database=mysql_db,
    )

    cursor = conn.cursor(dictionary=True)
    cursor.execute(sql_query)
    rows = cursor.fetchall()

    _enrich_rows_with_restaurant_metadata(cursor, rows)

    cursor.close()
    conn.close()

    print(f"Fetched rows: {len(rows)}")

    points: list[PointStruct] = []
    for idx, row in enumerate(rows, start=1):
        text = _build_text(row)

        # Print first 3 so you can verify the output looks right
        if idx <= 3:
            print(f"\n[Row {idx} text preview]\n{text}\n")

        vector = model.encode(text).tolist()
        point_id = _build_point_id(row.get("id"), idx)

        payload = dict(row)
        payload["chunk_text"] = text

        points.append(PointStruct(id=point_id, vector=vector, payload=payload))

    if points:
        qdrant.upsert(collection_name=collection_name, points=points)

    print(f"\nIngested {len(points)} records into '{collection_name}'.")
    return len(points)


if __name__ == "__main__":
    run_ingestion()