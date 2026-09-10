from typing import List, Optional
from pydantic import BaseModel


class LocationMatch(BaseModel):
    region: str
    state: str
    district: Optional[str] = None
    type: str  # "City", "District", "Taluka", "Village", "Station"
    lat: float
    lon: float
    cpcb_station_nearby: bool = False
    approx_distance_to_station_km: Optional[float] = None


class SearchResponse(BaseModel):
    query: str
    total_matches: int
    results: List[LocationMatch]
