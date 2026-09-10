import json
import pandas as pd
from typing import Dict, Any, List


def dataframe_to_geojson_points(
    df: pd.DataFrame,
    lat_col: str = "lat",
    lon_col: str = "lon",
    properties_cols: List[str] = None,
) -> Dict[str, Any]:
    """
    Converts a pandas DataFrame of geographic coordinates into a GeoJSON FeatureCollection.
    """
    features = []

    for _, row in df.iterrows():
        lat = float(row[lat_col])
        lon = float(row[lon_col])

        if properties_cols:
            props = {col: (row[col] if pd.notna(row[col]) else None) for col in properties_cols if col in row}
        else:
            props = {k: (v if pd.notna(v) else None) for k, v in row.items() if k not in (lat_col, lon_col)}

        # Convert timestamps or non-serializable objects
        clean_props = {}
        for k, v in props.items():
            if isinstance(v, (pd.Timestamp, pd.Timedelta)):
                clean_props[k] = str(v)
            else:
                clean_props[k] = v

        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat],  # GeoJSON standard: [longitude, latitude]
            },
            "properties": clean_props,
        }
        features.append(feature)

    return {
        "type": "FeatureCollection",
        "features": features,
    }
