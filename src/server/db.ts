import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Proposal,
  ProposalVersion,
  ProposalTemplate,
  AgencySettings,
  User,
  DashboardMetrics,
  MANDATORY_SECTIONS,
} from '../types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface SchemaDB {
  users: User[];
  proposals: Proposal[];
  proposal_versions: ProposalVersion[];
  templates: ProposalTemplate[];
  settings: AgencySettings;
}

const DEFAULT_SYSTEM_PROMPT = `You are a senior proposal consultant working at a top-tier digital transformation agency. Your responsibility is to write polished, professional, client-ready proposals suitable for enterprise and startup clients. Use formal business language, avoid unnecessary fluff, never invent pricing, and always produce clearly structured sections with headings. If required information is missing, use professional placeholders instead of hallucinating facts.`;

const INITIAL_SETTINGS: AgencySettings = {
  id: 'set-1',
  agencyName: 'Apex Digital Transformations',
  tagline: 'Engineering Enterprise Web & AI Solutions',
  logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop&q=80',
  brandColor: '#1e3a8a', // Deep navy
  accentColor: '#3b82f6', // Bright blue
  contactEmail: 'proposals@apexdigital.io',
  website: 'https://apexdigital.io',
  phone: '+1 (800) 555-0199',
  address: '100 Innovation Way, Suite 400, San Francisco, CA 94105',
  footerText: 'Confidential - Prepared by Apex Digital Transformations',
  defaultSystemPrompt: DEFAULT_SYSTEM_PROMPT,
};

const INITIAL_TEMPLATES: ProposalTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Enterprise Cloud & Web Architecture',
    description: 'Comprehensive technical proposal for custom software, cloud architecture, and web applications.',
    category: 'Software Engineering',
    isSystemDefault: true,
    createdAt: new Date().toISOString(),
    defaultSections: MANDATORY_SECTIONS.map((s) => ({
      key: s.key,
      title: s.title,
      defaultPromptHint: `Focus on enterprise reliability, high availability, security standards, and modern stack implementation.`,
    })),
  },
  {
    id: 'tpl-2',
    name: 'AI Integration & Automation Platform',
    description: 'Tailored for clients seeking generative AI workflows, custom LLM agents, and business process automation.',
    category: 'AI & Data Science',
    isSystemDefault: true,
    createdAt: new Date().toISOString(),
    defaultSections: MANDATORY_SECTIONS.map((s) => ({
      key: s.key,
      title: s.title,
      defaultPromptHint: `Highlight privacy compliance, model evaluation, API security, scalability, and measurable ROI.`,
    })),
  },
  {
    id: 'tpl-3',
    name: 'UI/UX Redesign & Digital Experience',
    description: 'Ideal for product redesigns, visual identity overhauls, design systems, and frontend modernization.',
    category: 'Design & Product',
    isSystemDefault: true,
    createdAt: new Date().toISOString(),
    defaultSections: MANDATORY_SECTIONS.map((s) => ({
      key: s.key,
      title: s.title,
      defaultPromptHint: `Focus on user research, responsive design systems, accessibility (WCAG AA), and user conversion optimization.`,
    })),
  },
  {
    id: 'tpl-4',
    name: 'Managed Services & Technical Retainer',
    description: 'For ongoing maintenance, SLA support, code audits, security monitoring, and continuous delivery.',
    category: 'Retainer & Support',
    isSystemDefault: true,
    createdAt: new Date().toISOString(),
    defaultSections: MANDATORY_SECTIONS.map((s) => ({
      key: s.key,
      title: s.title,
      defaultPromptHint: `Emphasize 24/7 uptime monitoring, incident SLAs, dedicated engineering pod, and monthly maintenance cycles.`,
    })),
  },
];

const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    username: 'admin',
    name: 'Sarah Jenkins',
    email: 'sjenkins@apexdigital.io',
    role: 'admin',
  },
];

