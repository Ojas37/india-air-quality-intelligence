import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wind,
  Flame,
  Zap,
  ArrowRightLeft,
  Database,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/air-quality', label: 'Air Quality', icon: Wind },
  { path: '/hcho-hotspots', label: 'HCHO Hotspots', icon: Zap },
  { path: '/fire-activity', label: 'Fire Activity', icon: Flame },
  { path: '/pollution-transport', label: 'Pollution Transport', icon: ArrowRightLeft },
  { path: '/data-sources', label: 'Data Sources', icon: Database },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();

  return (
    <aside
      className="sidebar flex flex-col h-full relative"
      style={{
        width: collapsed ? '56px' : '220px',
        minWidth: collapsed ? '56px' : '220px',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 border-b"
        style={{
          padding: collapsed ? '16px 14px' : '16px 16px',
          borderColor: 'rgba(255,255,255,0.08)',
          height: '56px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            minWidth: '28px',
            background: '#2563eb',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Wind size={16} color="white" />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '700',
                color: '#e2e8f0',
                whiteSpace: 'nowrap',
                lineHeight: '1.2',
                letterSpacing: '0.01em',
              }}
            >
              India AQI
            </div>
            <div
              style={{
                fontSize: '10px',
                color: '#64748b',
                whiteSpace: 'nowrap',
                letterSpacing: '0.02em',
              }}
            >
              Intelligence Platform
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3" style={{ padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
              style={{ marginBottom: '2px', justifyContent: collapsed ? 'center' : 'flex-start' }}
            >
              <Icon size={16} style={{ minWidth: '16px' }} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      {!collapsed && (
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ fontSize: '10px', color: '#475569', lineHeight: '1.6' }}>
            <div style={{ color: '#64748b', marginBottom: '2px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '9px' }}>
              Platform Version
            </div>
            v1.0.0 — Prototype
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          top: '14px',
          right: '-12px',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: '#334155',
          border: '2px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          color: '#94a3b8',
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
      </button>
    </aside>
  );
};

export default Sidebar;
