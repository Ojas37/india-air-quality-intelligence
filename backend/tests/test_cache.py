import time
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.cache import TTLCache, cached, memory_cache

client = TestClient(app)


def test_ttl_cache_basic_operations():
    cache = TTLCache(maxsize=10, default_ttl_seconds=2)
    cache.set("key1", "val1")
    assert cache.get("key1") == "val1"
    assert cache.get("non_existent") is None

    stats = cache.stats
    assert stats["hits"] == 1
    assert stats["misses"] == 1
    assert stats["size"] == 1


def test_ttl_cache_expiry():
    cache = TTLCache(maxsize=10, default_ttl_seconds=1)
    cache.set("exp_key", "exp_val", ttl_seconds=1)
    assert cache.get("exp_key") == "exp_val"

    time.sleep(1.1)
    assert cache.get("exp_key") is None


def test_ttl_cache_decorator():
    call_count = 0

    @cached(ttl_seconds=5, key_prefix="test_func")
    def compute(x: int):
        nonlocal call_count
        call_count += 1
        return x * 2

    # First call
    res1 = compute(10)
    assert res1 == 20
    assert call_count == 1

    # Second call (cached)
    res2 = compute(10)
    assert res2 == 20
    assert call_count == 1

    # Different arg
    res3 = compute(20)
    assert res3 == 40
    assert call_count == 2


def test_air_quality_grid_endpoint():
    response = client.get(
        "/api/v1/air-quality/grid?min_lat=28.0&min_lon=77.0&max_lat=28.5&max_lon=77.5&step_deg=0.5"
    )
    assert response.status_code == 200
    data = response.json()
    assert "cells" in data
    assert len(data["cells"]) > 0
    assert data["source_type"] == "AI Estimated"
    assert "pm25_pred" in data["cells"][0]
    assert "confidence_score" in data["cells"][0]


def test_air_quality_metrics_endpoint():
    response = client.get("/api/v1/air-quality/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "xgboost" in data or "mae" in str(data) or "R2" in str(data)
