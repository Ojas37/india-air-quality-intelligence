import React from 'react';
import type { AQICategory } from '../../types';
import { getCategoryColor } from '../../data/mockData';

interface StatusBadgeProps {
  status: AQICategory | string;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'sm',
  showDot = true,
}) => {
  const color = getCategoryColor(status);

  return (
    <span
      className="badge"
      style={{
        background: `${color}18`,
        color: color,
        border: `1px solid ${color}35`,
        fontSize: size === 'sm' ? '10px' : '11px',
        padding: size === 'sm' ? '2px 7px' : '3px 10px',
        gap: showDot ? '4px' : '0',
      }}
    >
      {showDot && (
        <span
          style={{
            display: 'inline-block',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: color,
            flexShrink: 0,
          }}
        />
      )}
      {status}
    </span>
  );
};

export default StatusBadge;
