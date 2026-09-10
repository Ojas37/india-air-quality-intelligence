import os
import pandas as pd
from typing import Dict, Any
from datetime import datetime
from backend.app.core.logging import logger
from backend.app.core.config import settings
from backend.app.data.catalog.catalog import DataCatalog
from backend.app.data.ingestors.cpcb import CPCBIngestor
from backend.app.data.ingestors.insat import INSATIngestor
from backend.app.data.ingestors.tropomi import TROPOMIIngestor
from backend.app.data.ingestors.firms import FIRMSIngestor
from backend.app.data.ingestors.era5 import ERA5Ingestor


class IngestionPipeline:
    """
    Master data pipeline orchestrator coordinating all 5 environmental data streams.
    """

    def __init__(self):
        self.catalog = DataCatalog()
        self.ingestors = {
            "cpcb_caaqms": CPCBIngestor(),
            "insat_aod": INSATIngestor(),
            "tropomi_trace_gases": TROPOMIIngestor(),
            "nasa_firms": FIRMSIngestor(),
            "era5_meteorology": ERA5Ingestor(),
        }

    def run_all(self) -> Dict[str, Dict[str, Any]]:
        """
        Executes ingestion for all datasets and updates the central catalog.
        """
        results = {}
        logger.info("=== Starting Multi-Source Ingestion Pipeline ===")

        for ds_id, ingestor in self.ingestors.items():
            try:
                logger.info(f"Ingesting {ds_id}...")
                cleaned_df = ingestor.run_pipeline()
                
                # Update DataCatalog with fresh metrics
                raw_path = os.path.join(ingestor.raw_dir, f"{ingestor.dataset_id}_latest.csv")
                proc_path = os.path.join(ingestor.processed_dir, f"{ingestor.dataset_id}_latest.parquet")
                
                self.catalog.update_status(
                    dataset_id=ds_id,
                    records=len(cleaned_df),
                    raw_path=raw_path,
                    processed_path=proc_path,
                )

                results[ds_id] = {
                    "status": "SUCCESS",
                    "records": len(cleaned_df),
                    "columns": list(cleaned_df.columns),
                    "processed_path": proc_path,
                }
                logger.info(f"Successfully processed {len(cleaned_df)} records for {ds_id}")

            except Exception as e:
                logger.error(f"Error ingesting {ds_id}: {str(e)}", exc_info=True)
                results[ds_id] = {
                    "status": "ERROR",
                    "error": str(e),
                }

        logger.info("=== Multi-Source Ingestion Pipeline Finished ===")
        return results


def run_ingestion_cli():
    """Command-line entry point for scheduled or manual data ingestion."""
    pipeline = IngestionPipeline()
    summary = pipeline.run_all()
    for k, v in summary.items():
        print(f"[{v.get('status')}] {k}: {v.get('records', 0)} records")


if __name__ == "__main__":
    run_ingestion_cli()
