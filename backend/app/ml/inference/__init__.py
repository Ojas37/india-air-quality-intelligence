"""
AI Surface air quality inference and explainability engine.
"""
from backend.app.ml.inference.predictor import AirQualityPredictor, get_predictor

__all__ = ["AirQualityPredictor", "get_predictor"]
