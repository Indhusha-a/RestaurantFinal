from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import logging
from topsis_calculator import TopsisCalculator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:8080"])

# Initialize TOPSIS calculator
calculator = TopsisCalculator()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'TOPSIS ML Engine',
        'version': '1.0.0'
    })

@app.route('/api/topsis/calculate', methods=['POST'])
def calculate_topsis():
    """
    Calculate TOPSIS rankings for group decision
    
    Expected Request Body:
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
        "weights": [0.3, 0.3, 0.4],  # Optional: member weights
        "criteria_types": ["max", "max", "max"]  # Optional
    }
    """
    try:
        data = request.get_json()
        logger.info(f"Received TOPSIS request for session: {data.get('session_id')}")
        
        # Validate required fields
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        preferences = data.get('preferences', [])
        restaurants = data.get('restaurants', [])
        
        if not preferences or not restaurants:
            return jsonify({'error': 'Missing preferences or restaurants'}), 400
        
        # Build preference matrix
        matrix, restaurant_ids = calculator.build_preference_matrix(
            preferences, 
            restaurants,
            specialties_map={},  # Will be populated from DB in production
            tags_map={}           # Will be populated from DB in production
        )
        
        # Calculate TOPSIS
        weights = data.get('weights')
        criteria_types = data.get('criteria_types')
        
        scores, rankings = calculator.calculate(matrix, weights, criteria_types)
        
        # Prepare response
        results = []
        for i, restaurant_id in enumerate(restaurant_ids):
            results.append({
                'restaurant_id': restaurant_id,
                'topsis_score': round(scores[i], 4),
                'rank': rankings[i]
            })
        
        # Sort by rank
        results.sort(key=lambda x: x['rank'])
        
        response = {
            'success': True,
            'session_id': data.get('session_id'),
            'results': results,
            'matrix': matrix,  # Optional: for debugging
            'message': 'TOPSIS calculation completed successfully'
        }
        
        logger.info(f"TOPSIS calculation successful for session {data.get('session_id')}")
        return jsonify(response), 200
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"TOPSIS calculation failed: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/topsis/debug', methods=['POST'])
def debug_topsis():
    """Debug endpoint with sample calculation"""
    try:
        # Sample data for testing
        matrix = [
            [0.8, 0.6, 0.9],
            [0.7, 0.8, 0.5],
            [0.9, 0.7, 0.6]
        ]
        
        scores, rankings = calculator.calculate(matrix)
        
        return jsonify({
            'matrix': matrix,
            'scores': scores,
            'rankings': rankings
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting TOPSIS ML Engine on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)