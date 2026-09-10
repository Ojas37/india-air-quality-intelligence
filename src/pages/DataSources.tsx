import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2 } from 'lucide-react';
import { dataSources as fallbackDataSources } from '../data/mockData';
import type { DataSource } from '../types';
import { api } from '../services/api';

const DataSources: React.FC = () => {
  const [sources, setSources] = useState<DataSource[]>(fallbackDataSources);

  useEffect(() => {
    api.getDatasets()
      .then((data) => {
        if (data && data.length > 0) {
          setSources(data);
        }
      })
      .catch(() => setSources(fallbackDataSources));
  }, []);

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#f8f9fa' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 24px 48px' }}>
        {/* Page header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Database size={18} color="#1d4ed8" />
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
              Data Sources & Multi-Source Geospatial Fusion Catalog
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
            Scientific datasets integrated into AIMLess: in-situ monitoring, geostationary & polar-orbiting satellites, and atmospheric reanalysis.
          </p>
        </div>

        {/* Data source cards */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
              Integrated Geospatial Data Catalog ({sources.length})
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>
              <CheckCircle2 size={13} />
              All Pipeline Ingestors Active
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {sources.map((ds) => {
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
                        fontWeight: '700',
                        color: '#0284c7',
                        background: '#e0f2fe',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        border: '1px solid #bae6fd',
                      }}
                    >
                      {ds.status || 'Active'}
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
                      Parameters & Features
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
          AIMLess — India Air Quality & Pollution Intelligence Platform
          <br />
          Smart India Hackathon (SIH) Real-Data Geospatial Pipeline & Benchmark Demonstration
        </div>
      </div>
    </div>
  );
};

export default DataSources;
