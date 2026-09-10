import pytest
from backend.app.services.hcho_service import get_hcho_service
from backend.app.services.fire_service import get_fire_service
from backend.app.schemas.common import ConfidenceLevel


def test_fire_service_queries():
    fire_service = get_fire_service()
    res = fire_service.get_fires(confidence_filter="All", type_filter="All")

    assert res.total_fires > 0
    assert res.total_frp_mw > 0
    assert len(res.state_summaries) > 0

    # Test filtering by high confidence
    res_high = fire_service.get_fires(confidence_filter="High")
    assert res_high.total_fires <= res.total_fires
    for f in res_high.fires:
        assert f.confidence == "High"

    # Test filtering by agricultural type
    res_agri = fire_service.get_fires(type_filter="Agricultural")
    for f in res_agri.fires:
        assert f.fire_type == "Agricultural"


def test_hcho_hotspot_detection_and_correlation():
    hcho_service = get_hcho_service()
    res = hcho_service.detect_hotspots()

    assert res.total_hotspots > 0
    assert len(res.hotspots) > 0

    # Ensure hotspots are sorted by HCHO column descending
    for i in range(len(res.hotspots) - 1):
        assert res.hotspots[i].hcho_column >= res.hotspots[i+1].hcho_column

    # Check Ludhiana hotspot (should correlate strongly with agricultural fires)
    ludhiana = next((h for h in res.hotspots if "Ludhiana" in h.region or "Ludhiana" in h.district), None)
    assert ludhiana is not None
    assert ludhiana.fire_correlation == "Strong"
    assert "agricultural residue" in ludhiana.source_classification.lower()
    assert ludhiana.confidence == ConfidenceLevel.HIGH

    # Check Ghaziabad / Vadodara industrial hotspot (should have weak/none fire correlation but industrial classification)
    industrial = next((h for h in res.hotspots if "Ghaziabad" in h.region or "Vadodara" in h.region), None)
    assert industrial is not None
    assert industrial.fire_correlation in ["Weak", "None"]
    assert "industrial" in industrial.source_classification.lower() or "petrochemical" in industrial.source_classification.lower()


def test_hcho_correlation_filtering():
    hcho_service = get_hcho_service()
    res_strong = hcho_service.detect_hotspots(correlation_filter="Strong")

    for h in res_strong.hotspots:
        assert h.fire_correlation == "Strong"
