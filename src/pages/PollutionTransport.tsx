import React, { useState } from 'react';
import { ArrowRightLeft, Wind, Info, AlertTriangle, Navigation } from 'lucide-react';
import MapContainer from '../components/map/MapContainer';
import { defaultMapLayers, transportEvents } from '../data/mockData';
import type { MapLayer } from '../types';

const PollutionTransport: React.FC = () => {
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    ...defaultMapLayers.map((l) => ({
      ...l,
      enabled: l.name === 'Surface AQI' || l.name === 'Wind Direction',
    })),
  ]);

  const handleLayerToggle = (id: string) => {
    setMapLayers((layers) =>
      layers.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l))
    );
  };

  const primaryEvent = transportEvents[0];

  const confidenceColor: Record<string, string> = {
    High: '#22c55e',
    Moderate: '#eab308',
    Low: '#94a3b8',
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
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <ArrowRightLeft size={16} color="#0891b2" />
              <h1 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                Pollution Transport Analysis
              </h1>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Wind-driven pollution pathway indication — ERA5 meteorological data (mock)
            </p>
          </div>
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Info size={12} color="#1d4ed8" />
            <span style={{ fontSize: '10px', color: '#1d4ed8', fontWeight: '600' }}>
              Analytical indication — not confirmed transport pathway
            </span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', overflow: 'hidden' }}>
        {/* Map */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <MapContainer layers={mapLayers} onLayerToggle={handleLayerToggle} mode="transport" />
        </div>

        {/* Right panel */}
        <div style={{ borderLeft: '1px solid #e2e8f0', overflowY: 'auto', background: '#ffffff' }}>
          <div style={{ padding: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Navigation size={13} color="#0891b2" />
              Transport Assessment
            </div>

            {/* Primary event */}
            <div
              style={{
                border: '1px solid #e0f2fe',
                borderRadius: '8px',
                background: '#f0f9ff',
                padding: '14px',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#0c4a6e' }}>
                  Primary Transport Event
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '600',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: `${confidenceColor[primaryEvent.confidence]}20`,
                    color: confidenceColor[primaryEvent.confidence],
                    border: `1px solid ${confidenceColor[primaryEvent.confidence]}40`,
                  }}
                >
                  {primaryEvent.confidence} Confidence
                </span>
              </div>

              <div style={{ display: 'grid', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ background: '#ffffff', borderRadius: '6px', padding: '8px 10px', border: '1px solid #bae6fd' }}>
                    <div style={{ fontSize: '10px', color: '#0891b2', fontWeight: '600', marginBottom: '2px' }}>WIND DIRECTION</div>
                    <div style={{ fontWeight: '700', color: '#0c4a6e', fontSize: '16px' }}>{primaryEvent.windDirection}</div>
                  </div>
                  <div style={{ background: '#ffffff', borderRadius: '6px', padding: '8px 10px', border: '1px solid #bae6fd' }}>
                    <div style={{ fontSize: '10px', color: '#0891b2', fontWeight: '600', marginBottom: '2px' }}>WIND SPEED</div>
                    <div style={{ fontWeight: '700', color: '#0c4a6e', fontSize: '16px' }}>{primaryEvent.windSpeed} m/s</div>
                  </div>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '6px', padding: '8px 10px', border: '1px solid #bae6fd' }}>
                  <div style={{ fontSize: '10px', color: '#0891b2', fontWeight: '600', marginBottom: '4px' }}>POTENTIAL SOURCE REGION</div>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>{primaryEvent.sourceRegion}</div>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '6px', padding: '8px 10px', border: '1px solid #bae6fd' }}>
                  <div style={{ fontSize: '10px', color: '#0891b2', fontWeight: '600', marginBottom: '4px' }}>DOWNWIND REGION</div>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>{primaryEvent.downwindRegion}</div>
                </div>
              </div>

              {/* Transport arrow visual */}
              <div
                style={{
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#ffffff',
                  border: '1px solid #bae6fd',
                  borderRadius: '6px',
                  padding: '10px 14px',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#0c4a6e' }}>{primaryEvent.sourceRegion}</div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '2px', color: '#0891b2' }}>
                  <div style={{ flex: 1, height: '1px', background: '#0891b2' }} />
                  <Wind size={12} />
                  <div style={{ flex: 1, height: '1px', background: '#0891b2' }} />
                  <span style={{ fontSize: '10px' }}>→</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#0c4a6e' }}>{primaryEvent.downwindRegion}</div>
              </div>

              <div
                style={{
                  marginTop: '10px',
                  fontSize: '11px',
                  color: '#475569',
                  lineHeight: '1.6',
                  background: '#ffffff',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  border: '1px solid #bae6fd',
                }}
              >
                {primaryEvent.assessment}
              </div>
            </div>

            {/* Secondary event */}
            {transportEvents.slice(1).map((event) => (
              <div
                key={event.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>Secondary Event</div>
                  <span style={{ fontSize: '10px', fontWeight: '600', color: '#94a3b8' }}>{event.confidence} Confidence</span>
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                  {event.sourceRegion} → {event.downwindRegion}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Wind: {event.windDirection} at {event.windSpeed} m/s
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', lineHeight: '1.5' }}>
                  {event.assessment}
                </div>
              </div>
            ))}

            {/* Wind data summary */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Wind size={12} color="#64748b" />
                Wind Field Summary
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '10px' }}>Avg. Speed</div>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>3.2 m/s</div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '10px' }}>Dominant Dir.</div>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>SE</div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '10px' }}>Data Source</div>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>ERA5</div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '10px' }}>Boundary Layer</div>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>~800 m</div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '6px',
                padding: '10px 12px',
                display: 'flex',
                gap: '8px',
              }}
            >
              <AlertTriangle size={13} color="#92400e" style={{ flexShrink: 0, marginTop: '1px' }} />
              <div style={{ fontSize: '10px', color: '#78350f', lineHeight: '1.6' }}>
                This is a pollution transport indication based on wind data analysis. It does not confirm that pollution originated from the identified source regions. Actual transport depends on complex atmospheric dynamics.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollutionTransport;
