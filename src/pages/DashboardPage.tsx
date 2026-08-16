import React from 'react';
import {
  FileText,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Send,
  Plus,
  ArrowRight,
  Eye,
  Building,
} from 'lucide-react';
import { DashboardMetrics, Proposal } from '../types';

interface DashboardPageProps {
  metrics: DashboardMetrics | null;
  onNewProposal: () => void;
  onSelectProposal: (id: string) => void;
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  metrics,
  onNewProposal,
  onSelectProposal,
  onNavigate,
}) => {
  if (!metrics) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Loading executive dashboard metrics...
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    under_review: 'bg-amber-50 text-amber-700 border-amber-200',
    sent: 'bg-blue-50 text-blue-700 border-blue-200',
    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    declined: 'bg-rose-50 text-rose-700 border-rose-200',
    archived: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome & Quick Action Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini AI Engine Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Agency Proposal Workspace</h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Generate polished, client-ready proposals for enterprise software, cloud transformations, and digital retainers in under 2 minutes.
          </p>
        </div>

        <button
          onClick={onNewProposal}
          className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center space-x-2 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Generate New Proposal</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Proposals</span>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{metrics.totalProposals}</div>
          <p className="text-xs text-slate-500">Active proposal pipeline</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Generated This Month</span>
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{metrics.generatedThisMonth}</div>
          <p className="text-xs text-emerald-600 font-medium">100% AI Structured Format</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Acceptance Rate</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{metrics.acceptanceRate}%</div>
          <p className="text-xs text-slate-500">{metrics.acceptedCount} deals closed successfully</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Out for Review / Sent</span>
            <Send className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{metrics.sentCount + metrics.underReviewCount}</div>
          <p className="text-xs text-amber-600 font-medium">{metrics.underReviewCount} pending internal audit</p>
        </div>
      </div>

      {/* Recent Proposals Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Proposal Activity</h2>
            <p className="text-xs text-slate-500">Latest proposals drafted and updated by agency staff</p>
          </div>

          <button
            onClick={() => onNavigate('proposals')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1 transition-colors"
          >
            <span>View All Proposals</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Client & Company</th>
                <th className="px-6 py-3.5">Service Line</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Last Updated</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.recentProposals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No proposals created yet. Click "Generate New Proposal" to get started!
                  </td>
                </tr>
              ) : (
                metrics.recentProposals.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{p.clientCompany}</div>
                      <div className="text-slate-500 flex items-center space-x-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{p.clientName} ({p.title})</span>
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

                    <td className="px-6 py-4 text-slate-500">
                      {new Date(p.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onSelectProposal(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs inline-flex items-center space-x-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Open Workspace</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
