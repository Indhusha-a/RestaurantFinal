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
# BudgetRange enum → human-readable label + price hint
# Matches your Java enum exactly
# ------------------------------------------------------------------
BUDGET_LABELS: dict[str, str] = {
    "ZERO_TO_1000":      "very cheap, budget-friendly, affordable, under 1000 LKR, inexpensive",
    "ONE_TO_2000":       "cheap, budget-friendly, affordable, 1000 to 2000 LKR, low cost",
    "TWO_TO_5000":       "moderate, mid-range, reasonable price, 2000 to 5000 LKR",
    "FIVE_THOUSAND_PLUS":"expensive, premium, upscale, fine dining, above 5000 LKR, luxury",
}

def _budget_label(budget_range: Any) -> str:
    if not budget_range:
        return "unknown budget"
    key = str(budget_range).strip().upper()
    return BUDGET_LABELS.get(key, str(budget_range))


# ------------------------------------------------------------------
# Approval status → readable text
# ------------------------------------------------------------------
def _approval_label(status: Any) -> str:
    mapping = {
        "APPROVED": "approved and open",
        "PENDING":  "pending approval",
        "REJECTED": "rejected",
    }
    return mapping.get(str(status or "").strip().upper(), str(status or "unknown"))


# ------------------------------------------------------------------
# Fetch all tags for all restaurants  { restaurant_id -> [tag names] }
# ------------------------------------------------------------------
def _fetch_all_tags(cursor) -> dict[Any, list[str]]:
    cursor.execute(
        """
        SELECT rt.restaurant_id, t.tagName, t.tagDescription
        FROM restaurant_tags rt
        JOIN tags t ON t.tag_id = rt.tag_id
        ORDER BY rt.restaurant_id, t.tagName
        """
    )
    result: dict[Any, list[str]] = {}
    for row in cursor.fetchall():
        rid = row["restaurant_id"]
        name = row.get("tagName") or ""
        desc = row.get("tagDescription") or ""
        label = name if not desc else f"{name} ({desc})"
        result.setdefault(rid, []).append(label)
    return result


# ------------------------------------------------------------------
# Fetch all specialities for all restaurants
# { restaurant_id -> [speciality strings] }
# ------------------------------------------------------------------
def _fetch_all_specialities(cursor) -> dict[Any, list[str]]:
    cursor.execute(
        """
        SELECT rs.restaurant_id, s.name, s.description, s.category
        FROM restaurant_specialities rs
        JOIN specialities s ON s.speciality_id = rs.speciality_id
        ORDER BY rs.restaurant_id, s.name
        """
    )
    result: dict[Any, list[str]] = {}
    for row in cursor.fetchall():
        rid = row["restaurant_id"]
        name = row.get("name") or ""
        desc = row.get("description") or ""
        cat  = row.get("category") or ""

        parts = [name]
        if cat:
            parts.append(f"category: {cat}")
        if desc:
            parts.append(desc)
        label = " — ".join(parts)
        result.setdefault(rid, []).append(label)
    return result


# ------------------------------------------------------------------
# Build the richest possible chunk text for a restaurant row
# This is what gets embedded — make it as query-friendly as possible
# ------------------------------------------------------------------
def _build_restaurant_text(row: dict[str, Any],
                            tags: list[str],
                            specialities: list[str]) -> str:
    parts: list[str] = []

    name           = str(row.get("name") or "").strip()
    description    = str(row.get("description") or "").strip()
    address        = str(row.get("address") or "").strip()
    phone          = str(row.get("phone") or "").strip()
    email          = str(row.get("email") or "").strip()
    budget_range   = str(row.get("budgetRange") or row.get("budget_range") or "").strip()
    approval       = str(row.get("approvalStatus") or row.get("approval_status") or "").strip()
    is_active      = row.get("isActive") or row.get("is_active")
    points         = row.get("points")
    location_link  = str(row.get("locationLink") or row.get("location_link") or "").strip()
    rejection      = str(row.get("rejectionReason") or row.get("rejection_reason") or "").strip()

    # --- Name & identity ---
    parts.append(f"{name} is a restaurant.")

    # --- Budget / price range ---
    if budget_range:
        label = _budget_label(budget_range)
        parts.append(
            f"Budget range: {budget_range.replace('_', ' to ')}. "
            f"This restaurant is {label}."
        )

    # --- Description ---
    if description:
        parts.append(description)

    # --- Location ---
    if address:
        parts.append(f"Located at: {address}.")
    if location_link:
        parts.append(f"Google Maps link: {location_link}.")

    # --- Contact ---
    if phone:
        parts.append(f"Phone: {phone}.")
    if email:
        parts.append(f"Email: {email}.")

    # --- Tags (cuisine type, atmosphere, dietary, etc.) ---
    if tags:
        parts.append(f"Tags: {', '.join(tags)}.")

    # --- Specialities ---
    if specialities:
        parts.append(f"Specialities: {', '.join(specialities)}.")

    # --- Operational status ---
    active_str = "currently active and open" if is_active else "currently inactive or closed"
    approval_str = _approval_label(approval)
    parts.append(f"Status: {approval_str}, {active_str}.")

    # --- Points (popularity signal) ---
    if points is not None:
        parts.append(f"Loyalty points available: {points}.")

    return " ".join(parts).strip()


