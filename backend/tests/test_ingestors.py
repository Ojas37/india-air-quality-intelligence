import pytest
import pandas as pd
import numpy as np
from backend.app.data.ingestors.cpcb import CPCBIngestor
from backend.app.data.ingestors.insat import INSATIngestor
from backend.app.data.ingestors.tropomi import TROPOMIIngestor
from backend.app.data.ingestors.firms import FIRMSIngestor
from backend.app.data.ingestors.era5 import (
    ERA5Ingestor,
    calculate_relative_humidity,
    calculate_wind_dynamics,
)
from backend.app.data.processors.cleaner import DataCleaner
from backend.app.data.catalog.catalog import DataCatalog


def test_cpcb_ingestion_and_cleaning():
    ingestor = CPCBIngestor()
    raw = ingestor.fetch()
    assert len(raw) > 0
    assert ingestor.validate(raw) is True

    cleaned = ingestor.clean(raw)
    assert "aqi" in cleaned.columns
    assert "aqi_category" in cleaned.columns
    assert "dominant_pollutant" in cleaned.columns
    # Ensure no negative concentrations
    assert (cleaned["pm25"].dropna() >= 0).all()
    # Check that Delhi Anand Vihar is present and mapped to Poor/Very Poor
    anand_vihar = cleaned[cleaned["station_id"] == "DL001"].iloc[0]
    assert anand_vihar["aqi"] > 200


def test_insat_aod_qa_filtering():
    ingestor = INSATIngestor()
    raw = ingestor.fetch()
    assert ingestor.validate(raw) is True

    cleaned = ingestor.clean(raw)
    # Ensure all kept records have qc_flag == 0 (cloud-free)
    assert (cleaned["qc_flag"] == 0).all()
    # AOD within physical bounds
    assert (cleaned["aod_550nm"] >= 0.0).all()
    assert (cleaned["aod_550nm"] <= 3.5).all()


def test_tropomi_trace_gases_qa_filtering():
    ingestor = TROPOMIIngestor()
    raw = ingestor.fetch()
    assert ingestor.validate(raw) is True

    cleaned = ingestor.clean(raw)
    # Ensure low quality (qa_value <= 0.5) like Odisha cloud edge point is excluded
    assert (cleaned["qa_value"] > 0.5).all()
    assert "hcho_anomaly_sigma" in cleaned.columns
    assert "hcho_level" in cleaned.columns
    # Ludhiana should be classified as High HCHO
    ludhiana = cleaned[cleaned["region"].str.contains("Ludhiana")].iloc[0]
    assert ludhiana["hcho_level"] == "High"


def test_firms_fire_ingestion():
    ingestor = FIRMSIngestor()
    raw = ingestor.fetch()
    assert ingestor.validate(raw) is True

    cleaned = ingestor.clean(raw)
    # Ensure low confidence test fire (<50%) was removed
    assert (cleaned["confidence"] >= 50).all()
    assert (cleaned["frp_mw"] > 0).all()
    assert "confidence_class" in cleaned.columns


def test_era5_meteorology_and_wind_math():
    # Test August-Roche-Magnus RH derivation
    rh_dry = calculate_relative_humidity(temp_c=30.0, dewpoint_c=10.0)
    rh_sat = calculate_relative_humidity(temp_c=25.0, dewpoint_c=25.0)
    assert 25.0 <= rh_dry <= 35.0
    assert rh_sat == 100.0

    # Test North-Westerly wind (u > 0, v < 0)
    speed, deg, cardinal = calculate_wind_dynamics(u=3.0, v=-3.0)
    assert 4.2 <= speed <= 4.3
    assert 310.0 <= deg <= 320.0
    assert cardinal == "NW"

    ingestor = ERA5Ingestor()
    raw = ingestor.fetch()
    assert ingestor.validate(raw) is True
    cleaned = ingestor.clean(raw)
    assert "relative_humidity" in cleaned.columns
    assert "wind_speed" in cleaned.columns
    assert "wind_direction_cardinal" in cleaned.columns


def test_data_cleaner_utilities():
    df = pd.DataFrame({
        "lat": [28.6, 19.0, 50.0, -10.0, 13.0, 22.5],  # 50.0 and -10.0 are out of India
        "lon": [77.2, 72.8, 80.0, 75.0, 80.2, 88.3],
        "val": [10.0, 12.0, 11.0, 10.5, 11.5, 500.0],
    })
    clipped = DataCleaner.filter_geographic_bounds(df)
    assert len(clipped) == 4  # Delhi, Mumbai, Chennai, Kolkata

    clean_outliers = DataCleaner.detect_outliers_zscore(df, column="val", threshold=2.0)
    assert pd.isna(clean_outliers.loc[5, "val"])


def test_catalog_tracking():
    catalog = DataCatalog()
    all_datasets = catalog.list_all()
    assert len(all_datasets) >= 5

    cpcb_meta = catalog.get("cpcb_caaqms")
    assert cpcb_meta is not None
    assert cpcb_meta.status in ["AVAILABLE", "LIVE"]
