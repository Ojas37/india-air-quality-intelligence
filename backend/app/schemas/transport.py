from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from backend.app.schemas.common import SourceType, ConfidenceLevel


class WindVectorPoint(BaseModel):
    latitude: float
    longitude: float
    u_ms: float = Field(..., description="Zonal eastward wind component (m/s)")
    v_ms: float = Field(..., description="Meridional northward wind component (m/s)")
    speed_ms: float = Field(..., description="Scalar wind speed (m/s)")
    direction_deg: float = Field(..., description="Compass wind direction (0-360 deg)")
    direction_cardinal: str  # "NW", "W", "SE", etc.
    source_type: SourceType = SourceType.SATELLITE_OBSERVED


class TransportPathway(BaseModel):
    id: str
    source_region: str
    source_state: str
    source_lat: float
    source_lon: float
    
    downwind_receptor_region: str
    downwind_receptor_state: str
    receptor_lat: float
    receptor_lon: float
    
    wind_direction: str
    wind_speed_ms: float
    travel_distance_km: float
    estimated_travel_time_hours: float
    
    assessment_narrative: str
    confidence: ConfidenceLevel
    source_type: SourceType = SourceType.DERIVED_ANALYSIS


class TransportResponse(BaseModel):
    summary: str
    wind_vectors: List[WindVectorPoint]
    pathways: List[TransportPathway]
    source_type: SourceType = SourceType.DERIVED_ANALYSIS
    timestamp: datetime = Field(default_factory=datetime.utcnow)
