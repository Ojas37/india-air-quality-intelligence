import React, { useState } from 'react';
import { Settings, User, ChevronDown, RefreshCw } from 'lucide-react';

interface TopHeaderProps {
  title?: string;
  subtitle?: string;
}

const REGIONS = [
  'All India',
  'North India',
  'South India',
  'East India',
  'West India',
  'Central India',
  'Northeast India',
];

const TopHeader: React.FC<TopHeaderProps> = ({ title, subtitle }) => {
  const [selectedRegion, setSelectedRegion] = useState('All India');
  const [selectedDate, setSelectedDate] = useState('2026-08-19');

  return (
    <header
      style={{
        height: '56px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: '16px',
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* Title area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h1
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e293b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <span
                style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Data status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            color: '#64748b',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '5px 10px',
          }}
        >
          <RefreshCw size={10} color="#22c55e" />
          <span>Updated 14:00 IST</span>
        </div>


        {/* Date selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '4px 10px',
            cursor: 'pointer',
          }}
        >
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '12px',
              color: '#1e293b',
              cursor: 'pointer',
              outline: 'none',
            }}
          />
        </div>

        {/* Region selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '4px 8px 4px 10px',
            cursor: 'pointer',
            minWidth: '120px',
          }}
        >
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '12px',
              color: '#1e293b',
              cursor: 'pointer',
              outline: 'none',
              flex: 1,
              appearance: 'none',
            }}
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <ChevronDown size={12} color="#94a3b8" />
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: '#e2e8f0' }} />

        {/* Settings */}
        <button
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
          }}
          title="Settings"
        >
          <Settings size={14} />
        </button>

        {/* User */}
        <button
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            background: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#94a3b8',
          }}
          title="User profile"
        >
          <User size={14} color="#94a3b8" />
        </button>
      </div>
    </header>
  );
};

export default TopHeader;
