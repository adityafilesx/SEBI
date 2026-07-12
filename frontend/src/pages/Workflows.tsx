import { useEffect, useState } from 'react';
import { GitBranch, AlertTriangle, Clock, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import type { Workflow, Gap, RemediationPlan } from '../types';
import PageShell from '../components/layout/PageShell';
import { Card, Badge, Button } from '../components/ui';

export default function Workflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [remediation, setRemediation] = useState<RemediationPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'workflows' | 'gaps'>('workflows');

  useEffect(() => {
    api.getWorkflows().then(setWorkflows).catch(() => {});
    api.getGaps().then(setGaps).catch(() => {});
  }, []);

  const handleRemediation = async (gapId: string) => {
    const plan = await api.getRemediation(gapId);
    setRemediation(plan);
  };

  const timelineSteps = [
    'Incident Detected', 'Initial Classification', 'Report Preparation',
    'Exchange Submission', 'Root Cause Analysis', 'Corrective Action',
    'Management Review', 'Audit Pack Closure'
  ];

  return (
    <PageShell
      title="Workflows & Gap Detection"
      subtitle={`${workflows.length} workflows · ${gaps.length} compliance gaps detected`}
    >
      {/* Tab Switch */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        <button onClick={() => setActiveTab('workflows')} style={{
          padding: '8px 20px', borderRadius: '8px 8px 0 0', fontSize: 13, fontWeight: 600,
          background: activeTab === 'workflows' ? 'var(--color-bg-card)' : 'transparent',
          color: activeTab === 'workflows' ? 'var(--color-accent-emerald)' : 'var(--color-text-muted)',
          border: activeTab === 'workflows' ? '1px solid var(--color-border)' : '1px solid transparent',
          borderBottom: activeTab === 'workflows' ? '1px solid var(--color-bg-card)' : undefined,
          cursor: 'pointer', fontFamily: 'var(--font-sans)',
        }}>
          <GitBranch size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
          Workflows ({workflows.length})
        </button>
        <button onClick={() => setActiveTab('gaps')} style={{
          padding: '8px 20px', borderRadius: '8px 8px 0 0', fontSize: 13, fontWeight: 600,
          background: activeTab === 'gaps' ? 'var(--color-bg-card)' : 'transparent',
          color: activeTab === 'gaps' ? 'var(--color-accent-amber)' : 'var(--color-text-muted)',
          border: activeTab === 'gaps' ? '1px solid var(--color-border)' : '1px solid transparent',
          borderBottom: activeTab === 'gaps' ? '1px solid var(--color-bg-card)' : undefined,
          cursor: 'pointer', fontFamily: 'var(--font-sans)',
        }}>
          <AlertTriangle size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
          Gaps ({gaps.length})
        </button>
      </div>

      {activeTab === 'workflows' && (
        <>
          {/* Visual Workflow Timeline */}
          <Card title="Technical Glitch Incident Lifecycle" subtitle="End-to-end compliance workflow" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto', padding: '8px 0' }}>
              {timelineSteps.map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    padding: '8px 14px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                    background: i < 3 ? 'rgba(16,185,129,0.15)' : i < 5 ? 'rgba(59,130,246,0.15)' : 'rgba(100,116,139,0.1)',
                    color: i < 3 ? '#10b981' : i < 5 ? '#3b82f6' : '#94a3b8',
                    border: `1px solid ${i < 3 ? 'rgba(16,185,129,0.3)' : i < 5 ? 'rgba(59,130,246,0.3)' : 'var(--color-border)'}`,
                    whiteSpace: 'nowrap',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    {i < 3 && <CheckCircle2 size={10} />}
                    {step}
                  </div>
                  {i < timelineSteps.length - 1 && <ArrowRight size={14} color="var(--color-text-muted)" />}
                </div>
              ))}
            </div>
          </Card>

          {/* Workflow Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
            {workflows.map(wf => (
              <Card key={wf.id} hoverable>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent-blue)' }}>{wf.workflow_id}</span>
                  <Badge>{wf.status}</Badge>
                </div>
                <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{wf.title}</h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11, marginBottom: 10 }}>
                  <div><User size={10} style={{ display: 'inline', marginRight: 4 }} />{wf.owner || 'Unassigned'}</div>
                  <div><Clock size={10} style={{ display: 'inline', marginRight: 4 }} />{wf.due_date ? new Date(wf.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</div>
                  <div style={{ color: 'var(--color-text-muted)' }}>{wf.department}</div>
                  <div style={{ color: 'var(--color-text-muted)' }}>Linked: {wf.linked_obligation_id}</div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Progress</span>
                    <span style={{ fontWeight: 600, color: wf.completion_percentage === 100 ? '#10b981' : '#3b82f6' }}>
                      {wf.completion_percentage}%
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--color-bg-surface)' }}>
                    <div style={{
                      width: `${wf.completion_percentage}%`, height: '100%', borderRadius: 3,
                      background: wf.status === 'Overdue' ? '#ef4444' : wf.completion_percentage === 100 ? '#10b981' : '#3b82f6',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>

                {/* Steps */}
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  {wf.steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
                      <span style={{
                        width: 14, height: 14, borderRadius: '50%', fontSize: 8, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: step.status === 'Completed' ? '#10b981' : step.status === 'In Progress' ? '#3b82f6' : 'var(--color-border)',
                        color: step.status === 'Pending' ? 'var(--color-text-muted)' : '#fff',
                      }}>
                        {step.status === 'Completed' ? '✓' : step.step}
                      </span>
                      <span style={{
                        textDecoration: step.status === 'Completed' ? 'line-through' : 'none',
                        opacity: step.status === 'Completed' ? 0.6 : 1,
                      }}>{step.title}</span>
                    </div>
                  ))}
                </div>

                {wf.escalation_level > 0 && (
                  <div style={{
                    marginTop: 8, padding: '4px 8px', borderRadius: 4,
                    background: 'rgba(239,68,68,0.1)', fontSize: 10, color: '#ef4444', fontWeight: 500,
                  }}>
                    ⚠ Escalation Level {wf.escalation_level}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === 'gaps' && (
        <div style={{ display: 'grid', gridTemplateColumns: remediation ? '1.2fr 1fr' : '1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {gaps.map(gap => (
              <Card key={gap.gap_id} hoverable>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent-amber)', marginRight: 8 }}>{gap.gap_id}</span>
                    <Badge>{gap.gap_type.replace('_', ' ')}</Badge>
                  </div>
                  <Badge variant="risk">{gap.severity}</Badge>
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                  Linked: {gap.obligation_id}
                </div>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
                  {gap.reason}
                </p>
                <div style={{
                  padding: '8px 10px', borderRadius: 6, background: 'var(--color-bg-surface)',
                  fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 8,
                }}>
                  <strong style={{ color: 'var(--color-text-primary)' }}>Suggested:</strong> {gap.suggested_remediation}
                </div>
                <Button size="sm" variant="primary" onClick={() => handleRemediation(gap.gap_id)}>
                  Generate Remediation Plan
                </Button>
              </Card>
            ))}
          </div>

          {/* Remediation Plan */}
          {remediation && (
            <div className="animate-slide-in">
              <Card title="Remediation Plan" subtitle={`For ${remediation.gap_id}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {remediation.steps.map(step => (
                    <div key={step.step} style={{
                      padding: '12px', borderRadius: 8,
                      background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                          background: 'var(--color-accent-emerald)', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>{step.step}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{step.action}</span>
                      </div>
                      <p style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', marginLeft: 30, lineHeight: 1.5 }}>
                        {step.details}
                      </p>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 30, marginTop: 4 }}>
                        Deadline: {step.deadline}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}
