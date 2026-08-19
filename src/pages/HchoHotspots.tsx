import React, { useState } from 'react';
import { Zap, Info } from 'lucide-react';
import MapContainer from '../components/map/MapContainer';
import { hchoHotspots, defaultMapLayers } from '../data/mockData';
import type { MapLayer } from '../types';

const HCHO_LEVEL_COLOR: Record<string, string> = {
  High: '#dc2626',
  Elevated: '#f97316',
  Moderate: '#eab308',
  Low: '#22c55e',
};

const CORRELATION_COLOR: Record<string, string> = {
  Strong: '#dc2626',
  Moderate: '#f97316',
  Weak: '#eab308',
  None: '#94a3b8',
};

const HchoHotspots: React.FC = () => {
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    ...defaultMapLayers.map((l) => ({ ...l, enabled: l.name === 'HCHO' })),
  ]);
  const [selected, setSelected] = useState<string | null>(null);

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
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <Zap size={16} color="#7c3aed" />
              <h1 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                HCHO Hotspot Intelligence
              </h1>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Formaldehyde (HCHO) spatial analysis — satellite-derived observations and potential biomass-burning indicators
            </p>
          </div>
        </div>
      </div>

      {/* Main */}
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
            mode="hcho"
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
          <div style={{ padding: '14px 14px 0' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b', marginBottom: '10px' }}>
              Detected Hotspots ({hchoHotspots.length})
            </div>

            {/* Hotspot list */}
            {hchoHotspots.map((spot) => (
              <div
                key={spot.id}
                onClick={() => setSelected(selected === spot.id ? null : spot.id)}
                style={{
                  border: '1px solid',
                  borderColor: selected === spot.id ? '#7c3aed' : '#e2e8f0',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  background: selected === spot.id ? '#faf5ff' : '#ffffff',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                      {spot.region}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '1px' }}>{spot.state}</div>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: `${HCHO_LEVEL_COLOR[spot.hchoLevel]}18`,
                      color: HCHO_LEVEL_COLOR[spot.hchoLevel],
                      border: `1px solid ${HCHO_LEVEL_COLOR[spot.hchoLevel]}35`,
                    }}
                  >
                    {spot.hchoLevel}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '11px' }}>
                  <span style={{ color: '#64748b' }}>HCHO</span>
                  <span style={{ fontWeight: '600', color: '#7c3aed' }}>{spot.hchoValue} × 10⁻⁵ mol/m²</span>
                  <span style={{ color: '#64748b' }}>Fire correlation</span>
                  <span
                    style={{
                      fontWeight: '600',
                      color: CORRELATION_COLOR[spot.fireCorrelation],
                    }}
                  >
                    {spot.fireCorrelation}
                  </span>
                </div>

                {selected === spot.id && (
                  <div
                    style={{
                      marginTop: '10px',
                      paddingTop: '10px',
                      borderTop: '1px solid #f1f5f9',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: '6px',
                        marginBottom: '6px',
                      }}
                    >
                      <Info size={12} color="#7c3aed" style={{ flexShrink: 0, marginTop: '1px' }} />
                      <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
                        {spot.notes}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: '#94a3b8',
                        fontStyle: 'italic',
                        borderTop: '1px solid #f8fafc',
                        paddingTop: '6px',
                        marginTop: '4px',
                      }}
                    >
                      Potential source region — analytical indication only. Satellite-derived HCHO from TROPOMI (mock data).
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ padding: '14px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
              HCHO Concentration Scale
            </div>
            {Object.entries(HCHO_LEVEL_COLOR).map(([level, color]) => (
              <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '14px', height: '10px', background: color, borderRadius: '2px', opacity: 0.7 }} />
                <span style={{ fontSize: '11px', color: '#475569' }}>{level}</span>
              </div>
            ))}
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px', lineHeight: '1.5' }}>
              Derived from Sentinel-5P / TROPOMI atmospheric column measurements (mock data for demonstration)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HchoHotspots;
