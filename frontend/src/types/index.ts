/* TypeScript interfaces matching backend schemas */

export interface Document {
  id: number;
  title: string;
  document_type: string;
  source: string;
  circular_number: string | null;
  issue_date: string | null;
  intermediary: string;
  status: string;
  file_path: string | null;
  page_count: number;
  created_at: string;
  clause_count: number;
  obligation_count: number;
}

export interface DocumentDetail extends Document {
  raw_text: string | null;
  clauses: Clause[];
}

export interface Clause {
  id: number;
  document_id: number;
  clause_number: string;
  heading: string | null;
  text: string;
  source_text: string | null;
  page_number: number | null;
  risk_tags: string[];
  created_at: string;
  obligation_count: number;
}

export interface Obligation {
  id: number;
  obligation_id: string;
  clause_id: number;
  obligation_text: string;
  obligation_type: string;
  trigger_type: string;
  intermediary: string;
  owner_role: string | null;
  department: string | null;
  deadline_rule: string | null;
  required_evidence: string[];
  risk_level: string;
  confidence_score: number;
  clause_trust_score: number;
  status: string;
  human_review_required: boolean;
  grounded: boolean;
  source_citation: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  evidence_uploaded: number;
  evidence_required: number;
  evidence_completeness: number;
}

export interface ObligationDetail extends Obligation {
  clause: Clause | null;
  evidence_items: Evidence[];
  audit_trail: AuditEvent[];
}

export interface Workflow {
  id: number;
  workflow_id: string;
  obligation_id: number;
  title: string;
  owner: string | null;
  department: string | null;
  due_date: string | null;
  status: string;
  escalation_level: number;
  completion_percentage: number;
  steps: WorkflowStep[];
  created_at: string;
  linked_obligation_id: string;
}

export interface WorkflowStep {
  step: number;
  title: string;
  status: string;
}

export interface Evidence {
  id: number;
  evidence_id: string;
  obligation_id: number;
  workflow_id: number | null;
  file_name: string;
  evidence_type: string;
  validation_status: string;
  uploaded_by: string | null;
  uploaded_at: string;
}

export interface AuditEvent {
  id: number;
  entity_type: string;
  entity_id: number;
  action: string;
  actor: string | null;
  timestamp: string;
  details: Record<string, unknown> | null;
}

export interface Gap {
  gap_id: string;
  obligation_id: string;
  obligation_text: string;
  gap_type: string;
  severity: string;
  reason: string;
  suggested_remediation: string;
  owner: string | null;
  due_date: string | null;
}

export interface DashboardMetrics {
  documents_processed: number;
  clauses_extracted: number;
  obligations_generated: number;
  pending_reviews: number;
  evidence_gaps: number;
  overdue_workflows: number;
  audit_readiness_score: number;
}

export interface ImpactRadar {
  circular_title: string;
  clauses_added: number;
  obligations_modified: number;
  workflows_impacted: number;
  evidence_requirements_changed: number;
  review_required: boolean;
}

export interface RegulatoryDiffItem {
  change_type: string;
  obligation_id: string;
  description: string;
  old_value: string | null;
  new_value: string | null;
}

export interface RemediationPlan {
  gap_id: string;
  steps: { step: number; action: string; details: string; deadline: string }[];
}
