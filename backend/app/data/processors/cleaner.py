import pandas as pd
import numpy as np
from typing import List, Optional, Tuple
from backend.app.core.logging import logger


class DataCleaner:
    """
    Standardized geospatial and environmental data cleaning utilities.
    """

    @staticmethod
    def filter_geographic_bounds(
        df: pd.DataFrame,
        lat_col: str = "lat",
        lon_col: str = "lon",
        min_lat: float = 6.0,
        max_lat: float = 38.0,
        min_lon: float = 68.0,
        max_lon: float = 98.0,
    ) -> pd.DataFrame:
        """
        Clips points strictly within the Indian territorial bounds.
        """
        valid = (
            (df[lat_col] >= min_lat) & (df[lat_col] <= max_lat) &
            (df[lon_col] >= min_lon) & (df[lon_col] <= max_lon)
        )
        dropped = len(df) - valid.sum()
        if dropped > 0:
            logger.warning(f"Filtered out {dropped} out-of-bounds geographic points.")
        return df[valid].copy()

    @staticmethod
    def detect_outliers_zscore(
        df: pd.DataFrame,
        column: str,
        threshold: float = 3.5,
    ) -> pd.DataFrame:
        """
        Replaces statistical outliers beyond threshold standard deviations with NaN.
        """
        cleaned = df.copy()
        if column in cleaned.columns and cleaned[column].dropna().count() > 3:
            col_data = cleaned[column].dropna()
            mean = col_data.mean()
            std = col_data.std()
            if std > 0:
                z_scores = (cleaned[column] - mean).abs() / std
                outliers = z_scores > threshold
                if outliers.sum() > 0:
                    logger.info(f"Flagged {outliers.sum()} outliers in column '{column}'.")
                    cleaned.loc[outliers, column] = np.nan
        return cleaned

    @staticmethod
    def normalize_timestamps(
        df: pd.DataFrame,
        time_col: str = "timestamp",
    ) -> pd.DataFrame:
        """
        Converts timestamps to standard ISO8601 UTC representation.
        """
        cleaned = df.copy()
        if time_col in cleaned.columns:
            cleaned[time_col] = pd.to_datetime(cleaned[time_col], errors="coerce", utc=True)
        return cleaned
