import React, { useState, useEffect } from 'react';
import {
  Calculator,
  DollarSign,
  Clock,
  Calendar,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { PricingConfig, PricingItem } from '../types';

interface PricingCalculatorProps {
  initialConfig?: PricingConfig;
  clientCompany?: string;
  onApplyToSection: (markdownContent: string, config: PricingConfig) => void;
  onClose?: () => void;
  isModal?: boolean;
}

const DEFAULT_CONFIG: PricingConfig = {
  hourlyRate: 100, // 100 USD default per hour
  hoursPerDay: 8, // 8 hrs default per day
  daysOfWork: 20, // default 20 working days (~1 month)
  currency: 'USD',
  discountPercent: 0,
  taxPercent: 0,
  paymentTerms: '50% Initial Deposit upon signing, 25% at Midpoint Milestone, 25% upon Final Acceptance and Deployment.',
  items: [
    {
      id: 'item-1',
      name: 'Phase 1: Discovery, Architecture & Wireframing',
      days: 5,
      hoursPerDay: 8,
      hourlyRate: 100,
    },
    {
      id: 'item-2',
      name: 'Phase 2: Core Engineering & Integrations',
      days: 10,
      hoursPerDay: 8,
      hourlyRate: 100,
    },
    {
      id: 'item-3',
      name: 'Phase 3: Quality Assurance, UAT & Launch',
      days: 5,
      hoursPerDay: 8,
      hourlyRate: 100,
    },
  ],
};

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'AU$',
    INR: '₹',
  };
  const sym = symbols[currency] || '$';
  return `${sym}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function generatePricingMarkdown(config: PricingConfig, clientCompany: string = 'Client'): string {
  const currency = config.currency || 'USD';
  const hourlyRate = config.hourlyRate || 100;
  const hoursPerDay = config.hoursPerDay || 8;
  const daysOfWork = config.daysOfWork || 20;

  const items = config.items && config.items.length > 0 ? config.items : [];
  const useItems = items.length > 0;

  let subtotal = 0;
  let totalHours = 0;
  let totalDays = 0;

  if (useItems) {
    items.forEach((it) => {
      const itHours = it.days * it.hoursPerDay;
      const itCost = itHours * it.hourlyRate;
      subtotal += itCost;
      totalHours += itHours;
      totalDays += it.days;
    });
  } else {
    totalDays = daysOfWork;
    totalHours = daysOfWork * hoursPerDay;
    subtotal = totalHours * hourlyRate;
  }

  const discountAmount = config.discountPercent ? (subtotal * config.discountPercent) / 100 : 0;
  const discountedSubtotal = subtotal - discountAmount;
  const taxAmount = config.taxPercent ? (discountedSubtotal * config.taxPercent) / 100 : 0;
  const grandTotal = discountedSubtotal + taxAmount;

  let markdown = `### 8. Commercial Investment & Pricing Model\n\n`;
  markdown += `The commercial structure for **${clientCompany}** is calculated transparently based on verified engineering effort, hourly rate, and duration.\n\n`;

  markdown += `#### 8.1 Rate & Baseline Assumptions\n`;
  markdown += `- **Standard Hourly Rate:** ${formatCurrency(hourlyRate, currency)} / hour\n`;
  markdown += `- **Standard Working Day:** ${hoursPerDay} hours / day (${formatCurrency(hourlyRate * hoursPerDay, currency)} / day)\n`;
  markdown += `- **Estimated Work Duration:** ${totalDays} working days (~${totalHours} total engineering hours)\n\n`;

  markdown += `#### 8.2 Deliverable & Milestone Cost Breakdown\n\n`;
  markdown += `| Phase / Deliverable | Est. Days | Hours/Day | Hourly Rate | Total Investment |\n`;
  markdown += `|---|---|---|---|---|\n`;

  if (useItems) {
    items.forEach((it) => {
      const itHours = it.days * it.hoursPerDay;
      const itCost = itHours * it.hourlyRate;
      markdown += `| **${it.name}** | ${it.days} days | ${it.hoursPerDay} hrs | ${formatCurrency(it.hourlyRate, currency)}/hr | ${formatCurrency(itCost, currency)} |\n`;
    });
  } else {
    markdown += `| **Full Engagement Engineering Effort** | ${totalDays} days | ${hoursPerDay} hrs | ${formatCurrency(hourlyRate, currency)}/hr | ${formatCurrency(subtotal, currency)} |\n`;
  }

  markdown += `\n`;
  markdown += `#### 8.3 Financial Summary\n\n`;
  markdown += `| Item | Amount (${currency}) |\n`;
  markdown += `|---|---|\n`;
  markdown += `| **Base Subtotal (${totalHours} hrs @ ${formatCurrency(hourlyRate, currency)}/hr)** | **${formatCurrency(subtotal, currency)}** |\n`;

  if (config.discountPercent && config.discountPercent > 0) {
    markdown += `| Strategic Partnership Discount (${config.discountPercent}%) | -${formatCurrency(discountAmount, currency)} |\n`;
  }
  if (config.taxPercent && config.taxPercent > 0) {
    markdown += `| Applicable Tax / VAT (${config.taxPercent}%) | +${formatCurrency(taxAmount, currency)} |\n`;
  }

  markdown += `| **Total Project Investment** | **${formatCurrency(grandTotal, currency)} ${currency}** |\n\n`;

  markdown += `#### 8.4 Payment Terms & Invoicing Schedule\n`;
  markdown += `${config.paymentTerms || 'Payment to be rendered in agreed milestone installments against verified deliverables.'}\n\n`;
  markdown += `*All pricing quotes are valid for 30 calendar days from the date of issuance.*`;

  return markdown;
}

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  initialConfig,
  clientCompany = 'Client',
  onApplyToSection,
  onClose,
  isModal = false,
}) => {
  const [config, setConfig] = useState<PricingConfig>(() => {
    if (initialConfig) {
      return {
        ...DEFAULT_CONFIG,
        ...initialConfig,
        items: initialConfig.items && initialConfig.items.length > 0 ? initialConfig.items : DEFAULT_CONFIG.items,
      };
    }
    return DEFAULT_CONFIG;
  });

  const [mode, setMode] = useState<'simple' | 'breakdown'>('simple');
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Sync total days in simple mode
  const handleSimpleDaysChange = (days: number) => {
    const val = Math.max(1, days);
    setConfig((prev) => ({
      ...prev,
      daysOfWork: val,
    }));
  };

  const handleSimpleRateChange = (rate: number) => {
    const val = Math.max(1, rate);
    setConfig((prev) => ({
      ...prev,
      hourlyRate: val,
      items: prev.items?.map((it) => ({ ...it, hourlyRate: val })),
    }));
  };

  const handleSimpleHoursChange = (hours: number) => {
    const val = Math.max(1, Math.min(24, hours));
    setConfig((prev) => ({
      ...prev,
      hoursPerDay: val,
      items: prev.items?.map((it) => ({ ...it, hoursPerDay: val })),
    }));
  };

  // Breakdown items handlers
  const handleAddItem = () => {
    const newItem: PricingItem = {
      id: `item-${Date.now()}`,
      name: `Phase ${((config.items?.length || 0) + 1)}: New Workstream`,
      days: 5,
      hoursPerDay: config.hoursPerDay || 8,
      hourlyRate: config.hourlyRate || 100,
    };
    setConfig((prev) => ({
      ...prev,
      items: [...(prev.items || []), newItem],
    }));
  };

  const handleUpdateItem = (id: string, updates: Partial<PricingItem>) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items?.map((it) => (it.id === id ? { ...it, ...updates } : it)),
    }));
  };

  const handleDeleteItem = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items?.filter((it) => it.id !== id),
    }));
  };

  const handleResetDefaults = () => {
    setConfig(DEFAULT_CONFIG);
  };

  // Calculations
  const hourlyRate = config.hourlyRate || 100;
  const hoursPerDay = config.hoursPerDay || 8;
  const daysOfWork = config.daysOfWork || 20;
  const dailyRate = hourlyRate * hoursPerDay;

  let calculatedDays = daysOfWork;
  let calculatedHours = daysOfWork * hoursPerDay;
  let subtotal = calculatedHours * hourlyRate;

  if (mode === 'breakdown' && config.items && config.items.length > 0) {
    calculatedDays = config.items.reduce((sum, it) => sum + (Number(it.days) || 0), 0);
    calculatedHours = config.items.reduce((sum, it) => sum + (Number(it.days) || 0) * (Number(it.hoursPerDay) || 8), 0);
    subtotal = config.items.reduce(
      (sum, it) => sum + (Number(it.days) || 0) * (Number(it.hoursPerDay) || 8) * (Number(it.hourlyRate) || 100),
      0
    );
  }

  const discountAmount = config.discountPercent ? (subtotal * config.discountPercent) / 100 : 0;
  const discountedSubtotal = subtotal - discountAmount;
  const taxAmount = config.taxPercent ? (discountedSubtotal * config.taxPercent) / 100 : 0;
  const grandTotal = discountedSubtotal + taxAmount;

  const handleApply = () => {
    const updatedConfig: PricingConfig = {
      ...config,
      daysOfWork: calculatedDays,
    };
    const markdown = generatePricingMarkdown(updatedConfig, clientCompany);
    onApplyToSection(markdown, updatedConfig);
    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      if (onClose && isModal) onClose();
    }, 900);
  };

  const content = (
    <div className="space-y-6">
      {/* Top Banner / Formula Header */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Pricing Calculator & Formula</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Standard baseline: <span className="font-semibold text-blue-700">$100 USD/hr</span> &times; <span className="font-semibold text-blue-700">8 hrs/day</span> &times; <span className="font-semibold text-blue-700">Days of work</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMode('simple')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'simple'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Simple Project
            </button>
            <button
              onClick={() => setMode('breakdown')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'breakdown'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Phase Breakdown
            </button>
          </div>
        </div>
      </div>

      {/* Main Calculation Inputs */}
      {mode === 'simple' ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Hourly Rate */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                <span>Hourly Rate (USD)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">$</span>
                <input
                  type="number"
                  min="1"
                  step="5"
                  value={config.hourlyRate}
                  onChange={(e) => handleSimpleRateChange(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-sm font-bold text-slate-900 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500">Default: $100 / hour</p>
            </div>

            {/* Daily Hours */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Work Hours / Day</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={config.hoursPerDay}
                  onChange={(e) => handleSimpleHoursChange(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-bold text-slate-900 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500">Default: 8 hours / day</p>
            </div>

            {/* Total Working Days */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Days of Work</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={config.daysOfWork}
                  onChange={(e) => handleSimpleDaysChange(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-bold text-slate-900 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500">Total business days</p>
            </div>
          </div>

          {/* Quick Preset Days Pills */}
          <div className="pt-2 border-t border-slate-100 flex items-center space-x-2 flex-wrap gap-2 text-xs">
            <span className="text-slate-500 font-semibold text-[11px]">Quick Presets:</span>
            {[5, 10, 15, 20, 30, 45, 60].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleSimpleDaysChange(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  config.daysOfWork === d
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {d} Days ({d * 8}h)
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Phase Breakdown Mode */
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Project Phases & Milestones Breakdown
            </h4>
            <button
              onClick={handleAddItem}
              className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center space-x-1 border border-blue-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Phase</span>
            </button>
          </div>

          <div className="space-y-3">
            {config.items?.map((it, idx) => {
              const itemHours = (Number(it.days) || 0) * (Number(it.hoursPerDay) || 8);
              const itemTotal = itemHours * (Number(it.hourlyRate) || 100);

              return (
                <div
                  key={it.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={it.name}
                      onChange={(e) => handleUpdateItem(it.id, { name: e.target.value })}
                      placeholder="Phase name..."
                      className="font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 w-full max-w-md focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleDeleteItem(it.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove Phase"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-500 uppercase">Days</span>
                      <input
                        type="number"
                        min="1"
                        value={it.days}
                        onChange={(e) => handleUpdateItem(it.id, { days: Math.max(1, Number(e.target.value)) })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-500 uppercase">Hrs/Day</span>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={it.hoursPerDay}
                        onChange={(e) => handleUpdateItem(it.id, { hoursPerDay: Math.max(1, Number(e.target.value)) })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-500 uppercase">Rate ($/hr)</span>
                      <input
                        type="number"
                        min="1"
                        value={it.hourlyRate}
                        onChange={(e) => handleUpdateItem(it.id, { hourlyRate: Math.max(1, Number(e.target.value)) })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-500 uppercase">Phase Total</span>
                      <div className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-blue-700">
                        {formatCurrency(itemTotal, config.currency)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Adjustments: Currency, Discount, Tax & Terms */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 text-xs">
        <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
          Additional Financial Settings & Terms
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Currency</label>
            <select
              value={config.currency}
              onChange={(e) => setConfig({ ...config, currency: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-xl bg-white font-semibold text-slate-800"
            >
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="CAD">CAD (CA$) - Canadian Dollar</option>
              <option value="AUD">AUD (AU$) - Australian Dollar</option>
              <option value="INR">INR (₹) - Indian Rupee</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Discount (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={config.discountPercent || 0}
              onChange={(e) => setConfig({ ...config, discountPercent: Number(e.target.value) })}
              className="w-full p-2 border border-slate-300 rounded-xl font-semibold text-slate-800"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tax / VAT (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={config.taxPercent || 0}
              onChange={(e) => setConfig({ ...config, taxPercent: Number(e.target.value) })}
              className="w-full p-2 border border-slate-300 rounded-xl font-semibold text-slate-800"
              placeholder="0"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block font-semibold text-slate-700 mb-1">Payment Schedule & Invoicing Terms</label>
            <input
              type="text"
              value={config.paymentTerms || ''}
              onChange={(e) => setConfig({ ...config, paymentTerms: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-xl text-slate-800"
              placeholder="e.g. 50% Initial Deposit, 25% Midpoint, 25% Final Acceptance"
            />
          </div>
        </div>
      </div>

      {/* Live Financial Summary Display */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-5 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h4 className="font-bold text-sm text-white">Live Calculation Results</h4>
          </div>
          <button
            onClick={handleResetDefaults}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ($100/hr, 8h/day)</span>
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Rate / Hour</div>
            <div className="text-lg font-bold text-white mt-0.5">{formatCurrency(hourlyRate, config.currency)}</div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Daily Rate (8h)</div>
            <div className="text-lg font-bold text-blue-400 mt-0.5">{formatCurrency(dailyRate, config.currency)}</div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Effort</div>
            <div className="text-lg font-bold text-white mt-0.5">
              {calculatedDays} Days <span className="text-xs text-slate-400 font-normal">({calculatedHours}h)</span>
            </div>
          </div>

          <div className="bg-blue-950/80 p-3 rounded-xl border border-blue-700/60">
            <div className="text-[11px] font-bold text-blue-300 uppercase">Grand Total</div>
            <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
              {formatCurrency(grandTotal, config.currency)}
            </div>
          </div>
        </div>

        {/* Calculation breakdown explanation */}
        <div className="text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p>
              <strong className="text-white">Formula Applied:</strong> {formatCurrency(hourlyRate, config.currency)}/hr &times; {hoursPerDay} hrs/day &times; {calculatedDays} days = <strong className="text-emerald-400">{formatCurrency(subtotal, config.currency)}</strong>
              {discountAmount > 0 ? ` - ${formatCurrency(discountAmount, config.currency)} (${config.discountPercent}% off)` : ''}
              {taxAmount > 0 ? ` + ${formatCurrency(taxAmount, config.currency)} tax` : ''}
            </p>
            <p className="text-slate-400 text-[11px]">
              Clicking "Apply to Pricing Section" formats this breakdown as a standardized Markdown table with milestones and inserts it into Section 8.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          {appliedSuccess ? (
            <div className="px-4 py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center space-x-2 w-full sm:w-auto">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Successfully Applied to Section 8: Pricing!</span>
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Prepared for: <span className="text-white font-semibold">{clientCompany}</span>
            </div>
          )}

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              onClick={handleApply}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg flex items-center space-x-2 transition-all cursor-pointer w-full sm:w-auto justify-center"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Apply to Section 8 (Pricing)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
        <div className="bg-slate-50 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-300">
          {/* Header */}
          <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-blue-600 text-white">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Proposal Pricing Calculator</h3>
                <p className="text-xs text-slate-500">Edit rates, hours, days, and project phases</p>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">{content}</div>
        </div>
      </div>
    );
  }

  return content;
};