# ------------------------------------------------------------------
# Main ingestion
# ------------------------------------------------------------------
def run_ingestion() -> int:
    embedding_model_name = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    qdrant_url           = _env("QDRANT_URL", "http://qdrant:6333")
    collection_name      = _env("QDRANT_COLLECTION", "products")
    recreate_collection  = os.getenv("INGEST_RECREATE_COLLECTION", "false").lower() == "true"

    # Pull every useful column from restaurants
    sql_query = os.getenv(
        "INGEST_SQL",
        """
        SELECT
            restaurant_id   AS id,
            name,
            description,
            email,
            phone,
            address,
            locationLink,
            budgetRange,
            approvalStatus,
            isActive,
            isRejected,
            rejectionReason,
            points,
            image_url       AS imageUrl
        FROM restaurants
        WHERE approvalStatus = 'APPROVED'
        """,
    )

    mysql_host     = _env("MYSQL_HOST")
    mysql_port     = int(_env("MYSQL_PORT", "3306"))
    mysql_db       = _env("MYSQL_DATABASE")
    mysql_user     = _env("MYSQL_USER")
    mysql_password = _env("MYSQL_PASSWORD")

    # ── Load model ──────────────────────────────────────────────────
    print(f"Loading embedding model: {embedding_model_name}")
    model = SentenceTransformer(embedding_model_name)
    vector_size = model.get_sentence_embedding_dimension()

    # ── Connect to Qdrant ───────────────────────────────────────────
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

    # ── Connect to MySQL ────────────────────────────────────────────
    print(f"Connecting to MySQL: {mysql_host}:{mysql_port}/{mysql_db}")
    conn = mysql.connector.connect(
        host=mysql_host,
        port=mysql_port,
        user=mysql_user,
        password=mysql_password,
        database=mysql_db,
    )
    cursor = conn.cursor(dictionary=True)

    # ── Pre-fetch tags & specialities (one query each, not N+1) ────
    print("Fetching tags and specialities...")
    try:
        tag_map         = _fetch_all_tags(cursor)
        speciality_map  = _fetch_all_specialities(cursor)
    except Exception as exc:
        print(f"Warning: could not load tags/specialities: {exc}")
        tag_map        = {}
        speciality_map = {}

    # ── Fetch restaurants ───────────────────────────────────────────
    print("Fetching restaurants...")
    cursor.execute(sql_query)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    print(f"Fetched {len(rows)} restaurants.")

    # ── Build points ────────────────────────────────────────────────
    points: list[PointStruct] = []

    for idx, row in enumerate(rows, start=1):
        rid          = row.get("id") or idx
        tags         = tag_map.get(rid, [])
        specialities = speciality_map.get(rid, [])

        chunk_text = _build_restaurant_text(row, tags, specialities)

        # Preview first 3
        if idx <= 3:
            print(f"\n[Row {idx}] {row.get('name')}")
            print(chunk_text)
            print()

        vector = model.encode(chunk_text).tolist()

        # Build a clean payload — everything the LLM might want to show
        payload = {
            "id":              rid,
            "name":            row.get("name"),
            "description":     row.get("description"),
            "address":         row.get("address"),
            "phone":           row.get("phone"),
            "email":           row.get("email"),
            "locationLink":    row.get("locationLink"),
            "budgetRange":     row.get("budgetRange") or row.get("budget_range"),
            "budgetLabel":     _budget_label(row.get("budgetRange") or row.get("budget_range") or ""),
            "approvalStatus":  row.get("approvalStatus") or row.get("approval_status"),
            "isActive":        row.get("isActive") or row.get("is_active"),
            "points":          row.get("points"),
            "imageUrl":        row.get("imageUrl") or row.get("image_url"),
            "tags":            tags,
            "specialities":    specialities,
            "chunk_text":      chunk_text,
        }

        # Qdrant needs integer or UUID ids
        try:
            point_id = int(rid)
        except (TypeError, ValueError):
            point_id = str(rid)

        points.append(PointStruct(id=point_id, vector=vector, payload=payload))

    # ── Upsert ──────────────────────────────────────────────────────
    if points:
        qdrant.upsert(collection_name=collection_name, points=points)

    print(f"\nIngested {len(points)} restaurants into '{collection_name}'.")
    return len(points)


if __name__ == "__main__":
    run_ingestion()