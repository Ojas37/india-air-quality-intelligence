import pytest
import pandas as pd
import numpy as np
from backend.app.geospatial.distance import (
    haversine_distance,
    compute_fire_proximity_kernels,
    find_nearest_point,
)
from backend.app.geospatial.grid import SpatialGrid, generate_india_grid
from backend.app.geospatial.spatial_join import GeospatialFusionEngine
from backend.app.geospatial.geojson_generator import dataframe_to_geojson_points


def test_haversine_distance_calculations():
    # Delhi (28.6139, 77.2090) to Mumbai (19.0760, 72.8777) ~1150 km
    dist_delhi_mumbai = haversine_distance(28.6139, 77.2090, 19.0760, 72.8777)
    assert 1140.0 <= dist_delhi_mumbai <= 1180.0

    # Same point distance is 0.0
    dist_zero = haversine_distance(28.6139, 77.2090, 28.6139, 77.2090)
    assert dist_zero == 0.0


def test_fire_proximity_kernels():
    fires_df = pd.DataFrame([
        {"lat": 28.62, "lon": 77.21, "frp_mw": 50.0},  # ~1 km from Delhi
        {"lat": 28.70, "lon": 77.25, "frp_mw": 30.0},  # ~10 km from Delhi (within 25km)
        {"lat": 30.90, "lon": 75.85, "frp_mw": 100.0}, # ~295 km from Delhi (outside 25km)
    ])

    kernels = compute_fire_proximity_kernels(28.6139, 77.2090, fires_df)

    assert kernels["fire_count_5km"] == 1
    assert kernels["fire_frp_5km"] == 50.0
    assert kernels["fire_count_25km"] == 2
    assert kernels["fire_frp_25km"] == 80.0
    assert kernels["dist_to_nearest_fire_km"] < 2.0


def test_spatial_grid_generation():
    grid = SpatialGrid(resolution_deg=1.0)  # Coarse grid for test
    df = grid.generate()

    assert len(df) > 0
    assert "cell_id" in df.columns
    assert "elevation_m" in df.columns
    assert "zone" in df.columns

    # Verify all coordinates inside Indian bounding box
    assert (df["lat"] >= 8.0).all() and (df["lat"] <= 35.0).all()
    assert (df["lon"] >= 68.5).all() and (df["lon"] <= 97.0).all()


def test_geospatial_fusion_engine_single_point():
    engine = GeospatialFusionEngine()
    engine.load_latest_processed_data()

    features = engine.fuse_single_point(lat=28.6139, lon=77.2090)

    expected_features = [
        "latitude", "longitude", "elevation_m",
        "hour", "month", "day_of_year",
        "aod_insat", "hcho_column", "no2_column", "so2_column", "co_column",
        "temperature_2m", "relative_humidity", "wind_u", "wind_v", "wind_speed", "boundary_layer_height",
        "fire_count_5km", "fire_count_25km", "fire_frp_5km", "fire_frp_25km",
    ]
    for feat in expected_features:
        assert feat in features, f"Missing feature {feat}"
        assert features[feat] is not None


def test_geojson_point_export():
    df = pd.DataFrame([
        {"latitude": 28.6139, "longitude": 77.2090, "name": "Delhi", "aqi": 342},
        {"latitude": 19.0760, "longitude": 72.8777, "name": "Mumbai", "aqi": 156},
    ])

    geojson = dataframe_to_geojson_points(
        df, lat_col="latitude", lon_col="longitude", properties_cols=["name", "aqi"]
    )

    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) == 2
    # Verify standard GeoJSON [lon, lat] ordering
    assert geojson["features"][0]["geometry"]["coordinates"] == [77.2090, 28.6139]
    assert geojson["features"][0]["properties"]["name"] == "Delhi"
    assert geojson["features"][0]["properties"]["aqi"] == 342