const SAMPLE_PROPOSAL_1: Proposal = {
  id: 'prop-sample-1',
  title: 'NextGen Omnichannel E-Commerce & Mobile App Modernization',
  clientName: 'Marcus Vance',
  clientCompany: 'Vanguard Retail Holdings',
  clientEmail: 'm.vance@vanguardretail.com',
  serviceType: 'Cloud & Mobile Engineering',
  summary: 'Architecting a headless e-commerce frontend with real-time inventory synchronization, sub-second page loads, and native iOS/Android mobile applications.',
  status: 'sent',
  templateId: 'tpl-1',
  templateName: 'Enterprise Cloud & Web Architecture',
  tone: 'Professional & Formal',
  customNotes: 'Client requires SOC2 compliance, automated CI/CD deployment, and high concurrency support for seasonal traffic spikes.',
  createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  versionCount: 2,
  sections: [
    {
      id: 'sec-1',
      key: 'cover_page',
      title: '1. Cover Page',
      content: `# Project Proposal: NextGen Omnichannel E-Commerce Modernization
**Prepared for:** Vanguard Retail Holdings (Attn: Marcus Vance)  
**Prepared by:** Apex Digital Transformations  
**Date:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}  
**Document ID:** ADT-PROP-2026-884  
**Version:** 2.0 (Client Final)`,
    },
    {
      id: 'sec-2',
      key: 'executive_summary',
      title: '2. Executive Summary',
      content: `### Executive Summary

Vanguard Retail Holdings is executing a strategic digital transformation to replace legacy monolithic commerce infrastructure with a high-performance, resilient microservices ecosystem. 

Apex Digital Transformations proposes to deliver a modern **Headless Commerce & Mobile Ecosystem** engineered to handle peak traffic seamlessly, reduce page load times under 800ms, and elevate mobile conversion rates by over 35%. 

Through our proven cloud architecture patterns, React/Next.js storefronts, and automated CI/CD pipelines, we will establish a scalable foundation that empowers Vanguard to introduce new product channels swiftly and securely.`,
    },
    {
      id: 'sec-3',
      key: 'understanding_requirements',
      title: '3. Understanding Client Requirements',
      content: `### Client Context & Business Requirements

Based on our discovery sessions with Vanguard's engineering and product leadership, we have identified key operational challenges:

1. **Legacy Performance Bottlenecks:** Existing monolithic stack experiences severe latency during peak promotional events.
2. **Disconnected Mobile Experience:** Current web view wrapper apps suffer low user engagement and lack native push notifications.
3. **Inventory Sync Delays:** Multi-warehouse inventory updates take up to 45 minutes to reflect online, leading to overselling issues.
4. **Compliance & Security:** Mandate for zero-trust API access, end-to-end PCI-DSS compliance, and SOC2 audit readiness.`,
    },
    {
      id: 'sec-4',
      key: 'proposed_solution',
      title: '4. Proposed Solution',
      content: `### Proposed Architecture & Solution Overview

Apex Digital proposes an enterprise-grade **Headless Commerce & Micro-Frontend Platform**:

- **Edge Storefront Layer:** Built on React/Next.js deployed to global CDN edge locations for instant initial page rendering and optimal SEO.
- **Unified API Gateway:** Node.js/GraphQL layer providing secure aggregation across payment providers, ERP, and warehouse inventory systems.
- **Native Cross-Platform Apps:** iOS and Android applications offering offline cart persistence, biometrics, and personalized push marketing.
- **Automated Infrastructure:** Infrastructure-as-Code (Terraform) provisioned on cloud containers with automated scaling and zero-downtime rolling deployments.`,
    },
    {
      id: 'sec-5',
      key: 'scope_of_work',
      title: '5. Scope of Work',
      content: `### Scope of Work (SOW)

The engagement encompasses four core workstreams executed over a 14-week timeline:

1. **Phase 1: Architecture & Technical Specs (Weeks 1-2)**
   - API contract definitions, schema validation, zero-trust security policy setup.
   - User journey mapping and prototype visual design system approval.

2. **Phase 2: Storefront & Mobile App Development (Weeks 3-8)**
   - Custom headless catalog, search, cart, and multi-currency checkout build.
   - Native iOS & Android application development with biometric auth.

3. **Phase 3: Integration & Performance Tuning (Weeks 9-11)**
   - Real-time ERP/Inventory Webhook synchronization engine.
   - Load testing up to 50,000 requests/minute, latency optimization.

4. **Phase 4: Security Audit, Training & Launch (Weeks 12-14)**
   - Penetration testing, PCI-DSS compliance verification.
   - Admin user training, DNS cutover, and 30-day hypercare support.`,
    },
    {
      id: 'sec-6',
      key: 'deliverables',
      title: '6. Deliverables',
      content: `### Project Deliverables

- **Production Storefront Codebase:** Fully tested React/TypeScript web application repository.
- **Native iOS & Android Apps:** App Store & Google Play store submission binaries.
- **API Middleware & Microservices:** Node.js GraphQL gateway and inventory integration server.
- **Deployment Scripts:** Infrastructure-as-Code Terraform modules and CI/CD pipelines.
- **Documentation Suite:** System architecture diagrams, API docs, and Admin user manuals.`,
    },
    {
      id: 'sec-7',
      key: 'timeline',
      title: '7. Timeline',
      content: `### Milestone Timeline

| Milestone | Deliverable | Targeted Completion |
|---|---|---|
| **M1: Discovery & Specs** | Architecture Blueprint & Design System | End of Week 2 |
| **M2: Core Storefront** | Working Web Storefront & Catalog API | End of Week 6 |
| **M3: Mobile Apps Beta** | iOS / Android Internal TestFlight Builds | End of Week 9 |
| **M4: Systems Integration** | ERP & Payment Gateway Webhooks Live | End of Week 11 |
| **M5: Production Launch** | Final Cutover & App Store Go-Live | End of Week 14 |`,
    },
    {
      id: 'sec-8',
      key: 'pricing',
      title: '8. Pricing',
      content: `### Commercial Investment & Pricing

Pricing will be finalized after requirement discussion.`,
    },
    {
      id: 'sec-9',
      key: 'assumptions',
      title: '9. Assumptions',
      content: `### Project Assumptions

- Vanguard technical team will provide sandbox API keys for ERP and payment gateway integrations within 5 business days of project kickoff.
- Design approvals for core wireframes and user flows will be rendered within 3 business days of presentation.
- All product catalog imagery and translated localized copy will be provided by Vanguard content managers.`,
    },
    {
      id: 'sec-10',
      key: 'exclusions',
      title: '10. Exclusions',
      content: `### Exclusions

- Refactoring of legacy ERP database schemas prior to API endpoint exposure.
- Third-party app store submission fee expenses (billed directly to client).
- Ongoing content creation, copy translation, or custom photography production.`,
    },
    {
      id: 'sec-11',
      key: 'risks',
      title: '11. Risks & Mitigation Strategies',
      content: `### Risk Register & Mitigation

- **Risk: Legacy ERP API Instability**  
  *Mitigation:* Implement caching proxy layer with automated circuit-breakers to ensure web catalog remains available even during backend maintenance window.
- **Risk: Third-Party Store Approval Delays**  
  *Mitigation:* Submit early beta builds during Week 8 to pre-screen store guidelines compliance.`,
    },
    {
      id: 'sec-12',
      key: 'acceptance_criteria',
      title: '12. Acceptance Criteria',
      content: `### Acceptance Criteria

- All core user journeys pass 100% of automated unit and integration tests.
- Initial homepage load metric achieves under 800ms Time-To-Interactive on standard 4G connections.
- Zero High or Critical security vulnerabilities detected during automated penetration scanning.`,
    },
    {
      id: 'sec-13',
      key: 'support_maintenance',
      title: '13. Support & Maintenance',
      content: `### Post-Launch Hypercare & Warranty

Apex Digital provides **30 Days of Inclusive Hypercare Support** following go-live:
- Dedicated P1 incident response time under 30 minutes (24/7 coverage).
- Bi-weekly performance review and security monitoring reports.
- Optional seamless transition into our Managed Technical Retainer plan.`,
    },
    {
      id: 'sec-14',
      key: 'terms_conditions',
      title: '14. Terms & Conditions',
      content: `### Standard Engagement Terms

- **Intellectual Property:** All custom code, design assets, and documentation created under this SOW become the exclusive property of Vanguard Retail Holdings upon final payment.
- **Confidentiality:** Both parties agree to maintain strict confidentiality under our standard NDA framework.
- **Validity:** This proposal remains valid for 30 calendar days from the issuance date.`,
    },
    {
      id: 'sec-15',
      key: 'next_steps',
      title: '15. Next Steps',
      content: `### Next Steps to Kickoff

1. **Review & Sign:** Execute formal SOW and Master Services Agreement (MSA).
2. **Kickoff Workshop:** Schedule 2-hour technical discovery session with engineering stakeholders.
3. **Sandbox Setup:** Provide API keys and repository access permissions.
4. **Sprint 1 Start:** Commence Architecture & Design phase within 5 business days of contract execution.`,
    },
    {
      id: 'sec-16',
      key: 'thank_you',
      title: '16. Thank You',
      content: `### Thank You

We appreciate the opportunity to partner with Vanguard Retail Holdings on this strategic initiative. Our engineering team is excited to help build your next-generation digital storefront.

**Contact Person:** Sarah Jenkins, VP of Engineering  
**Email:** sjenkins@apexdigital.io  
**Direct Line:** +1 (800) 555-0199  
**Apex Digital Transformations**`,
    },
  ],
};

