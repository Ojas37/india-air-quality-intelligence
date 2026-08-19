import React, { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown, Minus, ChevronsUpDown } from 'lucide-react';
import type { RegionalAQI, TrendDirection } from '../../types';
import StatusBadge from './StatusBadge';

const TrendIcon: React.FC<{ trend: TrendDirection }> = ({ trend }) => {
  if (trend === 'up') return <ArrowUp size={12} className="trend-up" />;
  if (trend === 'down') return <ArrowDown size={12} className="trend-down" />;
  return <Minus size={12} className="trend-stable" />;
};

interface DataTableProps {
  data: RegionalAQI[];
}

type SortKey = keyof Pick<RegionalAQI, 'region' | 'aqi' | 'pm25' | 'status'>;

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [sortKey, setSortKey] = useState<SortKey>('aqi');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      let av = a[sortKey] as string | number;
      let bv = b[sortKey] as string | number;
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const columns: { key: SortKey; label: string }[] = [
    { key: 'region', label: 'Region' },
    { key: 'aqi', label: 'AQI' },
    { key: 'pm25', label: 'PM₂.₅' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {col.label}
                  <ChevronsUpDown size={10} color="#cbd5e1" />
                </div>
              </th>
            ))}
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.region}>
              <td>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>{row.region}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{row.state}</div>
              </td>
              <td>
                <span style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                  {row.aqi}
                </span>
              </td>
              <td style={{ color: '#475569' }}>
                {row.pm25} <span style={{ fontSize: '11px', color: '#94a3b8' }}>µg/m³</span>
              </td>
              <td>
                <StatusBadge status={row.status} />
              </td>
              <td>
                <TrendIcon trend={row.trend} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
