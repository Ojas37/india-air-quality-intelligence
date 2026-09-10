from enum import Enum
from typing import Optional, List, Dict, Any, Generic, TypeVar
from pydantic import BaseModel, Field
from datetime import datetime

T = TypeVar("T")


class SourceType(str, Enum):
    OBSERVED = "Observed"
    SATELLITE_OBSERVED = "Satellite Observed"
    AI_ESTIMATED = "AI Estimated"
    DERIVED_ANALYSIS = "Derived Analysis"


class ConfidenceLevel(str, Enum):
    HIGH = "High"
    MODERATE = "Moderate"
    LOW = "Low"


class Coordinate(BaseModel):
    lat: float = Field(..., description="Latitude in decimal degrees", ge=-90.0, le=90.0)
    lon: float = Field(..., description="Longitude in decimal degrees", ge=-180.0, le=180.0)


class GeoJSONGeometry(BaseModel):
    type: str = "Point"
    coordinates: List[float]  # [lon, lat]


class GeoJSONFeature(BaseModel, Generic[T]):
    type: str = "Feature"
    geometry: GeoJSONGeometry
    properties: T


class GeoJSONFeatureCollection(BaseModel, Generic[T]):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature[T]]


class BaseResponse(BaseModel):
    success: bool = True
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    source_type: SourceType = SourceType.AI_ESTIMATED
    data_freshness: Optional[str] = None
    demo_mode: bool = False
