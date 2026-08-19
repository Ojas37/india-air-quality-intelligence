import React from 'react';
import type { PollutantReading } from '../../types';
import StatusBadge from './StatusBadge';

interface PollutantCardProps {
  pollutant: PollutantReading;
  compact?: boolean;
}

const PollutantCard: React.FC<PollutantCardProps> = ({ pollutant, compact = false }) => {
  return (
    <div
      className="card"
      style={{
        padding: compact ? '12px 14px' : '16px 18px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '6px',
            }}
            dangerouslySetInnerHTML={{ __html: pollutant.shortName }}
          />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span
              style={{
                fontSize: compact ? '20px' : '24px',
                fontWeight: '700',
                color: '#1e293b',
                lineHeight: '1',
                letterSpacing: '-0.5px',
              }}
            >
              {pollutant.value}
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{pollutant.unit}</span>
          </div>
        </div>
        <StatusBadge status={pollutant.category} size="sm" />
      </div>
      {!compact && (
        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', lineHeight: '1.5' }}>
          {pollutant.description}
        </div>
      )}
    </div>
  );
};

export default PollutantCard;
