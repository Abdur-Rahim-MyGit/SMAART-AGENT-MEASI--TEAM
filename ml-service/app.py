import os, sys
# Ensure the script's directory is in the path for local module resolution
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from flask import Flask, request, jsonify
from flask_cors import CORS
from resume_parser import extract_skills_from_text
import json
import os

app = Flask(__name__)
# Enable CORS for frontend and backend access
CORS(app)

# --- Data Loaders ---
market_data = {}
try:
    _md_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'data', 'market_data.json')
    if os.path.exists(_md_path):
        with open(_md_path) as _f:
            market_data = json.load(_f)
        print(f"ML Service: loaded market data for {len(market_data)} roles")
except Exception as _e:
    print(f"ML Service: market_data.json not loaded — {_e}")

# Portable Mock Student Success Model
# This replaces the XGBoost and NumPy dependencies with a standard python approach
# to ensure zero-install reliability for our AI success scores.
class MockStudentSuccessModel:
    def predict_proba(self, student_features):
        """
        Features are expected to be [skill_match_count, degree_relevance_score, market_demand_score]
        """
        try:
            # Simple weighted average for the mock probability
            weights = [0.4, 0.4, 0.2]
            score = sum(f * w for f, w in zip(student_features, weights)) / sum(weights) 
            score = score / 10.0 # Standardize to 0-1 range
            # Clamp to range [0.1, 0.95] as per original logic
            return max(0.1, min(0.95, score))
        except:
            return 0.5

mock_model = MockStudentSuccessModel()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy", 
        "service": "smaart-ml",
        "engine": "Lightweight-Rule-Service v1.2"
    }), 200

@app.route('/parse-resume', methods=['POST'])
def parse_resume_endpoint():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({"error": "Missing 'text' in payload"}), 400
        
    text = data['text']
    try:
        skills = extract_skills_from_text(text)
        return jsonify({
            "status": "success",
            "extracted_skills": skills
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict-success', methods=['POST'])
def predict_success_endpoint():
    data = request.json
    if not data or 'features' not in data:
        return jsonify({"error": "Missing 'features' list in payload"}), 400
    
    features = list(data['features'])
    role_name = data.get('role_name', '')
    
    try:
        # Ensure we have 3 features
        while len(features) < 3:
            features.append(5)
        
        # Replace features[2] with real demand score if market_data loaded
        if role_name and role_name in market_data:
            demand = market_data[role_name].get('demand_level', 'Medium')
            features[2] = {'High': 9, 'Medium': 6, 'Low': 3}.get(demand, 6)
        
        # Explicitly extract the first three features to avoid slice-index type issues
        input_features = [features[i] for i in range(min(3, len(features)))]
        prob = mock_model.predict_proba(input_features)
        
        # Using string formatting to round, bypassing potential round() overload issues in some stubs
        rounded_prob = float("{:.4f}".format(float(prob)))
        
        return jsonify({
            "status": "success",
            "success_probability": rounded_prob,
            "role_name": role_name,
            "demand_score_used": features[2]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Flask app start point
    # Runs on Port 5001 to avoid conflicts with Backend/Frontend dev servers
    print("Starting SMAART ML Service on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=False)
