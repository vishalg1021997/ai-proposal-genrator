import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  Eye,
  History,
  Sparkles,
  CheckCircle2,
  Building,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { Proposal, ProposalSection, ProposalVersion, AgencySettings } from '../types';
import { RichTextEditor } from '../components/RichTextEditor';
import { RegenerateModal } from '../components/RegenerateModal';
import { VersionHistoryDrawer } from '../components/VersionHistoryDrawer';
import { ProposalPreviewModal } from '../components/ProposalPreviewModal';
import { api } from '../services/api';

interface ProposalEditorPageProps {
  proposalId: string;
  settings: AgencySettings;
  onBack: () => void;
}

export const ProposalEditorPage: React.FC<ProposalEditorPageProps> = ({
  proposalId,
  settings,
  onBack,
}) => {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [versions, setVersions] = useState<ProposalVersion[]>([]);
  const [activeSectionKey, setActiveSectionKey] = useState<string>('cover_page');
  const [activeSectionContent, setActiveSectionContent] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Modals & Drawers
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);

  const loadProposalData = async () => {
    setLoading(true);
    try {
      const data = await api.getProposalById(proposalId);
      setProposal(data.proposal);
      setVersions(data.versions);

      if (data.proposal.sections.length > 0) {
        const first = data.proposal.sections[0];
        setActiveSectionKey(first.key);
        setActiveSectionContent(first.content);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load proposal details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposalData();
  }, [proposalId]);

  if (loading || !proposal) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs animate-pulse">
        Loading proposal workspace...
      </div>
    );
  }

  const activeSectionIdx = proposal.sections.findIndex((s) => s.key === activeSectionKey);
  const activeSection = proposal.sections[activeSectionIdx] || proposal.sections[0];

  const handleSelectSection = (key: string) => {
    // Save unsaved content to local state first
    updateLocalSectionContent(activeSectionKey, activeSectionContent);
    setActiveSectionKey(key);
    const target = proposal.sections.find((s) => s.key === key);
    if (target) {
      setActiveSectionContent(target.content);
    }
  };

  const updateLocalSectionContent = (key: string, content: string) => {
    if (!proposal) return;
    const updated = proposal.sections.map((s) =>
      s.key === key ? { ...s, content, isCustomized: true, lastUpdated: new Date().toISOString() } : s
    );
    setProposal({ ...proposal, sections: updated });
  };

  const handleEditorContentChange = (newContent: string) => {
    setActiveSectionContent(newContent);
    updateLocalSectionContent(activeSectionKey, newContent);
  };

  const handleStatusChange = async (newStatus: any) => {
    try {
      const updated = await api.updateProposal(
        proposal.id,
        { status: newStatus },
        `Status changed to ${newStatus}`
      );
      if (updated) setProposal(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleSaveProposal = async (reason: string = 'Manual save in editor') => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      // Ensure current active section content is captured
      updateLocalSectionContent(activeSectionKey, activeSectionContent);

      const updated = await api.updateProposal(
        proposal.id,
        {
          sections: proposal.sections,
          title: proposal.title,
        },
        reason
      );

      if (updated) {
        setProposal(updated);
        // Reload versions
        const versionList = await api.getProposalVersions(proposal.id);
        setVersions(versionList);

        setSaveMessage('Saved version snapshot successfully!');
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save proposal changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateSection = async (key: string, instructions: string) => {
    const res = await api.regenerateSectionAI(proposal.id, key, instructions);
    if (res.success && res.proposal) {
      setProposal(res.proposal);
      const updatedSec = res.proposal.sections.find((s) => s.key === key);
      if (updatedSec) {
        setActiveSectionContent(updatedSec.content);
      }
      const versionList = await api.getProposalVersions(proposal.id);
      setVersions(versionList);
    }
  };

  const handleRestoreVersion = async (ver: ProposalVersion) => {
    if (window.confirm(`Restore proposal to version v${ver.versionNumber}.0?`)) {
      try {
        const restored = await api.updateProposal(
          proposal.id,
          { sections: ver.sections, title: ver.title },
          `Restored version snapshot v${ver.versionNumber}.0`
        );
        if (restored) {
          setProposal(restored);
          const currentTarget = restored.sections.find((s) => s.key === activeSectionKey);
          if (currentTarget) setActiveSectionContent(currentTarget.content);
          setIsHistoryOpen(false);
        }
      } catch (err: any) {
        alert(err.message || 'Failed to restore version');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Back to Directory"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={proposal.title}
                onChange={(e) => setProposal({ ...proposal, title: e.target.value })}
                className="font-bold text-slate-900 text-lg border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-hidden px-1 rounded transition-colors"
              />
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                v{proposal.versionCount || 1}.0
              </span>
            </div>

            <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5 px-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{proposal.clientCompany} ({proposal.clientName})</span>
              <span>&bull;</span>
              <span>{proposal.serviceType}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          {/* Status Dropdown */}
          <select
            value={proposal.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold capitalize text-slate-800 focus:outline-hidden"
          >
            <option value="draft">Draft</option>
            <option value="under_review">Under Review</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
          </select>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <History className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Versions</span>
          </button>

          <button
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-2xs"
          >
            <Eye className="w-4 h-4 text-blue-400" />
            <span>Preview & Export PDF</span>
          </button>

          <button
            onClick={() => handleSaveProposal('Manual version save')}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Version'}</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Main Workspace Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: 16 Proposal Sections */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 space-y-3 h-fit max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 px-1">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Proposal Sections (16)
            </h3>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              AI Enforced
            </span>
          </div>

          <div className="space-y-1">
            {proposal.sections.map((s, idx) => {
              const isActive = s.key === activeSectionKey;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectSection(s.key)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate pr-2">{s.title}</span>
                  {s.isCustomized ? (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isActive ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      Edited
                    </span>
                  ) : (
                    <FileCheck className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Main Editor Canvas */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
          {/* Section Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Section {activeSectionIdx + 1} of 16
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">{activeSection.title}</h2>
            </div>

            <button
              onClick={() => setIsRegenerateOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-all shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Regenerate with AI</span>
            </button>
          </div>

          {/* Section Rich Editor */}
          <RichTextEditor
            content={activeSectionContent}
            onChange={handleEditorContentChange}
          />

          {/* Section Prev / Next Navigation */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              disabled={activeSectionIdx === 0}
              onClick={() => {
                if (activeSectionIdx > 0) {
                  const prevKey = proposal.sections[activeSectionIdx - 1].key;
                  handleSelectSection(prevKey);
                }
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Section</span>
            </button>

            <button
              disabled={activeSectionIdx === proposal.sections.length - 1}
              onClick={() => {
                if (activeSectionIdx < proposal.sections.length - 1) {
                  const nextKey = proposal.sections[activeSectionIdx + 1].key;
                  handleSelectSection(nextKey);
                }
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1 disabled:opacity-40 transition-colors"
            >
              <span>Next Section</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Regenerate Modal */}
      <RegenerateModal
        section={activeSection}
        isOpen={isRegenerateOpen}
        onClose={() => setIsRegenerateOpen(false)}
        onRegenerate={handleRegenerateSection}
      />

      {/* Version History Drawer */}
      <VersionHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        versions={versions}
        onRestoreVersion={handleRestoreVersion}
      />

      {/* Full Document Preview & PDF Export Modal */}
      <ProposalPreviewModal
        proposal={proposal}
        settings={settings}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
};
