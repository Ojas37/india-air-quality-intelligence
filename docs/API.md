# AIMLess — API Specification (`/api/v1/`)

This document defines the REST API contract for the **AIMLess: India Air Quality & Pollution Intelligence Platform**.

All endpoints adhere to versioned routing under `/api/v1/`, strict JSON/GeoJSON payload serialization, and standard scientific metadata classification.

---

## 1. Scientific Data Taxonomy

Every response payload containing environmental metrics includes a `source_type` classification:

- `Observed`: Physical in-situ measurement from calibrated CPCB / SPCB ground monitoring stations.
- `Satellite Observed`: Remote-sensing columnar density or radiant power (e.g. Sentinel-5P TROPOMI, INSAT-3D/3DR, NASA FIRMS).
- `AI Estimated`: Statistical/machine learning surface estimation (e.g. XGBoost $\text{PM}_{2.5}$ model inference).
- `Derived Analysis`: Analytical or physical modeling (e.g. ERA5 wind plume trajectory, HCHO-fire spatial correlation).

---

## 2. API Endpoints Overview

### Health & Metadata
- **`GET /api/v1/health`**
  - Returns backend health, version, uptime, and dataset freshness timestamps.
  - Response:
    ```json
    {
      "status": "healthy",
      "version": "1.0.0",
      "demo_mode": false,
      "timestamp": "2026-09-10T11:00:00Z",
      "data_freshness": {
        "cpcb": "2026-09-10T10:30:00Z",
        "tropomi": "2026-09-10T08:00:00Z",
        "insat": "2026-09-10T10:00:00Z",
        "firms": "2026-09-10T09:15:00Z",
        "era5": "2026-09-10T06:00:00Z"
      }
    }
    ```

---

### Air Quality (`/api/v1/air-quality`)

- **`GET /api/v1/air-quality/stations`**
  - Returns active CPCB ground monitoring stations with latest observed criteria pollutants.
  - Parameters:
    - `state` (optional string): Filter by state.
    - `bbox` (optional string): `min_lon,min_lat,max_lon,max_lat` bounding box.
  - Response: GeoJSON FeatureCollection of stations with properties (`station_id`, `name`, `city`, `state`, `aqi`, `category`, `pm25`, `pm10`, `no2`, `so2`, `co`, `o3`, `observed_at`).

- **`GET /api/v1/air-quality/prediction`**
  - Evaluates AI surface-level $\text{PM}_{2.5}$ and derived NAQI for arbitrary coordinates (including unmonitored regions).
  - Parameters:
    - `lat` (float, required): Latitude (e.g. `28.6139`)
    - `lon` (float, required): Longitude (e.g. `77.2090`)
  - Response:
    ```json
    {
      "location": { "lat": 28.6139, "lon": 77.2090, "region_name": "New Delhi" },
      "prediction": {
        "pm25": 142.5,
        "pm25_unit": "µg/m³",
        "aqi": 317,
        "category": "Very Poor",
        "confidence_score": 0.88,
        "confidence_interval_95": [128.2, 156.8],
        "source_type": "AI Estimated"
      },
      "feature_contributions": [
        { "feature": "aod_insat", "contribution": 0.42, "description": "High columnar aerosol optical depth" },
        { "feature": "pblh_era5", "contribution": 0.28, "description": "Low planetary boundary layer trapping pollutants" },
        { "feature": "fire_frp_25km", "contribution": 0.18, "description": "Upwind active fire radiative power" },
        { "feature": "wind_speed", "contribution": -0.12, "description": "Low surface ventilation" }
      ],
      "model_version": "xgboost-v1.0"
    }
    ```

- **`GET /api/v1/air-quality/grid`**
  - Returns regularized 10km resolution spatial mesh over India with AI-estimated $\text{PM}_{2.5}$ and AQI categories.
  - Parameters:
    - `bbox` (string, optional): Spatial bounding box filter.
    - `zoom` (int, optional): Map zoom level to determine spatial resolution LOD.

- **`GET /api/v1/air-quality/timeseries`**
  - Returns 24-hour diurnal or 7-day multi-pollutant timeseries for a given location.
  - Parameters:
    - `lat` (float), `lon` (float), `range` (`24h` | `7d` | `30d`)

---

### HCHO Hotspot Intelligence (`/api/v1/hcho`)

- **`GET /api/v1/hcho/hotspots`**
  - Returns detected spatial Formaldehyde ($\text{HCHO}$) anomalies from Sentinel-5P TROPOMI.
  - Parameters:
    - `min_correlation` (optional string): Filter by fire correlation (*Strong, Moderate, Weak, None*).
  - Response:
    ```json
    [
      {
        "id": "hcho-hotspot-01",
        "lat": 30.9010,
        "lon": 75.8573,
        "region": "Ludhiana Agricultural Belt",
        "state": "Punjab",
        "hcho_column": 18.4,
        "hcho_unit": "10^-5 mol/m²",
        "hcho_anomaly_sigma": 3.2,
        "nearby_fires_25km": 42,
        "total_frp_mw": 850.5,
        "fire_correlation": "Strong",
        "source_classification": "Potential agricultural residue burning",
        "confidence": "High",
        "source_type": "Derived Analysis"
      }
    ]
    ```

---

### Fire Activity (`/api/v1/fires`)

- **`GET /api/v1/fires/recent`**
  - Returns active thermal anomalies detected by NASA FIRMS (MODIS / VIIRS).
  - Parameters:
    - `confidence` (optional string): `High`, `Medium`, `Low`, `All`
    - `fire_type` (optional string): `Agricultural`, `Forest`, `Industrial`, `All`
    - `bbox` (optional string): Bounding box.

- **`GET /api/v1/fires/state-summary`**
  - Returns aggregated active fire statistics grouped by state.

---

### Pollution Transport (`/api/v1/transport`)

- **`GET /api/v1/transport/wind`**
  - Returns regularized ERA5 $u/v$ wind vector grid for animated map visualization.
  - Returns array of `{ lat, lon, u, v, speed_ms, direction_deg }`.

- **`GET /api/v1/transport/pathways`**
  - Returns estimated transboundary pollutant transport pathways.
  - Phrasing standard: *"Potential transport pathway"* with distance, estimated travel time, and pathway confidence score.

---

### Data Sources Catalog (`/api/v1/datasets`)

- **`GET /api/v1/datasets`**
  - Returns detailed status, update frequency, spatial resolution, and connection status for all integrated scientific providers (CPCB, TROPOMI, INSAT, FIRMS, ERA5).

---

### Geography & Search (`/api/v1/geography`)

- **`GET /api/v1/geography/search`**
  - Fast location autocomplete across thousands of Indian cities, districts, talukas, and villages.
  - Parameter: `q` (string, min 2 chars).
