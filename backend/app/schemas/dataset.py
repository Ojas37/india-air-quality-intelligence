from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


class DatasetInfo(BaseModel):
    id: str
    name: str
    short_name: str
    provider: str
    description: str
    parameters: List[str]
    spatial_resolution: str
    temporal_frequency: str
    status: str  # "Live", "Connected", "Benchmark Dataset", "Planned"
    last_ingested: Optional[datetime] = None


class DatasetListResponse(BaseModel):
    datasets: List[DatasetInfo]
    demo_mode: bool = False
    timestamp: datetime
