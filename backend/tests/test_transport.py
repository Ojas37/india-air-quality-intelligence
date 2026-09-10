import pytest
import pandas as pd
from backend.app.geospatial.wind import WindTrajectoryEngine
from backend.app.services.transport_service import get_transport_service
from backend.app.schemas.common import ConfidenceLevel


def test_wind_trajectory_engine():
    era5_df = pd.DataFrame([
        {"lat": 30.0, "lon": 76.0, "u10": 3.0, "v10": -2.0, "wind_speed": 3.6, "wind_direction_deg": 303.0},
        {"lat": 28.5, "lon": 77.0, "u10": 2.5, "v10": -1.5, "wind_speed": 2.9, "wind_direction_deg": 309.0},
    ])
    engine = WindTrajectoryEngine(era5_df)

    # Test forward trajectory from Ludhiana (30.9, 75.8) for 6 hours
    trajectory = engine.compute_forward_trajectory(
        start_lat=30.9, start_lon=75.8, duration_hours=6.0, step_hours=1.0
    )

    assert len(trajectory) == 7  # 0 to 6 hours
    assert trajectory[0]["cumulative_distance_km"] == 0.0
    # Plume should move southward (decreasing lat, negative v) and eastward (increasing lon, positive u)
    assert trajectory[-1]["lat"] < trajectory[0]["lat"]
    assert trajectory[-1]["lon"] > trajectory[0]["lon"]
    assert trajectory[-1]["cumulative_distance_km"] > 40.0


def test_transport_service_pathways():
    service = get_transport_service()
    res = service.get_transport_analysis()

    assert len(res.wind_vectors) > 0
    assert len(res.pathways) > 0
    assert "North-Westerly" in res.summary

    # Check Primary NW Agricultural Fire -> Delhi pathway
    nw_pathway = next((p for p in res.pathways if p.id == "pathway-001"), None)
    assert nw_pathway is not None
    assert "Punjab" in nw_pathway.source_state
    assert "Delhi" in nw_pathway.downwind_receptor_state
    assert 250.0 <= nw_pathway.travel_distance_km <= 330.0
    assert 18.0 <= nw_pathway.estimated_travel_time_hours <= 25.0
    assert nw_pathway.confidence == ConfidenceLevel.HIGH
    assert "potential transport pathway" in nw_pathway.assessment_narrative.lower() or "likelihood of transboundary smoke" in nw_pathway.assessment_narrative.lower()


def test_transport_secondary_pathways():
    service = get_transport_service()
    res = service.get_transport_analysis()

    # Check industrial and petrochemical pathways
    industrial_pathway = next((p for p in res.pathways if p.id == "pathway-002"), None)
    assert industrial_pathway is not None
    assert "Ghaziabad" in industrial_pathway.source_region

    petro_pathway = next((p for p in res.pathways if p.id == "pathway-003"), None)
    assert petro_pathway is not None
    assert "Vadodara" in petro_pathway.source_region
