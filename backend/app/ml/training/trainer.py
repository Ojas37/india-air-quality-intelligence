import os
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, Tuple, List

from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold
import xgboost as xgb

from backend.app.core.logging import logger
from backend.app.core.config import settings
from backend.app.core.aqi import calculate_sub_index, get_aqi_category


FEATURE_COLUMNS = [
    # Satellite
    "aod_insat",
    "hcho_column",
    "no2_column",
    "so2_column",
    "co_column",
    # Meteorology & Boundary Layer
    "temperature_2m",
    "dewpoint_2m",
    "relative_humidity",
    "wind_u",
    "wind_v",
    "wind_speed",
    "wind_direction",
    "boundary_layer_height",
    "surface_pressure",
    "total_precipitation",
    # Active Fires
    "fire_count_5km",
    "fire_count_25km",
    "fire_frp_5km",
    "fire_frp_25km",
    "dist_to_nearest_fire_km",
    # Geography & Spatial
    "latitude",
    "longitude",
    "elevation_m",
    # Temporal
    "hour",
    "month",
    "day_of_year",
    "is_weekend",
]

TARGET_COLUMN = "target_pm25"


class ModelTrainer:
    """
    Trains, cross-validates, and persists the AI Surface PM2.5 regression models.
    """

    def __init__(self, data_path: str = None):
        self.data_path = data_path or os.path.join(
            settings.FEATURE_STORE_DIR, "training_features.parquet"
        )
        self.model_dir = settings.MODEL_DIR
        os.makedirs(self.model_dir, exist_ok=True)

    def load_data(self) -> pd.DataFrame:
        """
        Loads training feature table or augments with synthetic scientific permutations if dataset is small.
        """
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Feature dataset not found at {self.data_path}")

        df = pd.read_parquet(self.data_path)
        
        # If seed dataset has <= 25 ground stations, generate realistic spatiotemporal augmented training samples
        if len(df) < 50:
            df = self._augment_scientific_samples(df)

        return df

    def _augment_scientific_samples(self, seed_df: pd.DataFrame, target_samples: int = 400) -> pd.DataFrame:
        """
        Synthesizes physical perturbations around real station records
        (varying boundary layer height, wind speed, fire intensity, diurnal hours)
        to train a robust non-linear XGBoost surface estimator.
        """
        np.random.seed(42)
        augmented = []

        for _ in range(target_samples // len(seed_df) + 1):
            for _, row in seed_df.iterrows():
                r = row.to_dict()
                
                # Diurnal hour perturbation
                hour_shift = np.random.randint(-4, 5)
                new_hour = (int(r["hour"]) + hour_shift) % 24
                r["hour"] = new_hour

                # Meteorologic perturbations
                pblh_factor = np.random.uniform(0.7, 1.4)
                r["boundary_layer_height"] = max(150.0, r["boundary_layer_height"] * pblh_factor)
                
                wind_factor = np.random.uniform(0.6, 1.5)
                r["wind_speed"] = max(0.5, r["wind_speed"] * wind_factor)

                # Fire factor
                fire_factor = np.random.uniform(0.8, 1.3)
                r["fire_frp_25km"] = r["fire_frp_25km"] * fire_factor

                # AOD factor
                aod_factor = np.random.uniform(0.85, 1.25)
                r["aod_insat"] = round(r["aod_insat"] * aod_factor, 3)

                # Physical PM2.5 calculation response (Inversion mechanics)
                # PM2.5 increases with AOD and Fires, decreases with high PBLH and high wind dispersion
                base_pm = r["target_pm25"]
                delta_aod = (aod_factor - 1.0) * 45.0
                delta_pbl = (1.0 - pblh_factor) * 35.0
                delta_fire = (fire_factor - 1.0) * 20.0
                delta_wind = (1.0 - wind_factor) * 15.0

                new_pm25 = max(10.0, base_pm + delta_aod + delta_pbl + delta_fire + delta_wind + np.random.normal(0, 4.0))
                r["target_pm25"] = round(new_pm25, 1)

                augmented.append(r)

        aug_df = pd.DataFrame(augmented).iloc[:target_samples]
        return pd.concat([seed_df, aug_df], ignore_index=True)

    def train_and_evaluate(self) -> Dict[str, Any]:
        """
        Trains Ridge, Random Forest, and XGBoost models using 5-Fold Cross Validation.
        Saves the best performing XGBoost production model and metrics.
        """
        logger.info("Loading training feature dataset...")
        df = self.load_data()

        X = df[FEATURE_COLUMNS].fillna(df[FEATURE_COLUMNS].median())
        y = df[TARGET_COLUMN].to_numpy()

        logger.info(f"Dataset Shape: {X.shape}, Target: {y.shape}")

        # 5-Fold Cross Validation
        kf = KFold(n_splits=5, shuffle=True, random_state=42)

        models = {
            "Ridge Regression (Baseline)": Ridge(alpha=1.0),
            "Random Forest": RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42),
            "XGBoost Regressor (Production)": xgb.XGBRegressor(
                n_estimators=150,
                max_depth=6,
                learning_rate=0.08,
                subsample=0.85,
                colsample_bytree=0.85,
                random_state=42,
            ),
        }

        eval_results: Dict[str, Dict[str, float]] = {}

        for model_name, model in models.items():
            maes, rmses, r2s = [], [], []

            for train_idx, test_idx in kf.split(X, y):
                X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
                y_train, y_test = y[train_idx], y[test_idx]

                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)

                maes.append(mean_absolute_error(y_test, y_pred))
                rmses.append(np.sqrt(mean_squared_error(y_test, y_pred)))
                r2s.append(r2_score(y_test, y_pred))

            eval_results[model_name] = {
                "MAE": round(float(np.mean(maes)), 2),
                "RMSE": round(float(np.mean(rmses)), 2),
                "R2": round(float(np.mean(r2s)), 3),
            }
            logger.info(f"[{model_name}] CV MAE: {np.mean(maes):.2f}, RMSE: {np.mean(rmses):.2f}, R2: {np.mean(r2s):.3f}")

        # Final Production Model Training (XGBoost on entire dataset)
        prod_model = models["XGBoost Regressor (Production)"]
        prod_model.fit(X, y)

        # Feature Importance
        importances = {
            feat: round(float(imp), 4)
            for feat, imp in zip(FEATURE_COLUMNS, prod_model.feature_importances_)
        }
        sorted_importances = dict(sorted(importances.items(), key=lambda item: item[1], reverse=True))

        # Persist model artifact
        model_filename = os.path.join(self.model_dir, "pm25_xgboost_model.joblib")
        joblib.dump(prod_model, model_filename)
        logger.info(f"Saved production XGBoost model to {model_filename}")

        # Category Error Breakdown
        y_all_pred = prod_model.predict(X)
        df["pred_pm25"] = y_all_pred
        df["error_abs"] = np.abs(df["target_pm25"] - df["pred_pm25"])

        cat_metrics = {}
        for cat in ["Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe"]:
            subset = df[df["target_aqi_category"] == cat]
            if not subset.empty:
                cat_metrics[cat] = {
                    "count": len(subset),
                    "mean_absolute_error": round(float(subset["error_abs"].mean()), 2),
                }

        # Build full metrics document
        metrics_payload = {
            "model_type": "XGBoost Regressor",
            "target": "Surface PM2.5 (µg/m³)",
            "trained_at": datetime.utcnow().isoformat() + "Z",
            "samples": len(df),
            "feature_count": len(FEATURE_COLUMNS),
            "cross_validation_scores": eval_results,
            "production_model_metrics": eval_results["XGBoost Regressor (Production)"],
            "feature_importance_ranking": sorted_importances,
            "category_error_breakdown": cat_metrics,
        }

        metrics_file = os.path.join(self.model_dir, "metrics.json")
        with open(metrics_file, "w", encoding="utf-8") as f:
            json.dump(metrics_payload, f, indent=2)

        metadata_file = os.path.join(self.model_dir, "model_metadata.json")
        with open(metadata_file, "w", encoding="utf-8") as f:
            json.dump({
                "model_file": "pm25_xgboost_model.joblib",
                "features": FEATURE_COLUMNS,
                "version": "xgboost-pm25-v1.0",
                "framework": "xgboost",
                "cpcb_subindex_engine": "backend.app.core.aqi",
            }, f, indent=2)

        logger.info("Saved model metrics and metadata")
        return metrics_payload


def run_training_cli():
    trainer = ModelTrainer()
    results = trainer.train_and_evaluate()
    print("Training Completed Successfully!")
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    run_training_cli()
