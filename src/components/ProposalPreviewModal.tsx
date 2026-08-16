import React, { useState, useRef } from 'react';
import { X, Printer, Download, Eye, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Proposal, AgencySettings } from '../types';

interface ProposalPreviewModalProps {
  proposal: Proposal;
  settings: AgencySettings;
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalPreviewModal: React.FC<ProposalPreviewModalProps> = ({
  proposal,
  settings,
  isOpen,
  onClose,
}) => {
  const [exportStyle, setExportStyle] = useState<'branded' | 'plain'>('branded');
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const brandColor = exportStyle === 'branded' ? settings.brandColor || '#1e3a8a' : '#0f172a';
  const accentColor = exportStyle === 'branded' ? settings.accentColor || '#3b82f6' : '#475569';

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      // Dynamic import html2pdf
      // @ts-ignore
      const html2pdfModule = await import('html2pdf.js');
      // @ts-ignore
      const html2pdfFunc = (html2pdfModule.default || html2pdfModule) as any;

      const element = printRef.current;
      if (!element) return;

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${proposal.clientCompany.replace(/\s+/g, '_')}_Proposal.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await html2pdfFunc().set(opt).from(element).save();
    } catch (err) {
      console.warn('html2pdf fallback to window.print:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">{proposal.title}</h2>
              <p className="text-xs text-slate-400">
                Prepared for <span className="text-slate-200 font-semibold">{proposal.clientCompany}</span> &bull; Status: <span className="capitalize text-emerald-400 font-semibold">{proposal.status.replace('_', ' ')}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Style Selector */}
            <div className="bg-slate-800 p-1 rounded-lg flex items-center space-x-1 border border-slate-700">
              <button
                onClick={() => setExportStyle('branded')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  exportStyle === 'branded'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Branded PDF
              </button>
              <button
                onClick={() => setExportStyle('plain')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  exportStyle === 'plain'
                    ? 'bg-slate-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Plain Text
              </button>
            </div>

            <button
              onClick={handlePrint}
              title="Print Document"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden sm:flex items-center space-x-1 text-xs font-medium"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Canvas View */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8 flex justify-center">
          <div
            ref={printRef}
            id="printable-proposal-document"
            className="w-full max-w-3xl bg-white shadow-xl rounded-xl border border-slate-200 p-8 sm:p-12 text-slate-900 space-y-10"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            {/* Document Branded Header */}
            <div className="border-b-2 pb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6" style={{ borderColor: brandColor }}>
              <div>
                {exportStyle === 'branded' && settings.logoUrl && (
                  <img
                    src={settings.logoUrl}
                    alt={settings.agencyName}
                    className="h-12 w-auto object-contain mb-3 rounded"
                    onError={(e) => {
                      // Hide image if invalid URL
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
                <h1 className="text-2xl font-black tracking-tight" style={{ color: brandColor }}>
                  {settings.agencyName}
                </h1>
                <p className="text-xs text-slate-500">{settings.tagline}</p>
                <p className="text-xs text-slate-500 mt-1">{settings.address}</p>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p><span className="font-semibold text-slate-900">Proposal ID:</span> {proposal.id.toUpperCase()}</p>
                <p><span className="font-semibold text-slate-900">Date Issued:</span> {new Date(proposal.createdAt).toLocaleDateString()}</p>
                <p><span className="font-semibold text-slate-900">Version:</span> {proposal.versionCount}.0</p>
                <p><span className="font-semibold text-slate-900">Contact:</span> {settings.contactEmail}</p>
              </div>
            </div>

            {/* Client & Project Banner */}
            <div className="rounded-xl p-6 text-white shadow-md space-y-3" style={{ backgroundColor: brandColor }}>
              <div className="text-xs font-semibold uppercase tracking-wider opacity-80">Enterprise Proposal For</div>
              <h2 className="text-2xl font-bold">{proposal.clientCompany}</h2>
              <div className="text-sm opacity-90">
                Attention: <span className="font-semibold">{proposal.clientName}</span> ({proposal.clientEmail || 'N/A'})
              </div>
              <div className="pt-2 border-t border-white/20 flex flex-wrap gap-4 text-xs font-medium">
                <div>Service Line: <span className="font-bold">{proposal.serviceType}</span></div>
                <div>Tone Framework: <span className="font-bold">{proposal.tone}</span></div>
              </div>
            </div>

            {/* All 16 Proposal Sections */}
            <div className="space-y-10">
              {proposal.sections.map((sec, idx) => (
                <div key={sec.id} className="scroll-mt-6 border-b border-slate-100 pb-8 last:border-0">
                  <div className="flex items-center space-x-2 mb-4">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-2xs"
                      style={{ backgroundColor: accentColor }}
                    >
                      {idx + 1}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">{sec.title}</h3>
                  </div>

                  <div
                    className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-800 space-y-3"
                    dangerouslySetInnerHTML={{
                      __html: sec.content
                        .replace(/^###\s+(.*$)/gim, '<h3 class="text-base font-bold text-slate-900 mt-4 mb-2">$1</h3>')
                        .replace(/^##\s+(.*$)/gim, '<h2 class="text-lg font-bold text-slate-900 mt-5 mb-2">$1</h2>')
                        .replace(/^#\s+(.*$)/gim, '<h1 class="text-xl font-extrabold text-slate-900 mt-6 mb-3">$1</h1>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/\n\n/g, '<br/><br/>'),
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Document Sign-off / Footer */}
            <div className="border-t-2 pt-6 text-center text-xs text-slate-500 space-y-2" style={{ borderColor: brandColor }}>
              <div className="flex items-center justify-center space-x-2 text-slate-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>{settings.footerText}</span>
              </div>
              <p>{settings.website} &bull; {settings.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
