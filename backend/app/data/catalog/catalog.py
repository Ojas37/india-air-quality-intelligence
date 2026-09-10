import json
import os
from typing import Dict, List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field


class DatasetMetadata(BaseModel):
    dataset_id: str
    name: str
    provider: str
    parameters: List[str]
    spatial_coverage: str = "India (Subcontinent)"
    spatial_resolution: str
    temporal_frequency: str
    format: str
    raw_path: Optional[str] = None
    processed_path: Optional[str] = None
    quality_flags: List[str] = []
    total_records: int = 0
    last_ingested_at: Optional[datetime] = None
    status: str = "AVAILABLE"  # LIVE, AVAILABLE, BENCHMARK, ERROR


class DataCatalog:
    """
    Catalog manager tracking ingested datasets, schema versions, and freshness.
    """

    def __init__(self, catalog_path: Optional[str] = None):
        self.catalog_path = catalog_path or os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
            "data",
            "catalog.json",
        )
        self._registry: Dict[str, DatasetMetadata] = {}
        self._load()

    def _load(self):
        if os.path.exists(self.catalog_path):
            try:
                with open(self.catalog_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for k, v in data.items():
                        self._registry[k] = DatasetMetadata(**v)
            except Exception:
                self._initialize_defaults()
        else:
            self._initialize_defaults()

    def _initialize_defaults(self):
        defaults = [
            DatasetMetadata(
                dataset_id="cpcb_caaqms",
                name="CPCB Continuous Ambient Air Quality Monitoring",
                provider="Central Pollution Control Board",
                parameters=["PM2.5", "PM10", "NO2", "SO2", "CO", "O3", "NH3"],
                spatial_resolution="Point in-situ",
                temporal_frequency="15-minute / Hourly",
                format="CSV / JSON",
                quality_flags=["qa_status=Valid", "negative_value_filter=True", "range_check=Passed"],
                status="AVAILABLE",
            ),
            DatasetMetadata(
                dataset_id="insat_aod",
                name="INSAT-3D / INSAT-3DR Aerosol Optical Depth",
                provider="ISRO MOSDAC",
                parameters=["AOD_550nm"],
                spatial_resolution="0.05° (~5 km)",
                temporal_frequency="30-min",
                format="HDF5 / GeoParquet",
                quality_flags=["qc_flag=0 (High Quality)", "cloud_mask=Clear"],
                status="AVAILABLE",
            ),
            DatasetMetadata(
                dataset_id="tropomi_trace_gases",
                name="Copernicus Sentinel-5P TROPOMI Trace Gases",
                provider="ESA / Copernicus",
                parameters=["HCHO", "NO2", "SO2", "CO", "O3"],
                spatial_resolution="5.5 × 3.5 km²",
                temporal_frequency="Daily",
                format="NetCDF / GeoParquet",
                quality_flags=["qa_value>0.5", "cloud_fraction<0.3"],
                status="AVAILABLE",
            ),
            DatasetMetadata(
                dataset_id="nasa_firms",
                name="NASA FIRMS Active Fires & FRP",
                provider="NASA LANCE (MODIS / VIIRS)",
                parameters=["FRP_MW", "Brightness_Temp", "Confidence"],
                spatial_resolution="375m (VIIRS) / 1km (MODIS)",
                temporal_frequency="4-8 passes/day",
                format="GeoJSON / Parquet",
                quality_flags=["confidence>=50%", "day_night=D/N"],
                status="AVAILABLE",
            ),
            DatasetMetadata(
                dataset_id="era5_meteorology",
                name="ECMWF ERA5 Atmospheric Reanalysis",
                provider="Copernicus Climate Change Service",
                parameters=["u10", "v10", "t2m", "d2m", "pblh", "sp", "tp"],
                spatial_resolution="0.25° (~25 km)",
                temporal_frequency="Hourly",
                format="NetCDF / GeoParquet",
                quality_flags=["physical_bounds_check=Passed"],
                status="AVAILABLE",
            ),
        ]
        for d in defaults:
            self._registry[d.dataset_id] = d
        self.save()

    def register(self, metadata: DatasetMetadata):
        self._registry[metadata.dataset_id] = metadata
        self.save()

    def update_status(self, dataset_id: str, records: int, raw_path: str, processed_path: str):
        if dataset_id in self._registry:
            ds = self._registry[dataset_id]
            ds.total_records = records
            ds.raw_path = raw_path
            ds.processed_path = processed_path
            ds.last_ingested_at = datetime.utcnow()
            ds.status = "LIVE"
            self.save()

    def get(self, dataset_id: str) -> Optional[DatasetMetadata]:
        return self._registry.get(dataset_id)

    def list_all(self) -> List[DatasetMetadata]:
        return list(self._registry.values())

    def save(self):
        os.makedirs(os.path.dirname(self.catalog_path), exist_ok=True)
        with open(self.catalog_path, "w", encoding="utf-8") as f:
            data = {k: v.model_dump(mode="json") for k, v in self._registry.items()}
            json.dump(data, f, indent=2, default=str)
