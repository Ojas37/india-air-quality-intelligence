# AI/ML Surface Air Quality Modeling & Explainability

This document details the machine learning methodology for estimating surface $\text{PM}_{2.5}$ across India, model validation protocols, and TreeSHAP explainability.

---

## 1. Problem Formulation & Pipeline

Directly predicting AQI with a machine learning classifier or regressor produces distorted boundaries across non-linear index thresholds. The platform adheres to the **pollutant-first estimation pipeline**:

```
[Satellite AOD + Trace Gases + ERA5 Meteorology + FIRMS Fires + Geography]
                                    │
                                    ▼
                      [Supervised ML Regressor]
                                    │
                                    ▼
                     [Estimated Surface PM2.5 (µg/m³)]
                                    │
                                    ▼
                  [Official CPCB Sub-Index Conversion]
                                    │
                                    ▼
                   [Estimated Indian AQI & Category]
```

---

## 2. Feature Engineering & Feature Matrix

The tabular feature vector $X \in \mathbb{R}^D$ per location and timestamp contains:

| Category | Feature Name | Description | Source |
| :--- | :--- | :--- | :--- |
| **Satellite** | `aod_insat` | Aerosol Optical Depth at 550nm | INSAT-3D/3DR |
| | `hcho_column` | Tropospheric HCHO column ($10^{-5}\text{ mol/m}^2$) | Sentinel-5P |
| | `no2_column` | Tropospheric $\text{NO}_2$ column | Sentinel-5P |
| | `so2_column` | Tropospheric $\text{SO}_2$ column | Sentinel-5P |
| | `co_column` | Total Column $\text{CO}$ | Sentinel-5P |
| **Meteorology** | `temperature_2m` | 2m air temperature ($^\circ\text{C}$) | ERA5 |
| | `dewpoint_2m` | 2m dewpoint temperature ($^\circ\text{C}$) | ERA5 |
| | `relative_humidity` | Computed relative humidity (\%) | ERA5 derived |
| | `wind_u_10m` | Zonal wind component ($m/s$) | ERA5 |
| | `wind_v_10m` | Meridional wind component ($m/s$) | ERA5 |
| | `wind_speed` | Scalar wind speed ($m/s$) | ERA5 derived |
| | `wind_direction` | Meteorological wind direction ($0-360^\circ$) | ERA5 derived |
| | `surface_pressure` | Surface atmospheric pressure ($\text{hPa}$) | ERA5 |
| | `boundary_layer_height` | Planetary boundary layer height ($m$) | ERA5 |
| | `total_precipitation` | 1-hour total precipitation ($mm$) | ERA5 |
| **Active Fires** | `fire_count_5km` | Active fire count within 5km radius | NASA FIRMS |
| | `fire_count_25km` | Active fire count within 25km radius | NASA FIRMS |
| | `fire_frp_5km` | Sum of Fire Radiative Power within 5km ($\text{MW}$) | NASA FIRMS |
| | `fire_frp_25km` | Sum of Fire Radiative Power within 25km ($\text{MW}$) | NASA FIRMS |
| | `dist_to_nearest_fire_km`| Distance to nearest detected fire | NASA FIRMS |
| **Geography** | `latitude`, `longitude` | Spatial coordinates | Spatial |
| | `elevation_m` | Digital elevation ($m$) | DEM |
| **Temporal** | `hour`, `month`, `day_of_year` | Diurnal and seasonal cycle | Timestamp |
| | `is_weekend` | Weekend binary flag | Timestamp |

---

## 3. Machine Learning Models

### Model Hierarchy:
1. **Baseline Regressor**: Ridge / ElasticNet linear model with standardized features.
2. **Tabular Ensemble (Production Core)**: Extreme Gradient Boosting (**XGBoost Regressor**) and **Random Forest Regressor**.
3. **Advanced Spatiotemporal (Future Extension)**: Spatial GCN + ConvLSTM model encoding atmospheric advection tensors.

### Loss Function & Regularization:
- Objective: Root Mean Squared Error ($\text{RMSE}$) with $L_1$ (Lasso) and $L_2$ (Ridge) regularization to prevent overfitting in sparse observation zones.

---

## 4. Validation Strategy (Preventing Data Leakage)

To ensure realistic performance estimation for unmonitored regions:
1. **Spatial Leave-Location-Out (LLO)**: Hold out entire monitoring stations from training to evaluate model generalization to unmonitored locations.
2. **Blocked Temporal Split**: Train on earlier chronological blocks (e.g. 2024–2025) and evaluate on unseen subsequent periods (e.g. 2026). Random k-fold cross-validation is strictly forbidden as temporal autocorrelation creates artificial over-optimistic test scores.

### Target Performance Metrics:
- Mean Absolute Error ($\text{MAE}$) in $\mu\text{g/m}^3$
- Root Mean Squared Error ($\text{RMSE}$) in $\mu\text{g/m}^3$
- Coefficient of Determination ($R^2$)
- High-pollution episode recall (AQI $> 300$)

---

## 5. Explainable AI (TreeSHAP)

Every inference query provides local feature importance via TreeSHAP:

$$f(x) = \phi_0 + \sum_{i=1}^{M} \phi_i(x)$$

Where $\phi_i(x)$ is the marginal contribution of feature $i$ to the predicted surface $\text{PM}_{2.5}$ anomaly relative to national baseline $\phi_0$.

This directly enables the user-facing explanation widget:
> *"Why is air quality estimated to be Poor?"*
> - **AOD High**: $+46\mu\text{g/m}^3$ (Heavy atmospheric aerosol column)
> - **Low Boundary Layer**: $+32\mu\text{g/m}^3$ (Trapping ground emissions)
> - **Upstream Fires**: $+21\mu\text{g/m}^3$ (FRP detected in upwind transport sector)
> - **Wind Ventilation**: $-8\mu\text{g/m}^3$ (Slight dispersion)
