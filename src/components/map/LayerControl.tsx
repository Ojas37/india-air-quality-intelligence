import React from 'react';
import { Layers } from 'lucide-react';
import type { MapLayer } from '../../types';

interface LayerControlProps {
  layers: MapLayer[];
  onToggle: (id: string) => void;
}

const LayerControl: React.FC<LayerControlProps> = ({ layers, onToggle }) => {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        padding: '10px 12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        minWidth: '180px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '10px',
        }}
      >
        <Layers size={12} color="#64748b" />
        <span
          style={{
            fontSize: '10px',
            fontWeight: '700',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Map Layers
        </span>
      </div>

      {layers.map((layer) => (
        <label
          key={layer.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '6px',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={layer.enabled}
            onChange={() => onToggle(layer.id)}
            style={{ width: '13px', height: '13px', accentColor: '#2563eb', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '12px', color: '#334155', userSelect: 'none' }}>
            {layer.name}
          </span>
        </label>
      ))}
    </div>
  );
};

export default LayerControl;
