import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Trash2,
  Copy,
  Building,
  FileText,
  Calendar,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import { Proposal, ProposalStatus } from '../types';
import { api } from '../services/api';

interface ProposalsPageProps {
  onSelectProposal: (id: string) => void;
  onNewProposal: () => void;
}

export const ProposalsPage: React.FC<ProposalsPageProps> = ({
  onSelectProposal,
  onNewProposal,
}) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const data = await api.getProposals(search, statusFilter);
      setProposals(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, [search, statusFilter]);

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete proposal "${title}"?`)) {
      try {
        await api.deleteProposal(id);
        loadProposals();
      } catch (err: any) {
        alert(err.message || 'Failed to delete proposal');
      }
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, proposal: Proposal) => {
    e.stopPropagation();
    try {
      const copy = await api.createProposal({
        title: `${proposal.title} (Copy)`,
        clientName: proposal.clientName,
        clientCompany: proposal.clientCompany,
        clientEmail: proposal.clientEmail,
        serviceType: proposal.serviceType,
        summary: proposal.summary,
        status: 'draft',
        templateId: proposal.templateId,
        templateName: proposal.templateName,
        tone: proposal.tone,
        customNotes: proposal.customNotes,
        sections: proposal.sections,
      });
      alert('Proposal duplicated successfully as draft!');
      loadProposals();
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate proposal');
    }
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    under_review: 'bg-amber-50 text-amber-700 border-amber-200',
    sent: 'bg-blue-50 text-blue-700 border-blue-200',
    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    declined: 'bg-rose-50 text-rose-700 border-rose-200',
    archived: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Proposal Directory</h1>
          <p className="text-xs text-slate-500">Search, manage, version, and export all client proposals</p>
        </div>

        <button
          onClick={onNewProposal}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs flex items-center space-x-2 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Proposal</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search client, company, service..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs font-semibold">
            {['all', 'draft', 'under_review', 'sent', 'accepted', 'declined'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Proposals List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
            Loading proposals...
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        ) : proposals.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No proposals found</p>
            <p className="text-xs text-slate-400">Try adjusting your search criteria or create a new proposal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Proposal & Client</th>
                  <th className="px-6 py-3.5">Service Line</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Versions</th>
                  <th className="px-6 py-3.5">Last Updated</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proposals.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => onSelectProposal(p.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{p.title}</div>
                      <div className="text-slate-500 flex items-center space-x-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{p.clientCompany} ({p.clientName})</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-medium">
                        {p.serviceType}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${
                          statusColors[p.status] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-slate-600">
                      v{p.versionCount || 1}.0
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProposal(p.id);
                          }}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                          title="Open Workspace"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => handleDuplicate(e, p)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                          title="Duplicate Proposal"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => handleDelete(e, p.id, p.title)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          title="Delete Proposal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
