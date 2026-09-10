import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any


def haversine_distance(
    lat1: float, lon1: float, lat2: float, lon2: float
) -> float:
    """
    Computes great-circle distance between two points in kilometers.
    """
    r = 6371.0  # Earth radius in kilometers

    phi1, phi2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dlambda = np.radians(lon2 - lon1)

    a = np.sin(dphi / 2.0) ** 2 + np.cos(phi1) * np.cos(phi2) * np.sin(dlambda / 2.0) ** 2
    c = 2.0 * np.arctan2(np.sqrt(a), np.sqrt(1.0 - a))

    return float(r * c)


def haversine_vectorized(
    lat: float, lon: float, lats_array: np.ndarray, lons_array: np.ndarray
) -> np.ndarray:
    """
    Computes distances in km from a single (lat, lon) to arrays of lats and lons.
    """
    r = 6371.0
    phi1 = np.radians(lat)
    phi2 = np.radians(lats_array)
    dphi = np.radians(lats_array - lat)
    dlambda = np.radians(lons_array - lon)

    a = np.sin(dphi / 2.0) ** 2 + np.cos(phi1) * np.cos(phi2) * np.sin(dlambda / 2.0) ** 2
    c = 2.0 * np.arctan2(np.sqrt(a), np.sqrt(1.0 - a))

    return r * c


def find_nearest_point(
    lat: float, lon: float, df: pd.DataFrame, lat_col: str = "lat", lon_col: str = "lon"
) -> Tuple[Dict[str, Any], float]:
    """
    Finds the closest record in a DataFrame to (lat, lon).
    Returns (nearest_row_dict, distance_km).
    """
    if df.empty:
        return {}, float("inf")

    lats = df[lat_col].to_numpy()
    lons = df[lon_col].to_numpy()

    distances = haversine_vectorized(lat, lon, lats, lons)
    min_idx = int(np.argmin(distances))
    min_dist = float(distances[min_idx])

    return df.iloc[min_idx].to_dict(), min_dist


def compute_fire_proximity_kernels(
    lat: float,
    lon: float,
    fires_df: pd.DataFrame,
    lat_col: str = "lat",
    lon_col: str = "lon",
    frp_col: str = "frp_mw",
) -> Dict[str, float]:
    """
    Aggregates active fire counts and FRP sums within 5km and 25km radius buffers.
    """
    if fires_df.empty:
        return {
            "fire_count_5km": 0,
            "fire_count_25km": 0,
            "fire_frp_5km": 0.0,
            "fire_frp_25km": 0.0,
            "dist_to_nearest_fire_km": 999.0,
        }

    lats = fires_df[lat_col].to_numpy()
    lons = fires_df[lon_col].to_numpy()
    frps = fires_df[frp_col].to_numpy() if frp_col in fires_df.columns else np.zeros(len(fires_df))

    distances = haversine_vectorized(lat, lon, lats, lons)

    # 5km radius kernel
    mask_5km = distances <= 5.0
    count_5km = int(np.sum(mask_5km))
    frp_5km = float(np.sum(frps[mask_5km]))

    # 25km radius kernel
    mask_25km = distances <= 25.0
    count_25km = int(np.sum(mask_25km))
    frp_25km = float(np.sum(frps[mask_25km]))

    nearest_dist = float(np.min(distances)) if len(distances) > 0 else 999.0

    return {
        "fire_count_5km": count_5km,
        "fire_count_25km": count_25km,
        "fire_frp_5km": round(frp_5km, 2),
        "fire_frp_25km": round(frp_25km, 2),
        "dist_to_nearest_fire_km": round(nearest_dist, 2),
    }
