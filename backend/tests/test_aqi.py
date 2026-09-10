import pytest
from backend.app.core.aqi import (
    calculate_sub_index,
    get_aqi_category,
    calculate_composite_aqi,
    AQICategory,
)


def test_pm25_sub_indices():
    # Good range (0 - 30 µg/m³ -> 0 - 50 AQI)
    assert calculate_sub_index("pm25", 0.0) == 0
    assert calculate_sub_index("pm25", 15.0) == 25
    assert calculate_sub_index("pm25", 30.0) == 50

    # Satisfactory range (31 - 60 µg/m³ -> 51 - 100 AQI)
    assert calculate_sub_index("pm25", 45.0) == 75
    assert calculate_sub_index("pm25", 60.0) == 100

    # Moderate range (61 - 90 µg/m³ -> 101 - 200 AQI)
    assert calculate_sub_index("pm25", 75.0) == 150
    assert calculate_sub_index("pm25", 90.0) == 200

    # Poor range (91 - 120 µg/m³ -> 201 - 300 AQI)
    assert calculate_sub_index("pm25", 105.0) == 250
    assert calculate_sub_index("pm25", 120.0) == 300

    # Very Poor range (121 - 250 µg/m³ -> 301 - 400 AQI)
    assert calculate_sub_index("pm25", 185.0) == 350
    assert calculate_sub_index("pm25", 250.0) == 400

    # Severe range (250+ µg/m³ -> 401 - 500 AQI)
    assert calculate_sub_index("pm25", 375.0) == 450
    assert calculate_sub_index("pm25", 600.0) == 500


def test_aqi_category_mapping():
    assert get_aqi_category(25) == AQICategory.GOOD
    assert get_aqi_category(50) == AQICategory.GOOD
    assert get_aqi_category(75) == AQICategory.SATISFACTORY
    assert get_aqi_category(100) == AQICategory.SATISFACTORY
    assert get_aqi_category(150) == AQICategory.MODERATE
    assert get_aqi_category(200) == AQICategory.MODERATE
    assert get_aqi_category(250) == AQICategory.POOR
    assert get_aqi_category(300) == AQICategory.POOR
    assert get_aqi_category(350) == AQICategory.VERY_POOR
    assert get_aqi_category(400) == AQICategory.VERY_POOR
    assert get_aqi_category(450) == AQICategory.SEVERE
    assert get_aqi_category(500) == AQICategory.SEVERE


def test_composite_aqi_calculation():
    # PM2.5 is dominant
    pollutants = {
        "pm25": 110.0,  # AQI ~267 (Poor)
        "pm10": 80.0,   # AQI ~80 (Satisfactory)
        "no2": 35.0,    # AQI ~44 (Good)
    }
    aqi, category, dominant = calculate_composite_aqi(pollutants)
    assert category == AQICategory.POOR
    assert dominant == "PM25"
    assert 260 <= aqi <= 270


def test_invalid_pollutant_handling():
    assert calculate_sub_index("unknown_pollutant", 50.0) is None
    assert calculate_sub_index("pm25", -10.0) is None
