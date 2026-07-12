import type { ReactNode, CSSProperties } from 'react';
import clsx from 'clsx';

/* ═══════════════════════════════════════════════════════════════
   Shared UI components for RegPilot AI
   ═══════════════════════════════════════════════════════════════ */

// ── Button ────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

const buttonStyles: Record<ButtonVariant, CSSProperties> = {
  primary: { background: 'var(--color-accent-emerald)', color: '#fff', border: 'none' },
  secondary: { background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' },
  ghost: { background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid transparent' },
  danger: { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' },
  success: { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' },
};

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  onClick?: (e: any) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  style?: CSSProperties;
}

export function Button({ children, variant = 'primary', onClick, disabled, size = 'md', style }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...buttonStyles[variant],
        padding: size === 'sm' ? '5px 12px' : '8px 16px',
        borderRadius: 8,
        fontSize: size === 'sm' ? 12 : 13,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ── Badge ─────────────────────────────────────────────────────
const statusColors: Record<string, { bg: string; color: string }> = {
  'Approved': { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
  'Workflow Created': { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
  'Needs Review': { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
  'AI Draft': { bg: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8' },
  'Rejected': { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
  'Legal Review': { bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' },
  'Pending': { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
  'In Progress': { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
  'Completed': { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
  'Overdue': { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
  'Escalated': { bg: 'rgba(249, 115, 22, 0.15)', color: '#f97316' },
  'Accepted': { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },

  'Missing': { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
  'Analyzed': { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
  'Uploaded': { bg: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8' },
  'Processing': { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
};

const riskColors: Record<string, { bg: string; color: string }> = {
  'Critical': { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
  'High': { bg: 'rgba(249, 115, 22, 0.15)', color: '#f97316' },
  'Medium': { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
  'Low': { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
};

interface BadgeProps {
  children: ReactNode;
  variant?: 'status' | 'risk' | 'custom';
  color?: string;
  bg?: string;
}

export function Badge({ children, variant = 'status', color, bg }: BadgeProps) {
  const label = String(children);
  const colors = variant === 'risk'
    ? riskColors[label] || { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' }
    : statusColors[label] || { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' };

  return (
    <span className="badge" style={{
      background: bg || colors.bg,
      color: color || colors.color,
    }}>
      {children}
    </span>
  );
}

// ── MetricCard ────────────────────────────────────────────────
interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  color?: string;
  subtitle?: string;
}

export function MetricCard({ icon, label, value, color = 'var(--color-accent-emerald)', subtitle }: MetricCardProps) {
  return (
    <div className="glass-card" style={{ padding: '18px 20px', flex: 1, minWidth: 140 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color,
        }}>
          {icon}
        </div>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>{subtitle}</div>
      )}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────
interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  style?: CSSProperties;
  hoverable?: boolean;
  onClick?: () => void;
}

export function Card({ children, title, subtitle, actions, style, hoverable, onClick }: CardProps) {
  return (
    <div
      className={clsx('glass-card', hoverable && 'glass-card-hover')}
      onClick={onClick}
      style={{ padding: '20px', cursor: onClick ? 'pointer' : 'default', ...style }}
    >
      {(title || actions) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            {title && <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

// ── ConfidenceBar ─────────────────────────────────────────────
interface ConfidenceBarProps {
  score: number; // 0-1
  showLabel?: boolean;
}

export function ConfidenceBar({ score, showLabel = true }: ConfidenceBarProps) {
  const pct = Math.round(score * 100);
  const barColor = pct >= 85 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        flex: 1, height: 6, borderRadius: 3,
        background: 'var(--color-bg-surface)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: barColor, borderRadius: 3,
          transition: 'width 0.3s ease',
        }} />
      </div>
      {showLabel && (
        <span style={{ fontSize: 11, fontWeight: 600, color: barColor, minWidth: 36 }}>
          {pct}%
        </span>
      )}
    </div>
  );
}

// ── ClauseTrustScore ──────────────────────────────────────────
interface ClauseTrustProps {
  score: number; // 0-100
  compact?: boolean;
}

export function ClauseTrustScore({ score, compact }: ClauseTrustProps) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  if (compact) {
    return (
      <span style={{ fontSize: 12, fontWeight: 700, color }}>
        {score}/100
      </span>
    );
  }
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 6,
      background: `${color}15`, border: `1px solid ${color}30`,
    }}>
      <Shield size={12} style={{ color }} />
      <span style={{ fontSize: 11, fontWeight: 600, color }}>
        ClauseTrust: {score}/100
      </span>
    </div>
  );
}

import { Shield } from 'lucide-react';

// ── EvidenceCompletenessBar ───────────────────────────────────
interface EvidenceCompletenessProps {
  uploaded: number;
  required: number;
}

export function EvidenceCompletenessBar({ uploaded, required }: EvidenceCompletenessProps) {
  const pct = required > 0 ? Math.round((uploaded / required) * 100) : 0;
  const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Evidence Completeness</span>
        <span style={{ fontSize: 11, fontWeight: 600, color }}>{uploaded}/{required} ({pct}%)</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'var(--color-bg-surface)', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: color, borderRadius: 3,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
}

// ── AuditTimeline ─────────────────────────────────────────────
interface TimelineItem {
  action: string;
  actor: string | null;
  timestamp: string;
  details?: Record<string, unknown> | null;
}

interface AuditTimelineProps {
  events: TimelineItem[];
}

export function AuditTimeline({ events }: AuditTimelineProps) {
  return (
    <div style={{ position: 'relative', paddingLeft: 24 }}>
      {/* Vertical line */}
      <div style={{
        position: 'absolute', left: 7, top: 4, bottom: 4,
        width: 2, background: 'var(--color-border)',
      }} />
      {events.map((event, i) => (
        <div key={i} style={{ position: 'relative', marginBottom: 16 }} className="animate-fade-in">
          {/* Dot */}
          <div style={{
            position: 'absolute', left: -20, top: 4,
            width: 10, height: 10, borderRadius: '50%',
            background: i === events.length - 1 ? 'var(--color-accent-emerald)' : 'var(--color-border)',
            border: '2px solid var(--color-bg-card)',
          }} />
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {event.action}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
              {event.actor || 'System'} · {new Date(event.timestamp).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── HallucinationGuard ────────────────────────────────────────
interface HallucinationGuardProps {
  grounded: boolean;
  sourceCitation: string | null;
  confidenceScore: number;
}

export function HallucinationGuard({ grounded, sourceCitation, confidenceScore }: HallucinationGuardProps) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4,
    }}>
      <span style={{
        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
        background: grounded ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
        color: grounded ? '#10b981' : '#ef4444',
      }}>
        {grounded ? '✓ Grounded' : '✗ Ungrounded'}
      </span>
      <span style={{
        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
        background: sourceCitation ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
        color: sourceCitation ? '#10b981' : '#ef4444',
      }}>
        {sourceCitation ? '✓ Source Found' : '✗ No Source'}
      </span>
      <span style={{
        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
        background: confidenceScore >= 0.85 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
        color: confidenceScore >= 0.85 ? '#10b981' : '#f59e0b',
      }}>
        {confidenceScore >= 0.85 ? '✓ High Confidence' : '⚠ Review Required'}
      </span>
    </div>
  );
}
