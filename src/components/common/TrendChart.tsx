import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { AQITrendPoint } from '../../types';


interface TrendChartProps {
  data: AQITrendPoint[];
  title?: string;
  height?: number;
  showPM25?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '10px 14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          fontSize: '12px',
        }}
      >
        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
            <span style={{ color: '#64748b' }}>{p.name}:</span>
            <span style={{ fontWeight: '600', color: '#1e293b' }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title,
  height = 180,
  showPM25 = false,
}) => {
  return (
    <div>
      {title && (
        <div
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '12px',
          }}
        >
          {title}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={100} stroke="#84cc16" strokeDasharray="3 3" strokeWidth={1} />
          <ReferenceLine y={200} stroke="#f97316" strokeDasharray="3 3" strokeWidth={1} />
          <Line
            type="monotone"
            dataKey="aqi"
            name="AQI"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: '#2563eb', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          {showPM25 && (
            <Line
              type="monotone"
              dataKey="pm25"
              name="PM₂.₅"
              stroke="#f97316"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 2"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
