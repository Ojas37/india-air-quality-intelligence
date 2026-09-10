# AIMLess — India Air Quality & Pollution Intelligence Platform
## Comprehensive Architecture & Engineering Blueprint

---

### 1. Executive Summary & SIH Mission

The **AIMLess (Air Intelligence & Monitoring Layer for Environmental Spatial Science)** platform is an AI-powered geospatial intelligence system engineered to address the critical spatial gaps in India's ground-based air quality monitoring network.

While Central Pollution Control Board (CPCB) continuous ambient air quality monitoring stations (CAAQMS) provide high-precision ground truth observations, their spatial footprint is confined to major urban corridors. Hundreds of rural districts, agricultural hubs, industrial belts, and peri-urban talukas remain unmonitored. 

AIMLess resolves this through **Multi-Source Geospatial Data Fusion**, harmonizing:
- **In-situ Ground Observations**: CPCB / State Pollution Control Boards CAAQMS
- **Geostationary Satellite Aerosols**: ISRO INSAT-3D / INSAT-3DR Aerosol Optical Depth (AOD)
- **Polar-Orbiting Trace Gas Spectrometry**: ESA Sentinel-5P / TROPOMI ($\text{HCHO}$, $\text{NO}_2$, $\text{SO}_2$, $\text{CO}$, $\text{O}_3$)
- **Active Thermal Anomaly Observations**: NASA FIRMS (MODIS / VIIRS 375m) Fire Radiative Power (FRP)
- **Atmospheric Reanalysis & Meteorology**: ECMWF ERA5 (Boundary layer dynamics, $u/v$ wind components, temperature, relative humidity, planetary boundary layer height)
- **Geographic & Land Context**: High-resolution DEM elevation, land use/land cover (LULC), and administrative geometries

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATA SOURCES                                        │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌───────────────┐ ┌───────────────┐  │
│  │  CPCB CAAQMS   │ │  INSAT-3D AOD  │ │ S-5P TROPOMI   │ │  NASA FIRMS   │ │  ECMWF ERA5   │  │
│  │ (Ground Obs)   │ │ (Aerosols)     │ │ (Trace Gases)  │ │ (Active Fires)│ │ (Wind/Temp/BL)│  │
│  └───────┬────────┘ └───────┬────────┘ └───────┬────────┘ └───────┬───────┘ └───────┬───────┘  │
└──────────┼──────────────────┼──────────────────┼──────────────────┼─────────────────┼──────────┘
           │                  │                  │                  │                 │
           ▼                  ▼                  ▼                  ▼                 ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                           LAYER 2 — PROCESSING & FUSION ENGINE                         │
│  • Spatial Indexing (H3/KD-Tree/R-Tree) • Quality Filtering (QA Flags, Cloud Masking)  │
│  • Spatiotemporal Alignment (10km / 1km Grids) • Feature Store (Parquet/GeoParquet)   │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        LAYER 3 — AI / ML & ANALYTICS ENGINE                            │
│  ┌───────────────────────────────────┐      ┌───────────────────────────────────────┐  │
│  │ Surface PM2.5 Estimation          │      │ Hotspot & Transport Intelligence      │  │
│  │ • Baseline -> XGBoost -> Deep ML  │      │ • HCHO Anomaly & Cluster Detection    │  │
│  │ • CPCB Sub-Index AQI Conversion   │      │ • Fire-HCHO Spatial Correlation       │  │
│  │ • Uncertainty / Confidence Score  │      │ • ERA5 Lagrangian Wind Trajectories   │  │
│  │ • TreeSHAP Prediction Attribution │      │ • Source -> Receptor Risk Attribution │  │
│  └───────────────────────────────────┘      └───────────────────────────────────────┘  │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                         LAYER 4 — APPLICATION & INTERFACES                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ FastAPI Backend (/api/v1/) — Bounded Box Caching, PostGIS, Schema Validation     │  │
│  └────────────────────────────────────────┬─────────────────────────────────────────┘  │
│                                           │                                            │
│  ┌────────────────────────────────────────▼─────────────────────────────────────────┐  │
│  │ React 19 Frontend (GIS Leaflet Engine, Recharts, NAQI Palette, Search Inspector) │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 2. Scientific Integrity & Taxonomy Principles

