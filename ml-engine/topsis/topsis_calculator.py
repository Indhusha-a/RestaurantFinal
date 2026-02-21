import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TopsisCalculator:
    """
    TOPSIS (Technique for Order Preference by Similarity to Ideal Solution)
    Implementation for Group Restaurant Decision Making
    """
    
    def __init__(self):
        self.scaler = MinMaxScaler()
    
    def calculate(self, decision_matrix, weights=None, criteria_types=None):
        """
        Calculate TOPSIS scores and rankings
        
        Parameters:
        - decision_matrix: 2D array [members × restaurants] with preference scores
        - weights: Array of weights for each criterion (default: equal weights)
        - criteria_types: Array of 'max' or 'min' for benefit/cost criteria
        
        Returns:
        - scores: Array of TOPSIS scores
        - rankings: Array of rankings
        """
        try:
            # Convert to numpy array
            matrix = np.array(decision_matrix)
            n_members, n_restaurants = matrix.shape
            
            logger.info(f"TOPSIS calculation started: {n_members} members, {n_restaurants} restaurants")
            
            # Step 1: Normalize the decision matrix (vector normalization)
            normalized = self._vector_normalize(matrix)
            logger.debug(f"Normalized matrix shape: {normalized.shape}")
            
            # Step 2: Apply weights
            if weights is None:
                weights = np.ones(n_members) / n_members  # Equal weights
            else:
                weights = np.array(weights) / np.sum(weights)  # Normalize weights
            
            weighted_matrix = normalized * weights[:, np.newaxis]
            logger.debug(f"Weighted matrix shape: {weighted_matrix.shape}")
            
            # Step 3: Determine ideal best and worst
            if criteria_types is None:
                criteria_types = ['max'] * n_members  # Default: all criteria are benefit
            
            ideal_best = []
            ideal_worst = []
            
            for i, crit_type in enumerate(criteria_types):
                if crit_type == 'max':
                    ideal_best.append(np.max(weighted_matrix[i]))
                    ideal_worst.append(np.min(weighted_matrix[i]))
                else:  # 'min'
                    ideal_best.append(np.min(weighted_matrix[i]))
                    ideal_worst.append(np.max(weighted_matrix[i]))
            
            ideal_best = np.array(ideal_best)
            ideal_worst = np.array(ideal_worst)
            
            logger.debug(f"Ideal best: {ideal_best}")
            logger.debug(f"Ideal worst: {ideal_worst}")
            
            # Step 4: Calculate separation measures
            separation_best = np.sqrt(np.sum((weighted_matrix.T - ideal_best) ** 2, axis=1))
            separation_worst = np.sqrt(np.sum((weighted_matrix.T - ideal_worst) ** 2, axis=1))
            
            logger.debug(f"Separation best shape: {separation_best.shape}")
            logger.debug(f"Separation worst shape: {separation_worst.shape}")
            
            # Step 5: Calculate relative closeness to ideal solution
            with np.errstate(divide='ignore', invalid='ignore'):
                scores = separation_worst / (separation_best + separation_worst)
                scores = np.nan_to_num(scores, nan=0.0)
            
            logger.info(f"TOPSIS scores calculated: {scores}")
            
            # Step 6: Calculate rankings
            rankings = self._calculate_rankings(scores)
            
            return scores.tolist(), rankings.tolist()
            
        except Exception as e:
            logger.error(f"TOPSIS calculation failed: {str(e)}")
            raise
    
    def _vector_normalize(self, matrix):
        """Vector normalization for TOPSIS"""
        normalized = np.zeros_like(matrix, dtype=float)
        for j in range(matrix.shape[1]):  # For each restaurant
            norm = np.sqrt(np.sum(matrix[:, j] ** 2))
            if norm > 0:
                normalized[:, j] = matrix[:, j] / norm
        return normalized
    
    def _calculate_rankings(self, scores):
        """Calculate rankings from scores (1 = best)"""
        # Handle NaN values
        scores = np.array(scores)
        scores = np.nan_to_num(scores, nan=-1)
        
        # Get sorting indices (descending order)
        sorted_indices = np.argsort(scores)[::-1]
        
        # Create rankings array
        rankings = np.zeros_like(scores, dtype=int)
        for rank, idx in enumerate(sorted_indices, 1):
            rankings[idx] = rank
        
        return rankings
    
    def build_preference_matrix(self, member_preferences, restaurants, specialties_map, tags_map):
        """
        Build decision matrix from member preferences
        
        Parameters:
        - member_preferences: List of member preference objects
        - restaurants: List of restaurant objects
        - specialties_map: Dict mapping specialty names to IDs
        - tags_map: Dict mapping tag names to IDs
        
        Returns:
        - decision_matrix: 2D array of preference scores
        - restaurant_ids: List of restaurant IDs in same order as matrix columns
        """
        try:
            n_members = len(member_preferences)
            n_restaurants = len(restaurants)
            
            # Initialize matrix with zeros
            matrix = np.zeros((n_members, n_restaurants))
            restaurant_ids = [r['restaurant_id'] for r in restaurants]
            
            logger.info(f"Building preference matrix: {n_members} members × {n_restaurants} restaurants")
            
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
                    logger.debug(f"Score for member {i}, restaurant {j}: {score}")
            
            logger.info(f"Preference matrix built: {matrix}")
            return matrix.tolist(), restaurant_ids
            
        except Exception as e:
            logger.error(f"Failed to build preference matrix: {str(e)}")
            raise
    
    def _calculate_restaurant_score(self, restaurant, craving, budget, member_tags, 
                                   specialties_map, tags_map):
        """Calculate individual preference score for a restaurant"""
        score = 0.0
        max_score = 4  # Total possible points
        
        # 1. Craving match (2 points)
        restaurant_specialties = [s.lower() for s in restaurant.get('specialties', [])]
        if craving and any(craving in spec or spec in craving for spec in restaurant_specialties):
            score += 2
            logger.debug(f"Craving match +2 for {restaurant['name']}")
        elif not craving:
            score += 1  # No craving specified, partial points
        
        # 2. Budget match (1 point)
        if budget and restaurant.get('budget_range') == budget:
            score += 1
            logger.debug(f"Budget match +1 for {restaurant['name']}")
        elif not budget:
            score += 0.5
        
        # 3. Tags match (1 point for each matching tag, max 1)
        restaurant_tags = restaurant.get('tag_ids', [])
        matching_tags = set(member_tags) & set(restaurant_tags)
        if matching_tags:
            tag_score = min(len(matching_tags) / 3, 1.0)  # Normalize to max 1
            score += tag_score
            logger.debug(f"Tags match +{tag_score} for {restaurant['name']}")
        
        return min(score / max_score, 1.0)  # Normalize to [0, 1]