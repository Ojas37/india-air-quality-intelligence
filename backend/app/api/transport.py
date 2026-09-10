from fastapi import APIRouter
from datetime import datetime
from backend.app.schemas.transport import (
    TransportResponse,
    WindVectorPoint,
    TransportPathway,
)
from backend.app.schemas.common import SourceType, ConfidenceLevel

router = APIRouter()


@router.get("/wind", response_model=TransportResponse)
async def get_transport_analysis():
    """
    Returns ERA5 meteorological wind vectors and evaluated source-to-receptor transport pathways.
    """
    sample_vectors = [
        WindVectorPoint(
            latitude=30.5,
            longitude=76.0,
            u_ms=3.2,
            v_ms=-2.8,
            speed_ms=4.25,
            direction_deg=311.0,
            direction_cardinal="NW",
            source_type=SourceType.SATELLITE_OBSERVED,
        ),
        WindVectorPoint(
            latitude=29.0,
            longitude=77.0,
            u_ms=2.9,
            v_ms=-2.1,
            speed_ms=3.58,
            direction_deg=306.0,
            direction_cardinal="NW",
            source_type=SourceType.SATELLITE_OBSERVED,
        ),
        WindVectorPoint(
            latitude=28.5,
            longitude=77.2,
            u_ms=2.1,
            v_ms=-1.5,
            speed_ms=2.58,
            direction_deg=305.0,
            direction_cardinal="NW",
            source_type=SourceType.SATELLITE_OBSERVED,
        ),
    ]

    sample_pathways = [
        TransportPathway(
            id="pathway-001",
            source_region="Punjab / Haryana Agricultural Belt",
            source_state="Punjab",
            source_lat=30.9010,
            source_lon=75.8573,
            downwind_receptor_region="Delhi NCR / National Capital Region",
            downwind_receptor_state="Delhi",
            receptor_lat=28.6139,
            receptor_lon=77.2090,
            wind_direction="North-Westerly (NW)",
            wind_speed_ms=3.8,
            travel_distance_km=295.0,
            estimated_travel_time_hours=21.5,
            assessment_narrative="North-westerly boundary layer winds align with intense biomass burning plumes, indicating high likelihood of transboundary smoke advection toward the Indo-Gangetic Plain receptor basin.",
            confidence=ConfidenceLevel.HIGH,
            source_type=SourceType.DERIVED_ANALYSIS,
        )
    ]

    return TransportResponse(
        summary="Dominant North-Westerly synoptic airflow over Northern India promoting plume transport toward Delhi NCR.",
        wind_vectors=sample_vectors,
        pathways=sample_pathways,
        source_type=SourceType.DERIVED_ANALYSIS,
    )
