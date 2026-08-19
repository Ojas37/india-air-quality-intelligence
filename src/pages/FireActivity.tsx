import React, { useState } from 'react';
import { Flame, Filter, BarChart2, TrendingUp } from 'lucide-react';
import MapContainer from '../components/map/MapContainer';
import {
  defaultMapLayers,
  fireStatsByState,
  dailyFireCounts,
  firePoints,
} from '../data/mockData';
import type { MapLayer } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const CONFIDENCE_COLORS: Record<string, string> = {
  High: '#dc2626',
  Medium: '#f97316',
  Low: '#fbbf24',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 14px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ fontWeight: '600', marginBottom: '4px', color: '#1e293b' }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ display: 'flex', gap: '6px', marginBottom: '2px', alignItems: 'center' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            <span style={{ color: '#64748b' }}>{p.name}:</span>
            <span style={{ fontWeight: '600', color: '#1e293b' }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const FireActivity: React.FC = () => {
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    ...defaultMapLayers.map((l) => ({ ...l, enabled: l.name === 'Active Fires' })),
  ]);
  const [confFilter, setConfFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  const handleLayerToggle = (id: string) => {
    setMapLayers((layers) =>
      layers.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l))
    );
  };

  const filteredFires = firePoints.filter((f) => {
    if (confFilter !== 'All' && f.confidence !== confFilter) return false;
    if (typeFilter !== 'All' && f.type !== typeFilter) return false;
    return true;
  });

  const statCards = [
    { label: 'Active Fires', value: 216, color: '#dc2626' },
    { label: 'High Confidence', value: 143, color: '#f97316' },
    { label: 'Agricultural Fires', value: 87, color: '#eab308' },
    { label: 'Forest Fires', value: 34, color: '#22c55e' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          padding: '14px 20px 12px',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <Flame size={16} color="#dc2626" />
              <h1 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                Fire Activity & Biomass Burning
              </h1>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Active fire detections — MODIS/VIIRS satellite observations (mock data)
            </p>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Filter size={12} color="#64748b" />
            <select
              value={confFilter}
              onChange={(e) => setConfFilter(e.target.value)}
              style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '4px', fontSize: '11px', padding: '4px 8px', color: '#1e293b', cursor: 'pointer', outline: 'none' }}
            >
              <option value="All">All Confidence</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '4px', fontSize: '11px', padding: '4px 8px', color: '#1e293b', cursor: 'pointer', outline: 'none' }}
            >
              <option value="All">All Types</option>
              <option value="Agricultural">Agricultural</option>
              <option value="Forest">Forest</option>
              <option value="Industrial">Industrial</option>
            </select>
            <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
              {filteredFires.length} fires shown
            </span>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          padding: '10px 20px',
          background: '#f8f9fa',
          borderBottom: '1px solid #e2e8f0',
          flexShrink: 0,
        }}
      >
        {statCards.map((s) => (
          <div key={s.label} className="card" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: '10px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: s.color, lineHeight: '1' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', overflow: 'hidden' }}>
        {/* Map */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <MapContainer layers={mapLayers} onLayerToggle={handleLayerToggle} mode="fire" />
        </div>

        {/* Right panel */}
        <div style={{ borderLeft: '1px solid #e2e8f0', overflowY: 'auto', background: '#ffffff' }}>
          {/* Daily trend */}
          <div style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <TrendingUp size={13} color="#64748b" />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                Daily Fire Activity — 7 Days
              </span>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={dailyFireCounts} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" name="Total Fires" stroke="#dc2626" strokeWidth={2} dot={{ fill: '#dc2626', r: 3 }} />
                <Line type="monotone" dataKey="highConfidence" name="High Confidence" stroke="#f97316" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* State ranking */}
          <div style={{ borderTop: '1px solid #f1f5f9', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <BarChart2 size={13} color="#64748b" />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                State-wise Fire Count
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={fireStatsByState}
                layout="vertical"
                margin={{ top: 0, right: 8, bottom: 0, left: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="state" type="category" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} width={56} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="agricultural" name="Agricultural" fill="#eab308" stackId="a" radius={[0, 0, 0, 0]} barSize={10} />
                <Bar dataKey="forest" name="Forest" fill="#22c55e" stackId="a" radius={[0, 3, 3, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Fire table */}
          <div style={{ borderTop: '1px solid #f1f5f9', padding: '0 0 14px' }}>
            <div style={{ padding: '12px 14px 8px', fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
              Recent Detections
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr>
                  {['State', 'Type', 'Conf.'].map((h) => (
                    <th key={h} style={{ padding: '6px 14px', background: '#f8f9fa', color: '#64748b', fontWeight: '600', fontSize: '10px', textTransform: 'uppercase', textAlign: 'left', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {firePoints.slice(0, 10).map((f) => (
                  <tr key={f.id}>
                    <td style={{ padding: '8px 14px', borderBottom: '1px solid #f8fafc', color: '#334155' }}>{f.state}</td>
                    <td style={{ padding: '8px 14px', borderBottom: '1px solid #f8fafc', color: '#475569' }}>{f.type}</td>
                    <td style={{ padding: '8px 14px', borderBottom: '1px solid #f8fafc' }}>
                      <span style={{ fontSize: '10px', fontWeight: '600', color: CONFIDENCE_COLORS[f.confidence], background: `${CONFIDENCE_COLORS[f.confidence]}18`, padding: '2px 6px', borderRadius: '4px' }}>
                        {f.confidence}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FireActivity;
