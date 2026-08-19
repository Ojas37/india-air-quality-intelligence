import React from 'react';

const AQI_LEGEND = [
  { range: '0–50', label: 'Good', color: '#22c55e' },
  { range: '51–100', label: 'Satisfactory', color: '#84cc16' },
  { range: '101–200', label: 'Moderate', color: '#eab308' },
  { range: '201–300', label: 'Poor', color: '#f97316' },
  { range: '301–400', label: 'Very Poor', color: '#ef4444' },
  { range: '401–500', label: 'Severe', color: '#7f1d1d' },
];

const MapLegend: React.FC = () => {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        padding: '10px 12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        minWidth: '140px',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          fontWeight: '700',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '8px',
        }}
      >
        AQI Index
      </div>
      {AQI_LEGEND.map((item) => (
        <div
          key={item.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
          }}
        >
          <div
            style={{
              width: '16px',
              height: '10px',
              borderRadius: '2px',
              background: item.color,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: '#64748b' }}>{item.range}</span>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>{item.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MapLegend;
