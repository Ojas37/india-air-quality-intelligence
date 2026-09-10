from fastapi import APIRouter
from backend.app.api import health, air_quality, hcho, fires, transport, datasets, geography

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(air_quality.router, prefix="/air-quality", tags=["Air Quality"])
api_router.include_router(hcho.router, prefix="/hcho", tags=["HCHO Hotspots"])
api_router.include_router(fires.router, prefix="/fires", tags=["Active Fires"])
api_router.include_router(transport.router, prefix="/transport", tags=["Pollution Transport"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["Datasets"])
api_router.include_router(geography.router, prefix="/geography", tags=["Geography & Search"])
