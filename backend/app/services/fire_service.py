import os
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from datetime import datetime

from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.schemas.fire import FirePoint, FireListResponse, StateFireSummary
from backend.app.schemas.common import SourceType
from backend.app.data.ingestors.firms import FIRMSIngestor


class FireService:
    """
    Service managing NASA FIRMS active thermal anomaly queries and state statistics.
    """

    def __init__(self):
        self.firms_path = os.path.join(settings.PROCESSED_DATA_DIR, "firms", "firms_latest.parquet")
        self.fires_df: Optional[pd.DataFrame] = None
        self._load_data()

    def _load_data(self):
        if os.path.exists(self.firms_path):
            self.fires_df = pd.read_parquet(self.firms_path)
        else:
            ingestor = FIRMSIngestor()
            self.fires_df = ingestor.run_pipeline()

    def get_fires(
        self,
        confidence_filter: str = "All",
        type_filter: str = "All",
        state_filter: Optional[str] = None,
    ) -> FireListResponse:
        """
        Filters active fire detections by confidence, classification type, or state.
        """
        if self.fires_df is None or self.fires_df.empty:
            self._load_data()

        df = self.fires_df.copy()

        if confidence_filter != "All":
            df = df[df["confidence_class"].str.lower() == confidence_filter.lower()]

        if type_filter != "All":
            df = df[df["type"].str.lower() == type_filter.lower()]

        if state_filter:
            df = df[df["state"].str.lower() == state_filter.lower()]

        fire_points = [
            FirePoint(
                id=str(row.get("fire_id", f"fire_{idx}")),
                latitude=float(row["lat"]),
                longitude=float(row["lon"]),
                confidence=str(row["confidence_class"]),
                fire_type=str(row.get("type", "Agricultural")),
                state=str(row.get("state", "Unknown")),
                district=str(row.get("district", "Unknown")),
                frp_mw=float(row.get("frp_mw", 0.0)),
                brightness_kelvin=float(row.get("brightness_k", 330.0)),
                satellite=str(row.get("satellite", "VIIRS")),
                daynight=str(row.get("daynight", "D")),
                detected_at=pd.to_datetime(row.get("timestamp", datetime.utcnow())),
                source_type=SourceType.SATELLITE_OBSERVED,
            )
            for idx, row in df.iterrows()
        ]

        # Compute state-wise fire distribution
        state_summaries = []
        if self.fires_df is not None and not self.fires_df.empty:
            grouped = self.fires_df.groupby("state")
            for state_name, group in grouped:
                state_summaries.append(
                    StateFireSummary(
                        state=str(state_name),
                        active_fires=len(group),
                        high_confidence=int((group["confidence_class"] == "High").sum()),
                        agricultural_fires=int((group["type"] == "Agricultural").sum()),
                        forest_fires=int((group["type"] == "Forest").sum()),
                        total_frp_mw=round(float(group["frp_mw"].sum()), 2),
                    )
                )

        state_summaries.sort(key=lambda s: s.active_fires, reverse=True)

        return FireListResponse(
            total_fires=len(fire_points),
            high_confidence_count=len([f for f in fire_points if f.confidence == "High"]),
            total_frp_mw=round(sum(f.frp_mw for f in fire_points), 2),
            fires=fire_points,
            state_summaries=state_summaries,
            source_type=SourceType.SATELLITE_OBSERVED,
            timestamp=datetime.utcnow(),
        )


_fire_service_instance = None


def get_fire_service() -> FireService:
    global _fire_service_instance
    if _fire_service_instance is None:
        _fire_service_instance = FireService()
    return _fire_service_instance
