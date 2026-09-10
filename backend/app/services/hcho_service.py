import os
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime

from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.schemas.hcho import HCHOHotspot, HCHOHotspotsResponse
from backend.app.schemas.common import SourceType, ConfidenceLevel
from backend.app.geospatial.distance import compute_fire_proximity_kernels
from backend.app.data.ingestors.tropomi import TROPOMIIngestor
from backend.app.data.ingestors.firms import FIRMSIngestor


class HCHOService:
    """
    Service executing HCHO anomaly detection, spatial clustering,
    FIRMS active fire correlation, and source type classification.
    """

    def __init__(self):
        self.tropomi_path = os.path.join(settings.PROCESSED_DATA_DIR, "tropomi", "tropomi_latest.parquet")
        self.firms_path = os.path.join(settings.PROCESSED_DATA_DIR, "firms", "firms_latest.parquet")
        self.tropomi_df: Optional[pd.DataFrame] = None
        self.firms_df: Optional[pd.DataFrame] = None
        self._load_data()

    def _load_data(self):
        if os.path.exists(self.tropomi_path):
            self.tropomi_df = pd.read_parquet(self.tropomi_path)
        else:
            ingestor = TROPOMIIngestor()
            self.tropomi_df = ingestor.run_pipeline()

        if os.path.exists(self.firms_path):
            self.firms_df = pd.read_parquet(self.firms_path)
        else:
            ingestor = FIRMSIngestor()
            self.firms_df = ingestor.run_pipeline()

    def classify_source_type(
        self,
        fire_correlation: str,
        fire_count: int,
        frp_mw: float,
        no2_col: float,
        so2_col: float,
        state: str,
    ) -> Tuple[str, ConfidenceLevel, str]:
        """
        Classifies potential emission source using multi-sensor scientific heuristics.
        """
        if fire_correlation == "Strong":
            if state in ["Punjab", "Haryana", "Uttar Pradesh", "Bihar"]:
                return (
                    "Potential agricultural residue burning",
                    ConfidenceLevel.HIGH,
                    f"Strong spatial alignment with {fire_count} active thermal fire pixels (Total FRP: {frp_mw:.1f} MW) during harvesting cycle.",
                )
            elif state in ["Madhya Pradesh", "Odisha", "Uttarakhand", "Himachal Pradesh"]:
                return (
                    "Potential forest fire / biomass combustion",
                    ConfidenceLevel.HIGH,
                    f"High fire density ({fire_count} pixels, {frp_mw:.1f} MW) in forested terrain.",
                )
            else:
                return (
                    "Potential biomass burning",
                    ConfidenceLevel.MODERATE,
                    f"High thermal radiative power ({frp_mw:.1f} MW) in vicinity.",
                )
        elif fire_correlation in ["Weak", "None"]:
            if no2_col >= 25.0 or so2_col >= 5.0:
                return (
                    "Potential industrial / combustion source",
                    ConfidenceLevel.HIGH,
                    f"Elevated HCHO co-located with high NO2 ({no2_col:.1f}) and SO2 ({so2_col:.1f}) but negligible fire activity, indicating industrial stack / manufacturing plumes.",
                )
            elif state in ["Gujarat", "Maharashtra"] and no2_col >= 18.0:
                return (
                    "Potential petrochemical / solvent VOC emissions",
                    ConfidenceLevel.MODERATE,
                    "Elevated HCHO column over known petrochemical refinery corridor.",
                )
            else:
                return (
                    "Potential biogenic VOC emissions / background",
                    ConfidenceLevel.MODERATE,
                    "Vegetative isoprene oxidation in dense canopy with low combustion co-pollutants.",
                )
        else:
            return (
                "Potential mixed emission source",
                ConfidenceLevel.MODERATE,
                f"Moderate fire activity ({fire_count} fires) with mixed urban/rural background.",
            )

    def detect_hotspots(
        self, correlation_filter: Optional[str] = None
    ) -> HCHOHotspotsResponse:
        """
        Identifies HCHO hotspots from TROPOMI, computes FIRMS fire correlation,
        and derives source classifications.
        """
        if self.tropomi_df is None or self.tropomi_df.empty:
            self._load_data()

        hotspots: List[HCHOHotspot] = []

        for idx, row in self.tropomi_df.iterrows():
            lat = float(row["lat"])
            lon = float(row["lon"])
            hcho = float(row["hcho_column"])
            sigma = float(row.get("hcho_anomaly_sigma", (hcho - 7.0) / 2.5))
            level = str(row.get("hcho_level", "Moderate"))
            no2 = float(row.get("no2_column", 15.0))
            so2 = float(row.get("so2_column", 2.0))
            state = str(row.get("state", "India"))
            region = str(row.get("region", f"Sector ({lat:.2f}N, {lon:.2f}E)"))

            # Fire correlation analysis using 25km proximity kernel
            if self.firms_df is not None and not self.firms_df.empty:
                fire_stats = compute_fire_proximity_kernels(lat, lon, self.firms_df)
                fire_count = fire_stats["fire_count_25km"]
                total_frp = fire_stats["fire_frp_25km"]
            else:
                fire_count = 0
                total_frp = 0.0

            if fire_count >= 3 or total_frp >= 50.0:
                corr = "Strong"
            elif fire_count >= 1 or total_frp >= 15.0:
                corr = "Moderate"
            else:
                corr = "None"

            classification, conf, notes = self.classify_source_type(
                fire_correlation=corr,
                fire_count=fire_count,
                frp_mw=total_frp,
                no2_col=no2,
                so2_col=so2,
                state=state,
            )

            hotspot = HCHOHotspot(
                id=f"hcho_{idx+1:03d}",
                latitude=lat,
                longitude=lon,
                region=region,
                state=state,
                district=str(row.get("district", state)),
                hcho_column=round(hcho, 1),
                hcho_anomaly_sigma=round(sigma, 1),
                hcho_level=level,
                nearby_fires_25km=fire_count,
                total_frp_mw=round(total_frp, 1),
                fire_correlation=corr,
                source_classification=classification,
                confidence=conf,
                notes=notes,
                source_type=SourceType.DERIVED_ANALYSIS,
                detected_at=datetime.utcnow(),
            )
            hotspots.append(hotspot)

        if correlation_filter:
            hotspots = [h for h in hotspots if h.fire_correlation.lower() == correlation_filter.lower()]

        # Sort hotspots by severity (HCHO column descending)
        hotspots.sort(key=lambda h: h.hcho_column, reverse=True)

        return HCHOHotspotsResponse(
            total_hotspots=len(hotspots),
            strong_fire_correlated=len([h for h in hotspots if h.fire_correlation == "Strong"]),
            hotspots=hotspots,
            source_type=SourceType.DERIVED_ANALYSIS,
            timestamp=datetime.utcnow(),
        )


_hcho_service_instance = None


def get_hcho_service() -> HCHOService:
    global _hcho_service_instance
    if _hcho_service_instance is None:
        _hcho_service_instance = HCHOService()
    return _hcho_service_instance
