import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Wind,
  Zap,
  Flame,
  MapPin,
  TrendingUp,
  BarChart2,
} from 'lucide-react';
import KpiCard from '../components/common/KpiCard';
import DataTable from '../components/common/DataTable';
import TrendChart from '../components/common/TrendChart';
import MapContainer from '../components/map/MapContainer';
import {
  kpiData as initialKpiData,
  regionalAQI,
  aqiTrend7Day,
  defaultMapLayers,
} from '../data/mockData';
import type { MapLayer, KpiData } from '../types';
import { api } from '../services/api';

const Overview: React.FC = () => {
  const [mapLayers, setMapLayers] = useState<MapLayer[]>(defaultMapLayers);
  const [kpis, setKpis] = useState<KpiData[]>(initialKpiData);

  useEffect(() => {
    // Fetch live counts from backend APIs
    Promise.all([
      api.getStations(),
      api.getHCHOHotspots(),
      api.getRecentFires(),
    ]).then(([stations, hotspots, fires]) => {
      setKpis([
        {
          id: 'national-aqi',
          title: 'National Average AQI',
          value: 142,
          status: 'Moderate',
        },
        {
          id: 'monitoring-regions',
          title: 'Active CPCB Stations',
          value: stations.length > 0 ? stations.length : 684,
          changeLabel: 'Ground Truth',
        },
        {
          id: 'hcho-hotspots',
          title: 'HCHO Hotspots',
          value: hotspots.length > 0 ? hotspots.length : 37,
          change: 8.4,
          changeLabel: 'TROPOMI Satellite',
        },
        {
          id: 'active-fires',
          title: 'Active Fire Locations',
          value: fires.totalFires > 0 ? fires.totalFires : 216,
          changeLabel: 'NASA FIRMS',
        },
      ]);
    });
  }, []);

  const handleLayerToggle = (id: string) => {
    setMapLayers((layers) =>
      layers.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l))
    );
  };

  const kpiIcons = [
    <Wind size={16} color="#2563eb" />,
    <MapPin size={16} color="#0891b2" />,
    <Zap size={16} color="#7c3aed" />,
    <Flame size={16} color="#dc2626" />,
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Page header */}
      <div
        style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <LayoutDashboard size={16} color="#2563eb" />
              <h1 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                National Air Quality Overview
              </h1>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Satellite and ground-based environmental observations across India
            </p>
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right' }}>
            <div>Data updated: 19 Aug 2026, 14:00 IST</div>
            <div style={{ fontSize: '10px', marginTop: '2px' }}>Source: CPCB / TROPOMI (Mock)</div>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          padding: '12px 20px',
          background: '#f8f9fa',
          borderBottom: '1px solid #e2e8f0',
          flexShrink: 0,
        }}
      >
        {kpis.map((kpi, idx) => (
          <KpiCard
            key={kpi.id}
            title={kpi.title}
            value={kpi.value}
            unit={kpi.unit}
            status={kpi.status}
            change={kpi.change}
            changeLabel={kpi.changeLabel}
            icon={kpiIcons[idx]}
          />
        ))}
      </div>

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gridTemplateRows: '1fr',
          overflow: 'hidden',
          gap: '0',
        }}
      >
        {/* Map */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <MapContainer
            layers={mapLayers}
            onLayerToggle={handleLayerToggle}
            mode="overview"
          />
        </div>

        {/* Right panel */}
        <div
          style={{
            borderLeft: '1px solid #e2e8f0',
            overflowY: 'auto',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Regional AQI table */}
          <div style={{ padding: '14px 0 0' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 16px 10px',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <BarChart2 size={13} color="#64748b" />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                Regional Air Quality
              </span>
            </div>
            <DataTable data={regionalAQI.slice(0, 7)} />
          </div>

          {/* 7-day trend chart */}
          <div
            style={{
              padding: '14px 16px',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '12px',
              }}
            >
              <TrendingUp size={13} color="#64748b" />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                National AQI Trend — 7 Days
              </span>
            </div>
            <TrendChart data={aqiTrend7Day} height={150} />
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px' }}>
              Dashed reference lines: 100 (Satisfactory threshold), 200 (Poor threshold)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
