from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import os
import pandas as pd
from datetime import datetime
from backend.app.core.logging import logger
from backend.app.core.config import settings


class BaseIngestor(ABC):
    """
    Abstract Base Class for all environmental dataset adapters.
    Enforces standardized lifecycle: fetch -> validate -> clean -> save.
    """

    def __init__(self, dataset_id: str):
        self.dataset_id = dataset_id
        self.raw_dir = os.path.join(settings.RAW_DATA_DIR, dataset_id)
        self.processed_dir = os.path.join(settings.PROCESSED_DATA_DIR, dataset_id)
        os.makedirs(self.raw_dir, exist_ok=True)
        os.makedirs(self.processed_dir, exist_ok=True)

    @abstractmethod
    def fetch(self, **kwargs) -> Any:
        """Fetch or load raw data."""
        pass

    @abstractmethod
    def validate(self, data: Any) -> bool:
        """Validate format, schema, coordinates, and physical bounds."""
        pass

    @abstractmethod
    def clean(self, data: Any) -> pd.DataFrame:
        """Apply QA masks, outlier filtering, and coordinate normalization."""
        pass

    def save_raw(self, raw_data: Any, filename: str) -> str:
        """Persist raw payload for reproducibility."""
        path = os.path.join(self.raw_dir, filename)
        if isinstance(raw_data, pd.DataFrame):
            raw_data.to_csv(path, index=False)
        elif isinstance(raw_data, (dict, list)):
            import json
            with open(path, "w", encoding="utf-8") as f:
                json.dump(raw_data, f, indent=2, default=str)
        elif isinstance(raw_data, str):
            with open(path, "w", encoding="utf-8") as f:
                f.write(raw_data)
        logger.info(f"[{self.dataset_id}] Saved raw data to {path}")
        return path

    def save_processed(self, df: pd.DataFrame, filename_base: str) -> str:
        """Save normalized cleaned dataset as Parquet and GeoJSON/CSV."""
        parquet_path = os.path.join(self.processed_dir, f"{filename_base}.parquet")
        csv_path = os.path.join(self.processed_dir, f"{filename_base}.csv")

        # Save Parquet for fast analytics and ML loading
        df.to_parquet(parquet_path, index=False, engine="pyarrow")
        df.to_csv(csv_path, index=False)

        logger.info(f"[{self.dataset_id}] Processed {len(df)} records -> {parquet_path}")
        return parquet_path

    def run_pipeline(self, **kwargs) -> pd.DataFrame:
        """Execute the full ingestion and transformation pipeline."""
        logger.info(f"[{self.dataset_id}] Starting ingestion pipeline...")
        raw = self.fetch(**kwargs)
        if not self.validate(raw):
            raise ValueError(f"[{self.dataset_id}] Data validation failed!")
        
        cleaned_df = self.clean(raw)
        timestamp_str = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        self.save_processed(cleaned_df, f"{self.dataset_id}_latest")
        return cleaned_df
