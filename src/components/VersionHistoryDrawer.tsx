import React from 'react';
import { History, X, Clock, User, RotateCcw, GitCommit } from 'lucide-react';
import { ProposalVersion, ProposalSection } from '../types';

interface VersionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  versions: ProposalVersion[];
  onRestoreVersion: (version: ProposalVersion) => void;
}

export const VersionHistoryDrawer: React.FC<VersionHistoryDrawerProps> = ({
  isOpen,
  onClose,
  versions,
  onRestoreVersion,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base text-white">Proposal Version Timeline</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Versions List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {versions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No version history snapshots available yet.
            </div>
          ) : (
            versions.map((ver) => (
              <div
                key={ver.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200">
                      v{ver.versionNumber}.0
                    </span>
                    <span className="font-semibold text-xs text-slate-900 truncate max-w-[180px]">{ver.title}</span>
                  </div>
                  <button
                    onClick={() => onRestoreVersion(ver)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-blue-700 text-xs font-semibold flex items-center space-x-1 shadow-2xs transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-200 font-mono leading-tight">
                  <GitCommit className="w-3 h-3 inline-block mr-1 text-blue-500" />
                  {ver.changelog || 'Saved version snapshot'}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(ver.createdAt).toLocaleString()}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{ver.createdBy}</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
