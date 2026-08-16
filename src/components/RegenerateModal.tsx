import React, { useState } from 'react';
import { Sparkles, X, RefreshCw, AlertCircle } from 'lucide-react';
import { ProposalSection } from '../types';

interface RegenerateModalProps {
  section: ProposalSection | null;
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: (sectionKey: string, instructions: string) => Promise<void>;
}

export const RegenerateModal: React.FC<RegenerateModalProps> = ({
  section,
  isOpen,
  onClose,
  onRegenerate,
}) => {
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !section) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructions.trim()) {
      setError('Please provide specific prompt instructions for the AI.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onRegenerate(section.key, instructions);
      setInstructions('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate section.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const PRESET_PROMPTS = [
    'Make this section more technical and detailed for engineering stakeholders.',
    'Focus heavily on ROI, cost efficiency, and business metrics.',
    'Simplify language for executive readers and highlight key milestones.',
    'Add an explicit table outlining deliverables, owners, and check-ins.',
    'Emphasize SOC2 security, compliance, and risk mitigation strategies.',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">AI Section Assistant</h3>
              <p className="text-xs text-blue-200">Regenerating: <span className="font-semibold text-white">{section.title}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-blue-200 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Custom Regeneration Prompt / Guidelines:
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-hidden text-slate-800"
              placeholder="e.g. Include 2-week agile sprint iterations, focus on WCAG AA accessibility compliance, and add risk mitigation bullet points..."
            />
          </div>

          {/* Quick Preset Ideas */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">
              Quick Prompt Ideas:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PROMPTS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInstructions(preset)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-xs text-slate-600 transition-colors text-left"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center space-x-2 transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Regenerating via Gemini...' : 'Regenerate Section'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
