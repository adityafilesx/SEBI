import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Calendar, Building, Tag, ChevronRight, Eye } from 'lucide-react';
import { api } from '../lib/api';
import type { DocumentDetail, Clause, Obligation } from '../types';
import PageShell from '../components/layout/PageShell';
import { Card, Badge, Button, ConfidenceBar, ClauseTrustScore, HallucinationGuard } from '../components/ui';

export default function DocumentViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
  const [clauseObligations, setClauseObligations] = useState<Obligation[]>([]);
  const [allObligations, setAllObligations] = useState<Obligation[]>([]);

  useEffect(() => {
    if (id) {
      api.getDocument(Number(id)).then(d => {
        setDoc(d);
        if (d.clauses.length > 0) setSelectedClause(d.clauses[0]);
      }).catch(() => {});
      api.getObligations().then(setAllObligations).catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    if (selectedClause) {
      const oblsForClause = allObligations.filter(o => o.clause_id === selectedClause.id);
      setClauseObligations(oblsForClause);
    }
  }, [selectedClause, allObligations]);

  if (!doc) return <PageShell title="Loading..."><div style={{ color: 'var(--color-text-muted)' }}>Loading document...</div></PageShell>;

  return (
    <PageShell
      title={doc.title.substring(0, 70) + (doc.title.length > 70 ? '...' : '')}
      subtitle={`${doc.circular_number || 'Regulatory Document'} · ${doc.document_type}`}
      actions={
        <Button variant="secondary" onClick={() => navigate('/review')}>
          <Eye size={14} /> Review Obligations
        </Button>
      }
    >
      {/* Three-panel layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 1fr', gap: 16, minHeight: '70vh' }}>
        {/* LEFT: Document Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card title="Document Info">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={14} color="var(--color-accent-blue)" />
                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>Source</div>
                  <div style={{ fontWeight: 500 }}>{doc.source}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={14} color="var(--color-accent-purple)" />
                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>Issue Date</div>
                  <div style={{ fontWeight: 500 }}>
                    {doc.issue_date ? new Date(doc.issue_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building size={14} color="var(--color-accent-amber)" />
                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>Intermediary</div>
                  <div style={{ fontWeight: 500 }}>{doc.intermediary}</div>
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 10, marginBottom: 4 }}>Status</div>
                <Badge>{doc.status}</Badge>
              </div>
              <div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 10, marginBottom: 4 }}>Pages</div>
                <div style={{ fontWeight: 500 }}>{doc.page_count}</div>
              </div>
            </div>
          </Card>

          <Card title="Statistics">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ textAlign: 'center', padding: 8, borderRadius: 6, background: 'var(--color-bg-surface)' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-accent-blue)' }}>{doc.clause_count}</div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Clauses</div>
              </div>
              <div style={{ textAlign: 'center', padding: 8, borderRadius: 6, background: 'var(--color-bg-surface)' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-accent-emerald)' }}>{doc.obligation_count}</div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Obligations</div>
              </div>
            </div>
          </Card>

          {/* Scenario Tags */}
          <Card title="Scenario Tags">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {Array.from(new Set(doc.clauses.flatMap(c => c.risk_tags))).map(tag => (
                <span key={tag} style={{
                  fontSize: 10, padding: '3px 8px', borderRadius: 4,
                  background: 'var(--color-bg-surface)', color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                }}>
                  <Tag size={9} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                  {tag}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* MIDDLE: Clause Tree */}
        <Card title="Extracted Clauses" subtitle={`${doc.clauses.length} clauses from real document text`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: '65vh', overflowY: 'auto' }}>
            {doc.clauses.map(clause => (
              <div
                key={clause.id}
                onClick={() => setSelectedClause(clause)}
                style={{
                  padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  background: selectedClause?.id === clause.id ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  border: `1px solid ${selectedClause?.id === clause.id ? 'var(--color-accent-emerald)' : 'transparent'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{
                  minWidth: 44, padding: '2px 0', fontSize: 11, fontWeight: 700,
                  color: 'var(--color-accent-emerald)',
                }}>
                  {clause.clause_number}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 3 }}>
                    {clause.heading || 'Untitled Clause'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                    {clause.text.substring(0, 80)}...
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    {clause.risk_tags.slice(0, 2).map(tag => (
                      <span key={tag} style={{
                        fontSize: 9, padding: '1px 6px', borderRadius: 3,
                        background: 'var(--color-bg-surface)', color: 'var(--color-text-muted)',
                      }}>{tag}</span>
                    ))}
                    {clause.obligation_count > 0 && (
                      <span style={{
                        fontSize: 9, padding: '1px 6px', borderRadius: 3,
                        background: 'rgba(16,185,129,0.1)', color: '#10b981',
                      }}>{clause.obligation_count} obl.</span>
                    )}
                  </div>
                </div>
                <ChevronRight size={14} color="var(--color-text-muted)" />
              </div>
            ))}
          </div>
        </Card>

        {/* RIGHT: Selected Clause Detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {selectedClause ? (
            <>
              <Card title={`Clause ${selectedClause.clause_number}`} subtitle={selectedClause.heading || undefined}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Source Text (Extracted from PDF)
                  </div>
                  <div style={{
                    padding: 12, borderRadius: 6,
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)',
                    fontSize: 12, lineHeight: 1.7, color: 'var(--color-text-secondary)',
                    borderLeft: '3px solid var(--color-accent-emerald)',
                  }}>
                    {selectedClause.source_text || selectedClause.text}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {selectedClause.risk_tags.map(tag => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
                {selectedClause.page_number && (
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 8 }}>
                    Page {selectedClause.page_number}
                  </div>
                )}
              </Card>

              {/* Obligations for this clause */}
              {clauseObligations.length > 0 ? (
                <Card title="Extracted Obligations" subtitle={`${clauseObligations.length} obligation(s) from this clause`}>
                  {clauseObligations.map(obl => (
                    <div key={obl.id} style={{
                      padding: 12, borderRadius: 8, marginBottom: 8,
                      background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent-emerald)' }}>{obl.obligation_id}</span>
                        <Badge>{obl.status}</Badge>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
                        {obl.obligation_text}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <ClauseTrustScore score={obl.clause_trust_score} />
                        <Badge variant="risk">{obl.risk_level}</Badge>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4 }}>AI Confidence</div>
                        <ConfidenceBar score={obl.confidence_score} />
                      </div>
                      <HallucinationGuard
                        grounded={obl.grounded}
                        sourceCitation={obl.source_citation}
                        confidenceScore={obl.confidence_score}
                      />
                      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                        <Button size="sm" variant="success" onClick={() => navigate('/review')}>Approve</Button>
                        <Button size="sm" variant="secondary" onClick={() => navigate('/review')}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => navigate('/review')}>Reject</Button>
                        <Button size="sm" variant="ghost" onClick={() => navigate('/review')}>Legal Review</Button>
                      </div>
                    </div>
                  ))}
                </Card>
              ) : (
                <Card>
                  <div style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-muted)', fontSize: 12 }}>
                    No obligations extracted for this clause.
                    {selectedClause.text.length < 50 && <div style={{ marginTop: 4 }}>Clause text may be too short for obligation extraction.</div>}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)', fontSize: 13 }}>
                Select a clause from the list to view details and extracted obligations.
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageShell>
  );
}
