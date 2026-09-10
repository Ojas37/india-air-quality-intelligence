import pytest
import os
import pandas as pd
import numpy as np
from backend.app.ml.training.trainer import ModelTrainer, FEATURE_COLUMNS
from backend.app.ml.inference.predictor import AirQualityPredictor, get_predictor
from backend.app.core.config import settings


def test_model_training_and_metrics():
    trainer = ModelTrainer()
    results = trainer.train_and_evaluate()

    assert "production_model_metrics" in results
    prod_metrics = results["production_model_metrics"]
    assert "MAE" in prod_metrics and prod_metrics["MAE"] > 0
    assert "RMSE" in prod_metrics and prod_metrics["RMSE"] > 0
    assert "R2" in prod_metrics and prod_metrics["R2"] > 0.85

    assert os.path.exists(os.path.join(settings.MODEL_DIR, "pm25_xgboost_model.joblib"))
    assert os.path.exists(os.path.join(settings.MODEL_DIR, "metrics.json"))
    assert os.path.exists(os.path.join(settings.MODEL_DIR, "model_metadata.json"))


def test_predictor_inference():
    predictor = get_predictor()
    # Test prediction at Delhi NCR (high pollution basin)
    delhi_pred = predictor.predict_location(lat=28.6139, lon=77.2090)

    assert delhi_pred["pm25_pred"] > 30.0
    assert delhi_pred["aqi_pred"] > 50
    assert delhi_pred["aqi_category"] in ["Moderate", "Poor", "Very Poor", "Severe"]
    assert 0.6 <= delhi_pred["confidence_score"] <= 1.0

    # Test confidence interval bounds
    ci = delhi_pred["confidence_interval_95"]
    assert len(ci) == 2
    assert ci[0] <= delhi_pred["pm25_pred"] <= ci[1]

    # Test feature explanations (TreeSHAP)
    assert "feature_contributions" in delhi_pred
    assert len(delhi_pred["feature_contributions"]) > 0
    first_contrib = delhi_pred["feature_contributions"][0]
    assert "feature" in first_contrib
    assert "contribution_ugm3" in first_contrib
    assert "description" in first_contrib


def test_predictor_unmonitored_rural_location():
    predictor = get_predictor()
    # Test prediction at unmonitored rural location in Maharashtra (e.g. Baramati)
    rural_pred = predictor.predict_location(lat=18.1516, lon=74.5804)

    assert rural_pred["pm25_pred"] > 0.0
    assert rural_pred["source_type"] == "AI Estimated"
    assert rural_pred["confidence_level"] in ["High", "Moderate", "Low"]
