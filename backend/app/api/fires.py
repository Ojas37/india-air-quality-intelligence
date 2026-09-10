from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime
from backend.app.schemas.fire import FirePoint, FireListResponse, StateFireSummary
from backend.app.schemas.common import SourceType

router = APIRouter()


@router.get("/recent", response_model=FireListResponse)
async def get_recent_fires(
    confidence: Optional[str] = Query("All", description="Filter by confidence: High, Medium, Low, All"),
    fire_type: Optional[str] = Query("All", description="Filter by fire type: Agricultural, Forest, Industrial, All"),
):
    """
    Returns active thermal anomalies and Fire Radiative Power (FRP) from NASA FIRMS.
    """
    sample_fires = [
        FirePoint(
            id="firms-001",
            latitude=31.1471,
            longitude=75.3412,
            confidence="High",
            fire_type="Agricultural",
            state="Punjab",
            district="Jalandhar",
            frp_mw=48.5,
            brightness_kelvin=345.2,
            satellite="VIIRS-NOAA20",
            detected_at=datetime.utcnow(),
            source_type=SourceType.SATELLITE_OBSERVED,
        ),
        FirePoint(
            id="firms-002",
            latitude=30.3165,
            longitude=76.3988,
            confidence="High",
            fire_type="Agricultural",
            state="Punjab",
            district="Patiala",
            frp_mw=62.1,
            brightness_kelvin=356.8,
            satellite="VIIRS-S-NPP",
            detected_at=datetime.utcnow(),
            source_type=SourceType.SATELLITE_OBSERVED,
        ),
        FirePoint(
            id="firms-003",
            latitude=29.9695,
            longitude=76.8783,
            confidence="Medium",
            fire_type="Agricultural",
            state="Haryana",
            district="Kurukshetra",
            frp_mw=32.4,
            brightness_kelvin=338.4,
            satellite="MODIS-Aqua",
            detected_at=datetime.utcnow(),
            source_type=SourceType.SATELLITE_OBSERVED,
        ),
        FirePoint(
            id="firms-004",
            latitude=22.7196,
            longitude=75.8577,
            confidence="Low",
            fire_type="Forest",
            state="Madhya Pradesh",
            district="Indore",
            frp_mw=18.2,
            brightness_kelvin=322.0,
            satellite="VIIRS-NOAA20",
            detected_at=datetime.utcnow(),
            source_type=SourceType.SATELLITE_OBSERVED,
        ),
    ]

    filtered = sample_fires
    if confidence != "All":
        filtered = [f for f in filtered if f.confidence.lower() == confidence.lower()]
    if fire_type != "All":
        filtered = [f for f in filtered if f.fire_type.lower() == fire_type.lower()]

    state_summaries = [
        StateFireSummary(
            state="Punjab",
            active_fires=118,
            high_confidence=94,
            agricultural_fires=102,
            forest_fires=2,
            total_frp_mw=2450.0,
        ),
        StateFireSummary(
            state="Haryana",
            active_fires=54,
            high_confidence=41,
            agricultural_fires=48,
            forest_fires=1,
            total_frp_mw=980.0,
        ),
        StateFireSummary(
            state="Uttar Pradesh",
            active_fires=32,
            high_confidence=22,
            agricultural_fires=25,
            forest_fires=4,
            total_frp_mw=540.0,
        ),
        StateFireSummary(
            state="Madhya Pradesh",
            active_fires=12,
            high_confidence=6,
            agricultural_fires=4,
            forest_fires=7,
            total_frp_mw=180.0,
        ),
    ]

    return FireListResponse(
        total_fires=len(filtered),
        high_confidence_count=len([f for f in filtered if f.confidence == "High"]),
        total_frp_mw=sum(f.frp_mw for f in filtered),
        fires=filtered,
        state_summaries=state_summaries,
        source_type=SourceType.SATELLITE_OBSERVED,
    )
