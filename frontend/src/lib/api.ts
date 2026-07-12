/* API client for RegPilot AI backend */

const API_BASE = '/api';

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  // Documents
  getDocuments: () => fetchApi<import('../types').Document[]>('/documents'),
  getDocument: (id: number) => fetchApi<import('../types').DocumentDetail>(`/documents/${id}`),
  analyzeDocument: (id: number) => fetchApi<import('../types').DocumentDetail>(`/documents/${id}/analyze`, { method: 'POST' }),

  // Clauses
  getDocumentClauses: (docId: number) => fetchApi<import('../types').Clause[]>(`/documents/${docId}/clauses`),

  // Obligations
  getObligations: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<import('../types').Obligation[]>(`/obligations${qs}`);
  },
  getObligation: (id: number) => fetchApi<import('../types').ObligationDetail>(`/obligations/${id}`),
  approveObligation: (id: number) => fetchApi<import('../types').Obligation>(`/obligations/${id}/approve`, { method: 'POST' }),
  rejectObligation: (id: number) => fetchApi<import('../types').Obligation>(`/obligations/${id}/reject`, { method: 'POST' }),
  sendForLegalReview: (id: number) => fetchApi<import('../types').Obligation>(`/obligations/${id}/legal-review`, { method: 'POST' }),

  // Workflows
  getWorkflows: () => fetchApi<import('../types').Workflow[]>('/workflows'),
  generateWorkflow: (oblId: number) => fetchApi<import('../types').Workflow>(`/workflows/generate/${oblId}`, { method: 'POST' }),

  // Evidence
  getEvidence: () => fetchApi<import('../types').Evidence[]>('/evidence'),

  // Dashboard
  getDashboardMetrics: () => fetchApi<import('../types').DashboardMetrics>('/dashboard/metrics'),
  getImpactRadar: () => fetchApi<import('../types').ImpactRadar>('/dashboard/impact-radar'),

  // Gaps
  getGaps: () => fetchApi<import('../types').Gap[]>('/gaps'),
  getRemediation: (gapId: string) => fetchApi<import('../types').RemediationPlan>(`/gaps/remediation?gap_id=${gapId}`, { method: 'POST' }),

  // Audit
  getAuditEvents: (entityType?: string, entityId?: number) => {
    const params: Record<string, string> = {};
    if (entityType) params.entity_type = entityType;
    if (entityId) params.entity_id = String(entityId);
    const qs = Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<import('../types').AuditEvent[]>(`/audit/events${qs}`);
  },
  generateReport: () => fetchApi<Record<string, unknown>>('/audit/generate-report', { method: 'POST' }),
  getRegulatoryDiff: () => fetchApi<import('../types').RegulatoryDiffItem[]>('/audit/regulatory-diff'),
};
