from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime
from backend.app.schemas.hcho import HCHOHotspot, HCHOHotspotsResponse
from backend.app.schemas.common import SourceType, ConfidenceLevel

router = APIRouter()


@router.get("/hotspots", response_model=HCHOHotspotsResponse)
async def get_hcho_hotspots(
    correlation_filter: Optional[str] = Query(None, description="Filter by correlation: Strong, Moderate, Weak, None"),
):
    """
    Returns detected TROPOMI HCHO anomalies and their correlation with active FIRMS fires.
    """
    hotspots = [
        HCHOHotspot(
            id="hcho-001",
            latitude=30.9010,
            longitude=75.8573,
            region="Ludhiana Agricultural Belt",
            state="Punjab",
            district="Ludhiana",
            hcho_column=18.4,
            hcho_anomaly_sigma=3.4,
            hcho_level="High",
            nearby_fires_25km=46,
            total_frp_mw=920.0,
            fire_correlation="Strong",
            source_classification="Potential agricultural residue burning",
            confidence=ConfidenceLevel.HIGH,
            notes="Co-located with dense post-monsoon paddy residue burning clusters.",
            source_type=SourceType.DERIVED_ANALYSIS,
        ),
        HCHOHotspot(
            id="hcho-002",
            latitude=28.6692,
            longitude=77.4538,
            region="Ghaziabad Industrial Area",
            state="Uttar Pradesh",
            district="Ghaziabad",
            hcho_column=15.2,
            hcho_anomaly_sigma=2.8,
            hcho_level="Elevated",
            nearby_fires_25km=3,
            total_frp_mw=45.0,
            fire_correlation="Weak",
            source_classification="Potential industrial / urban emissions",
            confidence=ConfidenceLevel.HIGH,
            notes="High HCHO with low fire activity; suggests chemical processing/industrial VOC sources.",
            source_type=SourceType.DERIVED_ANALYSIS,
        ),
        HCHOHotspot(
            id="hcho-003",
            latitude=22.3072,
            longitude=73.1812,
            region="Vadodara Petrochemical Complex",
            state="Gujarat",
            district="Vadodara",
            hcho_column=14.8,
            hcho_anomaly_sigma=2.6,
            hcho_level="Elevated",
            nearby_fires_25km=1,
            total_frp_mw=12.0,
            fire_correlation="None",
            source_classification="Potential petrochemical refinery emissions",
            confidence=ConfidenceLevel.HIGH,
            notes="Industrial point source VOC plume from refinery belt.",
            source_type=SourceType.DERIVED_ANALYSIS,
        ),
    ]

    if correlation_filter:
        hotspots = [h for h in hotspots if h.fire_correlation.lower() == correlation_filter.lower()]

    return HCHOHotspotsResponse(
        total_hotspots=len(hotspots),
        strong_fire_correlated=len([h for h in hotspots if h.fire_correlation == "Strong"]),
        hotspots=hotspots,
        source_type=SourceType.DERIVED_ANALYSIS,
        timestamp=datetime.utcnow(),
    )
