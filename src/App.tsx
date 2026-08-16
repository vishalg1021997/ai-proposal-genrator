import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { ProposalsPage } from './pages/ProposalsPage';
import { ProposalWizardPage } from './pages/ProposalWizardPage';
import { ProposalEditorPage } from './pages/ProposalEditorPage';
import { TemplateManagerPage } from './pages/TemplateManagerPage';
import { SettingsPage } from './pages/SettingsPage';
import { SupabaseModal } from './components/SupabaseModal';
import { AgencySettings, DashboardMetrics } from './types';
import { api } from './services/api';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

  const [settings, setSettings] = useState<AgencySettings | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [sData, mData] = await Promise.all([api.getSettings(), api.getDashboard()]);
      setSettings(sData);
      setMetrics(mData);
    } catch (err) {
      console.error('Failed to load initial settings/metrics:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, currentTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center text-xs animate-pulse">
        Initializing AI Proposal Application...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleOpenProposal = (id: string) => {
    setSelectedProposalId(id);
    setCurrentTab('editor');
  };

  const handleNewProposal = () => {
    setCurrentTab('wizard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'editor') setSelectedProposalId(null);
        }}
        onNewProposal={handleNewProposal}
        onOpenSqlModal={() => setIsSqlModalOpen(true)}
        settings={settings}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <DashboardPage
            metrics={metrics}
            onNewProposal={handleNewProposal}
            onSelectProposal={handleOpenProposal}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'proposals' && (
          <ProposalsPage
            onSelectProposal={handleOpenProposal}
            onNewProposal={handleNewProposal}
          />
        )}

        {currentTab === 'wizard' && (
          <ProposalWizardPage
            onComplete={(id) => {
              setSelectedProposalId(id);
              setCurrentTab('editor');
            }}
            onCancel={() => setCurrentTab('proposals')}
          />
        )}

        {currentTab === 'editor' && selectedProposalId && settings && (
          <ProposalEditorPage
            proposalId={selectedProposalId}
            settings={settings}
            onBack={() => {
              setSelectedProposalId(null);
              setCurrentTab('proposals');
            }}
          />
        )}

        {currentTab === 'templates' && <TemplateManagerPage />}

        {currentTab === 'settings' && settings && (
          <SettingsPage
            settings={settings}
            onUpdateSettings={(updated) => setSettings(updated)}
            onOpenSqlModal={() => setIsSqlModalOpen(true)}
          />
        )}
      </main>

      <SupabaseModal isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
