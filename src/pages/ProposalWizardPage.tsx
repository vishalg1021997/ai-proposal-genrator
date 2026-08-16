import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building,
  CheckCircle2,
  Layers,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { ProposalTemplate } from '../types';
import { api } from '../services/api';

interface ProposalWizardPageProps {
  onComplete: (proposalId: string) => void;
  onCancel: () => void;
}

export const ProposalWizardPage: React.FC<ProposalWizardPageProps> = ({
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);

  // Form Fields
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [serviceType, setServiceType] = useState('Cloud & Mobile Engineering');
  const [serviceDescription, setServiceDescription] = useState('');
  const [keyChallenges, setKeyChallenges] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [tone, setTone] = useState('Professional & Formal');
  const [customPromptNotes, setCustomPromptNotes] = useState('');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentGenStep, setCurrentGenStep] = useState('Initializing Gemini AI...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getTemplates()
      .then((data) => {
        setTemplates(data);
        if (data.length > 0) setSelectedTemplateId(data[0].id);
      })
      .catch((err) => console.error('Failed to load templates:', err));
  }, []);

  const handleStartGeneration = async () => {
    if (!clientCompany.trim() || !clientName.trim()) {
      setError('Please fill in required client details.');
      setStep(1);
      return;
    }

    if (!serviceDescription.trim()) {
      setError('Please provide service requirements / description.');
      setStep(2);
      return;
    }

    setIsGenerating(true);
    setStep(4);
    setError(null);

    try {
      setGenerationProgress(20);
      setCurrentGenStep('Creating proposal record & configuring 16 mandatory sections...');

      const selectedTpl = templates.find((t) => t.id === selectedTemplateId);

      const created = await api.createProposal({
        title: `${serviceType} Proposal for ${clientCompany}`,
        clientName,
        clientCompany,
        clientEmail,
        serviceType,
        summary: serviceDescription,
        status: 'draft',
        templateId: selectedTemplateId,
        templateName: selectedTpl?.name || 'Standard Template',
        tone,
        customNotes: customPromptNotes,
        sections: [],
      });

      setGenerationProgress(50);
      setCurrentGenStep('Sending client scope & business constraints to Gemini 3.7 Flash...');

      // Call AI Generation Endpoint
      const res = await api.generateProposalAI(created.id, {
        serviceDescription,
        keyChallenges,
        customPromptNotes,
      });

      setGenerationProgress(90);
      setCurrentGenStep('Verifying 16 sections & enforcing pricing safety rules...');

      setTimeout(() => {
        setGenerationProgress(100);
        onComplete(res.proposal.id);
      }, 800);
    } catch (err: any) {
      console.error('Wizard AI Generation failed:', err);
      setError(err.message || 'Failed to generate proposal via Gemini AI');
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-8">
      {/* Wizard Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span>AI Proposal Creator</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Generate Client Proposal</h1>
        <p className="text-xs text-slate-500">
          Step-by-step workflow to produce structured 16-section proposals
        </p>
      </div>

      {/* Step Indicators */}
      {!isGenerating && (
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 text-xs font-semibold">
          {[
            { num: 1, title: '1. Client Details' },
            { num: 2, title: '2. Services & Scope' },
            { num: 3, title: '3. Template & Tone' },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => s.num < step && setStep(s.num)}
              className={`flex items-center space-x-2 cursor-pointer transition-colors ${
                step === s.num
                  ? 'text-blue-600 font-bold'
                  : step > s.num
                  ? 'text-emerald-600'
                  : 'text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s.num
                    ? 'bg-blue-600 text-white'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className="hidden sm:inline">{s.title}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Client Details */}
      {step === 1 && !isGenerating && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Client & Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Client Company Name *
              </label>
              <input
                type="text"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900"
                placeholder="e.g. Vanguard Retail Holdings"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Primary Contact Name *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900"
                placeholder="e.g. Marcus Vance"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Client Email Address
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900"
                placeholder="e.g. m.vance@vanguardretail.com"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!clientCompany.trim() || !clientName.trim()) {
                  setError('Client company and contact name are required.');
                  return;
                }
                setError(null);
                setStep(2);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5"
            >
              <span>Next: Services & Scope</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Services & Scope */}
      {step === 2 && !isGenerating && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Service Category & Objectives
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Service Type / Solution Area *
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900"
              >
                <option value="Cloud & Mobile Engineering">Cloud & Mobile Engineering</option>
                <option value="AI Integration & GenAI Platform">AI Integration & GenAI Platform</option>
                <option value="UI/UX Redesign & Digital Experience">UI/UX Redesign & Digital Experience</option>
                <option value="Managed Technical Retainer & Support">Managed Technical Retainer & Support</option>
                <option value="Cybersecurity & Infrastructure Modernization">Cybersecurity & Infrastructure Modernization</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Requested Services & Objectives Description *
              </label>
              <textarea
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                rows={4}
                required
                className="w-full p-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 text-xs"
                placeholder="Describe what the client is looking to build, expected timelines, high-level features, or technical goals..."
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Key Client Challenges & Pain Points (Optional)
              </label>
              <textarea
                value={keyChallenges}
                onChange={(e) => setKeyChallenges(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 text-xs"
                placeholder="e.g. Legacy monolithic latency, inventory synchronization delays during peak promotional traffic..."
              />
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => {
                if (!serviceDescription.trim()) {
                  setError('Please enter a service description.');
                  return;
                }
                setError(null);
                setStep(3);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5"
            >
              <span>Next: Template & Tone</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Template & Tone */}
      {step === 3 && !isGenerating && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Select Template & Voice Tone
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-2">
                Proposal Template Preset
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplateId === tpl.id
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="font-bold text-slate-900">{tpl.name}</div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{tpl.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tone of Voice
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-blue-500 text-slate-900"
              >
                <option value="Professional & Formal">Professional & Formal (Enterprise Default)</option>
                <option value="Persuasive & Innovative">Persuasive & Innovative (Startup / Venture)</option>
                <option value="Technical & Precise">Technical & Precise (Engineering / Architecture)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Special Prompt Guidelines for Gemini AI (Optional)
              </label>
              <input
                type="text"
                value={customPromptNotes}
                onChange={(e) => setCustomPromptNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-blue-500 text-slate-900"
                placeholder="e.g. Ensure compliance with SOC2 standards, emphasize agile 2-week iterations..."
              />
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleStartGeneration}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-md flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Full Proposal</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 4: AI Progress Screen */}
      {isGenerating && (
        <div className="bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
            <Sparkles className="w-8 h-8 text-blue-400 absolute" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black">Generating Proposal via Gemini AI</h2>
            <p className="text-xs text-blue-200">{currentGenStep}</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700 max-w-md mx-auto">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${generationProgress}%` }}
            />
          </div>

          <div className="text-xs text-slate-400 grid grid-cols-2 gap-2 max-w-sm mx-auto text-left bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-1 text-emerald-400">
              <FileCheck className="w-3.5 h-3.5" />
              <span>16 Mandatory Sections</span>
            </div>
            <div className="flex items-center space-x-1 text-emerald-400">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Pricing Safety Guard</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
