import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional


class SpatialGrid:
    """
    Generates regularized spatial meshes over India for continuous spatial prediction.
    """

    def __init__(
        self,
        min_lat: float = 8.0,
        max_lat: float = 35.0,
        min_lon: float = 68.5,
        max_lon: float = 97.0,
        resolution_deg: float = 0.25,  # ~25km baseline mesh for fast nationwide coverage
    ):
        self.min_lat = min_lat
        self.max_lat = max_lat
        self.min_lon = min_lon
        self.max_lon = max_lon
        self.resolution = resolution_deg

    def estimate_elevation(self, lat: float, lon: float) -> float:
        """
        Estimates digital elevation (m) based on physiographic regional terrain.
        """
        # Himalayan & Karakoram Range
        if lat >= 30.0 and lon <= 80.0:
            return round(1200.0 + (lat - 30.0) * 450.0, 1)
        elif lat >= 27.0 and lon >= 88.0:
            return round(800.0 + (lat - 27.0) * 350.0, 1)
        # Deccan Plateau
        elif 12.0 <= lat <= 20.0 and 74.0 <= lon <= 80.0:
            return round(550.0 + np.sin(lat) * 80.0, 1)
        # Western Ghats
        elif 10.0 <= lat <= 18.0 and 73.0 <= lon <= 74.5:
            return round(900.0 + np.cos(lat) * 120.0, 1)
        # Indo-Gangetic Plain
        elif 24.0 <= lat <= 30.0 and 75.0 <= lon <= 88.0:
            return round(150.0 + (30.0 - lat) * 15.0, 1)
        # Coastal & lowlands
        else:
            return round(45.0 + np.random.uniform(5.0, 30.0), 1)

    def assign_geopolitical_zone(self, lat: float, lon: float) -> str:
        """
        Tags each spatial grid cell with its macro geographical zone.
        """
        if lat >= 28.0 and lon <= 78.0:
            return "Northern Agricultural / NCR"
        elif lat >= 24.0 and 78.0 < lon <= 88.0:
            return "Indo-Gangetic Basin"
        elif lat >= 24.0 and lon > 88.0:
            return "North-Eastern Region"
        elif 18.0 <= lat < 26.0 and 68.0 <= lon <= 78.0:
            return "Western Industrial Corridor"
        elif 18.0 <= lat < 24.0 and 78.0 < lon <= 86.0:
            return "Central Plateau / Mining Belt"
        else:
            return "Peninsular South India"

    def is_land_cell(self, lat: float, lon: float) -> bool:
        """
        Basic polygon mask excluding Arabian Sea and Bay of Bengal coordinates.
        """
        # Arabian Sea mask
        if lat < 20.0 and lon < 72.5:
            return False
        # Bay of Bengal mask
        if lat < 20.0 and lon > 82.0 and not (10.0 <= lat <= 14.0 and 79.5 <= lon <= 80.5):
            if not (lat <= 13.0 and lon <= 80.5):  # Tamil Nadu coast
                return False
        if lat < 16.0 and lon > 81.5:
            return False
        return True

    def generate(self) -> pd.DataFrame:
        """
        Builds the standard regularized grid DataFrame.
        """
        lats = np.arange(self.min_lat, self.max_lat + 1e-6, self.resolution)
        lons = np.arange(self.min_lon, self.max_lon + 1e-6, self.resolution)

        cells = []
        cell_counter = 1

        for lat in lats:
            for lon in lons:
                if self.is_land_cell(lat, lon):
                    zone = self.assign_geopolitical_zone(lat, lon)
                    elev = self.estimate_elevation(lat, lon)
                    cells.append({
                        "cell_id": f"GRID_IN_{cell_counter:05d}",
                        "lat": round(float(lat), 3),
                        "lon": round(float(lon), 3),
                        "zone": zone,
                        "elevation_m": elev,
                    })
                    cell_counter += 1

        df = pd.DataFrame(cells)
        return df


def generate_india_grid(resolution_deg: float = 0.25) -> pd.DataFrame:
    grid = SpatialGrid(resolution_deg=resolution_deg)
    return grid.generate()
