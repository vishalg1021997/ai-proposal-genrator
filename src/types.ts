export type ProposalStatus = 'draft' | 'under_review' | 'sent' | 'accepted' | 'declined' | 'archived';

export interface ProposalSection {
  id: string;
  title: string;
  key: string; // e.g. cover_page, executive_summary, scope_of_work, pricing, etc.
  content: string; // Markdown or HTML rich text
  isCustomized?: boolean;
  lastUpdated?: string;
}

export interface Proposal {
  id: string;
  title: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  serviceType: string; // e.g. "Cloud Migration & Modernization", "Mobile App Development"
  summary: string;
  status: ProposalStatus;
  templateId?: string;
  templateName?: string;
  tone: string; // e.g. "Professional & Formal", "Persuasive & Innovative", "Technical & Precise"
  customNotes?: string;
  createdAt: string;
  updatedAt: string;
  sections: ProposalSection[];
  versionCount: number;
}

export interface ProposalVersion {
  id: string;
  proposalId: string;
  versionNumber: number;
  title: string;
  sections: ProposalSection[];
  createdBy: string;
  createdAt: string;
  changelog: string;
}

export interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultSections: {
    key: string;
    title: string;
    defaultPromptHint?: string;
  }[];
  isSystemDefault?: boolean;
  createdAt: string;
}

export interface AgencySettings {
  id: string;
  agencyName: string;
  tagline: string;
  logoUrl: string;
  brandColor: string; // Hex color e.g. #2563eb
  accentColor: string; // Hex color e.g. #0f172a
  contactEmail: string;
  website: string;
  phone: string;
  address: string;
  footerText: string;
  defaultSystemPrompt: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'consultant';
}

export interface DashboardMetrics {
  totalProposals: number;
  generatedThisMonth: number;
  draftCount: number;
  underReviewCount: number;
  sentCount: number;
  acceptedCount: number;
  acceptanceRate: number;
  recentProposals: Proposal[];
}

export const MANDATORY_SECTIONS = [
  { key: 'cover_page', title: '1. Cover Page' },
  { key: 'executive_summary', title: '2. Executive Summary' },
  { key: 'understanding_requirements', title: '3. Understanding Client Requirements' },
  { key: 'proposed_solution', title: '4. Proposed Solution' },
  { key: 'scope_of_work', title: '5. Scope of Work' },
  { key: 'deliverables', title: '6. Deliverables' },
  { key: 'timeline', title: '7. Timeline' },
  { key: 'pricing', title: '8. Pricing' },
  { key: 'assumptions', title: '9. Assumptions' },
  { key: 'exclusions', title: '10. Exclusions' },
  { key: 'risks', title: '11. Risks' },
  { key: 'acceptance_criteria', title: '12. Acceptance Criteria' },
  { key: 'support_maintenance', title: '13. Support & Maintenance' },
  { key: 'terms_conditions', title: '14. Terms & Conditions' },
  { key: 'next_steps', title: '15. Next Steps' },
  { key: 'thank_you', title: '16. Thank You' },
] as const;
