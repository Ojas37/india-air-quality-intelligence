from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime
from backend.app.schemas.hcho import HCHOHotspot, HCHOHotspotsResponse
from backend.app.schemas.common import SourceType, ConfidenceLevel

router = APIRouter()


from backend.app.services.hcho_service import get_hcho_service


@router.get("/hotspots", response_model=HCHOHotspotsResponse)
async def get_hcho_hotspots(
    correlation_filter: Optional[str] = Query(None, description="Filter by correlation: Strong, Moderate, Weak, None"),
):
    """
    Returns detected TROPOMI HCHO anomalies and their correlation with active FIRMS fires.
    """
    service = get_hcho_service()
    return service.detect_hotspots(correlation_filter=correlation_filter)

