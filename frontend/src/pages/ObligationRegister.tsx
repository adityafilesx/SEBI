import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Obligation, ObligationDetail } from '../types';
import PageShell from '../components/layout/PageShell';
import {
  Card, Badge, ClauseTrustScore,
  EvidenceCompletenessBar, AuditTimeline
} from '../components/ui';

export default function ObligationRegister() {
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<ObligationDetail | null>(null);

  useEffect(() => {
    api.getObligations().then(setObligations).catch(() => {});
  }, []);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'Needs Review', label: 'Pending Review' },
    { key: 'Approved', label: 'Approved' },
    { key: 'evidence_missing', label: 'Evidence Missing' },
    { key: 'high_risk', label: 'High Risk' },
    { key: 'Workflow Created', label: 'Workflow Created' },
  ];

  const filtered = obligations.filter(o => {
    if (filter === 'all') return true;
    if (filter === 'evidence_missing') return o.evidence_completeness < 100 && o.status !== 'Rejected';
    if (filter === 'high_risk') return o.risk_level === 'Critical' || o.risk_level === 'High';
    return o.status === filter;
  });

  const loadDetail = (id: number) => {
    api.getObligation(id).then(setSelected).catch(() => {});
  };

  return (
    <PageShell
      title="Obligation Register"
      subtitle={`${obligations.length} obligations tracked · ${obligations.filter(o => o.status === 'Approved' || o.status === 'Workflow Created').length} approved`}
    >
      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setSelected(null); }} style={{
            padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 500,
            background: filter === f.key ? 'var(--color-accent-emerald)' : 'var(--color-bg-card)',
            color: filter === f.key ? '#fff' : 'var(--color-text-secondary)',
            border: `1px solid ${filter === f.key ? 'var(--color-accent-emerald)' : 'var(--color-border)'}`,
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}>{f.label}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1.2fr 1fr' : '1fr', gap: 16 }}>
        {/* Table */}
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['ID', 'Requirement', 'Owner', 'Risk', 'Evidence', 'Trust', 'Status', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--color-text-muted)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(obl => (
                  <tr key={obl.id}
                    onClick={() => loadDetail(obl.id)}
                    style={{
                      borderBottom: '1px solid var(--color-border-light)',
                      cursor: 'pointer',
                      background: selected?.id === obl.id ? 'rgba(16,185,129,0.05)' : undefined,
                    }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: 'var(--color-accent-emerald)', fontSize: 11 }}>{obl.obligation_id}</td>
                    <td style={{ padding: '10px', maxWidth: 200 }}>
                      <div style={{ fontSize: 11.5, lineHeight: 1.4 }}>{obl.obligation_text.substring(0, 80)}...</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>{obl.trigger_type}</div>
                    </td>
                    <td style={{ padding: '10px', fontSize: 11 }}>{obl.owner_role || <span style={{ color: '#ef4444' }}>Unassigned</span>}</td>
                    <td style={{ padding: '10px' }}><Badge variant="risk">{obl.risk_level}</Badge></td>
                    <td style={{ padding: '10px', minWidth: 80 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: obl.evidence_completeness >= 80 ? '#10b981' : obl.evidence_completeness >= 50 ? '#f59e0b' : '#ef4444' }}>
                        {obl.evidence_uploaded}/{obl.evidence_required} ({Math.round(obl.evidence_completeness)}%)
                      </div>
                    </td>
                    <td style={{ padding: '10px' }}><ClauseTrustScore score={obl.clause_trust_score} compact /></td>
                    <td style={{ padding: '10px' }}><Badge>{obl.status}</Badge></td>
                    <td style={{ padding: '10px', color: 'var(--color-text-muted)' }}>›</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Detail Panel */}
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '75vh', overflowY: 'auto' }} className="animate-slide-in">
            <Card title={selected.obligation_id} subtitle={selected.source_citation || undefined}>
              <p style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                {selected.obligation_text}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, marginBottom: 12 }}>
                <div><span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>Owner</span><div style={{ fontWeight: 500 }}>{selected.owner_role || 'Unassigned'}</div></div>
                <div><span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>Department</span><div style={{ fontWeight: 500 }}>{selected.department || 'Unassigned'}</div></div>
                <div><span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>Deadline</span><div style={{ fontWeight: 500 }}>{selected.deadline_rule || '—'}</div></div>
                <div><span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>Type</span><div style={{ fontWeight: 500 }}>{selected.obligation_type}</div></div>
              </div>
              <EvidenceCompletenessBar uploaded={selected.evidence_uploaded} required={selected.evidence_required} />
              <div style={{ marginTop: 8 }}>
                <ClauseTrustScore score={selected.clause_trust_score} />
              </div>
            </Card>

            {/* Evidence Files */}
            {selected.evidence_items.length > 0 && (
              <Card title="Evidence Files">
                {selected.evidence_items.map(ev => (
                  <div key={ev.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: '1px solid var(--color-border-light)', fontSize: 12,
                  }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{ev.file_name}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{ev.evidence_type} · {ev.uploaded_by}</div>
                    </div>
                    <Badge>{ev.validation_status}</Badge>
                  </div>
                ))}
              </Card>
            )}

            {/* Audit Trail */}
            {selected.audit_trail.length > 0 && (
              <Card title="Compliance History">
                <AuditTimeline events={selected.audit_trail} />
              </Card>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
