// ============================================================
// Central Mock Data File
// Replace these with real API calls later.
// All interfaces are defined in src/types/index.ts
// ============================================================

import type {
  KpiData,
  RegionalAQI,
  AQITrendPoint,
  HourlyDataPoint,
  MonitoringStation,
  HCHOHotspot,
  FirePoint,
  FireStatsByState,
  DailyFireCount,
  WindVector,
  TransportEvent,
  DataSource,
  PollutantReading,
  MapLayer,
} from '../types';

// ─── KPI Cards ───────────────────────────────────────────────
export const kpiData: KpiData[] = [
  {
    id: 'national-aqi',
    title: 'National Average AQI',
    value: 142,
    status: 'Moderate',
  },
  {
    id: 'monitoring-regions',
    title: 'Monitoring Regions',
    value: 684,
  },
  {
    id: 'hcho-hotspots',
    title: 'HCHO Hotspots',
    value: 37,
    change: 8.4,
    changeLabel: '+8.4% vs yesterday',
  },
  {
    id: 'active-fires',
    title: 'Active Fire Locations',
    value: 216,
    changeLabel: '+12 today',
  },
];

// ─── Regional AQI ────────────────────────────────────────────
export const regionalAQI: RegionalAQI[] = [
  {
    region: 'Delhi NCR',
    aqi: 286,
    pm25: 168,
    pm10: 242,
    no2: 74,
    so2: 22,
    co: 3.1,
    o3: 48,
    status: 'Poor',
    trend: 'up',
    lat: 28.6139,
    lng: 77.209,
    state: 'Delhi',
  },
  {
    region: 'Mumbai',
    aqi: 154,
    pm25: 82,
    pm10: 126,
    no2: 41,
    so2: 12,
    co: 1.8,
    o3: 62,
    status: 'Moderate',
    trend: 'stable',
    lat: 19.076,
    lng: 72.8777,
    state: 'Maharashtra',
  },
  {
    region: 'Pune',
    aqi: 118,
    pm25: 61,
    pm10: 94,
    no2: 28,
    so2: 9,
    co: 1.2,
    o3: 55,
    status: 'Moderate',
    trend: 'down',
    lat: 18.5204,
    lng: 73.8567,
    state: 'Maharashtra',
  },
  {
    region: 'Bengaluru',
    aqi: 92,
    pm25: 43,
    pm10: 71,
    no2: 19,
    so2: 6,
    co: 0.9,
    o3: 44,
    status: 'Satisfactory',
    trend: 'down',
    lat: 12.9716,
    lng: 77.5946,
    state: 'Karnataka',
  },
  {
    region: 'Kolkata',
    aqi: 174,
    pm25: 91,
    pm10: 138,
    no2: 47,
    so2: 18,
    co: 2.1,
    o3: 54,
    status: 'Moderate',
    trend: 'up',
    lat: 22.5726,
    lng: 88.3639,
    state: 'West Bengal',
  },
  {
    region: 'Chandigarh',
    aqi: 201,
    pm25: 112,
    pm10: 174,
    no2: 51,
    so2: 16,
    co: 2.4,
    o3: 42,
    status: 'Poor',
    trend: 'up',
    lat: 30.7333,
    lng: 76.7794,
    state: 'Chandigarh',
  },
  {
    region: 'Hyderabad',
    aqi: 108,
    pm25: 54,
    pm10: 87,
    no2: 26,
    so2: 8,
    co: 1.1,
    o3: 52,
    status: 'Moderate',
    trend: 'stable',
    lat: 17.385,
    lng: 78.4867,
    state: 'Telangana',
  },
  {
    region: 'Chennai',
    aqi: 86,
    pm25: 38,
    pm10: 64,
    no2: 17,
    so2: 5,
    co: 0.8,
    o3: 40,
    status: 'Satisfactory',
    trend: 'down',
    lat: 13.0827,
    lng: 80.2707,
    state: 'Tamil Nadu',
  },
  {
    region: 'Ahmedabad',
    aqi: 163,
    pm25: 87,
    pm10: 131,
    no2: 44,
    so2: 14,
    co: 2.0,
    o3: 58,
    status: 'Moderate',
    trend: 'stable',
    lat: 23.0225,
    lng: 72.5714,
    state: 'Gujarat',
  },
  {
    region: 'Jaipur',
    aqi: 178,
    pm25: 96,
    pm10: 148,
    no2: 49,
    so2: 17,
    co: 2.2,
    o3: 45,
    status: 'Moderate',
    trend: 'up',
    lat: 26.9124,
    lng: 75.7873,
    state: 'Rajasthan',
  },
  {
    region: 'Lucknow',
    aqi: 231,
    pm25: 134,
    pm10: 198,
    no2: 62,
    so2: 20,
    co: 2.8,
    o3: 46,
    status: 'Poor',
    trend: 'up',
    lat: 26.8467,
    lng: 80.9462,
    state: 'Uttar Pradesh',
  },
  {
    region: 'Patna',
    aqi: 248,
    pm25: 148,
    pm10: 214,
    no2: 68,
    so2: 23,
    co: 3.0,
    o3: 44,
    status: 'Poor',
    trend: 'up',
    lat: 25.5941,
    lng: 85.1376,
    state: 'Bihar',
  },
];

