"""
TOPSIS (Technique for Order Preference by Similarity to Ideal Solution)
Implementation for Group Restaurant Decision Making

This module implements the TOPSIS multi-criteria decision-making algorithm
to find the optimal restaurant for a group of users. Each group member
submits their preferences (craving, budget, vibe tags) and the algorithm
ranks candidate restaurants by computing how close each is to the
ideal solution across all members' combined preferences.

Algorithm Steps:
  1. Build a decision matrix (members × restaurants) with preference scores
  2. Normalize the matrix using vector normalization
  3. Apply weights to get the weighted normalized matrix
  4. Identify Positive Ideal Solution (PIS) and Negative Ideal Solution (NIS)
  5. Calculate Euclidean distance of each restaurant from PIS and NIS
  6. Compute relative closeness score for each restaurant
  7. Rank restaurants by closeness score (higher = better group match)

Author: Mihir (Project Lead)
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TopsisCalculator:
    """
    TOPSIS calculator for group restaurant decision making.
    Takes member preferences and restaurant data, produces ranked results
    with per-member breakdown scores for transparency.
    """

    def __init__(self):
        self.scaler = MinMaxScaler()

    # ==================== CORE TOPSIS ALGORITHM ====================

    def calculate(self, decision_matrix, weights=None, criteria_types=None):
        """
        Run the full TOPSIS algorithm on a decision matrix.

        Parameters:
            decision_matrix: 2D list/array where rows = group members,
                           columns = candidate restaurants,
                           values = individual preference scores [0-1]
            weights:        Optional weight for each member (default: equal)
            criteria_types: Optional 'max'/'min' per member (default: all 'max')

        Returns:
            scores:   List of closeness scores per restaurant (0 to 1, higher = better)
            rankings: List of rank positions per restaurant (1 = best)
        """
        try:
            matrix = np.array(decision_matrix, dtype=float)
            n_members, n_restaurants = matrix.shape

            logger.info(f"TOPSIS: {n_members} members × {n_restaurants} restaurants")

            # Step 1: Vector normalization — scales each column to unit length
            # This ensures all member scores are on comparable scales
            normalized = self._vector_normalize(matrix)

            # Step 2: Apply weights — each member can have different importance
            # Default: equal weight for all members (fair group decision)
            if weights is None:
                weights = np.ones(n_members) / n_members
            else:
                weights = np.array(weights, dtype=float)
                weights = weights / np.sum(weights)

            weighted_matrix = normalized * weights[:, np.newaxis]

            # Step 3: Determine Positive Ideal Solution (PIS) and
            # Negative Ideal Solution (NIS) for each member dimension
            if criteria_types is None:
                criteria_types = ['max'] * n_members

            ideal_best = []
            ideal_worst = []

            for i, crit_type in enumerate(criteria_types):
                if crit_type == 'max':
                    # Benefit criteria — higher is better
                    ideal_best.append(np.max(weighted_matrix[i]))
                    ideal_worst.append(np.min(weighted_matrix[i]))
                else:
                    # Cost criteria — lower is better
                    ideal_best.append(np.min(weighted_matrix[i]))
                    ideal_worst.append(np.max(weighted_matrix[i]))

            ideal_best = np.array(ideal_best)
            ideal_worst = np.array(ideal_worst)

            # Step 4: Calculate Euclidean distance from PIS and NIS
            # Each restaurant gets a distance to the best and worst scenarios
            separation_best = np.sqrt(
                np.sum((weighted_matrix.T - ideal_best) ** 2, axis=1)
            )
            separation_worst = np.sqrt(
                np.sum((weighted_matrix.T - ideal_worst) ** 2, axis=1)
            )

            # Step 5: Relative closeness — restaurants closer to PIS and
            # farther from NIS get higher scores
            with np.errstate(divide='ignore', invalid='ignore'):
                scores = separation_worst / (separation_best + separation_worst)
                scores = np.nan_to_num(scores, nan=0.0)

            logger.info(f"TOPSIS scores: {scores}")

            # Step 6: Rank restaurants (1 = best match for the group)
            rankings = self._calculate_rankings(scores)

            return scores.tolist(), rankings.tolist()

        except Exception as e:
            logger.error(f"TOPSIS calculation failed: {str(e)}")
            raise

    def _vector_normalize(self, matrix):
        """
        Vector normalization: divides each value by the column's Euclidean norm.
        This preserves the relative proportions within each restaurant column.
        """
        normalized = np.zeros_like(matrix, dtype=float)
        for j in range(matrix.shape[1]):
            norm = np.sqrt(np.sum(matrix[:, j] ** 2))
            if norm > 0:
                normalized[:, j] = matrix[:, j] / norm
        return normalized

    def _calculate_rankings(self, scores):
        """Convert closeness scores to rank positions (1 = best)."""
        scores = np.array(scores)
        scores = np.nan_to_num(scores, nan=-1)
        sorted_indices = np.argsort(scores)[::-1]
        rankings = np.zeros_like(scores, dtype=int)
        for rank, idx in enumerate(sorted_indices, 1):
            rankings[idx] = rank
        return rankings

    # ==================== PREFERENCE MATRIX BUILDER ====================

    def build_preference_matrix(self, member_preferences, restaurants, specialties_map, tags_map):
        """
        Constructs the decision matrix from raw member preferences and restaurant data.

        Each cell [i][j] = how well restaurant j satisfies member i's preferences,
        computed from craving match, budget compatibility, and vibe tag alignment.

        Parameters:
            member_preferences: List of dicts with keys:
                - craving: str (e.g., "pizza")
                - budget_preference: str (e.g., "1000-2000")
                - tag_ids: list of int (e.g., [1, 3, 5])
            restaurants: List of dicts with keys:
                - restaurant_id, name, budget_range, tag_ids, specialties
            specialties_map: Dict mapping specialty names to IDs (for lookup)
            tags_map: Dict mapping tag names to IDs (for lookup)

        Returns:
            matrix:         2D list of preference scores (members × restaurants)
            restaurant_ids: List of restaurant IDs matching the matrix columns
        """
        try:
            n_members = len(member_preferences)
            n_restaurants = len(restaurants)
            matrix = np.zeros((n_members, n_restaurants))
            restaurant_ids = [r['restaurant_id'] for r in restaurants]

            logger.info(f"Building matrix: {n_members} members × {n_restaurants} restaurants")

            for i, pref in enumerate(member_preferences):
                craving = pref.get('craving', '').lower()
                budget = pref.get('budget_preference', '')
                member_tags = pref.get('tag_ids', [])

                for j, restaurant in enumerate(restaurants):
                    score = self._calculate_restaurant_score(
                        restaurant, craving, budget, member_tags,
                        specialties_map, tags_map
                    )
                    matrix[i, j] = score

            return matrix.tolist(), restaurant_ids

        except Exception as e:
            logger.error(f"Failed to build preference matrix: {str(e)}")
            raise

    def _calculate_restaurant_score(self, restaurant, craving, budget, member_tags,
                                    specialties_map, tags_map):
        """
        Calculates how well a single restaurant matches one member's preferences.
        Score breakdown:
          - Craving match:  2 points (specialty matches what the member wants)
          - Budget match:   1 point  (restaurant is within member's budget range)
          - Tag alignment:  1 point  (vibe tags overlap, normalized by count)
        Total normalized to [0, 1] scale.
        """
        score = 0.0
        max_score = 4.0

        # Craving match — does the restaurant specialize in what the member wants?
        restaurant_specialties = [s.lower() for s in restaurant.get('specialties', [])]
        if craving and any(craving in spec or spec in craving for spec in restaurant_specialties):
            score += 2
        elif not craving:
            score += 1  # No preference = partial credit

        # Budget match — is the restaurant within the member's budget range?
        if budget and restaurant.get('budget_range') == budget:
            score += 1
        elif not budget:
            score += 0.5

        # Tag alignment — how many vibe tags match between member and restaurant?
        restaurant_tags = restaurant.get('tag_ids', [])
        matching_tags = set(member_tags) & set(restaurant_tags)
        if matching_tags:
            tag_score = min(len(matching_tags) / 3.0, 1.0)
            score += tag_score

        return min(score / max_score, 1.0)

    # ==================== MEMBER-LEVEL BREAKDOWN ====================

    def get_member_breakdown(self, member_preferences, restaurants, specialties_map, tags_map):
        """
        Returns per-member match percentages for each restaurant.
        Used by the frontend to show transparency — why a restaurant was recommended.

        Returns:
            breakdown: List of dicts, one per restaurant:
                {
                    "restaurant_id": 1,
                    "member_scores": [
                        {"user_id": 1, "match_percentage": 85.0},
                        {"user_id": 2, "match_percentage": 72.5}
                    ]
                }
        """
        breakdown = []

        for restaurant in restaurants:
            member_scores = []
            for pref in member_preferences:
                craving = pref.get('craving', '').lower()
                budget = pref.get('budget_preference', '')
                member_tags = pref.get('tag_ids', [])

                raw_score = self._calculate_restaurant_score(
                    restaurant, craving, budget, member_tags,
                    specialties_map, tags_map
                )
                member_scores.append({
                    "user_id": pref.get("user_id"),
                    "match_percentage": round(raw_score * 100, 1)
                })

            breakdown.append({
                "restaurant_id": restaurant["restaurant_id"],
                "member_scores": member_scores
            })

        return breakdown