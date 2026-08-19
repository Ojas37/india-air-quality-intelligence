import React from 'react';
import { Database, AlertTriangle } from 'lucide-react';
import { dataSources } from '../data/mockData';

const STATUS_CONFIG = {
  Connected: { color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', label: 'Connected' },
  Prototype: { color: '#f97316', bg: '#fff7ed', border: '#fed7aa', label: 'Prototype — Mock Data' },
  Planned: { color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0', label: 'Planned' },
};

const DataSources: React.FC = () => {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#f8f9fa' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 24px 48px' }}>
        {/* Page header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Database size={18} color="#1d4ed8" />
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
              Data Sources & Methodology
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
            Scientific data sources planned for integration into the India Air Quality Intelligence Platform
          </p>
        </div>

        {/* Prototype notice */}
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            padding: '14px 16px',
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            alignItems: 'flex-start',
          }}
        >
          <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#92400e', marginBottom: '4px' }}>
              Prototype Mode — Demo Interface
            </div>
            <div style={{ fontSize: '12px', color: '#78350f', lineHeight: '1.6' }}>
              This platform is currently operating in prototype mode. All displayed data is <strong>mock/simulated data</strong> designed to demonstrate the interface and analytical capabilities. The data sources listed below represent the planned real-data integration pipeline. No live API connections are active in this phase.
            </div>
          </div>
        </div>

        {/* Data source cards */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '14px' }}>
            Planned Data Integrations
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {dataSources.map((ds) => {
              const statusCfg = STATUS_CONFIG[ds.status];
              return (
                <div
                  key={ds.id}
                  className="card"
                  style={{ padding: '18px 20px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '2px' }}>
                        {ds.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{ds.provider}</div>
                    </div>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: statusCfg.bg,
                        color: statusCfg.color,
                        border: `1px solid ${statusCfg.border}`,
                        whiteSpace: 'nowrap',
                        marginLeft: '8px',
                      }}
                    >
                      {statusCfg.label}
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: '#475569', marginBottom: '12px', lineHeight: '1.6', marginTop: 0 }}>
                    {ds.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px', fontSize: '11px' }}>
                    <div>
                      <div style={{ color: '#94a3b8', marginBottom: '2px' }}>Spatial Resolution</div>
                      <div style={{ fontWeight: '600', color: '#334155' }}>{ds.resolution}</div>
                    </div>
                    <div>
                      <div style={{ color: '#94a3b8', marginBottom: '2px' }}>Update Frequency</div>
                      <div style={{ fontWeight: '600', color: '#334155' }}>{ds.frequency}</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Parameters
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {ds.parameters.map((p) => (
                        <span
                          key={p}
                          style={{
                            fontSize: '10px',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            background: '#f1f5f9',
                            color: '#334155',
                            fontWeight: '500',
                          }}
                          dangerouslySetInnerHTML={{ __html: p }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>



        {/* Footer note */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '11px', color: '#94a3b8', lineHeight: '1.8' }}>
          India Air Quality & Pollution Intelligence Platform — Prototype v1.0
          <br />
          Developed for academic demonstration. Mock data only. No real-time environmental data is displayed.
        </div>
      </div>
    </div>
  );
};

export default DataSources;