// ─── AQI 7-Day Trend ─────────────────────────────────────────
export const aqiTrend7Day: AQITrendPoint[] = [
  { date: '13 Aug', aqi: 136, pm25: 72, pm10: 114 },
  { date: '14 Aug', aqi: 141, pm25: 76, pm10: 119 },
  { date: '15 Aug', aqi: 138, pm25: 74, pm10: 116 },
  { date: '16 Aug', aqi: 145, pm25: 79, pm10: 122 },
  { date: '17 Aug', aqi: 151, pm25: 83, pm10: 128 },
  { date: '18 Aug', aqi: 147, pm25: 80, pm10: 124 },
  { date: '19 Aug', aqi: 142, pm25: 77, pm10: 120 },
];

// ─── 24-Hour Trend ────────────────────────────────────────────
export const hourlyData: HourlyDataPoint[] = [
  { hour: '00:00', aqi: 168, pm25: 91, pm10: 138, no2: 48, co: 2.4, o3: 38 },
  { hour: '02:00', aqi: 172, pm25: 93, pm10: 142, no2: 49, co: 2.5, o3: 36 },
  { hour: '04:00', aqi: 180, pm25: 97, pm10: 148, no2: 52, co: 2.6, o3: 34 },
  { hour: '06:00', aqi: 174, pm25: 94, pm10: 144, no2: 50, co: 2.5, o3: 36 },
  { hour: '08:00', aqi: 162, pm25: 88, pm10: 134, no2: 46, co: 2.3, o3: 40 },
  { hour: '10:00', aqi: 148, pm25: 80, pm10: 124, no2: 43, co: 2.1, o3: 48 },
  { hour: '12:00', aqi: 136, pm25: 73, pm10: 114, no2: 39, co: 1.9, o3: 56 },
  { hour: '14:00', aqi: 142, pm25: 77, pm10: 120, no2: 41, co: 2.0, o3: 62 },
  { hour: '16:00', aqi: 151, pm25: 82, pm10: 128, no2: 44, co: 2.2, o3: 58 },
  { hour: '18:00', aqi: 163, pm25: 88, pm10: 136, no2: 47, co: 2.3, o3: 51 },
  { hour: '20:00', aqi: 171, pm25: 93, pm10: 141, no2: 49, co: 2.4, o3: 44 },
  { hour: '22:00', aqi: 166, pm25: 90, pm10: 138, no2: 47, co: 2.3, o3: 40 },
];

