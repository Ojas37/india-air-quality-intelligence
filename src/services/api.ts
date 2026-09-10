import type {
  AIPredictionResult,
  HealthStatus,
  MonitoringStation,
  HCHOHotspot,
  FirePoint,
  FireStatsByState,
  TransportEvent,
  WindVector,
  DataSource,
} from '../types';

import {
  monitoringStations as mockStations,
  hchoHotspots as mockHotspots,
  firePoints as mockFires,
  fireStatsByState as mockStateFires,
  transportEvents as mockTransportEvents,
  windVectors as mockWindVectors,
  dataSources as mockDataSources,
} from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Generic safe fetch handler with fallback to offline data
 */
async function fetchWithFallback<T>(url: string, fallbackData: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      return await res.json();
    }
    console.warn(`[API] Server responded with status ${res.status} for ${url}. Using local data.`);
    return fallbackData;
  } catch (err) {
    console.info(`[API] Backend unavailable (${url}). Using local fallback data.`);
    return fallbackData;
  }
}

export const api = {
  /**
   * Health and freshness
   */
  async getHealth(): Promise<HealthStatus | null> {
    return fetchWithFallback<HealthStatus | null>(`${API_BASE_URL}/health`, null);
  },

  /**
   * CPCB Ground Monitoring Stations
   */
  async getStations(): Promise<MonitoringStation[]> {
    const data = await fetchWithFallback<{ stations: any[] }>(
      `${API_BASE_URL}/air-quality/stations`,
      { stations: mockStations }
    );
    return data.stations || mockStations;
  },

  /**
   * AI Surface PM2.5 & CPCB NAQI Prediction with TreeSHAP Explainability
   */
  async getPrediction(lat: number, lon: number): Promise<AIPredictionResult> {
    const defaultFallback: AIPredictionResult = {
      latitude: lat,
      longitude: lon,
      region_name: `Location (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`,
      pm25_pred: 115.0,
      pm25_unit: 'µg/m³',
      aqi_pred: 283,
      aqi_category: 'Poor',
      dominant_pollutant: 'PM2.5',
      confidence_score: 0.88,
      confidence_interval_95: [98.0, 132.0],
      confidence_level: 'High',
      feature_contributions: [
        { feature: 'aod_insat', contribution_ugm3: 38.4, percentage: 41.5, description: 'Columnar aerosol optical depth measured by INSAT-3D' },
        { feature: 'pblh_era5', contribution_ugm3: 24.2, percentage: 26.2, description: 'Low planetary boundary layer height trapping emissions' },
        { feature: 'fire_frp_25km', contribution_ugm3: 18.6, percentage: 20.1, description: 'Active thermal anomalies detected by NASA FIRMS in 25km radius' },
        { feature: 'wind_speed', contribution_ugm3: -11.2, percentage: -12.2, description: 'Surface wind speed promoting atmospheric dispersion' },
      ],
      model_version: 'xgboost-pm25-v1.0',
      source_type: 'AI Estimated',
      timestamp: new Date().toISOString(),
    };

    return fetchWithFallback<AIPredictionResult>(
      `${API_BASE_URL}/air-quality/prediction?lat=${lat}&lon=${lon}`,
      defaultFallback
    );
  },

  /**
   * TROPOMI HCHO Hotspots
   */
  async getHCHOHotspots(correlation?: string): Promise<HCHOHotspot[]> {
    const query = correlation ? `?correlation_filter=${encodeURIComponent(correlation)}` : '';
    const data = await fetchWithFallback<{ hotspots: HCHOHotspot[] }>(
      `${API_BASE_URL}/hcho/hotspots${query}`,
      { hotspots: mockHotspots }
    );
    return data.hotspots || mockHotspots;
  },

  /**
   * NASA FIRMS Active Fires
   */
  async getRecentFires(confidence = 'All', fireType = 'All'): Promise<{ fires: FirePoint[]; stateSummaries: FireStatsByState[]; totalFires: number; totalFrp: number }> {
    const url = `${API_BASE_URL}/fires/recent?confidence=${confidence}&fire_type=${fireType}`;
    const fallback = {
      fires: mockFires,
      stateSummaries: mockStateFires,
      totalFires: mockFires.length,
      totalFrp: 4150.0,
    };

    const data = await fetchWithFallback<any>(url, fallback);
    return {
      fires: data.fires || mockFires,
      stateSummaries: data.state_summaries || data.stateSummaries || mockStateFires,
      totalFires: data.total_fires || data.totalFires || mockFires.length,
      totalFrp: data.total_frp_mw || data.totalFrp || 4150.0,
    };
  },

  /**
   * ERA5 Pollution Transport & Wind Vectors
   */
  async getTransport(): Promise<{ summary: string; windVectors: WindVector[]; pathways: TransportEvent[] }> {
    const fallback = {
      summary: 'Dominant North-Westerly synoptic airflow over Northern India promoting plume transport toward Delhi NCR.',
      windVectors: mockWindVectors,
      pathways: mockTransportEvents,
    };

    const data = await fetchWithFallback<any>(`${API_BASE_URL}/transport/wind`, fallback);
    return {
      summary: data.summary || fallback.summary,
      windVectors: (data.wind_vectors || data.windVectors || mockWindVectors).map((w: any) => ({
        lat: w.latitude || w.lat,
        lng: w.longitude || w.lng,
        u: w.u_ms || w.u || 2.0,
        v: w.v_ms || w.v || -1.5,
        speed: w.speed_ms || w.speed || 2.5,
        direction: w.direction_cardinal || w.direction || 'NW',
      })),
      pathways: (data.pathways || mockTransportEvents).map((p: any) => ({
        id: p.id,
        sourceRegion: p.source_region || p.sourceRegion,
        downwindRegion: p.downwind_receptor_region || p.downwindRegion,
        windDirection: p.wind_direction || p.windDirection,
        windSpeed: p.wind_speed_ms || p.windSpeed,
        assessment: p.assessment_narrative || p.assessment,
        confidence: p.confidence,
        date: p.date || 'Active Assessment',
      })),
    };
  },

  /**
   * Data Sources
   */
  async getDatasets(): Promise<DataSource[]> {
    const data = await fetchWithFallback<{ datasets: any[] }>(`${API_BASE_URL}/datasets`, { datasets: mockDataSources });
    if (!data.datasets) return mockDataSources;

    return data.datasets.map((d) => ({
      id: d.id,
      name: d.name,
      shortName: d.short_name || d.shortName,
      provider: d.provider,
      description: d.description,
      parameters: d.parameters || [],
      resolution: d.spatial_resolution || d.resolution || 'Standard',
      frequency: d.temporal_frequency || d.frequency || 'Hourly',
      status: d.status || 'Connected',
    }));
  },

  /**
   * Geography location search
   */
  async searchGeography(query: string) {
    return fetchWithFallback<{ total_matches: number; results: any[] }>(
      `${API_BASE_URL}/geography/search?q=${encodeURIComponent(query)}`,
      { total_matches: 0, results: [] }
    );
  },
};