To prevent misleading environmental reporting, the platform enforces strict scientific data classification across all APIs and UI representations:

1. **Observed (Ground Truth)**: Direct physical measurements from calibrated CPCB monitoring stations (e.g. BAM-1020 Beta Attenuation Monitors for $\text{PM}_{2.5}$).
2. **Satellite Observed**: Columnar atmospheric density or radiant energy from spaceborne sensors (e.g., TROPOMI tropospheric $\text{HCHO}$ column in $\mu\text{mol/m}^2$, INSAT AOD unitless, MODIS/VIIRS thermal anomalies in MW FRP). *Satellite observations are columnar and must never be displayed as direct surface concentrations without model inversion.*
3. **AI Estimated**: Statistical/machine learning surface estimates inferred from multi-source features (e.g., Estimated $\text{PM}_{2.5}$ in $\mu\text{g/m}^3$, derived estimated AQI). Always accompanied by confidence intervals and model metadata.
4. **Derived Analysis**: Analytical models assessing relationships (e.g., Fire-HCHO spatial proximity, downwind transport trajectories). Must use calibrated scientific phrasing (*"Potential transport pathway"*, *"Potential biomass burning contribution"*).

#### Indian National AQI (NAQI) Calculation Methodology
Surface $\text{PM}_{2.5}$ is converted to the Indian NAQI standard using piecewise linear interpolation across official CPCB sub-index breakpoints:

$$I_p = \frac{I_{hi} - I_{lo}}{B_{hi} - B_{lo}} (C_p - B_{lo}) + I_{lo}$$

| Breakpoint Range ($\mu\text{g/m}^3$) | AQI Range | NAQI Category | Color Code |
| :--- | :--- | :--- | :--- |
| 0 – 30 | 0 – 50 | Good | `#16a34a` (Green) |
| 31 – 60 | 51 – 100 | Satisfactory | `#84cc16` (Light Green) |
| 61 – 90 | 101 – 200 | Moderate | `#eab308` (Yellow) |
| 91 – 120 | 201 – 300 | Poor | `#f97316` (Orange) |
| 121 – 250 | 301 – 400 | Very Poor | `#dc2626` (Red) |
| 250+ | 401 – 500 | Severe | `#7f1d1d` (Maroon) |

---

### 3. Layered Architectural Blueprint

#### Layer 1: Data Acquisition & Sources
- **CPCB / Open Government Data**: Ground measurements for validation and supervised learning targets ($\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{SO}_2$, $\text{CO}$, $\text{O}_3$).
- **INSAT-3D/3DR (ISRO MOSDAC)**: Level-2 Aerosol Optical Depth ($0.05^\circ \times 0.05^\circ$ resolution, 30-min cadence).
- **Sentinel-5P / TROPOMI (Copernicus)**: Level-2/3 tropospheric columnar amounts for $\text{HCHO}$, $\text{NO}_2$, $\text{SO}_2$, $\text{CO}$, $\text{O}_3$ ($5.5 \times 3.5\text{ km}$ resolution, daily revisit).
- **NASA FIRMS (LANCE)**: Near real-time active fire pixels from MODIS (Terra/Aqua 1km) and VIIRS (Suomi-NPP / NOAA-20 375m), capturing Latitude, Longitude, Brightness Temperature, Acquisition Date/Time, Confidence, and Fire Radiative Power (FRP in MW).
- **ECMWF ERA5 Reanalysis**: Surface temperature ($T_{2m}$), 2m Dewpoint ($D_{2m}$), $u/v$ wind components at 10m & 100m ($U_{10}, V_{10}$), Boundary Layer Height (BLH), Surface Pressure ($SP$), and Total Precipitation ($TP$).

#### Layer 2: Geospatial Preprocessing & Feature Fusion
1. **Quality Assurance & Masking**: Cloud-cover filtering on TROPOMI ($qa\_value > 0.5$) and INSAT AOD validity masks.
2. **Spatiotemporal Grid Alignment**: Spatial harmonization onto a standard regularized grid (e.g. $0.1^\circ \times 0.1^\circ \approx 10\text{ km}$ nationwide mesh) using bilinear interpolation and nearest-neighbor radius lookups.
3. **Fire Proximity Aggregation**: Rolling spatial density kernels computing:
   - `fire_count_5km`, `fire_count_25km`
   - `fire_frp_sum_5km`, `fire_frp_sum_25km`
   - `distance_to_nearest_fire_km`