// ─── Monitoring Stations ─────────────────────────────────────
export const monitoringStations: MonitoringStation[] = [
  { id: 'st-001', name: 'Anand Vihar', city: 'Delhi', state: 'Delhi', lat: 28.6469, lng: 77.3159, aqi: 312, status: 'Very Poor', pm25: 188, pm10: 268, lastUpdated: '2026-08-19T14:00:00' },
  { id: 'st-002', name: 'Chandni Chowk', city: 'Delhi', state: 'Delhi', lat: 28.6562, lng: 77.2306, aqi: 278, status: 'Poor', pm25: 162, pm10: 234, lastUpdated: '2026-08-19T14:00:00' },
  { id: 'st-003', name: 'ITO', city: 'Delhi', state: 'Delhi', lat: 28.6281, lng: 77.2432, aqi: 258, status: 'Poor', pm25: 152, pm10: 218, lastUpdated: '2026-08-19T14:00:00' },
  { id: 'st-004', name: 'Bandra', city: 'Mumbai', state: 'Maharashtra', lat: 19.0596, lng: 72.8295, aqi: 148, status: 'Moderate', pm25: 78, pm10: 122, lastUpdated: '2026-08-19T14:00:00' },
  { id: 'st-005', name: 'Worli', city: 'Mumbai', state: 'Maharashtra', lat: 18.9974, lng: 72.8174, aqi: 161, status: 'Moderate', pm25: 86, pm10: 131, lastUpdated: '2026-08-19T14:00:00' },
  { id: 'st-006', name: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', lat: 12.9279, lng: 77.6271, aqi: 88, status: 'Satisfactory', pm25: 41, pm10: 68, lastUpdated: '2026-08-19T14:00:00' },
  { id: 'st-007', name: 'Park Street', city: 'Kolkata', state: 'West Bengal', lat: 22.5528, lng: 88.3536, aqi: 179, status: 'Moderate', pm25: 93, pm10: 141, lastUpdated: '2026-08-19T14:00:00' },
  { id: 'st-008', name: 'Shivajinagar', city: 'Pune', state: 'Maharashtra', lat: 18.5308, lng: 73.8474, aqi: 112, status: 'Moderate', pm25: 58, pm10: 91, lastUpdated: '2026-08-19T14:00:00' },
  { id: 'st-009', name: 'Hazratganj', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8523, lng: 80.9464, aqi: 226, status: 'Poor', pm25: 131, pm10: 194, lastUpdated: '2026-08-19T14:00:00' },
  { id: 'st-010', name: 'Sector 17', city: 'Chandigarh', state: 'Chandigarh', lat: 30.7408, lng: 76.7796, aqi: 198, status: 'Moderate', pm25: 109, pm10: 170, lastUpdated: '2026-08-19T14:00:00' },
  { id: 'st-011', name: 'Jubilee Hills', city: 'Hyderabad', state: 'Telangana', lat: 17.4324, lng: 78.4073, aqi: 104, status: 'Moderate', pm25: 52, pm10: 84, lastUpdated: '2026-08-19T14:00:00' },
  { id: 'st-012', name: 'Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0834, lng: 80.2101, aqi: 82, status: 'Satisfactory', pm25: 36, pm10: 62, lastUpdated: '2026-08-19T14:00:00' },
];

// ─── HCHO Hotspots ───────────────────────────────────────────
export const hchoHotspots: HCHOHotspot[] = [
  {
    id: 'hcho-001',
    region: 'Punjab (Central)',
    state: 'Punjab',
    lat: 30.9,
    lng: 75.85,
    hchoLevel: 'High',
    hchoValue: 8.4,
    fireCorrelation: 'Strong',
    potentialSource: 'Potential biomass burning activity',
    notes: 'Elevated HCHO concentration shows strong spatial correlation with detected fire activity. Potential source region for agricultural residue burning.',
  },
  {
    id: 'hcho-002',
    region: 'Haryana (North)',
    state: 'Haryana',
    lat: 29.5,
    lng: 76.2,
    hchoLevel: 'Elevated',
    hchoValue: 6.2,
    fireCorrelation: 'Moderate',
    potentialSource: 'Mixed agricultural and industrial activity',
    notes: 'Satellite-derived HCHO shows elevated concentrations. Spatial correlation with fire detections suggests partial contribution from biomass burning.',
  },
  {
    id: 'hcho-003',
    region: 'Western Uttar Pradesh',
    state: 'Uttar Pradesh',
    lat: 28.4,
    lng: 78.1,
    hchoLevel: 'Elevated',
    hchoValue: 5.8,
    fireCorrelation: 'Moderate',
    potentialSource: 'Agricultural residue burning',
    notes: 'HCHO concentration analysis indicates potential contribution from agricultural residue burning in the Indo-Gangetic Plain region.',
  },
  {
    id: 'hcho-004',
    region: 'Central Madhya Pradesh',
    state: 'Madhya Pradesh',
    lat: 22.7,
    lng: 78.2,
    hchoLevel: 'Elevated',
    hchoValue: 5.4,
    fireCorrelation: 'Strong',
    potentialSource: 'Forest fire activity',
    notes: 'Satellite data indicates elevated HCHO with strong spatial correlation to forest fire detections in central MP.',
  },
  {
    id: 'hcho-005',
    region: 'Odisha (Interior)',
    state: 'Odisha',
    lat: 20.9,
    lng: 84.5,
    hchoLevel: 'Moderate',
    hchoValue: 4.1,
    fireCorrelation: 'Moderate',
    potentialSource: 'Mixed forest activity',
    notes: 'Moderate HCHO concentration detected. Spatial co-location with forest fire activity suggests partial biomass burning contribution.',
  },
  {
    id: 'hcho-006',
    region: 'Assam (Central)',
    state: 'Assam',
    lat: 26.3,
    lng: 92.8,
    hchoLevel: 'Elevated',
    hchoValue: 5.9,
    fireCorrelation: 'Strong',
    potentialSource: 'Potential crop residue burning',
    notes: 'High HCHO concentration detected over Assam. Strong spatial correlation with active fire detections in the region.',
  },
  {
    id: 'hcho-007',
    region: 'Chhattisgarh',
    state: 'Chhattisgarh',
    lat: 21.3,
    lng: 81.6,
    hchoLevel: 'Moderate',
    hchoValue: 3.8,
    fireCorrelation: 'Weak',
    potentialSource: 'Industrial and biomass sources',
    notes: 'Moderate HCHO with limited fire correlation. Industrial activity may contribute to observed concentrations.',
  },
];

// ─── Fire Points ──────────────────────────────────────────────
export const firePoints: FirePoint[] = [
  { id: 'f-001', lat: 30.6, lng: 75.2, confidence: 'High', type: 'Agricultural', state: 'Punjab', district: 'Ludhiana', detectedAt: '2026-08-19T08:30:00', brightness: 312 },
  { id: 'f-002', lat: 30.4, lng: 75.8, confidence: 'High', type: 'Agricultural', state: 'Punjab', district: 'Bathinda', detectedAt: '2026-08-19T09:15:00', brightness: 308 },
  { id: 'f-003', lat: 31.1, lng: 75.4, confidence: 'Medium', type: 'Agricultural', state: 'Punjab', district: 'Amritsar', detectedAt: '2026-08-19T10:00:00', brightness: 298 },
  { id: 'f-004', lat: 29.2, lng: 76.4, confidence: 'High', type: 'Agricultural', state: 'Haryana', district: 'Karnal', detectedAt: '2026-08-19T08:45:00', brightness: 316 },
  { id: 'f-005', lat: 29.8, lng: 76.0, confidence: 'Medium', type: 'Agricultural', state: 'Haryana', district: 'Ambala', detectedAt: '2026-08-19T09:30:00', brightness: 302 },
  { id: 'f-006', lat: 22.5, lng: 78.4, confidence: 'High', type: 'Forest', state: 'Madhya Pradesh', district: 'Hoshangabad', detectedAt: '2026-08-19T11:00:00', brightness: 328 },
  { id: 'f-007', lat: 22.1, lng: 79.2, confidence: 'High', type: 'Forest', state: 'Madhya Pradesh', district: 'Seoni', detectedAt: '2026-08-19T11:30:00', brightness: 334 },
  { id: 'f-008', lat: 21.2, lng: 84.8, confidence: 'Medium', type: 'Forest', state: 'Odisha', district: 'Kalahandi', detectedAt: '2026-08-19T10:15:00', brightness: 294 },
  { id: 'f-009', lat: 20.8, lng: 85.0, confidence: 'Low', type: 'Forest', state: 'Odisha', district: 'Rayagada', detectedAt: '2026-08-19T10:45:00', brightness: 284 },
  { id: 'f-010', lat: 26.5, lng: 92.2, confidence: 'High', type: 'Agricultural', state: 'Assam', district: 'Nagaon', detectedAt: '2026-08-19T07:30:00', brightness: 318 },
  { id: 'f-011', lat: 26.2, lng: 93.1, confidence: 'Medium', type: 'Forest', state: 'Assam', district: 'Jorhat', detectedAt: '2026-08-19T08:00:00', brightness: 296 },
  { id: 'f-012', lat: 21.4, lng: 81.4, confidence: 'High', type: 'Forest', state: 'Chhattisgarh', district: 'Bastar', detectedAt: '2026-08-19T12:00:00', brightness: 322 },
  { id: 'f-013', lat: 21.8, lng: 80.9, confidence: 'Medium', type: 'Forest', state: 'Chhattisgarh', district: 'Dhamtari', detectedAt: '2026-08-19T12:30:00', brightness: 306 },
  { id: 'f-014', lat: 28.8, lng: 78.5, confidence: 'High', type: 'Agricultural', state: 'Uttar Pradesh', district: 'Muzaffarnagar', detectedAt: '2026-08-19T09:00:00', brightness: 310 },
  { id: 'f-015', lat: 27.9, lng: 79.1, confidence: 'Medium', type: 'Agricultural', state: 'Uttar Pradesh', district: 'Bareilly', detectedAt: '2026-08-19T09:45:00', brightness: 300 },
];

// ─── Fire Stats by State ──────────────────────────────────────
export const fireStatsByState: FireStatsByState[] = [
  { state: 'Punjab', count: 48, highConfidence: 32, agricultural: 41, forest: 4 },
  { state: 'Haryana', count: 37, highConfidence: 24, agricultural: 31, forest: 3 },
  { state: 'Madhya Pradesh', count: 34, highConfidence: 22, agricultural: 12, forest: 19 },
  { state: 'Odisha', count: 28, highConfidence: 16, agricultural: 9, forest: 17 },
  { state: 'Chhattisgarh', count: 24, highConfidence: 15, agricultural: 6, forest: 16 },
  { state: 'Uttar Pradesh', count: 21, highConfidence: 14, agricultural: 18, forest: 2 },
  { state: 'Assam', count: 18, highConfidence: 11, agricultural: 12, forest: 5 },
  { state: 'Jharkhand', count: 14, highConfidence: 8, agricultural: 4, forest: 9 },
];

// ─── Daily Fire Count ─────────────────────────────────────────
export const dailyFireCounts: DailyFireCount[] = [
  { date: '13 Aug', count: 148, highConfidence: 98 },
  { date: '14 Aug', count: 162, highConfidence: 107 },
  { date: '15 Aug', count: 178, highConfidence: 118 },
  { date: '16 Aug', count: 196, highConfidence: 131 },
  { date: '17 Aug', count: 204, highConfidence: 136 },
  { date: '18 Aug', count: 212, highConfidence: 141 },
  { date: '19 Aug', count: 216, highConfidence: 143 },
];

// ─── Wind Vectors ─────────────────────────────────────────────
export const windVectors: WindVector[] = [
  { lat: 32, lng: 75, u: -1.2, v: -3.8, speed: 4.0, direction: 'SE' },
  { lat: 31, lng: 76, u: -1.4, v: -3.6, speed: 3.9, direction: 'SE' },
  { lat: 30, lng: 77, u: -1.6, v: -3.4, speed: 3.8, direction: 'SE' },
  { lat: 29, lng: 78, u: -1.8, v: -3.2, speed: 3.7, direction: 'SE' },
  { lat: 28.6, lng: 77.2, u: -2.0, v: -3.0, speed: 3.6, direction: 'SE' },
  { lat: 28, lng: 77, u: -2.1, v: -2.8, speed: 3.5, direction: 'SE' },
  { lat: 27, lng: 78, u: -1.8, v: -2.5, speed: 3.1, direction: 'SE' },
  { lat: 26, lng: 79, u: -1.6, v: -2.2, speed: 2.8, direction: 'SE' },
  { lat: 25, lng: 80, u: -1.4, v: -2.0, speed: 2.4, direction: 'SE' },
  { lat: 24, lng: 78, u: -1.0, v: -1.8, speed: 2.1, direction: 'SE' },
  { lat: 23, lng: 77, u: -0.8, v: -1.6, speed: 1.8, direction: 'SE' },
  { lat: 22, lng: 76, u: -0.6, v: -1.4, speed: 1.5, direction: 'SE' },
];

// ─── Transport Events ─────────────────────────────────────────
export const transportEvents: TransportEvent[] = [
  {
    id: 'tr-001',
    sourceRegion: 'Punjab / Haryana',
    downwindRegion: 'Delhi NCR',
    windDirection: 'SE',
    windSpeed: 4.8,
    assessment: 'Current wind conditions indicate potential southeastward transport of pollutants from agricultural burning regions towards the Delhi NCR airshed.',
    confidence: 'Moderate',
    date: '2026-08-19',
  },
  {
    id: 'tr-002',
    sourceRegion: 'Madhya Pradesh (Central)',
    downwindRegion: 'Uttar Pradesh (South)',
    windDirection: 'NE',
    windSpeed: 3.2,
    assessment: 'Northeastward flow may facilitate transport of smoke and particulate matter from central MP forest fires towards southern UP.',
    confidence: 'Low',
    date: '2026-08-19',
  },
];

// ─── Data Sources ─────────────────────────────────────────────
export const dataSources: DataSource[] = [
  {
    id: 'ds-cpcb',
    name: 'Central Pollution Control Board',
    shortName: 'CPCB',
    provider: 'Ministry of Environment, Forest and Climate Change, Govt. of India',
    description: 'Ground-based continuous ambient air quality monitoring observations from CAAQMS stations across India.',
    parameters: ['PM2.5', 'PM10', 'NO₂', 'SO₂', 'CO', 'O₃', 'NH₃'],
    resolution: 'Point stations',
    frequency: 'Hourly',
    status: 'Prototype',
  },
  {
    id: 'ds-tropomi',
    name: 'Sentinel-5P / TROPOMI',
    shortName: 'TROPOMI',
    provider: 'European Space Agency (ESA)',
    description: 'Tropospheric Monitoring Instrument providing global daily measurements of atmospheric trace gases including HCHO, NO₂, SO₂, CO, and O₃.',
    parameters: ['HCHO', 'NO₂', 'SO₂', 'CO', 'O₃', 'CH₄', 'Aerosol Index'],
    resolution: '3.5 × 5.5 km',
    frequency: 'Daily',
    status: 'Prototype',
  },
  {
    id: 'ds-insat',
    name: 'INSAT-3D / 3DR',
    shortName: 'INSAT-3D',
    provider: 'Indian Space Research Organisation (ISRO)',
    description: 'Geostationary satellite providing aerosol optical depth, land surface temperature, and cloud properties over India.',
    parameters: ['Aerosol Optical Depth', 'Land Surface Temperature', 'Cloud Properties'],
    resolution: '4 km (Imager)',
    frequency: 'Sub-hourly',
    status: 'Prototype',
  },
  {
    id: 'ds-modis',
    name: 'MODIS / VIIRS',
    shortName: 'MODIS/VIIRS',
    provider: 'NASA FIRMS / LANCE',
    description: 'Near real-time active fire detections from MODIS Terra/Aqua and VIIRS Suomi-NPP/NOAA-20 satellites.',
    parameters: ['Active Fires', 'Fire Radiative Power', 'Burn Area'],
    resolution: '375 m (VIIRS) / 1 km (MODIS)',
    frequency: 'Near real-time (~3 hr latency)',
    status: 'Prototype',
  },
  {
    id: 'ds-era5',
    name: 'ERA5 Reanalysis',
    shortName: 'ERA5',
    provider: 'ECMWF / Copernicus Climate Change Service',
    description: 'Fifth generation atmospheric reanalysis providing comprehensive meteorological variables for pollution transport modelling.',
    parameters: ['Wind Speed', 'Wind Direction', 'Temperature', 'Pressure', 'Humidity', 'Boundary Layer Height'],
    resolution: '31 km',
    frequency: 'Hourly',
    status: 'Prototype',
  },
];

// ─── Pollutant Readings ───────────────────────────────────────
export const pollutantReadings: PollutantReading[] = [
  { id: 'pol-pm25', name: 'Fine Particulate Matter', shortName: 'PM₂.₅', value: 82, unit: 'µg/m³', category: 'Moderate', description: 'Particles ≤2.5 µm diameter. Primary health indicator.' },
  { id: 'pol-pm10', name: 'Coarse Particulate Matter', shortName: 'PM₁₀', value: 126, unit: 'µg/m³', category: 'Moderate', description: 'Particles ≤10 µm diameter. Respiratory health concern.' },
  { id: 'pol-no2', name: 'Nitrogen Dioxide', shortName: 'NO₂', value: 41, unit: 'ppb', category: 'Moderate', description: 'Primarily from combustion emissions and traffic.' },
  { id: 'pol-co', name: 'Carbon Monoxide', shortName: 'CO', value: 1.8, unit: 'mg/m³', category: 'Satisfactory', description: 'Produced by incomplete combustion of carbon-containing fuels.' },
  { id: 'pol-o3', name: 'Ground-level Ozone', shortName: 'O₃', value: 62, unit: 'µg/m³', category: 'Moderate', description: 'Secondary pollutant formed from NOx and VOC reactions.' },
  { id: 'pol-so2', name: 'Sulphur Dioxide', shortName: 'SO₂', value: 12, unit: 'ppb', category: 'Good', description: 'From industrial processes and fossil fuel combustion.' },
];

// ─── Map Layers ───────────────────────────────────────────────
export const defaultMapLayers: MapLayer[] = [
  { id: 'layer-aqi', name: 'Surface AQI', enabled: true, description: 'Estimated surface AQI choropleth' },
  { id: 'layer-pm25', name: 'PM2.5', enabled: false, description: 'PM2.5 concentration layer' },
  { id: 'layer-pm10', name: 'PM10', enabled: false, description: 'PM10 concentration layer' },
  { id: 'layer-hcho', name: 'HCHO', enabled: false, description: 'Satellite-derived formaldehyde concentration' },
  { id: 'layer-no2', name: 'NO₂', enabled: false, description: 'Nitrogen dioxide concentration' },
  { id: 'layer-fires', name: 'Active Fires', enabled: false, description: 'MODIS/VIIRS fire detections' },
  { id: 'layer-wind', name: 'Wind Direction', enabled: false, description: 'ERA5 wind field vectors' },
  { id: 'layer-stations', name: 'Monitoring Stations', enabled: false, description: 'CPCB ground monitoring stations' },
];

// ─── Helper: AQI Color ────────────────────────────────────────
export function getAQIColor(aqi: number): string {
  if (aqi <= 50) return '#22c55e';
  if (aqi <= 100) return '#84cc16';
  if (aqi <= 200) return '#eab308';
  if (aqi <= 300) return '#f97316';
  if (aqi <= 400) return '#ef4444';
  return '#7f1d1d';
}

export function getAQICategory(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'Good': return '#22c55e';
    case 'Satisfactory': return '#84cc16';
    case 'Moderate': return '#eab308';
    case 'Poor': return '#f97316';
    case 'Very Poor': return '#ef4444';
    case 'Severe': return '#7f1d1d';
    default: return '#6b7280';
  }
}

export const INDIA_CENTER: [number, number] = [22.5937, 78.9629];
export const INDIA_ZOOM = 5;
