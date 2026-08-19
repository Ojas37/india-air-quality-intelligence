import React from 'react';

import type { AQICategory } from '../../types';
import { getCategoryColor } from '../../data/mockData';

interface KpiCardProps {
  title: string;
  value: number | string;
  unit?: string;
  status?: AQICategory;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  description?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  status,
  change: _change,
  changeLabel,
  icon,
  description,
}) => {


  return (
    <div
      className="card"
      style={{ padding: '16px 20px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: '500',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}
          >
            {title}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <div
              style={{
                fontSize: '26px',
                fontWeight: '700',
                color: '#1e293b',
                lineHeight: '1',
                letterSpacing: '-0.5px',
              }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {unit && (
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{unit}</div>
            )}
          </div>

          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {status && (
              <span
                className="badge"
                style={{
                  background: `${getCategoryColor(status)}20`,
                  color: getCategoryColor(status),
                  border: `1px solid ${getCategoryColor(status)}40`,
                }}
              >
                {status}
              </span>
            )}
            {changeLabel && (
              <span
                style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                }}
              >
                {changeLabel}
              </span>
            )}
          </div>

          {description && (
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              {description}
            </div>
          )}
        </div>

        {icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              background: '#f1f5f9',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
