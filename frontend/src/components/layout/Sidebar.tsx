import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, ClipboardCheck, List,
  GitBranch, FileBarChart, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/documents/1', icon: FileText, label: 'Document Viewer' },
  { to: '/review', icon: ClipboardCheck, label: 'Review Console' },
  { to: '/obligations', icon: List, label: 'Obligation Register' },
  { to: '/workflows', icon: GitBranch, label: 'Workflows & Gaps' },
  { to: '/audit', icon: FileBarChart, label: 'Audit Report' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{
        width: collapsed ? 64 : 240,
        minHeight: '100vh',
        background: 'var(--color-bg-sidebar)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 12px' : '20px 20px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #10b981, #3b82f6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 14, color: '#fff', flexShrink: 0,
        }}>
          RP
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)' }}>
              RegPilot AI
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
              COMPLIANCE COMPILER
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: collapsed ? '10px 12px' : '10px 14px',
              borderRadius: 8,
              fontSize: 13.5, fontWeight: 500,
              color: isActive ? 'var(--color-accent-emerald)' : 'var(--color-text-secondary)',
              background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              justifyContent: collapsed ? 'center' : 'flex-start',
            })}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          padding: '12px', margin: 8, borderRadius: 8,
          background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
          color: 'var(--color-text-secondary)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s ease',
        }}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Footer */}
      {!collapsed && (
        <div style={{
          padding: '12px 20px', borderTop: '1px solid var(--color-border)',
          fontSize: 10, color: 'var(--color-text-muted)',
        }}>
          SEBI TechSprint 2026 · Track 2
        </div>
      )}
    </aside>
  );
}
