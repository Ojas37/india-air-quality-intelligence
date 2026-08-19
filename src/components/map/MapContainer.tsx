import React, { useState } from 'react';
import {
  MapContainer as LeafletMap,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapLayer } from '../../types';
import {
  monitoringStations,
  regionalAQI,
  hchoHotspots,
  firePoints,
  windVectors,
  getAQIColor,
  getCategoryColor,
  INDIA_CENTER,
  INDIA_ZOOM,
} from '../../data/mockData';
import MapLegend from './MapLegend';
import LayerControl from './LayerControl';

interface MapContainerProps {
  layers: MapLayer[];
  onLayerToggle: (id: string) => void;
  mode?: 'overview' | 'air-quality' | 'hcho' | 'fire' | 'transport';
}

// Helper to check if a layer is enabled
const isEnabled = (layers: MapLayer[], name: string) =>
  layers.some((l) => l.name === name && l.enabled);

// Wind arrow rotated marker
const WindArrow: React.FC<{ lat: number; lng: number; speed: number; direction: string }> = ({
  lat,
  lng,
  speed,
  direction,
}) => {

  return (
    <CircleMarker
      center={[lat, lng]}
      radius={4}
      pathOptions={{
        fillColor: '#3b82f6',
        fillOpacity: 0.7,
        color: '#2563eb',
        weight: 1,
      }}
    >
      <Tooltip permanent direction="center" className="wind-tooltip">
        <span style={{ fontSize: '10px', fontWeight: '500' }}>
          {direction} {speed.toFixed(1)}m/s
        </span>
      </Tooltip>
    </CircleMarker>
  );
};

