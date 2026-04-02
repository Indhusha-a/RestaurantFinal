"""
TOPSIS Flask API — Group Restaurant Decision Making
Exposes the TOPSIS algorithm as a REST API for the Spring Boot backend
and Group Mode frontend to consume.

Endpoints:
  POST /api/topsis/calculate  — Run TOPSIS on group preferences
  POST /api/topsis/debug      — Test with sample data
  GET  /health                — Service health check

Port: 5000 (separate from Spring Boot on 8080 and CF on 8000)

Author: Mihir (Project Lead)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import logging
from topsis_calculator import TopsisCalculator

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:8080"])

calculator = TopsisCalculator()


#  HEALTH CHECK 

@app.route('/health', methods=['GET'])
def health_check():
    """Service health check for monitoring."""
    return jsonify({
        'status': 'healthy',
        'service': 'TOPSIS ML Engine',
        'version': '1.0.0'
    })


# TOPSIS CALCULATION
@app.route('/api/topsis/calculate', methods=['POST'])
def calculate_topsis():
    """
    Main TOPSIS endpoint — called by Group Mode after all members submit preferences.

    Request Body:
    {
        "session_id": 123,
        "preferences": [
            {
                "user_id": 1,
                "craving": "pizza",
                "budget_preference": "1000-2000",
                "tag_ids": [1, 3, 5]
            }
        ],
        "restaurants": [
            {
                "restaurant_id": 1,
                "name": "Pizza Paradise",
                "budget_range": "1000-2000",
                "tag_ids": [1, 2, 3],
                "specialties": ["Pizza", "Pasta"]
            }
        ],
        "weights": [0.33, 0.33, 0.34]  // Optional: member weights
    }

    Response:
    {
        "success": true,
        "session_id": 123,
        "results": [
            {
                "restaurant_id": 1,
                "topsis_score": 0.8542,
                "rank": 1,
                "group_match_percentage": 85.4,
                "member_scores": [
                    {"user_id": 1, "match_percentage": 87.5},
                    {"user_id": 2, "match_percentage": 72.5}
                ]
            }
        ]
    }
    """
    try:
        data = request.get_json()
        logger.info(f"TOPSIS request for session: {data.get('session_id')}")

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        preferences = data.get('preferences', [])
        restaurants = data.get('restaurants', [])

        if not preferences or not restaurants:
            return jsonify({'error': 'Missing preferences or restaurants'}), 400

        # Build preference matrix from member inputs and restaurant data
        matrix, restaurant_ids = calculator.build_preference_matrix(
            preferences,
            restaurants,
            specialties_map={},
            tags_map={}
        )

        # Run TOPSIS algorithm — produces scores and rankings
        weights = data.get('weights')
        criteria_types = data.get('criteria_types')
        scores, rankings = calculator.calculate(matrix, weights, criteria_types)

        # Get per-member breakdown for transparency display
        member_breakdown = calculator.get_member_breakdown(
            preferences, restaurants,
            specialties_map={}, tags_map={}
        )

        # Build response with results sorted by rank
        results = []
        for i, restaurant_id in enumerate(restaurant_ids):
            # Find member scores for this restaurant
            breakdown = next(
                (b for b in member_breakdown if b['restaurant_id'] == restaurant_id),
                {'member_scores': []}
            )

            results.append({
                'restaurant_id': restaurant_id,
                'topsis_score': round(scores[i], 4),
                'rank': rankings[i],
                'group_match_percentage': round(scores[i] * 100, 1),
                'member_scores': breakdown['member_scores']
            })

        results.sort(key=lambda x: x['rank'])

        response = {
            'success': True,
            'session_id': data.get('session_id'),
            'results': results,
            'message': 'TOPSIS calculation completed successfully'
        }

        logger.info(f"TOPSIS completed for session {data.get('session_id')}")
        return jsonify(response), 200

    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"TOPSIS failed: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


#  DEBUG / TEST ENDPOINT 

@app.route('/api/topsis/debug', methods=['POST'])
def debug_topsis():
    """
    Test endpoint with sample data — verifies the algorithm works.
    Uses a 3-member × 3-restaurant sample matrix.
    """
    try:
        # Sample: 3 group members rating 3 restaurants
        matrix = [
            [0.8, 0.6, 0.9],  # Member 1 preferences
            [0.7, 0.8, 0.5],  # Member 2 preferences
            [0.9, 0.7, 0.6]   # Member 3 preferences
        ]

        scores, rankings = calculator.calculate(matrix)

        return jsonify({
            'matrix': matrix,
            'scores': scores,
            'rankings': rankings,
            'explanation': 'Restaurant with rank 1 is the best group match'
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    logger.info("Starting TOPSIS ML Engine on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)