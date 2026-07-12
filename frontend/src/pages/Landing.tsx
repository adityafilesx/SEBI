import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, FileSearch, BarChart3, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui';

export default function Landing() {
  const navigate = useNavigate();

  const problems = [
    { icon: FileSearch, title: 'Manual Circular Review', desc: 'Compliance teams manually read 100+ page SEBI circulars to extract requirements' },
    { icon: AlertTriangle, title: 'Missed Obligations', desc: 'Critical compliance obligations buried in dense regulatory text go undetected' },
    { icon: BarChart3, title: 'Fragmented Evidence', desc: 'Evidence scattered across emails, tickets, and shared drives with no linkage' },
    { icon: Shield, title: 'Weak Audit Trail', desc: 'No systematic traceability from regulatory clause to operational compliance' },
  ];

  const differentiators = [
    { icon: '🔗', title: 'Not a Chatbot', desc: 'Structured compliance compiler, not a conversational interface' },
    { icon: '📌', title: 'Clause-Grounded', desc: 'Every obligation traces back to its exact source clause' },
    { icon: '👤', title: 'Human-in-the-Loop', desc: 'No obligation becomes active until approved by a compliance officer' },
    { icon: '📊', title: 'Evidence-Linked', desc: 'Each obligation has mapped evidence requirements and completeness scores' },
    { icon: '🔍', title: 'Gap Detection', desc: 'Automatically identifies missing evidence, unassigned obligations, and overdue workflows' },
    { icon: '📋', title: 'Audit-Ready', desc: 'Generate comprehensive reports with full source-to-action traceability' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Hero */}
      <div style={{
        maxWidth: 900, margin: '0 auto', padding: '80px 32px 60px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 9999, marginBottom: 24,
          background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
          fontSize: 12, color: '#10b981', fontWeight: 600,
        }}>
          SEBI Securities Market TechSprint 2026 · Track 2
        </div>

        <h1 style={{
          fontSize: 48, fontWeight: 800, lineHeight: 1.1, marginBottom: 16,
          letterSpacing: '-0.02em',
        }}>
          <span className="gradient-text">RegPilot AI</span>
        </h1>

        <p style={{
          fontSize: 18, color: 'var(--color-text-secondary)',
          maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.6,
        }}>
          Clause-grounded compliance compiler for SEBI-registered stockbrokers.
          Converts regulatory text into structured obligations, workflows,
          evidence requirements, and audit-ready reports.
        </p>

        <Button onClick={() => navigate('/dashboard')} style={{ padding: '12px 28px', fontSize: 15 }}>
          Open Compliance Workbench <ArrowRight size={16} />
        </Button>
      </div>

      {/* Pipeline Strip */}
      <div style={{
        maxWidth: 900, margin: '0 auto', padding: '0 32px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        flexWrap: 'wrap',
      }}>
        {['Circular', 'Clause', 'Obligation', 'Approval', 'Workflow', 'Evidence', 'Audit'].map((step, i) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              padding: '8px 16px', borderRadius: 8,
              background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
              fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'var(--color-accent-emerald)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700,
              }}>{i + 1}</div>
              {step}
            </div>
            {i < 6 && <ArrowRight size={14} color="var(--color-accent-emerald)" />}
          </div>
        ))}
      </div>

      {/* Problems */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px 48px' }}>
        <h2 style={{ fontSize: 14, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16, textAlign: 'center' }}>
          The Problem
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {problems.map(p => (
            <div key={p.title} className="glass-card" style={{ padding: 20 }}>
              <p.icon size={24} color="var(--color-accent-amber)" style={{ marginBottom: 12 }} />
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{p.title}</h3>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Differentiators */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px 60px' }}>
        <h2 style={{ fontSize: 14, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16, textAlign: 'center' }}>
          Why RegPilot AI
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
          {differentiators.map(d => (
            <div key={d.title} className="glass-card glass-card-hover" style={{ padding: 16, display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 24 }}>{d.icon}</span>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{d.title}</h3>
                <p style={{ fontSize: 11.5, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center', padding: '24px 32px',
        borderTop: '1px solid var(--color-border)',
        fontSize: 11, color: 'var(--color-text-muted)',
      }}>
        RegPilot AI · SEBI Securities Market TechSprint 2026 · Track 2: Regulatory Compliance for Intermediaries
      </div>
    </div>
  );
}
