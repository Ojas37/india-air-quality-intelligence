import os
import json
import pandas as pd
from backend.app.core.logging import logger
from backend.app.core.config import settings
from backend.app.geospatial.grid import generate_india_grid
from backend.app.geospatial.spatial_join import GeospatialFusionEngine
from backend.app.geospatial.geojson_generator import dataframe_to_geojson_points


class SpatialFusionPipeline:
    """
    Coordinates spatial mesh generation, spatiotemporal joins, and Parquet feature store creation.
    """

    def __init__(self):
        self.engine = GeospatialFusionEngine()

    def run(self):
        logger.info("=== Starting Geospatial Fusion Pipeline ===")

        # 1. Load latest processed data streams
        self.engine.load_latest_processed_data()

        # 2. Generate training features with CPCB ground truth labels
        logger.info("Building CPCB training feature table...")
        train_df = self.engine.create_training_features()

        # 3. Generate regularized nationwide spatial grid
        logger.info("Generating regularized spatial grid across India...")
        grid_df = generate_india_grid(resolution_deg=0.25)
        logger.info(f"Generated {len(grid_df)} spatial grid cells across India")

        # 4. Fuse satellite, meteorology, and fire features across nationwide grid
        logger.info("Fusing environmental features across national grid...")
        national_grid_features = self.engine.create_national_grid_features(grid_df)

        # 5. Export map-ready GeoJSON representation
        grid_geojson = dataframe_to_geojson_points(
            national_grid_features,
            lat_col="latitude",
            lon_col="longitude",
            properties_cols=["cell_id", "zone", "elevation_m", "aod_insat", "hcho_column", "fire_count_25km", "wind_speed"],
        )
        geojson_path = os.path.join(settings.PROCESSED_DATA_DIR, "map_grid.json")
        with open(geojson_path, "w", encoding="utf-8") as f:
            json.dump(grid_geojson, f)
        logger.info(f"Exported map-ready GeoJSON to {geojson_path}")

        logger.info("=== Geospatial Fusion Pipeline Completed Successfully ===")
        return {
            "training_records": len(train_df),
            "national_grid_cells": len(national_grid_features),
            "training_features_path": os.path.join(settings.FEATURE_STORE_DIR, "training_features.parquet"),
            "grid_features_path": os.path.join(settings.FEATURE_STORE_DIR, "national_grid_features.parquet"),
        }


def run_fusion_cli():
    pipeline = SpatialFusionPipeline()
    res = pipeline.run()
    print("Fusion Results:", res)


if __name__ == "__main__":
    run_fusion_cli()
