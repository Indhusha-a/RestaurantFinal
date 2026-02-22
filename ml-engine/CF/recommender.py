import numpy as np
import pandas as pd


# =====================================
# Cosine Similarity (Fully Safe)
# =====================================
def cosine_similarity(a, b):
    a = np.array(a, dtype=float)
    b = np.array(b, dtype=float)

    # Replace NaN with 0 just in case
    a = np.nan_to_num(a)
    b = np.nan_to_num(b)

    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return np.dot(a, b) / (norm_a * norm_b)


# =====================================
# Item-Based Collaborative Filtering
# =====================================
def generate_recommendations(user_id, ratings):

    df = pd.DataFrame(ratings)

    print("\n===== RECEIVED RATINGS =====")
    print(df)

    if df.empty:
        return []

    # =====================================
    # Build User-Item Matrix
    # =====================================
    matrix = df.pivot_table(
        index="userId",
        columns="restaurantId",
        values="ratingValue"
    )

    # 🔥 CRITICAL: Replace ALL NaN with 0
    matrix = matrix.fillna(0)

    print("\n===== USER ITEM MATRIX =====")
    print(matrix)

    # If user not found
    if user_id not in matrix.index:
        return []

    user_vector = matrix.loc[user_id]

    scores = {}

    # =====================================
    # Item-Based Recommendation Logic
    # =====================================
    for target_rest_id in matrix.columns:

        # Skip already rated restaurants
        if user_vector[target_rest_id] != 0:
            continue

        numerator = 0.0
        denominator = 0.0

        for rated_rest_id in matrix.columns:

            rating_value = user_vector[rated_rest_id]

            if rating_value == 0:
                continue

            item_a = matrix[rated_rest_id].values
            item_b = matrix[target_rest_id].values

            sim = cosine_similarity(item_a, item_b)

            if sim <= 0:
                continue

            numerator += sim * rating_value
            denominator += abs(sim)

        if denominator > 0:
            scores[target_rest_id] = numerator / denominator

    print("\n===== RECOMMENDATION SCORES =====")
    print(scores)

    # =====================================
    # Sort & Return Top 10
    # =====================================
    sorted_ids = sorted(scores, key=scores.get, reverse=True)

    return sorted_ids[:10]