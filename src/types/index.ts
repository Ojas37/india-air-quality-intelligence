// ============================================================
// India Air Quality & Pollution Intelligence Platform
// Central TypeScript Interfaces
// Replace mock data with real API responses matching these types
// ============================================================

export type AQICategory =
  | 'Good'
  | 'Satisfactory'
  | 'Moderate'
  | 'Poor'
  | 'Very Poor'
  | 'Severe';

export type TrendDirection = 'up' | 'down' | 'stable';

export type FireConfidence = 'High' | 'Medium' | 'Low';
export type FireType = 'Agricultural' | 'Forest' | 'Industrial' | 'Unknown';

export type HCHOLevel = 'High' | 'Elevated' | 'Moderate' | 'Low';
export type FireCorrelation = 'Strong' | 'Moderate' | 'Weak' | 'None';

export type LayerName =
  | 'Surface AQI'
  | 'PM2.5'
  | 'PM10'
  | 'HCHO'
  | 'NO₂'
  | 'Active Fires'
  | 'Wind Direction'
  | 'Monitoring Stations';

// ─── KPI Cards ───────────────────────────────────────────────
export interface KpiData {
  id: string;
  title: string;
  value: number | string;
  unit?: string;
  status?: AQICategory;
  change?: number; // percentage or absolute
  changeLabel?: string; // e.g. "+12 today"
  icon?: string;
}

// ─── Regional AQI ────────────────────────────────────────────
export interface RegionalAQI {
  region: string;
  aqi: number;
  pm25: number;
  pm10?: number;
  no2?: number;
  so2?: number;
  co?: number;
  o3?: number;
  status: AQICategory;
  trend: TrendDirection;
  lat: number;
  lng: number;
  state: string;
}

// ─── AQI Trend ───────────────────────────────────────────────
export interface AQITrendPoint {
  date: string; // e.g. "13 Aug"
  aqi: number;
  pm25?: number;
  pm10?: number;
}

// ─── 24-hour Trend ───────────────────────────────────────────
export interface HourlyDataPoint {
  hour: string; // e.g. "00:00"
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  co: number;
  o3: number;
}

// ─── Monitoring Stations ─────────────────────────────────────
export interface MonitoringStation {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  aqi: number;
  status: AQICategory;
  pm25: number;
  pm10: number;
  lastUpdated: string;
}

// ─── HCHO Hotspots ───────────────────────────────────────────
export interface HCHOHotspot {
  id: string;
  region: string;
  state: string;
  lat: number;
  lng: number;
  hchoLevel: HCHOLevel;
  hchoValue: number; // mol/m² × 10^-5
  fireCorrelation: FireCorrelation;
  potentialSource: string;
  notes: string;
}

// ─── Fire Activity ────────────────────────────────────────────
export interface FirePoint {
  id: string;
  lat: number;
  lng: number;
  confidence: FireConfidence;
  type: FireType;
  state: string;
  district?: string;
  detectedAt: string; // ISO date string
  brightness?: number; // Kelvin
}

export interface FireStatsByState {
  state: string;
  count: number;
  highConfidence: number;
  agricultural: number;
  forest: number;
}

export interface DailyFireCount {
  date: string;
  count: number;
  highConfidence: number;
}

// ─── Pollution Transport ──────────────────────────────────────
export interface WindVector {
  lat: number;
  lng: number;
  u: number; // eastward component (m/s)
  v: number; // northward component (m/s)
  speed: number;
  direction: string; // e.g. "NW"
}

export interface TransportEvent {
  id: string;
  sourceRegion: string;
  downwindRegion: string;
  windDirection: string;
  windSpeed: number; // m/s
  assessment: string;
  confidence: 'High' | 'Moderate' | 'Low';
  date: string;
}

// ─── Data Sources ────────────────────────────────────────────
export interface DataSource {
  id: string;
  name: string;
  shortName: string;
  provider: string;
  description: string;
  parameters: string[];
  resolution: string;
  frequency: string;
  status: 'Connected' | 'Prototype' | 'Planned';
  lastUpdated?: string;
}

// ─── Pollutant ───────────────────────────────────────────────
export interface PollutantReading {
  id: string;
  name: string;
  shortName: string;
  value: number;
  unit: string;
  category: AQICategory;
  description: string;
}

// ─── Navigation ──────────────────────────────────────────────
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

// ─── Map Layer ───────────────────────────────────────────────
export interface MapLayer {
  id: string;
  name: LayerName;
  enabled: boolean;
  description: string;
}