4. **Meteorological Derived Variables**:
   - Wind Speed: $W_s = \sqrt{u^2 + v^2}$
   - Wind Direction: $\theta = (\text{atan2}(-u, -v) \times \frac{180}{\pi}) \pmod{360}$
   - Relative Humidity ($RH$) derived from Magnus formula using $T$ and $T_{dew}$.
5. **Storage Standards**: Raw ingest -> Parquet / GeoParquet analytics store with columnar compression.

#### Layer 3: AI/ML Surface Air Quality & Intelligence Engine
- **Target Variable**: Surface $\text{PM}_{2.5}$ ($\mu\text{g/m}^3$)
- **Feature Set**:
  - Satellite: `aod`, `hcho_column`, `no2_column`, `so2_column`, `co_column`, `o3_column`
  - Weather: `temperature_2m`, `rh`, `wind_u`, `wind_v`, `wind_speed`, `wind_dir`, `surface_pressure`, `pblh`, `precipitation`
  - Fires: `fire_count_5km`, `fire_count_25km`, `fire_frp_5km`, `fire_frp_25km`
  - Temporal: `hour`, `day_of_year`, `month`, `day_of_week`, `is_weekend`
  - Geographic: `latitude`, `longitude`, `elevation_m`
- **Model Progression**:
  1. *Baseline*: Multi-variable ElasticNet / Ridge Regression.
  2. *Production ML*: Extreme Gradient Boosting (XGBoost Regressor) & LightGBM with hyperparameter optimization.
  3. *Deep Spatiotemporal (Advanced)*: Spatial Graph Neural Network / ConvLSTM capturing regional transport advection.
- **Validation Strategy**: Blocked chronological cross-validation and Leave-Location-Out (LLO) spatial validation to guarantee no data leakage between training and testing folds.
- **Explainability (XAI)**: TreeSHAP (SHapley Additive exPlanations) computed per inference to answer *"Why is air quality poor at this location?"* (e.g. 42% high AOD, 28% low boundary layer height trapping emissions, 18% upstream agricultural fires).

#### Layer 4: Backend API & Frontend System
- **Backend Framework**: Python 3.10+ FastAPI with Pydantic v2 schemas and strict asynchronous execution.
- **Data Caching & Bounding-Box Delivery**: GeoJSON spatial clipping to avoid dumping millions of nationwide points to client browsers.
- **Frontend**: React 19 SPA with TypeScript, Leaflet interactive mapping, and Recharts analytics.
- **Controlled Demo Mode**: Toggleable `DEMO_MODE=true` environment delivering frozen, real-derived benchmark scenarios (e.g., North India post-monsoon crop burning season) clearly tagged with `"SIH Demonstration Dataset"`.

---

### 4. Target API Schema Specification (`/api/v1/`)

| Endpoint | Method | Purpose | Response Payload Key Entities |
| :--- | :--- | :--- | :--- |
| `/api/v1/health` | GET | System health & data freshness | `status`, `timestamp`, `version`, `data_freshness` |
| `/api/v1/air-quality/stations` | GET | CPCB ground stations | GeoJSON FeatureCollection of stations with latest readings |
| `/api/v1/air-quality/prediction` | GET | AI PM2.5/AQI prediction for lat/lon | `pm25_pred`, `aqi_pred`, `confidence`, `shap_explanation` |
| `/api/v1/air-quality/grid` | GET | Spatial grid for map rendering (BBox) | GeoJSON FeatureCollection with grid cell AQI estimates |
| `/api/v1/air-quality/timeseries` | GET | Hourly/daily trend observations & forecast | Array of timestamps, observed values, predicted values |
| `/api/v1/hcho/hotspots` | GET | Detected HCHO anomalies & fire link | Hotspot entities with severity, fire correlation, potential source |
| `/api/v1/fires/recent` | GET | Active MODIS/VIIRS thermal points | Fire point coordinates, brightness, confidence, FRP, category |
| `/api/v1/fires/state-summary` | GET | State-wise fire counts & FRP statistics | Aggregated counts by state and confidence class |
| `/api/v1/transport/wind` | GET | ERA5 wind vector field for map canvas | Regularized vector array $(lat, lon, u, v, speed, direction)$ |
| `/api/v1/transport/pathways` | GET | Plume transport pathways & risk zones | Source centroid, receptor impact area, travel time, confidence |
| `/api/v1/datasets` | GET | Data source catalog & operational status | Dataset inventory with update frequency, resolution, status |
| `/api/v1/geography/search` | GET | Search locations across India | Ranked matching cities, talukas, villages with coordinates |

