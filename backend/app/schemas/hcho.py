from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from backend.app.schemas.common import SourceType, ConfidenceLevel


class HCHOHotspot(BaseModel):
    id: str
    latitude: float
    longitude: float
    region: str
    state: str
    district: Optional[str] = None
    
    # Satellite Measurements
    hcho_column: float = Field(..., description="Tropospheric HCHO column (10^-5 mol/m²)")
    hcho_anomaly_sigma: float = Field(..., description="Anomaly in standard deviations over regional baseline")
    hcho_level: str  # "High", "Elevated", "Moderate", "Low"
    
    # Fire Activity Link
    nearby_fires_25km: int = 0
    total_frp_mw: float = 0.0
    fire_correlation: str  # "Strong", "Moderate", "Weak", "None"
    
    # Scientific Attribution
    source_classification: str  # "Potential agricultural residue burning", "Potential industrial source", "Potential biogenic VOC emission"
    confidence: ConfidenceLevel
    notes: Optional[str] = None
    
    source_type: SourceType = SourceType.DERIVED_ANALYSIS
    detected_at: datetime = Field(default_factory=datetime.utcnow)


class HCHOHotspotsResponse(BaseModel):
    total_hotspots: int
    strong_fire_correlated: int
    hotspots: List[HCHOHotspot]
    source_type: SourceType = SourceType.DERIVED_ANALYSIS
    timestamp: datetime = Field(default_factory=datetime.utcnow)