let memoryDb: SchemaDB = {
  users: INITIAL_USERS,
  proposals: [SAMPLE_PROPOSAL_1],
  proposal_versions: [],
  templates: INITIAL_TEMPLATES,
  settings: INITIAL_SETTINGS,
};

// Initialize file database
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadLocalDb(): SchemaDB {
  try {
    ensureDataDir();
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        users: parsed.users || INITIAL_USERS,
        proposals: parsed.proposals || [SAMPLE_PROPOSAL_1],
        proposal_versions: parsed.proposal_versions || [],
        templates: parsed.templates || INITIAL_TEMPLATES,
        settings: parsed.settings || INITIAL_SETTINGS,
      };
    } else {
      saveLocalDb(memoryDb);
      return memoryDb;
    }
  } catch (err) {
    console.error('Failed to load local db file, fallback to in-memory:', err);
    return memoryDb;
  }
}

function saveLocalDb(data: SchemaDB) {
  try {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db file:', err);
  }
}

// Supabase client instantiation (if env vars set)
let supabaseClient: SupabaseClient | null = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
  try {
    supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    console.log('Supabase client initialized with URL:', process.env.SUPABASE_URL);
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
  }
}

// DB Interface Methods
export const db = {
  getSettings: async (): Promise<AgencySettings> => {
    const data = loadLocalDb();
    return data.settings || INITIAL_SETTINGS;
  },

  updateSettings: async (settings: Partial<AgencySettings>): Promise<AgencySettings> => {
    const data = loadLocalDb();
    data.settings = { ...data.settings, ...settings };
    saveLocalDb(data);
    return data.settings;
  },

  getTemplates: async (): Promise<ProposalTemplate[]> => {
    const data = loadLocalDb();
    return data.templates;
  },

  getTemplateById: async (id: string): Promise<ProposalTemplate | undefined> => {
    const data = loadLocalDb();
    return data.templates.find((t) => t.id === id);
  },

  createTemplate: async (template: Omit<ProposalTemplate, 'id' | 'createdAt'>): Promise<ProposalTemplate> => {
    const data = loadLocalDb();
    const newTpl: ProposalTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    data.templates.unshift(newTpl);
    saveLocalDb(data);
    return newTpl;
  },

  updateTemplate: async (id: string, update: Partial<ProposalTemplate>): Promise<ProposalTemplate | null> => {
    const data = loadLocalDb();
    const idx = data.templates.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    data.templates[idx] = { ...data.templates[idx], ...update };
    saveLocalDb(data);
    return data.templates[idx];
  },

  deleteTemplate: async (id: string): Promise<boolean> => {
    const data = loadLocalDb();
    const lenBefore = data.templates.length;
    data.templates = data.templates.filter((t) => t.id !== id);
    saveLocalDb(data);
    return data.templates.length < lenBefore;
  },

  getProposals: async (search?: string, status?: string): Promise<Proposal[]> => {
    const data = loadLocalDb();
    let list = data.proposals;

    if (status && status !== 'all') {
      list = list.filter((p) => p.status === status);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.clientCompany.toLowerCase().includes(q) ||
          p.clientName.toLowerCase().includes(q) ||
          p.serviceType.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  getProposalById: async (id: string): Promise<Proposal | undefined> => {
    const data = loadLocalDb();
    return data.proposals.find((p) => p.id === id);
  },

  createProposal: async (proposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'versionCount'>): Promise<Proposal> => {
    const data = loadLocalDb();
    const now = new Date().toISOString();
    const newProp: Proposal = {
      ...proposal,
      id: `prop-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      versionCount: 1,
    };
    data.proposals.unshift(newProp);

    // Save initial version snapshot
    const initialVersion: ProposalVersion = {
      id: `ver-${Date.now()}`,
      proposalId: newProp.id,
      versionNumber: 1,
      title: newProp.title,
      sections: newProp.sections,
      createdBy: 'admin',
      createdAt: now,
      changelog: 'Initial proposal draft created',
    };
    data.proposal_versions.unshift(initialVersion);

    saveLocalDb(data);
    return newProp;
  },

  updateProposal: async (
    id: string,
    update: Partial<Proposal>,
    changelogReason: string = 'Updated proposal content'
  ): Promise<Proposal | null> => {
    const data = loadLocalDb();
    const idx = data.proposals.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const now = new Date().toISOString();
    const current = data.proposals[idx];
    const newVersionNum = (current.versionCount || 1) + 1;

    const updatedProp: Proposal = {
      ...current,
      ...update,
      updatedAt: now,
      versionCount: newVersionNum,
    };

    data.proposals[idx] = updatedProp;

    // Create version snapshot
    const versionSnapshot: ProposalVersion = {
      id: `ver-${Date.now()}`,
      proposalId: id,
      versionNumber: newVersionNum,
      title: updatedProp.title,
      sections: updatedProp.sections,
      createdBy: 'admin',
      createdAt: now,
      changelog: changelogReason,
    };
    data.proposal_versions.unshift(versionSnapshot);

    saveLocalDb(data);
    return updatedProp;
  },

  deleteProposal: async (id: string): Promise<boolean> => {
    const data = loadLocalDb();
    const lenBefore = data.proposals.length;
    data.proposals = data.proposals.filter((p) => p.id !== id);
    data.proposal_versions = data.proposal_versions.filter((v) => v.proposalId !== id);
    saveLocalDb(data);
    return data.proposals.length < lenBefore;
  },

  getProposalVersions: async (proposalId: string): Promise<ProposalVersion[]> => {
    const data = loadLocalDb();
    return data.proposal_versions
      .filter((v) => v.proposalId === proposalId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  },

  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const data = loadLocalDb();
    const total = data.proposals.length;

    const draftCount = data.proposals.filter((p) => p.status === 'draft').length;
    const underReviewCount = data.proposals.filter((p) => p.status === 'under_review').length;
    const sentCount = data.proposals.filter((p) => p.status === 'sent').length;
    const acceptedCount = data.proposals.filter((p) => p.status === 'accepted').length;

    const closedTotal = acceptedCount + data.proposals.filter((p) => p.status === 'declined').length;
    const acceptanceRate = closedTotal > 0 ? Math.round((acceptedCount / closedTotal) * 100) : 100;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const generatedThisMonth = data.proposals.filter((p) => {
      const d = new Date(p.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const recentProposals = [...data.proposals]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    return {
      totalProposals: total,
      generatedThisMonth,
      draftCount,
      underReviewCount,
      sentCount,
      acceptedCount,
      acceptanceRate,
      recentProposals,
    };
  },

  getSupabaseSchemaSql: (): string => {
    return `-- Supabase PostgreSQL DDL Schema for AI Proposal Generator

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'consultant',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
  id VARCHAR(255) PRIMARY KEY DEFAULT 'set-1',
  agency_name VARCHAR(255) NOT NULL,
  tagline TEXT,
  logo_url TEXT,
  brand_color VARCHAR(50) DEFAULT '#1e3a8a',
  accent_color VARCHAR(50) DEFAULT '#3b82f6',
  contact_email VARCHAR(255),
  website VARCHAR(255),
  phone VARCHAR(100),
  address TEXT,
  footer_text TEXT,
  default_system_prompt TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates Table
CREATE TABLE IF NOT EXISTS public.templates (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  default_sections JSONB NOT NULL,
  is_system_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proposals Table
CREATE TABLE IF NOT EXISTS public.proposals (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_company VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  service_type VARCHAR(255) NOT NULL,
  summary TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  template_id VARCHAR(255),
  template_name VARCHAR(255),
  tone VARCHAR(100) DEFAULT 'Professional & Formal',
  custom_notes TEXT,
  version_count INT DEFAULT 1,
  sections JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proposal Versions Table
CREATE TABLE IF NOT EXISTS public.proposal_versions (
  id VARCHAR(255) PRIMARY KEY,
  proposal_id VARCHAR(255) REFERENCES public.proposals(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  sections JSONB NOT NULL,
  created_by VARCHAR(255) DEFAULT 'admin',
  changelog TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Basic Policies
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow internal authenticated staff access" ON public.proposals FOR ALL USING (true);
`;
  },
};
