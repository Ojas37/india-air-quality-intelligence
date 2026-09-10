"""
Central Pollution Control Board (CPCB) - Indian National Air Quality Index (NAQI)
Calculation Engine and Sub-Index Breakpoint Tables.

Formula:
    Ip = [(I_hi - I_lo) / (B_hi - B_lo)] * (Cp - B_lo) + I_lo

Where:
    Cp = Pollutant concentration
    B_hi = Breakpoint high concentration
    B_lo = Breakpoint low concentration
    I_hi = AQI sub-index high value
    I_lo = AQI sub-index low value
    Ip = Sub-index for the pollutant
"""

from typing import Dict, Optional, Tuple
from enum import Enum


class AQICategory(str, Enum):
    GOOD = "Good"
    SATISFACTORY = "Satisfactory"
    MODERATE = "Moderate"
    POOR = "Poor"
    VERY_POOR = "Very Poor"
    SEVERE = "Severe"


# Standard Breakpoint Table: (B_lo, B_hi, I_lo, I_hi)
BREAKPOINTS = {
    # PM2.5 (24-hr avg in µg/m³)
    "pm25": [
        (0.0, 30.0, 0, 50),
        (30.1, 60.0, 51, 100),
        (60.1, 90.0, 101, 200),
        (90.1, 120.0, 201, 300),
        (120.1, 250.0, 301, 400),
        (250.1, 500.0, 401, 500),
    ],
    # PM10 (24-hr avg in µg/m³)
    "pm10": [
        (0.0, 50.0, 0, 50),
        (50.1, 100.0, 51, 100),
        (100.1, 250.0, 101, 200),
        (250.1, 350.0, 201, 300),
        (350.1, 430.0, 301, 400),
        (430.1, 600.0, 401, 500),
    ],
    # NO2 (24-hr avg in µg/m³)
    "no2": [
        (0.0, 40.0, 0, 50),
        (40.1, 80.0, 51, 100),
        (80.1, 180.0, 101, 200),
        (180.1, 280.0, 201, 300),
        (280.1, 400.0, 301, 400),
        (400.1, 1000.0, 401, 500),
    ],
    # SO2 (24-hr avg in µg/m³)
    "so2": [
        (0.0, 40.0, 0, 50),
        (40.1, 80.0, 51, 100),
        (80.1, 380.0, 101, 200),
        (380.1, 800.0, 201, 300),
        (800.1, 1600.0, 301, 400),
        (1600.1, 2000.0, 401, 500),
    ],
    # CO (8-hr avg in mg/m³)
    "co": [
        (0.0, 1.0, 0, 50),
        (1.01, 2.0, 51, 100),
        (2.01, 10.0, 101, 200),
        (10.01, 17.0, 201, 300),
        (17.01, 34.0, 301, 400),
        (34.01, 50.0, 401, 500),
    ],
    # O3 (8-hr avg in µg/m³)
    "o3": [
        (0.0, 50.0, 0, 50),
        (50.1, 100.0, 51, 100),
        (100.1, 168.0, 101, 200),
        (168.1, 208.0, 201, 300),
        (208.1, 748.0, 301, 400),
        (748.1, 1000.0, 401, 500),
    ],
    # NH3 (24-hr avg in µg/m³)
    "nh3": [
        (0.0, 200.0, 0, 50),
        (200.1, 400.0, 51, 100),
        (400.1, 800.0, 101, 200),
        (800.1, 1200.0, 201, 300),
        (1200.1, 1800.0, 301, 400),
        (1800.1, 2400.0, 401, 500),
    ],
}

CATEGORY_METADATA = {
    AQICategory.GOOD: {
        "range": (0, 50),
        "color": "#16a34a",
        "description": "Minimal health impact",
    },
    AQICategory.SATISFACTORY: {
        "range": (51, 100),
        "color": "#84cc16",
        "description": "Minor breathing discomfort to sensitive people",
    },
    AQICategory.MODERATE: {
        "range": (101, 200),
        "color": "#eab308",
        "description": "Breathing discomfort to people with lungs, asthma and heart diseases",
    },
    AQICategory.POOR: {
        "range": (201, 300),
        "color": "#f97316",
        "description": "Breathing discomfort to most people on prolonged exposure",
    },
    AQICategory.VERY_POOR: {
        "range": (301, 400),
        "color": "#dc2626",
        "description": "Respiratory illness on prolonged exposure",
    },
    AQICategory.SEVERE: {
        "range": (401, 500),
        "color": "#7f1d1d",
        "description": "Affects healthy people and seriously impacts those with existing diseases",
    },
}


def calculate_sub_index(pollutant: str, concentration: float) -> Optional[int]:
    """
    Calculates the CPCB sub-index for a single pollutant concentration.
    """
    pollutant_key = pollutant.lower().replace(".", "")
    if pollutant_key not in BREAKPOINTS or concentration is None or concentration < 0:
        return None

    bp_list = BREAKPOINTS[pollutant_key]

    for b_lo, b_hi, i_lo, i_hi in bp_list:
        if b_lo <= concentration <= b_hi:
            sub_idx = ((i_hi - i_lo) / (b_hi - b_lo)) * (concentration - b_lo) + i_lo
            return int(round(sub_idx))

    # Cap if concentration exceeds highest breakpoint
    if concentration > bp_list[-1][1]:
        return 500

    return 0


def get_aqi_category(aqi: int) -> AQICategory:
    """
    Returns the AQICategory enum corresponding to an AQI integer value.
    """
    if aqi <= 50:
        return AQICategory.GOOD
    elif aqi <= 100:
        return AQICategory.SATISFACTORY
    elif aqi <= 200:
        return AQICategory.MODERATE
    elif aqi <= 300:
        return AQICategory.POOR
    elif aqi <= 400:
        return AQICategory.VERY_POOR
    else:
        return AQICategory.SEVERE


def calculate_composite_aqi(pollutants: Dict[str, float]) -> Tuple[int, AQICategory, str]:
    """
    Calculates composite Indian NAQI from available pollutant concentrations.
    According to CPCB rules, at least 3 pollutants must be available,
    one of which MUST be PM2.5 or PM10.

    Returns:
        Tuple of (overall_aqi, category, dominant_pollutant)
    """
    sub_indices = {}
    for p, val in pollutants.items():
        if val is not None:
            si = calculate_sub_index(p, val)
            if si is not None:
                sub_indices[p.lower()] = si

    if not sub_indices:
        return (0, AQICategory.GOOD, "None")

    dominant = max(sub_indices.items(), key=lambda x: x[1])
    overall_aqi = min(500, max(0, dominant[1]))
    category = get_aqi_category(overall_aqi)

    return (overall_aqi, category, dominant[0].upper())
