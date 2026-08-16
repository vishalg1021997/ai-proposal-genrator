import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import { ProposalTemplate, MANDATORY_SECTIONS } from '../types';
import { api } from '../services/api';

export const TemplateManagerPage: React.FC = () => {
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Software Engineering');

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await api.getTemplates();
      setTemplates(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.createTemplate({
        name,
        description,
        category,
        isSystemDefault: false,
        defaultSections: MANDATORY_SECTIONS.map((s) => ({
          key: s.key,
          title: s.title,
          defaultPromptHint: `Custom prompt hint for ${s.title}`,
        })),
      });

      setName('');
      setDescription('');
      setIsCreating(false);
      loadTemplates();
    } catch (err: any) {
      alert(err.message || 'Failed to create template');
    }
  };

  const handleDelete = async (id: string, tplName: string) => {
    if (window.confirm(`Delete template "${tplName}"?`)) {
      try {
        await api.deleteTemplate(id);
        loadTemplates();
      } catch (err: any) {
        alert(err.message || 'Failed to delete template');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Proposal Templates</h1>
          <p className="text-xs text-slate-500">
            Configure default structure and prompt hints for agency proposal workflows
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs flex items-center space-x-2 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Cancel' : 'New Template'}</span>
        </button>
      </div>

      {/* Create Template Form */}
      {isCreating && (
        <form onSubmit={handleCreateTemplate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h2 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Create Custom Proposal Template
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Template Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
                placeholder="e.g. Cybersecurity & SOC2 Audit Proposal"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="AI & Data Science">AI & Data Science</option>
                <option value="Design & Product">Design & Product</option>
                <option value="Retainer & Support">Retainer & Support</option>
                <option value="Security & Infrastructure">Security & Infrastructure</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
                placeholder="Target use case and client scenarios for this template..."
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs">
            ✨ New templates automatically inherit all 16 mandatory AI sections required by the agency framework.
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Save Template
            </button>
          </div>
        </form>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                    {tpl.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{tpl.name}</h3>
                </div>

                {tpl.isSystemDefault ? (
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                    Built-in System
                  </span>
                ) : (
                  <button
                    onClick={() => handleDelete(tpl.id, tpl.name)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{tpl.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center space-x-1 font-medium text-emerald-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>16 Mandatory Sections Pre-Configured</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
