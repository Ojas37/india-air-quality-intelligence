from fastapi import APIRouter
from datetime import datetime
from backend.app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint returning system status and data freshness information.
    """
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "demo_mode": settings.DEMO_MODE,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "data_freshness": {
            "cpcb_stations": "2026-09-10T10:00:00Z",
            "insat_aod": "2026-09-10T09:30:00Z",
            "tropomi_hcho": "2026-09-10T08:00:00Z",
            "nasa_firms": "2026-09-10T09:15:00Z",
            "era5_meteorology": "2026-09-10T06:00:00Z",
        },
    }
