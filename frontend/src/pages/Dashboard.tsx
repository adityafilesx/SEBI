import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, List, ClipboardCheck, AlertTriangle, ShieldCheck,
  Activity, TrendingUp, Radar, ChevronRight
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { api } from '../lib/api';
import type { Document, Obligation, DashboardMetrics, ImpactRadar } from '../types';
import PageShell from '../components/layout/PageShell';
import { MetricCard, Card, Badge, ConfidenceBar, ClauseTrustScore } from '../components/ui';

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#64748b'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [radar, setRadar] = useState<ImpactRadar | null>(null);

  useEffect(() => {
    api.getDashboardMetrics().then(setMetrics).catch(() => {});
    api.getDocuments().then(setDocuments).catch(() => {});
    api.getObligations().then(setObligations).catch(() => {});
    api.getImpactRadar().then(setRadar).catch(() => {});
  }, []);

  const statusData = obligations.reduce((acc, o) => {
    const existing = acc.find(a => a.name === o.status);
    if (existing) existing.value++;
    else acc.push({ name: o.status, value: 1 });
    return acc;
  }, [] as { name: string; value: number }[]);

  const riskData = obligations.reduce((acc, o) => {
    const existing = acc.find(a => a.name === o.risk_level);
    if (existing) existing.value++;
    else acc.push({ name: o.risk_level, value: 1 });
    return acc;
  }, [] as { name: string; value: number }[]);

  const recentObligations = obligations
    .filter(o => o.status === 'Needs Review' || o.status === 'AI Draft')
    .slice(0, 4);

  const alerts = [
    { text: 'RCA evidence missing for OBL-TG-003', severity: 'Critical', icon: AlertTriangle },
    { text: 'Workflow WF-TG-003 is overdue — escalation required', severity: 'High', icon: Activity },
    { text: 'New circular not yet reviewed (Cybersecurity Framework)', severity: 'Medium', icon: FileText },
    { text: 'OBL-TG-009 has no assigned owner', severity: 'High', icon: ShieldCheck },
  ];

  return (
    <PageShell
      title="Compliance Workbench"
      subtitle="RegPilot AI — SEBI Stockbroker Technical Glitch Compliance"
    >
      {/* Pipeline Strip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24,
        overflowX: 'auto', paddingBottom: 8,
      }}>
        {['Circular', 'Clause', 'Obligation', 'Approval', 'Workflow', 'Evidence', 'Audit'].map((step, i) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div className="pipeline-step">
              <div style={{
                width: 20, height: 20, borderRadius: '50%', fontSize: 10, fontWeight: 700,
                background: 'var(--color-accent-emerald)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{i + 1}</div>
              {step}
            </div>
            {i < 6 && <span className="pipeline-arrow">→</span>}
          </div>
        ))}
      </div>

      {/* Metric Cards */}
      {metrics && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <MetricCard icon={<FileText size={18} />} label="Documents" value={metrics.documents_processed} color="#3b82f6" />
          <MetricCard icon={<List size={18} />} label="Clauses" value={metrics.clauses_extracted} color="#8b5cf6" />
          <MetricCard icon={<ClipboardCheck size={18} />} label="Obligations" value={metrics.obligations_generated} color="#10b981" />
          <MetricCard icon={<AlertTriangle size={18} />} label="Pending Reviews" value={metrics.pending_reviews} color="#f59e0b" />
          <MetricCard icon={<ShieldCheck size={18} />} label="Evidence Gaps" value={metrics.evidence_gaps} color="#ef4444" />
          <MetricCard icon={<Activity size={18} />} label="Overdue" value={metrics.overdue_workflows} color="#f97316" />
          <MetricCard icon={<TrendingUp size={18} />} label="Audit Readiness" value={`${metrics.audit_readiness_score}%`} color="#10b981" subtitle="Score" />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Regulatory Inbox */}
        <Card title="Regulatory Inbox" subtitle="Recently processed documents" style={{ gridColumn: '1 / -1' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Document', 'Type', 'Date', 'Status', 'Clauses', 'Obligations', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--color-text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid var(--color-border-light)', cursor: 'pointer' }}
                      onClick={() => navigate(`/documents/${doc.id}`)}>
                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>{doc.title.substring(0, 60)}...</td>
                    <td style={{ padding: '10px 12px' }}><Badge>{doc.document_type}</Badge></td>
                    <td style={{ padding: '10px 12px', color: 'var(--color-text-secondary)', fontSize: 12 }}>
                      {doc.issue_date ? new Date(doc.issue_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '10px 12px' }}><Badge>{doc.status}</Badge></td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{doc.clause_count}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{doc.obligation_count}</td>
                    <td style={{ padding: '10px 12px' }}><ChevronRight size={14} color="var(--color-text-muted)" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Compliance Status (Pie) */}
        <Card title="Compliance Status" subtitle="Obligation distribution by status">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {statusData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--color-text-primary)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {statusData.map((s, i) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span style={{ color: 'var(--color-text-secondary)' }}>{s.name}: {s.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Risk Distribution (Bar) */}
        <Card title="Risk Distribution" subtitle="Obligations by risk level">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={riskData} layout="vertical">
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 12 }} width={70} />
              <Tooltip
                contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {riskData.map((entry) => (
                  <Cell key={entry.name} fill={
                    entry.name === 'Critical' ? '#ef4444' :
                    entry.name === 'High' ? '#f97316' :
                    entry.name === 'Medium' ? '#f59e0b' : '#10b981'
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Regulatory Change Impact Radar (Novelty 8) */}
        {radar && (
          <Card title="Regulatory Change Impact Radar" subtitle="Jan 2026 Technical Glitch Circular">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Radar size={32} color="var(--color-accent-cyan)" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{radar.circular_title}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>New circular detected — impact analysis</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Clauses Added', value: radar.clauses_added, color: '#10b981' },
                { label: 'Obligations Modified', value: radar.obligations_modified, color: '#f59e0b' },
                { label: 'Workflows Impacted', value: radar.workflows_impacted, color: '#3b82f6' },
                { label: 'Evidence Changes', value: radar.evidence_requirements_changed, color: '#8b5cf6' },
              ].map(item => (
                <div key={item.label} style={{
                  padding: '10px 14px', borderRadius: 8,
                  background: `${item.color}10`, border: `1px solid ${item.color}25`,
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>
            {radar.review_required && (
              <div style={{
                marginTop: 12, padding: '8px 12px', borderRadius: 6,
                background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)',
                fontSize: 11, color: '#f59e0b', fontWeight: 500,
              }}>
                ⚠ Compliance officer review required for {radar.obligations_modified + radar.clauses_added} items
              </div>
            )}
          </Card>
        )}

        {/* Critical Alerts */}
        <Card title="Critical Alerts" subtitle="Requires immediate attention">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alerts.map((alert, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 8,
                background: alert.severity === 'Critical' ? 'rgba(239,68,68,0.06)' :
                            alert.severity === 'High' ? 'rgba(249,115,22,0.06)' : 'rgba(245,158,11,0.06)',
                border: `1px solid ${
                  alert.severity === 'Critical' ? 'rgba(239,68,68,0.15)' :
                  alert.severity === 'High' ? 'rgba(249,115,22,0.15)' : 'rgba(245,158,11,0.15)'
                }`,
              }}>
                <alert.icon size={14} color={
                  alert.severity === 'Critical' ? '#ef4444' :
                  alert.severity === 'High' ? '#f97316' : '#f59e0b'
                } />
                <span style={{ flex: 1, fontSize: 12, color: 'var(--color-text-secondary)' }}>{alert.text}</span>
                <Badge variant="risk">{alert.severity}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent AI Extractions */}
        <Card title="Recent AI Extractions" subtitle="Obligations pending review" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {recentObligations.map(obl => (
              <div key={obl.id} className="glass-card glass-card-hover" style={{ padding: 14, cursor: 'pointer' }}
                   onClick={() => navigate('/review')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent-emerald)' }}>{obl.obligation_id}</span>
                  <Badge>{obl.status}</Badge>
                </div>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>
                  {obl.obligation_text.substring(0, 120)}...
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <ConfidenceBar score={obl.confidence_score} />
                  <ClauseTrustScore score={obl.clause_trust_score} compact />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
