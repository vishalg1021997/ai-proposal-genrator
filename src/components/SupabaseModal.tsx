import React, { useState, useEffect } from 'react';
import { Database, X, Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [sql, setSql] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api
        .getSupabaseSql()
        .then((data) => setSql(data))
        .catch((err) => setSql(`-- Error loading SQL: ${err.message}`))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Supabase PostgreSQL Schema DDL</h3>
              <p className="text-xs text-slate-400">Tables: users, proposals, proposal_versions, templates, settings</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-2">
            <div className="font-bold flex items-center space-x-1.5">
              <Terminal className="w-4 h-4 text-emerald-600" />
              <span>How to setup Supabase PostgreSQL:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-emerald-800">
              <li>Log in to your <strong>Supabase Dashboard</strong> and open the SQL Editor.</li>
              <li>Copy the DDL script below and execute it to create all required tables.</li>
              <li>In AI Studio Secrets or <code className="bg-emerald-100 px-1 rounded font-mono">.env</code>, set <code className="bg-emerald-100 px-1 rounded font-mono">SUPABASE_URL</code> and <code className="bg-emerald-100 px-1 rounded font-mono">SUPABASE_KEY</code>.</li>
            </ol>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 shadow-sm transition-all z-10"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied SQL!' : 'Copy SQL Script'}</span>
            </button>

            <pre className="p-4 pt-12 overflow-x-auto text-xs font-mono text-emerald-400 leading-relaxed max-h-80">
              {loading ? 'Loading database schema...' : sql}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline flex items-center space-x-1 font-medium"
          >
            <span>Open Supabase Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
