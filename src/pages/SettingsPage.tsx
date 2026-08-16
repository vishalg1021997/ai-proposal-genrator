import React, { useState } from 'react';
import {
  Settings,
  Save,
  Palette,
  Building,
  Terminal,
  CheckCircle2,
  Database,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { AgencySettings } from '../types';
import { api } from '../services/api';

interface SettingsPageProps {
  settings: AgencySettings;
  onUpdateSettings: (updated: AgencySettings) => void;
  onOpenSqlModal: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onOpenSqlModal,
}) => {
  const [formData, setFormData] = useState<AgencySettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updated = await api.updateSettings(formData);
      onUpdateSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update agency settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Agency Branding & Settings</h1>
          <p className="text-xs text-slate-500">
            Customize proposal PDF themes, agency logo, cover layout, and Gemini AI system prompts
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Agency settings updated successfully! All future generated proposals and PDFs will use these theme settings.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Agency Identity & Branding */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-slate-900 text-sm">Agency Identity & Logo</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Agency Name</label>
              <input
                type="text"
                value={formData.agencyName}
                onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                required
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Logo URL</label>
              <input
                type="text"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
                placeholder="https://..."
              />
              {formData.logoUrl && (
                <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-3">
                  <span className="text-[11px] text-slate-500">Logo Preview:</span>
                  <img src={formData.logoUrl} alt="Logo Preview" className="h-8 object-contain rounded" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Theme Colors */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Palette className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-slate-900 text-sm">PDF Theme Colors</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-slate-700 mb-2">Primary Brand Color (Cover Header)</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.brandColor}
                  onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5"
                />
                <input
                  type="text"
                  value={formData.brandColor}
                  onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                  className="w-32 p-2 rounded-xl border border-slate-300 font-mono uppercase font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-2">Accent Color (Section Badges)</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-32 p-2 rounded-xl border border-slate-300 font-mono uppercase font-bold text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Footer Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-slate-900 text-sm">Contact & Document Footer</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Document Footer Notice</label>
              <input
                type="text"
                value={formData.footerText}
                onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Gemini AI System Prompt Config */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-slate-900 text-sm">Gemini AI Senior Consultant System Prompt</h2>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Global Proposal System Instruction
            </label>
            <textarea
              value={formData.defaultSystemPrompt}
              onChange={(e) => setFormData({ ...formData, defaultSystemPrompt: e.target.value })}
              rows={5}
              className="w-full p-3 rounded-xl border border-slate-300 font-mono text-[11px] leading-relaxed text-slate-800"
            />
          </div>
        </div>

        {/* Database & Supabase DDL Info Card */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Database & Supabase Integration</h3>
            </div>

            <button
              type="button"
              onClick={onOpenSqlModal}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 transition-all"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Export Supabase SQL</span>
            </button>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed">
            All proposal states, custom templates, and versions persist automatically on local storage. To scale across multiple agency teams, execute our Supabase PostgreSQL script and configure <code className="text-emerald-400 font-mono">SUPABASE_URL</code> and <code className="text-emerald-400 font-mono">SUPABASE_KEY</code>.
          </p>
        </div>
      </form>
    </div>
  );
};
