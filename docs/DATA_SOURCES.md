# Scientific Data Sources & Methodology

This document details the scientific datasets, observation mechanics, preprocessing requirements, and quality control flags integrated into the platform.

---

## 1. Primary Datasets Inventory

| Dataset | Organization / Sensor | Key Variables | Spatial Resolution | Temporal Cadence | Format | Quality Filtering |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CPCB CAAQMS** | Central Pollution Control Board (India) | $\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{SO}_2$, $\text{CO}$, $\text{O}_3$, $\text{NH}_3$, $\text{Pb}$ | Point In-Situ | 15-min / 1-hour | REST API / CSV | Calibrated Beta-Attenuation; Outlier truncation ($>3\sigma$) |
| **INSAT-3D/3DR AOD** | ISRO MOSDAC (Indian Space Research Org) | Aerosol Optical Depth at 550nm ($\tau_{550}$) | $0.05^\circ \times 0.05^\circ$ ($\approx 5\text{ km}$) | 30 minutes (Geostationary) | HDF5 / NetCDF | Cloud-mask filtering; QC flags $= 0$ (High quality) |
| **Sentinel-5P TROPOMI** | ESA / Copernicus | Tropospheric columns: $\text{HCHO}$, $\text{NO}_2$, $\text{SO}_2$, $\text{CO}$, $\text{O}_3$ | $5.5 \times 3.5\text{ km}^2$ | Daily (13:30 local equator crossing) | NetCDF4 / GeoTIFF | QA value $> 0.5$ (cloud fraction $< 0.3$, non-snow/ice) |
| **NASA FIRMS** | NASA LANCE (MODIS Terra/Aqua & VIIRS S-NPP/NOAA-20) | Thermal Anomaly pixels, Fire Radiative Power (FRP in MW), Brightness Temp (K) | 375m (VIIRS) / 1km (MODIS) | 4–8 passes / day | GeoJSON / CSV / SHP | Detection confidence $> 50\%$; Day/Night classification |
| **ECMWF ERA5** | Copernicus Climate Change Service | $T_{2m}$, $D_{2m}$, $U_{10}$, $V_{10}$, Boundary Layer Height (BLH), Surface Pressure ($SP$), Precipitation ($TP$) | $0.25^\circ \times 0.25^\circ$ ($\approx 25\text{ km}$) | 1-hour | NetCDF / GRIB | Physical range verification; spatial regridding |

---

## 2. Ingestion & Preprocessing Mechanics

### A. CPCB Ground Stations
- Stations measure mass concentrations ($\mu\text{g/m}^3$ or $\text{mg/m}^3$ for $\text{CO}$).
- Time stamps normalized to UTC and IST (`Asia/Kolkata`).
- Negative readings or sensor-stuck states ($0\text{ variance}$ over 6 hours) automatically flagged and excluded.

### B. INSAT-3D Aerosol Optical Depth
- AOD is a dimensionless measure of total columnar aerosol extinction.
- Re-gridded to standard target grid using bilinear interpolation.
- Cloud edge pixels excluded using the ISRO cloud mask flag.

### C. Sentinel-5P TROPOMI Trace Gases
- Formaldehyde ($\text{HCHO}$) serves as a critical reactive volatile organic compound (VOC) intermediate resulting from isoprene oxidation, industrial processing, and incomplete biomass combustion.
- Tropospheric vertical column density is processed in units of $\text{mol/m}^2$ (scaled to $10^{-5}\text{ mol/m}^2$).
- Only pixels with `qa_value > 0.5` are retained to eliminate cloud contamination.

### D. NASA FIRMS Fire Radiative Power (FRP)
- Active fires aggregate spatial thermal emission in MegaWatts (MW).
- Circular radial kernels at 5km and 25km compute active fire density and cumulative FRP surrounding any grid cell.

### E. ECMWF ERA5 Atmospheric Dynamics
- $U_{10}$ (zonal eastward wind) and $V_{10}$ (meridional northward wind) are converted to scalar speed ($m/s$) and meteorological compass direction ($\theta^\circ$).
- Planetary Boundary Layer Height (PBLH in meters) is used as an atmospheric volume metric: lower PBLH compresses ground emissions, resulting in higher surface concentration even with constant emission rates.

---

## 3. Data Freshness & Benchmark Reference Scenario

- **Operational Pipeline**: Automated background worker fetching freshest data feeds.
- **Benchmark Reference Dataset**: High-pollution post-monsoon Indo-Gangetic Plain case study (combining intense stubble burning, low boundary layer height, and north-westerly transport) preserved as reproducible reference data.
