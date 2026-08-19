import React, { useState } from 'react';
import { Wind, Clock, BarChart2, TrendingUp } from 'lucide-react';
import MapContainer from '../components/map/MapContainer';
import PollutantCard from '../components/common/PollutantCard';
import {
  defaultMapLayers,
  pollutantReadings,
  hourlyData,
  regionalAQI,
} from '../data/mockData';
import type { MapLayer } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import StatusBadge from '../components/common/StatusBadge';

const POLLUTANTS = ['PM2.5', 'PM10', 'NO₂', 'SO₂', 'CO', 'O₃'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '10px 14px',
          fontSize: '11px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ fontWeight: '600', marginBottom: '6px', color: '#1e293b' }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ display: 'flex', gap: '6px', marginBottom: '3px', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
            <span style={{ color: '#64748b' }}>{p.name}:</span>
            <span style={{ fontWeight: '600', color: '#1e293b' }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const AirQuality: React.FC = () => {
  const [mapLayers, setMapLayers] = useState<MapLayer[]>(defaultMapLayers);
  const [selectedPollutant, setSelectedPollutant] = useState('PM2.5');
  const [selectedTime, setSelectedTime] = useState('14:00');

  const handleLayerToggle = (id: string) => {
    setMapLayers((layers) =>
      layers.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l))
    );
  };

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
              <Wind size={16} color="#2563eb" />
              <h1 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                Surface Air Quality
              </h1>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Estimated surface-level pollutant concentrations — India
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {/* Pollutant selector */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {POLLUTANTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPollutant(p)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '500',
                    border: '1px solid',
                    borderColor: selectedPollutant === p ? '#2563eb' : '#e2e8f0',
                    background: selectedPollutant === p ? '#eff6ff' : '#ffffff',
                    color: selectedPollutant === p ? '#2563eb' : '#64748b',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
            {/* Time selector */}
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              style={{
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                borderRadius: '4px',
                fontSize: '11px',
                padding: '4px 8px',
                color: '#1e293b',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {hourlyData.map((h) => (
                <option key={h.hour} value={h.hour}>{h.hour} IST</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main: map + right panel */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          overflow: 'hidden',
        }}
      >
        {/* Map */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <MapContainer
            layers={mapLayers}
            onLayerToggle={handleLayerToggle}
            mode="air-quality"
          />
        </div>

        {/* Right panel */}
        <div
          style={{
            borderLeft: '1px solid #e2e8f0',
            overflowY: 'auto',
            background: '#ffffff',
          }}
        >
          {/* Pollutant readings */}
          <div style={{ padding: '14px 14px 0' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '10px',
              }}
            >
              <BarChart2 size={13} color="#64748b" />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                Pollutant Concentrations — Mumbai (Demo)
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              {pollutantReadings.map((p) => (
                <PollutantCard key={p.id} pollutant={p} compact />
              ))}
            </div>
          </div>

          {/* 24-hour trend */}
          <div
            style={{
              padding: '0 14px 14px',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 0 10px',
              }}
            >
              <TrendingUp size={13} color="#64748b" />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                24-Hour Trend — National Average
              </span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={hourlyData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="aqi" name="AQI" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="pm25" name="PM₂.₅" stroke="#f97316" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="pm10" name="PM₁₀" stroke="#a855f7" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* City breakdown */}
          <div
            style={{
              borderTop: '1px solid #f1f5f9',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} color="#64748b" />
              Current AQI — Top Cities
            </div>
            {regionalAQI.slice(0, 6).map((city) => (
              <div
                key={city.region}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 0',
                  borderBottom: '1px solid #f8fafc',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#334155', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {city.region}
                </div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', minWidth: '36px', textAlign: 'right' }}>
                  {city.aqi}
                </span>
                <StatusBadge status={city.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQuality;
