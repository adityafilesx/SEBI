import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Scale, User, Zap } from 'lucide-react';
import { api } from '../lib/api';
import type { Obligation, ObligationDetail } from '../types';
import PageShell from '../components/layout/PageShell';
import {
  Card, Badge, Button, ConfidenceBar, ClauseTrustScore,
  EvidenceCompletenessBar, AuditTimeline, HallucinationGuard,
} from '../components/ui';

export default function ReviewConsole() {
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [selected, setSelected] = useState<ObligationDetail | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadObligations();
  }, []);

  const loadObligations = () => {
    api.getObligations().then(setObligations).catch(() => {});
  };

  const loadDetail = (id: number) => {
    api.getObligation(id).then(setSelected).catch(() => {});
  };

  const handleApprove = async (id: number) => {
    setActionLoading(true);
    await api.approveObligation(id);
    loadObligations();
    loadDetail(id);
    setActionLoading(false);
  };

  const handleReject = async (id: number) => {
    setActionLoading(true);
    await api.rejectObligation(id);
    loadObligations();
    loadDetail(id);
    setActionLoading(false);
  };

  const handleLegalReview = async (id: number) => {
    setActionLoading(true);
    await api.sendForLegalReview(id);
    loadObligations();
    loadDetail(id);
    setActionLoading(false);
  };

  const handleGenerateWorkflow = async (id: number) => {
    setActionLoading(true);
    await api.generateWorkflow(id);
    loadObligations();
    loadDetail(id);
    setActionLoading(false);
  };

  const filtered = filter === 'all'
    ? obligations
    : obligations.filter(o => o.status === filter);

  const reviewable = ['Needs Review', 'AI Draft'];
  const needsReviewCount = obligations.filter(o => reviewable.includes(o.status)).length;

  return (
    <PageShell
      title="Obligation Review Console"
      subtitle={`${needsReviewCount} obligation(s) pending review · Human-in-the-loop governance`}
    >
      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: `All (${obligations.length})` },
          { key: 'Needs Review', label: `Needs Review (${obligations.filter(o => o.status === 'Needs Review').length})` },
          { key: 'AI Draft', label: `AI Draft (${obligations.filter(o => o.status === 'AI Draft').length})` },
          { key: 'Approved', label: `Approved (${obligations.filter(o => o.status === 'Approved').length})` },
          { key: 'Workflow Created', label: `Workflow Created (${obligations.filter(o => o.status === 'Workflow Created').length})` },
          { key: 'Rejected', label: `Rejected (${obligations.filter(o => o.status === 'Rejected').length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500,
              background: filter === tab.key ? 'var(--color-accent-emerald)' : 'var(--color-bg-card)',
              color: filter === tab.key ? '#fff' : 'var(--color-text-secondary)',
              border: `1px solid ${filter === tab.key ? 'var(--color-accent-emerald)' : 'var(--color-border)'}`,
              cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 16 }}>
        {/* Obligation Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '75vh', overflowY: 'auto' }}>
          {filtered.map(obl => (
            <div
              key={obl.id}
              onClick={() => loadDetail(obl.id)}
              className="glass-card glass-card-hover"
              style={{
                padding: 16, cursor: 'pointer',
                border: selected?.id === obl.id ? '1px solid var(--color-accent-emerald)' : undefined,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-accent-emerald)', marginRight: 8 }}>
                    {obl.obligation_id}
                  </span>
                  <Badge variant="risk">{obl.risk_level}</Badge>
                </div>
                <Badge>{obl.status}</Badge>
              </div>

              <p style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
                {obl.obligation_text.substring(0, 150)}...
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--color-text-muted)' }}>
                  <span><Zap size={10} style={{ display: 'inline', marginRight: 3 }} />{obl.trigger_type}</span>
                  <span><User size={10} style={{ display: 'inline', marginRight: 3 }} />{obl.owner_role || 'Unassigned'}</span>
                </div>
                <ClauseTrustScore score={obl.clause_trust_score} compact />
              </div>

              <ConfidenceBar score={obl.confidence_score} />

              <HallucinationGuard
                grounded={obl.grounded}
                sourceCitation={obl.source_citation}
                confidenceScore={obl.confidence_score}
              />

              {/* Action Buttons */}
              {reviewable.includes(obl.status) && (
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <Button size="sm" variant="success" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleApprove(obl.id); }} disabled={actionLoading}>
                    <CheckCircle size={12} /> Approve
                  </Button>
                  <Button size="sm" variant="danger" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleReject(obl.id); }} disabled={actionLoading}>
                    <XCircle size={12} /> Reject
                  </Button>
                  <Button size="sm" variant="ghost" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleLegalReview(obl.id); }} disabled={actionLoading}>
                    <Scale size={12} /> Legal
                  </Button>
                </div>
              )}
              {obl.status === 'Approved' && (
                <div style={{ marginTop: 10 }}>
                  <Button size="sm" variant="primary" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleGenerateWorkflow(obl.id); }} disabled={actionLoading}>
                    Generate Workflow
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Detail Panel / Audit Trail Drawer */}
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '75vh', overflowY: 'auto' }} className="animate-slide-in">
            <Card title={`${selected.obligation_id} — Detail`} subtitle={selected.source_citation || undefined}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 2 }}>Type</div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{selected.obligation_type}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 2 }}>Trigger</div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{selected.trigger_type}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 2 }}>Owner</div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{selected.owner_role || 'Unassigned'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 2 }}>Department</div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{selected.department || 'Unassigned'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 2 }}>Deadline</div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{selected.deadline_rule || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 2 }}>Intermediary</div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{selected.intermediary}</div>
                </div>
              </div>

              {/* Required Evidence */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>Required Evidence</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {selected.required_evidence.map(ev => (
                    <span key={ev} style={{
                      fontSize: 10, padding: '3px 8px', borderRadius: 4,
                      background: 'var(--color-bg-surface)', color: 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)',
                    }}>{ev}</span>
                  ))}
                </div>
              </div>

              {/* Scores */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <ClauseTrustScore score={selected.clause_trust_score} />
                <Badge variant="risk">{selected.risk_level}</Badge>
                <Badge>{selected.status}</Badge>
              </div>

              <EvidenceCompletenessBar uploaded={selected.evidence_uploaded} required={selected.evidence_required} />
            </Card>

            {/* Source Clause */}
            {selected.clause && (
              <Card title="Source Clause" subtitle={`Clause ${selected.clause.clause_number}`}>
                <div style={{
                  padding: 12, borderRadius: 6,
                  background: 'var(--color-bg-surface)',
                  borderLeft: '3px solid var(--color-accent-emerald)',
                  fontSize: 12, lineHeight: 1.7, color: 'var(--color-text-secondary)',
                }}>
                  {selected.clause.source_text || selected.clause.text}
                </div>
              </Card>
            )}

            {/* Evidence Items */}
            {selected.evidence_items.length > 0 && (
              <Card title="Evidence Files" subtitle={`${selected.evidence_items.length} file(s)`}>
                {selected.evidence_items.map(ev => (
                  <div key={ev.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: '1px solid var(--color-border-light)', fontSize: 12,
                  }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{ev.file_name}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{ev.evidence_type}</div>
                    </div>
                    <Badge>{ev.validation_status}</Badge>
                  </div>
                ))}
              </Card>
            )}

            {/* Audit Trail (Novelty 5) */}
            <Card title="Audit Trail" subtitle="Full compliance lifecycle">
              {selected.audit_trail.length > 0 ? (
                <AuditTimeline events={selected.audit_trail} />
              ) : (
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', padding: 12 }}>
                  No audit events recorded yet.
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </PageShell>
  );
}
