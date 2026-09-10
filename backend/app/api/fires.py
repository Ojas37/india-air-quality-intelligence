from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime
from backend.app.schemas.fire import FirePoint, FireListResponse, StateFireSummary
from backend.app.schemas.common import SourceType

router = APIRouter()


from backend.app.services.fire_service import get_fire_service


@router.get("/recent", response_model=FireListResponse)
async def get_recent_fires(
    confidence: Optional[str] = Query("All", description="Filter by confidence: High, Medium, Low, All"),
    fire_type: Optional[str] = Query("All", description="Filter by fire type: Agricultural, Forest, Industrial, All"),
    state: Optional[str] = Query(None, description="Filter by state name"),
):
    """
    Returns active thermal anomalies and Fire Radiative Power (FRP) from NASA FIRMS.
    """
    service = get_fire_service()
    return service.get_fires(
        confidence_filter=confidence,
        type_filter=fire_type,
        state_filter=state,
    )

