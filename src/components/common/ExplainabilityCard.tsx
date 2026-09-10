import React from 'react';
import { Cpu, ShieldCheck, Sparkles, TrendingDown, TrendingUp, Info } from 'lucide-react';
import type { AIPredictionResult } from '../../types';

interface ExplainabilityCardProps {
  prediction: AIPredictionResult;
}

const ExplainabilityCard: React.FC<ExplainabilityCardProps> = ({ prediction }) => {
  const isAiEstimated = prediction.source_type === 'AI Estimated';

  return (
    <div
      className="card"
      style={{
        padding: '14px',
        marginBottom: '14px',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header with Source Type Badge and Model Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: isAiEstimated ? '#eff6ff' : '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isAiEstimated ? <Cpu size={14} color="#2563eb" /> : <ShieldCheck size={14} color="#16a34a" />}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>
              {isAiEstimated ? 'AI Surface PM2.5 Estimation' : 'CPCB Ground Station Observation'}
            </div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>
              {prediction.model_version || 'XGBoost v1.0 / CPCB NAQI'}
            </div>
          </div>
        </div>

        {/* Confidence Badge */}
        <div
          style={{
            fontSize: '10px',
            fontWeight: '700',
            padding: '2px 8px',
            borderRadius: '4px',
            background: isAiEstimated ? '#e0f2fe' : '#dcfce7',
            color: isAiEstimated ? '#0369a1' : '#15803d',
            border: `1px solid ${isAiEstimated ? '#bae6fd' : '#bbf7d0'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Sparkles size={10} />
          {prediction.confidence_level || 'High'} Conf. ({Math.round((prediction.confidence_score || 0.88) * 100)}%)
        </div>
      </div>

      {/* 95% Confidence Interval Banner */}
      {prediction.confidence_interval_95 && (
        <div
          style={{
            background: '#f1f5f9',
            borderRadius: '6px',
            padding: '8px 10px',
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
          }}
        >
          <span style={{ color: '#64748b', fontWeight: '500' }}>95% Confidence Interval:</span>
          <span style={{ color: '#1e293b', fontWeight: '700' }}>
            [{prediction.confidence_interval_95[0]} – {prediction.confidence_interval_95[1]} {prediction.pm25_unit}]
          </span>
        </div>
      )}

      {/* TreeSHAP Feature Contributions Waterfall */}
      {prediction.feature_contributions && prediction.feature_contributions.length > 0 && (
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#334155',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Info size={12} color="#64748b" />
            TreeSHAP Estimation Drivers
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {prediction.feature_contributions.map((feat, idx) => {
              const isPositive = feat.contribution_ugm3 >= 0;
              const absVal = Math.abs(feat.contribution_ugm3);
              const absPct = Math.min(100, Math.abs(feat.percentage));

              return (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #f1f5f9',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#1e293b' }}>
                      {feat.feature.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: isPositive ? '#dc2626' : '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {isPositive ? '+' : '-'}
                      {absVal.toFixed(1)} {prediction.pm25_unit}
                    </span>
                  </div>

                  {/* Impact Bar */}
                  <div
                    style={{
                      height: '4px',
                      width: '100%',
                      background: '#f1f5f9',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      marginBottom: '4px',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${absPct}%`,
                        background: isPositive ? '#ef4444' : '#22c55e',
                        borderRadius: '2px',
                      }}
                    />
                  </div>

                  <div style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.4' }}>
                    {feat.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplainabilityCard;
