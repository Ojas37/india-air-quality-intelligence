from typing import Optional, List, Dict
from pydantic import BaseModel, Field
from datetime import datetime
from backend.app.schemas.common import SourceType, ConfidenceLevel


class StationProperties(BaseModel):
    station_id: str
    station_name: str
    city: str
    state: str
    latitude: float
    longitude: float
    aqi: int
    category: str
    dominant_pollutant: str
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    no2: Optional[float] = None
    so2: Optional[float] = None
    co: Optional[float] = None
    o3: Optional[float] = None
    last_updated: datetime
    source_type: SourceType = SourceType.OBSERVED


class FeatureContribution(BaseModel):
    feature: str
    contribution_ugm3: float
    percentage: float
    description: str


class PredictionResponse(BaseModel):
    latitude: float
    longitude: float
    region_name: Optional[str] = "Unmonitored Region"
    state: Optional[str] = None
    district: Optional[str] = None
    
    # Model PM2.5 Prediction
    pm25_pred: float = Field(..., description="Estimated PM2.5 in µg/m³")
    pm25_unit: str = "µg/m³"
    
    # Derived NAQI
    aqi_pred: int = Field(..., description="Estimated Indian NAQI index")
    aqi_category: str
    dominant_pollutant: str = "PM2.5"
    
    # Uncertainty & Confidence
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Model prediction confidence score")
    confidence_interval_95: List[float] = Field(..., description="[lower_bound, upper_bound] in µg/m³")
    confidence_level: ConfidenceLevel
    
    # Explainable AI (TreeSHAP)
    feature_contributions: List[FeatureContribution] = []
    
    # Metadata
    model_version: str = "xgboost-pm25-v1.0"
    source_type: SourceType = SourceType.AI_ESTIMATED
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    demo_mode: bool = False


class DiurnalHourPoint(BaseModel):
    hour: str
    observed_pm25: Optional[float] = None
    predicted_pm25: float
    aqi: int
    category: str


class TimeseriesResponse(BaseModel):
    region_name: str
    latitude: float
    longitude: float
    range_type: str = "24h"
    points: List[DiurnalHourPoint]
    source_type: SourceType = SourceType.AI_ESTIMATED
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class GridCellProperties(BaseModel):
    cell_id: str
    center_lat: float
    center_lon: float
    pm25: float
    aqi: int
    category: str
    confidence: float
    source_type: SourceType = SourceType.AI_ESTIMATED
