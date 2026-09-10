from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from backend.app.schemas.common import SourceType


class FirePoint(BaseModel):
    id: str
    latitude: float
    longitude: float
    confidence: str  # "High", "Medium", "Low"
    fire_type: str  # "Agricultural", "Forest", "Industrial", "Unknown"
    state: str
    district: Optional[str] = None
    frp_mw: float = Field(..., description="Fire Radiative Power in MegaWatts")
    brightness_kelvin: float
    satellite: str  # "VIIRS-S-NPP", "VIIRS-NOAA20", "MODIS-Terra", "MODIS-Aqua"
    daynight: str = "D"
    detected_at: datetime
    source_type: SourceType = SourceType.SATELLITE_OBSERVED


class StateFireSummary(BaseModel):
    state: str
    active_fires: int
    high_confidence: int
    agricultural_fires: int
    forest_fires: int
    total_frp_mw: float


class FireListResponse(BaseModel):
    total_fires: int
    high_confidence_count: int
    total_frp_mw: float
    fires: List[FirePoint]
    state_summaries: List[StateFireSummary]
    source_type: SourceType = SourceType.SATELLITE_OBSERVED
    timestamp: datetime = Field(default_factory=datetime.utcnow)
