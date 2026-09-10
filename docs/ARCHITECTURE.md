# India Air Quality & Climate Intelligence Platform
## Comprehensive Architecture & Engineering Blueprint

---

### 1. Executive Summary & Mission

The **India Air Quality & Climate Intelligence Platform** is an AI-powered geospatial intelligence system engineered to address the critical spatial gaps in India's ground-based air quality monitoring network.

While Central Pollution Control Board (CPCB) continuous ambient air quality monitoring stations (CAAQMS) provide high-precision ground truth observations, their spatial footprint is confined to major urban corridors. Hundreds of rural districts, agricultural hubs, industrial belts, and peri-urban talukas remain unmonitored. 

The platform resolves this through **Multi-Source Geospatial Data Fusion**, harmonizing:
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

---

### 3. Layered Technical Architecture

#### Layer 1: Multi-Source Ingestion & Data Lake
- **Storage Strategy**: Local and cloud-compatible directory structure with partitioned Parquet storage.
- **Data Ingestion Engine**: Python modules utilizing `httpx` (async REST), `rasterio` / `xarray` (multidimensional NetCDF/HDF5), and `pandas` / `pyarrow` (tabular telemetry).
- **QA/QC Pipeline**: Automated outlier removal, boundary clipping to the Indian subcontinent bounding box ($6.0^\circ\text{N} - 37.5^\circ\text{N}$, $68.0^\circ\text{E} - 98.0^\circ\text{E}$), and missing value imputation flags.

#### Layer 2: Geospatial Processing & Spatial Fusion
- **Coordinate Reference System (CRS)**: WGS 84 (EPSG:4326) for global storage and Web Mercator (EPSG:3857) for web mapping.
- **Spatial Alignment**: 
  - Standard national regularized grid at $0.25^\circ \times 0.25^\circ$ ($\approx 25\text{km}$) and regional high-resolution grids ($0.05^\circ \approx 5\text{km}$).
  - Vectorized Haversine distance functions and spatial distance decay kernels.
- **Fire Density Estimation**: Radial buffers (5km and 25km) aggregating active fire count and sum of Fire Radiative Power (FRP in MW).

#### Layer 3: Machine Learning & Analytics Engine
- **Target Variable**: Surface $\text{PM}_{2.5}$ concentration ($\mu\text{g/m}^3$).
- **Model Hierarchy**:
  1. *Baseline*: Multivariable Ridge Regression & Random Forest.
  2. *Production ML*: Extreme Gradient Boosting (XGBoost Regressor) with 5-Fold Cross-Validation.
- **Validation Strategy**: Spatial and temporal cross-validation to guarantee generalization across unseen regions.
- **Explainability (XAI)**: TreeSHAP computed per inference to answer *"Why is air quality estimated to be this value?"*.

#### Layer 4: Backend API & Frontend System
- **Backend Framework**: Python 3.10+ FastAPI with Pydantic v2 schemas and strict asynchronous execution.
- **Data Caching & Bounding-Box Delivery**: In-memory `TTLCache` and spatial bounding box queries.
- **Frontend**: React 19 SPA with TypeScript, Leaflet interactive mapping, and Recharts analytics.

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

### 5. Repository Structure

```
india-air-quality-intelligence/
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI route controllers (/api/v1/)
│   │   ├── core/             # CPCB NAQI math, TTLCache, configs & logging
│   │   ├── data/             # Ingestion adapters, processors & catalog
│   │   ├── geospatial/       # Grid generation, fire kernels & wind trajectories
│   │   ├── ml/               # Training, inference, XGBoost models & TreeSHAP
│   │   ├── schemas/          # Pydantic v2 schemas
│   │   ├── services/         # Fire, HCHO & transport services
│   │   └── main.py
│   ├── data/                 # Raw & processed Parquet feature store
│   ├── tests/                # Automated 38-test pytest suite
│   ├── requirements.txt
│   └── run.py
├── docs/                     # Architecture, API, Data Sources & ML specifications
├── src/                      # React 19 + TypeScript Frontend
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/             # API client & hooks
│   └── types/
├── package.json
├── vite.config.ts
└── README.md
```
