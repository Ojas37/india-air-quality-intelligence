import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from backend.app.geospatial.distance import haversine_distance, find_nearest_point


class WindTrajectoryEngine:
    """
    Simulates kinematic Lagrangian forward and backward air parcel trajectories
    using 2D horizontal wind vector fields (u, v in m/s).
    """

    def __init__(self, era5_df: pd.DataFrame):
        self.era5_df = era5_df

    def get_wind_at_point(self, lat: float, lon: float) -> Tuple[float, float, float, float]:
        """
        Retrieves (u, v, wind_speed, wind_direction_deg) at (lat, lon) via nearest neighbor.
        """
        if self.era5_df.empty:
            return 2.5, -2.0, 3.2, 308.0

        nearest, _ = find_nearest_point(lat, lon, self.era5_df)
        u = float(nearest.get("u10", 2.5))
        v = float(nearest.get("v10", -2.0))
        speed = float(nearest.get("wind_speed", np.sqrt(u**2 + v**2)))
        direction = float(nearest.get("wind_direction_deg", (np.arctan2(-u, -v) * 180.0 / np.pi) % 360.0))

        return u, v, speed, direction

    def compute_forward_trajectory(
        self,
        start_lat: float,
        start_lon: float,
        duration_hours: float = 24.0,
        step_hours: float = 1.0,
    ) -> List[Dict[str, Any]]:
        """
        Calculates forward advection path of a pollution plume over time.
        """
        trajectory_points = []
        cur_lat = start_lat
        cur_lon = start_lon
        total_dist_km = 0.0

        trajectory_points.append({
            "hour": 0.0,
            "lat": round(cur_lat, 4),
            "lon": round(cur_lon, 4),
            "cumulative_distance_km": 0.0,
        })

        steps = int(duration_hours / step_hours)
        dt_seconds = step_hours * 3600.0

        for s in range(1, steps + 1):
            u, v, speed, direction = self.get_wind_at_point(cur_lat, cur_lon)

            # Degree displacement conversions (1 deg lat ~ 111.13 km)
            dlat = (v * dt_seconds) / 111139.0
            dlon = (u * dt_seconds) / (111139.0 * max(0.2, np.cos(np.radians(cur_lat))))

            next_lat = cur_lat + dlat
            next_lon = cur_lon + dlon

            step_dist = haversine_distance(cur_lat, cur_lon, next_lat, next_lon)
            total_dist_km += step_dist

            cur_lat = next_lat
            cur_lon = next_lon

            trajectory_points.append({
                "hour": s * step_hours,
                "lat": round(cur_lat, 4),
                "lon": round(cur_lon, 4),
                "cumulative_distance_km": round(total_dist_km, 1),
                "wind_speed_ms": round(speed, 2),
                "wind_direction_deg": round(direction, 1),
            })

        return trajectory_points
