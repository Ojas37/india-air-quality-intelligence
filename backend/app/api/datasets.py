from fastapi import APIRouter
from datetime import datetime
from backend.app.schemas.dataset import DatasetListResponse, DatasetInfo
from backend.app.core.config import settings

router = APIRouter()


@router.get("", response_model=DatasetListResponse)
async def list_datasets():
    """
    Returns inventory and status of all connected scientific data providers.
    """
    datasets = [
        DatasetInfo(
            id="cpcb-caaqms",
            name="CPCB Continuous Ambient Air Quality Monitoring",
            short_name="CPCB CAAQMS",
            provider="Central Pollution Control Board (Govt of India)",
            description="High-precision ground-based monitoring network providing continuous in-situ measurements of criteria pollutants.",
            parameters=["PM2.5", "PM10", "NO2", "SO2", "CO", "O3", "NH3"],
            spatial_resolution="Point in-situ (~680 stations)",
            temporal_frequency="15-minute / Hourly",
            status="Connected",
            last_ingested=datetime.utcnow(),
        ),
        DatasetInfo(
            id="insat-3d-aod",
            name="INSAT-3D / INSAT-3DR Aerosol Optical Depth",
            short_name="INSAT AOD",
            provider="ISRO MOSDAC",
            description="Geostationary meteorological satellite observations providing high-cadence AOD at 550nm over the Indian subcontinent.",
            parameters=["AOD_550nm"],
            spatial_resolution="0.05° × 0.05° (~5 km)",
            temporal_frequency="30 minutes",
            status="Connected",
            last_ingested=datetime.utcnow(),
        ),
        DatasetInfo(
            id="sentinel-5p-tropomi",
            name="Copernicus Sentinel-5P TROPOMI Trace Gases",
            short_name="S-5P TROPOMI",
            provider="ESA / Copernicus",
            description="Hyperspectral atmospheric imaging spectrometer measuring vertical column densities of trace gas pollutants.",
            parameters=["HCHO", "NO2", "SO2", "CO", "O3"],
            spatial_resolution="5.5 × 3.5 km²",
            temporal_frequency="Daily (13:30 local pass)",
            status="Connected",
            last_ingested=datetime.utcnow(),
        ),
        DatasetInfo(
            id="nasa-firms",
            name="NASA FIRMS Active Fire & Thermal Anomalies",
            short_name="NASA FIRMS",
            provider="NASA LANCE",
            description="Near real-time active fire locations and Fire Radiative Power (FRP) derived from MODIS and VIIRS sensors.",
            parameters=["Fire Radiative Power (MW)", "Brightness Temperature", "Confidence"],
            spatial_resolution="375m (VIIRS) / 1km (MODIS)",
            temporal_frequency="4-8 daily satellite passes",
            status="Connected",
            last_ingested=datetime.utcnow(),
        ),
        DatasetInfo(
            id="ecmwf-era5",
            name="ECMWF ERA5 Atmospheric Reanalysis & Meteorology",
            short_name="ERA5 Weather",
            provider="Copernicus Climate Change Service",
            description="Global atmospheric reanalysis providing comprehensive meteorological fields, wind vectors, and boundary layer heights.",
            parameters=["u/v wind", "Temperature", "Dewpoint", "PBL Height", "Surface Pressure", "Precipitation"],
            spatial_resolution="0.25° × 0.25° (~25 km)",
            temporal_frequency="Hourly",
            status="Connected",
            last_ingested=datetime.utcnow(),
        ),
    ]

    return DatasetListResponse(
        datasets=datasets,
        demo_mode=settings.DEMO_MODE,
        timestamp=datetime.utcnow(),
    )