---

### 5. Repository Target Structure

```
c:/Projects/SIH/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── air_quality.py
│   │   │   ├── datasets.py
│   │   │   ├── fires.py
│   │   │   ├── geography.py
│   │   │   ├── hcho.py
│   │   │   ├── health.py
│   │   │   └── transport.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── aqi.py
│   │   │   ├── config.py
│   │   │   └── logging.py
│   │   ├── data/
│   │   │   ├── catalog/
│   │   │   ├── ingestors/
│   │   │   └── processors/
│   │   ├── geospatial/
│   │   │   ├── grid.py
│   │   │   ├── spatial_join.py
│   │   │   └── wind.py
│   │   ├── ml/
│   │   │   ├── inference/
│   │   │   ├── models/
│   │   │   └── training/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   │   ├── air_quality.py
│   │   │   ├── common.py
│   │   │   ├── fire.py
│   │   │   ├── hcho.py
│   │   │   └── transport.py
│   │   ├── services/
│   │   │   ├── air_quality_service.py
│   │   │   ├── fire_service.py
│   │   │   ├── hcho_service.py
│   │   │   └── transport_service.py
│   │   └── main.py
│   ├── data/
│   │   ├── demo/
│   │   ├── features/
│   │   ├── processed/
│   │   └── raw/
│   ├── tests/
│   │   ├── test_aqi.py
│   │   ├── test_endpoints.py
│   │   └── test_inference.py
│   ├── .env.example
│   ├── requirements.txt
│   └── run.py
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATA_SOURCES.md
│   └── ML.md
├── src/                  # Existing React Frontend (Preserved)
│   ├── assets/
│   ├── components/
│   ├── data/
│   ├── pages/
│   ├── services/         # API client & hooks
│   └── types/
├── package.json
├── vite.config.ts
└── README.md
```

---

### 6. Phase-by-Phase Implementation Roadmap

- **Phase 1 — Audit + Architecture**: Comprehensive repository gap analysis, docs generation, backend directory skeleton, Pydantic schemas, and API contracts.
- **Phase 2 — Real Data Ingestion Pipeline**: Ingestion adapters for CPCB, INSAT AOD, TROPOMI, NASA FIRMS, and ERA5 with rigorous QA filtering and normalization.
- **Phase 3 — Geospatial Data Fusion**: Spatiotemporal joining, 10km regularized national grid generation, fire density kernel computation, and ML-ready Parquet feature tables.
- **Phase 4 — AI Surface Air Quality Model**: Tabular baseline + XGBoost $\text{PM}_{2.5}$ model training, spatial/temporal cross-validation, CPCB AQI sub-index converter, confidence estimation, and TreeSHAP explainability.
- **Phase 5 — HCHO + Fire Intelligence**: Spatial anomaly detection, FIRMS fire-HCHO proximity correlation, plume category classifier (*Biomass, Industrial, Biogenic*), and confidence grading.
- **Phase 6 — Pollution Transport Analysis**: ERA5 vector processing, Lagrangian forward/backward streamline estimation, source-to-receptor impact attribution, and travel time estimation.
- **Phase 7 — Frontend API Integration**: Connect React frontend to FastAPI REST endpoints, handle loading/error/freshness states, integrate Observed vs Estimated UI badges, and support DEMO_MODE toggle.
- **Phase 8 — Database, Performance & Caching**: Bounding-box spatial querying, in-memory/disk caching for heavy raster/vector calculations, and response optimization.
- **Phase 9 — Validation, SIH Demo Dataset & Final Polish**: End-to-end integration tests, model evaluation metrics display, reproducible frozen SIH benchmark dataset, and complete documentation.
