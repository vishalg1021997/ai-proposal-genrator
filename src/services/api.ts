import {
  Proposal,
  ProposalVersion,
  ProposalTemplate,
  AgencySettings,
  DashboardMetrics,
} from '../types';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const data = await res.json();
      errorMsg = data.error || errorMsg;
    } catch (_e) {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  login: async (username: string, password: string) => {
    return fetchJson<{ success: boolean; token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  logout: async () => {
    return fetchJson<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
  },

  getCurrentUser: async () => {
    return fetchJson<{ user: any }>('/api/auth/me');
  },

  getDashboard: async () => {
    return fetchJson<DashboardMetrics>('/api/dashboard');
  },

  getSettings: async () => {
    return fetchJson<AgencySettings>('/api/settings');
  },

  updateSettings: async (settings: Partial<AgencySettings>) => {
    return fetchJson<AgencySettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  getTemplates: async () => {
    return fetchJson<ProposalTemplate[]>('/api/templates');
  },

  createTemplate: async (template: Omit<ProposalTemplate, 'id' | 'createdAt'>) => {
    return fetchJson<ProposalTemplate>('/api/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  },

  updateTemplate: async (id: string, update: Partial<ProposalTemplate>) => {
    return fetchJson<ProposalTemplate>(`/api/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(update),
    });
  },

  deleteTemplate: async (id: string) => {
    return fetchJson<{ success: boolean }>(`/api/templates/${id}`, {
      method: 'DELETE',
    });
  },

  getProposals: async (search?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<Proposal[]>(`/api/proposals${query}`);
  },

  getProposalById: async (id: string) => {
    return fetchJson<{ proposal: Proposal; versions: ProposalVersion[] }>(`/api/proposals/${id}`);
  },

  getProposalVersions: async (id: string) => {
    const res = await fetchJson<{ proposal: Proposal; versions: ProposalVersion[] }>(`/api/proposals/${id}`);
    return res.versions;
  },

  createProposal: async (proposal: Partial<Proposal>) => {
    return fetchJson<Proposal>('/api/proposals', {
      method: 'POST',
      body: JSON.stringify(proposal),
    });
  },

  updateProposal: async (id: string, update: Partial<Proposal>, changelogReason?: string) => {
    return fetchJson<Proposal>(`/api/proposals/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...update, changelogReason }),
    });
  },

  deleteProposal: async (id: string) => {
    return fetchJson<{ success: boolean }>(`/api/proposals/${id}`, {
      method: 'DELETE',
    });
  },

  generateProposalAI: async (id: string, payload: { serviceDescription: string; keyChallenges?: string; customPromptNotes?: string }) => {
    return fetchJson<{ success: boolean; proposal: Proposal }>(`/api/proposals/${id}/generate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  regenerateSectionAI: async (id: string, sectionKey: string, instructions: string) => {
    return fetchJson<{ success: boolean; proposal: Proposal }>(`/api/proposals/${id}/regenerate`, {
      method: 'POST',
      body: JSON.stringify({ sectionKey, instructions }),
    });
  },

  getSupabaseSql: async () => {
    const res = await fetch('/api/schema/sql');
    return res.text();
  },
};
