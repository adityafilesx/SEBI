import { useEffect, useState } from 'react';
import { FileBarChart, Download, Copy, ArrowUpRight, Minus, Plus, X } from 'lucide-react';
import { api } from '../lib/api';
import type { RegulatoryDiffItem, AuditEvent } from '../types';
import PageShell from '../components/layout/PageShell';
import { Card, Badge, Button, AuditTimeline } from '../components/ui';

export default function AuditReport() {
  const [report, setReport] = useState<Record<string, any> | null>(null);
  const [diff, setDiff] = useState<RegulatoryDiffItem[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.getRegulatoryDiff().then(setDiff).catch(() => {});
    api.getAuditEvents().then(setEvents).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    const r = await api.generateReport();
    setReport(r);
    setGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
  };

  const handleDownload = () => {
    // Generate HTML report for download
    const html = generateHtmlReport(report);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'regpilot_audit_report.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const diffIcons: Record<string, any> = {
    new: { icon: Plus, color: '#10b981', label: 'New' },
    modified: { icon: ArrowUpRight, color: '#f59e0b', label: 'Modified' },
    removed: { icon: X, color: '#ef4444', label: 'Removed' },
    unchanged: { icon: Minus, color: '#64748b', label: 'Unchanged' },
  };

  return (
    <PageShell
      title="Audit Report Generator"
      subtitle="Comprehensive audit-ready compliance report with full traceability"
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={handleGenerate} disabled={generating}>
            <FileBarChart size={14} /> {generating ? 'Generating...' : report ? 'Regenerate' : 'Generate Report'}
          </Button>
          {report && (
            <>
              <Button variant="secondary" onClick={handleDownload}><Download size={14} /> Download HTML</Button>
              <Button variant="ghost" onClick={handleCopy}><Copy size={14} /> Copy JSON</Button>
            </>
          )}
        </div>
      }
    >
      {!report && !generating && (
        <Card style={{ textAlign: 'center', padding: 60 }}>
          <FileBarChart size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Generate Audit Report</h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', maxWidth: 400, margin: '0 auto 20px' }}>
            Generate a comprehensive audit-ready report including traceability tables, evidence completeness,
            regulatory diff analysis, and full compliance lifecycle.
          </p>
          <Button onClick={handleGenerate}>Generate Report</Button>
        </Card>
      )}

      {report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Executive Summary */}
          <Card title="1. Executive Summary">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
              {Object.entries(report.executive_summary || {}).map(([key, val]) => (
                <div key={key} style={{ padding: 12, borderRadius: 6, background: 'var(--color-bg-surface)' }}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>{String(val)}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Regulatory Corpus */}
          <Card title="2. Regulatory Corpus">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(report.regulatory_corpus || []).map((doc: any, i: number) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 6, background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)', fontSize: 12,
                }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{doc.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>{doc.circular_number}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{doc.date}</span>
                    <Badge>{doc.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Obligations Summary */}
          <Card title="3. Obligations Summary">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <h4 style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>By Status</h4>
                {Object.entries(report.obligations_summary?.by_status || {}).map(([status, count]) => (
                  <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
                    <span><Badge>{status}</Badge></span>
                    <span style={{ fontWeight: 600 }}>{String(count)}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>By Risk Level</h4>
                {Object.entries(report.obligations_summary?.by_risk || {}).map(([risk, count]) => (
                  <div key={risk} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
                    <span><Badge variant="risk">{risk}</Badge></span>
                    <span style={{ fontWeight: 600 }}>{String(count)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Traceability Table */}
          <Card title="4. Source-to-Action Traceability" subtitle="End-to-end regulatory compliance mapping">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                    {['Source Document', 'Clause', 'Obligation', 'Owner', 'Evidence', 'Status', 'Trust', 'Reviewer'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '8px 10px',
                        color: 'var(--color-text-muted)', fontSize: 10,
                        fontWeight: 600, textTransform: 'uppercase',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(report.traceability_table || []).map((row: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                      <td style={{ padding: '8px 10px', maxWidth: 140 }}>
                        <div style={{ fontSize: 10.5, lineHeight: 1.3 }}>{row.source_document.substring(0, 50)}...</div>
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-accent-blue)' }}>{row.clause}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-accent-emerald)' }}>{row.obligation_id}</td>
                      <td style={{ padding: '8px 10px' }}>{row.owner}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 500 }}>{row.evidence}</td>
                      <td style={{ padding: '8px 10px' }}><Badge>{row.status}</Badge></td>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>{row.clause_trust}</td>
                      <td style={{ padding: '8px 10px', fontSize: 10 }}>{row.reviewer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* AI Confidence Summary */}
          <Card title="5. AI Confidence & Validation">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[
                { label: 'Average Confidence', value: `${Math.round((report.ai_confidence_summary?.average || 0) * 100)}%` },
                { label: 'Above 85%', value: report.ai_confidence_summary?.above_85 },
                { label: 'Below 85%', value: report.ai_confidence_summary?.below_85 },
                { label: 'All Grounded', value: report.ai_confidence_summary?.all_grounded ? 'Yes ✓' : 'No ✗' },
              ].map(item => (
                <div key={item.label} style={{ padding: 12, borderRadius: 6, background: 'var(--color-bg-surface)', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{String(item.value)}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Regulatory Diff (Novelty 6) */}
          <Card title="6. Regulatory Change Comparison" subtitle="Old framework vs Jan 2026 revised framework">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {diff.map((item, i) => {
                const cfg = diffIcons[item.change_type] || diffIcons.unchanged;
                const Icon = cfg.icon;
                return (
                  <div key={i} style={{
                    padding: '12px 14px', borderRadius: 8,
                    background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                      background: `${cfg.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={14} color={cfg.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>{cfg.label.toUpperCase()}</span>
                        <span style={{ fontSize: 11, color: 'var(--color-accent-emerald)', fontWeight: 600 }}>{item.obligation_id}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-primary)', marginBottom: 4 }}>{item.description}</div>
                      {item.old_value && (
                        <div style={{ fontSize: 11, color: '#ef4444', fontStyle: 'italic' }}>— {item.old_value}</div>
                      )}
                      {item.new_value && (
                        <div style={{ fontSize: 11, color: '#10b981', fontStyle: 'italic' }}>+ {item.new_value}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Audit Event Log (Novelty 5 — Audit Replay) */}
          <Card title="7. Audit Event Log" subtitle={`${events.length} events recorded`}>
            <AuditTimeline events={events.slice(0, 15).map(e => ({
              action: e.action,
              actor: e.actor,
              timestamp: e.timestamp,
            }))} />
          </Card>
        </div>
      )}
    </PageShell>
  );
}


function generateHtmlReport(report: any): string {
  if (!report) return '';
  const rows = (report.traceability_table || []).map((r: any) =>
    `<tr><td>${r.source_document.substring(0, 50)}...</td><td>${r.clause}</td><td>${r.obligation_id}</td><td>${r.owner}</td><td>${r.evidence}</td><td>${r.status}</td><td>${r.clause_trust}</td><td>${r.reviewer}</td></tr>`
  ).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>RegPilot AI Audit Report</title>
<style>body{font-family:Inter,system-ui,sans-serif;padding:40px;max-width:1200px;margin:0 auto;color:#1a202c}
h1{color:#10b981}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{padding:8px 12px;border:1px solid #e2e8f0;text-align:left;font-size:13px}
th{background:#f7fafc;font-weight:600}.badge{display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600}
.section{margin-bottom:30px;padding:20px;border:1px solid #e2e8f0;border-radius:8px}</style></head>
<body>
<h1>RegPilot AI — Audit Report</h1>
<p>Generated: ${report.generated_at}</p>
<div class="section"><h2>Executive Summary</h2><p>Total Obligations: ${report.executive_summary?.total_obligations} | Approved: ${report.executive_summary?.approved} | Pending: ${report.executive_summary?.pending_review}</p></div>
<div class="section"><h2>Source-to-Action Traceability</h2>
<table><thead><tr><th>Source</th><th>Clause</th><th>Obligation</th><th>Owner</th><th>Evidence</th><th>Status</th><th>Trust</th><th>Reviewer</th></tr></thead>
<tbody>${rows}</tbody></table></div>
<div class="section"><h2>AI Confidence</h2><p>Average: ${Math.round((report.ai_confidence_summary?.average || 0) * 100)}% | All Grounded: ${report.ai_confidence_summary?.all_grounded ? 'Yes' : 'No'}</p></div>
<footer style="margin-top:40px;padding-top:20px;border-top:1px solid #e2e8f0;font-size:11px;color:#718096">RegPilot AI — SEBI TechSprint 2026 Track 2 | Clause-grounded compliance compiler</footer>
</body></html>`;
}
