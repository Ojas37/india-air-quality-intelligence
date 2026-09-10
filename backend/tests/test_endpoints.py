from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "data_freshness" in data
    assert "cpcb_stations" in data["data_freshness"]


def test_stations_endpoint():
    response = client.get("/api/v1/air-quality/stations")
    assert response.status_code == 200
    data = response.json()
    assert "stations" in data
    assert len(data["stations"]) > 0
    assert data["stations"][0]["source_type"] == "Observed"


def test_prediction_endpoint():
    response = client.get("/api/v1/air-quality/prediction?lat=28.6139&lon=77.2090")
    assert response.status_code == 200
    data = response.json()
    assert data["pm25_pred"] > 0
    assert data["source_type"] == "AI Estimated"
    assert len(data["feature_contributions"]) > 0
    assert "confidence_score" in data


def test_hcho_hotspots_endpoint():
    response = client.get("/api/v1/hcho/hotspots")
    assert response.status_code == 200
    data = response.json()
    assert "hotspots" in data
    assert len(data["hotspots"]) > 0
    assert data["hotspots"][0]["source_type"] == "Derived Analysis"


def test_fires_endpoint():
    response = client.get("/api/v1/fires/recent")
    assert response.status_code == 200
    data = response.json()
    assert "fires" in data
    assert "state_summaries" in data
    assert data["source_type"] == "Satellite Observed"


def test_transport_endpoint():
    response = client.get("/api/v1/transport/wind")
    assert response.status_code == 200
    data = response.json()
    assert "wind_vectors" in data
    assert "pathways" in data


def test_datasets_endpoint():
    response = client.get("/api/v1/datasets")
    assert response.status_code == 200
    data = response.json()
    assert len(data["datasets"]) >= 5


def test_geography_search_endpoint():
    response = client.get("/api/v1/geography/search?q=Delhi")
    assert response.status_code == 200
    data = response.json()
    assert data["total_matches"] > 0
    assert data["results"][0]["region"] == "Delhi NCR"
