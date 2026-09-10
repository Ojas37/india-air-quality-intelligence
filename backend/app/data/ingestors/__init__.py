"""
Dataset ingestors for CPCB, INSAT-3D, TROPOMI, NASA FIRMS, and ERA5.
"""
from backend.app.data.ingestors.base import BaseIngestor
from backend.app.data.ingestors.cpcb import CPCBIngestor
from backend.app.data.ingestors.insat import INSATIngestor
from backend.app.data.ingestors.tropomi import TROPOMIIngestor
from backend.app.data.ingestors.firms import FIRMSIngestor
from backend.app.data.ingestors.era5 import ERA5Ingestor

__all__ = [
    "BaseIngestor",
    "CPCBIngestor",
    "INSATIngestor",
    "TROPOMIIngestor",
    "FIRMSIngestor",
    "ERA5Ingestor",
]