const MapContent: React.FC<{ layers: MapLayer[]; mode: string }> = ({ layers, mode }) => {
  // AQI circles for major cities
  const showAQI = isEnabled(layers, 'Surface AQI') || mode === 'overview';
  const showStations = isEnabled(layers, 'Monitoring Stations');
  const showHCHO = isEnabled(layers, 'HCHO') || mode === 'hcho';
  const showFires = isEnabled(layers, 'Active Fires') || mode === 'fire';
  const showWind = isEnabled(layers, 'Wind Direction') || mode === 'transport';
  const showPM25 = isEnabled(layers, 'PM2.5');
  const showPM10 = isEnabled(layers, 'PM10');

  return (
    <>
      {/* Base map tiles - clean light style */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        maxZoom={18}
      />

      {/* AQI Heatmap circles */}
      {showAQI &&
        regionalAQI.map((city) => (
          <CircleMarker
            key={city.region}
            center={[city.lat, city.lng]}
            radius={Math.min(38, Math.max(18, city.aqi / 9))}
            pathOptions={{
              fillColor: getAQIColor(city.aqi),
              fillOpacity: 0.35,
              color: getAQIColor(city.aqi),
              weight: 1.5,
            }}
          >
            <Tooltip
              permanent
              direction="top"
              offset={[0, -8]}
            >
              <div style={{ textAlign: 'center', fontSize: '11px' }}>
                <div style={{ fontWeight: '600', color: '#1e293b' }}>{city.region}</div>
                <div style={{ fontWeight: '700', color: getAQIColor(city.aqi), fontSize: '13px' }}>
                  AQI {city.aqi}
                </div>
              </div>
            </Tooltip>
            <Popup>
              <div style={{ minWidth: '160px', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '8px', color: '#1e293b' }}>
                  {city.region}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '12px' }}>
                  <span style={{ color: '#64748b' }}>AQI</span>
                  <span style={{ fontWeight: '600', color: getAQIColor(city.aqi) }}>{city.aqi}</span>
                  <span style={{ color: '#64748b' }}>PM₂.₅</span>
                  <span style={{ fontWeight: '500' }}>{city.pm25} µg/m³</span>
                  <span style={{ color: '#64748b' }}>PM₁₀</span>
                  <span style={{ fontWeight: '500' }}>{city.pm10} µg/m³</span>
                  <span style={{ color: '#64748b' }}>NO₂</span>
                  <span style={{ fontWeight: '500' }}>{city.no2} ppb</span>
                  <span style={{ color: '#64748b' }}>Status</span>
                  <span style={{ fontWeight: '600', color: getCategoryColor(city.status) }}>{city.status}</span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '10px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                  Estimated Surface AQI — Mock data
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

      {/* PM2.5 circles (different visual) */}
      {showPM25 &&
        regionalAQI.map((city) => (
          <CircleMarker
            key={`pm25-${city.region}`}
            center={[city.lat, city.lng]}
            radius={Math.min(28, Math.max(12, city.pm25 / 6))}
            pathOptions={{
              fillColor: '#f97316',
              fillOpacity: 0.3,
              color: '#f97316',
              weight: 1,
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
                <b>{city.region}</b> — PM₂.₅: {city.pm25} µg/m³
              </div>
            </Popup>
          </CircleMarker>
        ))}

      {/* PM10 circles */}
      {showPM10 &&
        regionalAQI.map((city) => (
          <CircleMarker
            key={`pm10-${city.region}`}
            center={[city.lat, city.lng]}
            radius={Math.min(30, Math.max(12, (city.pm10 || 0) / 8))}
            pathOptions={{
              fillColor: '#a855f7',
              fillOpacity: 0.25,
              color: '#a855f7',
              weight: 1,
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
                <b>{city.region}</b> — PM₁₀: {city.pm10} µg/m³
              </div>
            </Popup>
          </CircleMarker>
        ))}

      {/* Monitoring stations */}
      {showStations &&
        monitoringStations.map((station) => (
          <CircleMarker
            key={station.id}
            center={[station.lat, station.lng]}
            radius={5}
            pathOptions={{
              fillColor: getAQIColor(station.aqi),
              fillOpacity: 0.9,
              color: '#ffffff',
              weight: 1.5,
            }}
          >
            <Tooltip direction="top">
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px' }}>
                <b>{station.name}</b>, {station.city}
                <br />AQI: {station.aqi} — {station.status}
              </div>
            </Tooltip>
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', minWidth: '140px' }}>
                <div style={{ fontWeight: '700', marginBottom: '6px' }}>{station.name}</div>
                <div style={{ color: '#64748b', marginBottom: '4px' }}>{station.city}, {station.state}</div>
                <div>AQI: <b style={{ color: getAQIColor(station.aqi) }}>{station.aqi}</b></div>
                <div>PM₂.₅: {station.pm25} µg/m³</div>
                <div>PM₁₀: {station.pm10} µg/m³</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px' }}>
                  CPCB CAAQMS — Mock data
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

      {/* HCHO hotspots */}
      {showHCHO &&
        hchoHotspots.map((spot) => (
          <CircleMarker
            key={spot.id}
            center={[spot.lat, spot.lng]}
            radius={Math.min(30, Math.max(16, spot.hchoValue * 3))}
            pathOptions={{
              fillColor: '#8b5cf6',
              fillOpacity: 0.3,
              color: '#7c3aed',
              weight: 1.5,
              dashArray: '4 2',
            }}
          >
            <Tooltip direction="top">
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px' }}>
                <b>{spot.region}</b>
                <br />HCHO: {spot.hchoValue} × 10⁻⁵ mol/m²
                <br />Level: {spot.hchoLevel}
              </div>
            </Tooltip>
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', minWidth: '180px' }}>
                <div style={{ fontWeight: '700', marginBottom: '4px' }}>{spot.region}</div>
                <div style={{ color: '#7c3aed', marginBottom: '6px' }}>HCHO: {spot.hchoValue} × 10⁻⁵ mol/m²</div>
                <div>Level: <b>{spot.hchoLevel}</b></div>
                <div>Fire correlation: <b>{spot.fireCorrelation}</b></div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '6px', lineHeight: '1.5' }}>
                  {spot.notes}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                  Potential source region — analytical indication only
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

      {/* Fire points */}
      {showFires &&
        firePoints.map((fire) => (
          <CircleMarker
            key={fire.id}
            center={[fire.lat, fire.lng]}
            radius={fire.confidence === 'High' ? 6 : fire.confidence === 'Medium' ? 5 : 4}
            pathOptions={{
              fillColor: fire.confidence === 'High' ? '#dc2626' : fire.confidence === 'Medium' ? '#f97316' : '#fbbf24',
              fillOpacity: 0.85,
              color: '#ffffff',
              weight: 1,
            }}
          >
            <Tooltip direction="top">
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px' }}>
                <b>{fire.state}</b>{fire.district ? ` — ${fire.district}` : ''}
                <br />Confidence: {fire.confidence} | Type: {fire.type}
              </div>
            </Tooltip>
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
                <b>Fire Detection</b>
                <div>State: {fire.state}</div>
                {fire.district && <div>District: {fire.district}</div>}
                <div>Confidence: {fire.confidence}</div>
                <div>Type: {fire.type}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                  MODIS/VIIRS — Mock data
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

      {/* Wind vectors */}
      {showWind &&
        windVectors.map((vec, idx) => (
          <WindArrow
            key={idx}
            lat={vec.lat}
            lng={vec.lng}
            speed={vec.speed}
            direction={vec.direction}
          />
        ))}
    </>
  );
};

const MapContainer: React.FC<MapContainerProps> = ({
  layers,
  onLayerToggle,
  mode = 'overview',
}) => {
  const [showLayers, setShowLayers] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <LeafletMap
        center={INDIA_CENTER}
        zoom={INDIA_ZOOM}
        style={{ width: '100%', height: '100%', borderRadius: '0' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <MapContent layers={layers} mode={mode} />
      </LeafletMap>

      {/* Layer control toggle */}
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
        <button
          onClick={() => setShowLayers((s) => !s)}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '11px',
            fontWeight: '600',
            color: '#334155',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <span>Layers</span>
        </button>
        {showLayers && (
          <LayerControl layers={layers} onToggle={onLayerToggle} />
        )}
      </div>

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: '24px', left: '10px', zIndex: 1000 }}>
        <MapLegend />
      </div>

      {/* Prototype watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '10px',
          zIndex: 1000,
          fontSize: '10px',
          color: '#94a3b8',
          background: 'rgba(255,255,255,0.8)',
          padding: '2px 6px',
          borderRadius: '4px',
        }}
      >
        Prototype — Mock Data
      </div>
    </div>
  );
};

export default MapContainer;
