from fastapi import APIRouter
from datetime import datetime
from backend.app.schemas.transport import (
    TransportResponse,
    WindVectorPoint,
    TransportPathway,
)
from backend.app.schemas.common import SourceType, ConfidenceLevel

router = APIRouter()


from backend.app.services.transport_service import get_transport_service


@router.get("/wind", response_model=TransportResponse)
async def get_transport_analysis():
    """
    Returns ERA5 meteorological wind vectors and evaluated source-to-receptor transport pathways.
    """
    service = get_transport_service()
    return service.get_transport_analysis()


@router.get("/pathways")
async def get_pathways_only():
    """
    Returns list of evaluated transboundary pollution transport pathways.
    """
    service = get_transport_service()
    analysis = service.get_transport_analysis()
    return {"total_pathways": len(analysis.pathways), "pathways": analysis.pathways}

