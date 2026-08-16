import React from 'react';
import {
  FileText,
  LayoutDashboard,
  Layers,
  Settings,
  Plus,
  LogOut,
  Database,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AgencySettings } from '../types';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onNewProposal: () => void;
  onOpenSqlModal: () => void;
  settings: AgencySettings | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onNewProposal,
  onOpenSqlModal,
  settings,
}) => {
  const { user, logout } = useAuth();

  const brandColor = settings?.brandColor || '#1e3a8a';
  const agencyName = settings?.agencyName || 'Apex Digital Transformations';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs print:hidden print-hide">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm transition-transform hover:scale-105"
              style={{ backgroundColor: brandColor }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">{agencyName}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  Internal Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">AI Enterprise Proposal Workspace</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onNavigate('proposals')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'proposals'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Proposals</span>
            </button>

            <button
              onClick={() => onNavigate('templates')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'templates'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Templates</span>
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'settings'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Branding & Settings</span>
            </button>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenSqlModal}
              title="View Supabase PostgreSQL DDL Schema"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors hidden sm:flex items-center space-x-1 text-xs font-medium"
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span className="hidden lg:inline">Supabase DDL</span>
            </button>

            <button
              onClick={onNewProposal}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-xs transition-all hover:opacity-95 focus:outline-hidden"
              style={{ backgroundColor: brandColor }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Proposal</span>
            </button>

            {user && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs">
                  {user.name.charAt(0)}
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
