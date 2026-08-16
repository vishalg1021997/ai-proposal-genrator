import React, { useState, useRef } from 'react';
import { X, Printer, Download, Eye, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Proposal, AgencySettings } from '../types';

interface ProposalPreviewModalProps {
  proposal: Proposal;
  settings: AgencySettings;
  isOpen: boolean;
  onClose: () => void;
}

function formatMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  const lines = markdown.split('\n');
  let html = '';
  let inList = false;
  let inNumberedList = false;
  let inTable = false;
  let tableRows: string[] = [];

  const flushList = () => {
    if (inList) {
      html += '</ul>';
      inList = false;
    }
    if (inNumberedList) {
      html += '</ol>';
      inNumberedList = false;
    }
  };

  const flushTable = () => {
    if (inTable && tableRows.length > 0) {
      let tableHtml = '<div class="overflow-x-auto my-3"><table class="w-full text-xs text-left border-collapse border border-slate-200">';
      tableRows.forEach((row, idx) => {
        const cells = row.split('|').map((c) => c.trim()).filter((c) => c.length > 0);
        // Skip separator line |---|---|
        if (cells.every((c) => /^[-:]+$/.test(c))) {
          return;
        }
        if (idx === 0) {
          tableHtml += '<thead class="bg-slate-100 font-bold text-slate-800"><tr>';
          cells.forEach((cell) => {
            tableHtml += `<th class="p-2 border border-slate-200">${formatInline(cell)}</th>`;
          });
          tableHtml += '</tr></thead><tbody>';
        } else {
          tableHtml += '<tr class="border-b border-slate-100 hover:bg-slate-50">';
          cells.forEach((cell) => {
            tableHtml += `<td class="p-2 border border-slate-200">${formatInline(cell)}</td>`;
          });
          tableHtml += '</tr>';
        }
      });
      tableHtml += '</tbody></table></div>';
      html += tableHtml;
      inTable = false;
      tableRows = [];
    }
  };

  const formatInline = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      inTable = true;
      tableRows.push(trimmed);
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      html += `<h3 class="text-base font-bold text-slate-900 mt-4 mb-2 tracking-tight">${formatInline(trimmed.slice(4))}</h3>`;
    } else if (trimmed.startsWith('## ')) {
      flushList();
      html += `<h2 class="text-lg font-bold text-slate-900 mt-5 mb-2.5 tracking-tight">${formatInline(trimmed.slice(3))}</h2>`;
    } else if (trimmed.startsWith('# ')) {
      flushList();
      html += `<h1 class="text-xl font-extrabold text-slate-900 mt-6 mb-3 tracking-tight">${formatInline(trimmed.slice(2))}</h1>`;
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        flushList();
        inList = true;
        html += '<ul class="list-disc list-inside space-y-1.5 my-2 pl-2 text-slate-700">';
      }
      html += `<li>${formatInline(trimmed.slice(2))}</li>`;
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (!inNumberedList) {
        flushList();
        inNumberedList = true;
        html += '<ol class="list-decimal list-inside space-y-1.5 my-2 pl-2 text-slate-700">';
      }
      const itemText = trimmed.replace(/^\d+\.\s/, '');
      html += `<li>${formatInline(itemText)}</li>`;
    } else if (trimmed === '') {
      flushList();
      // paragraph break
    } else {
      flushList();
      html += `<p class="my-2 leading-relaxed text-slate-700">${formatInline(trimmed)}</p>`;
    }
  }

  flushList();
  flushTable();

  return html;
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
    let tempContainer: HTMLElement | null = null;
    try {
      // Dynamic import html2pdf
      // @ts-ignore
      const html2pdfModule = await import('html2pdf.js');
      // @ts-ignore
      const html2pdfFunc = (html2pdfModule.default || html2pdfModule) as any;

      const element = printRef.current;
      if (!element) return;

      // Create an unconstrained clone of the proposal document for clean multi-page rendering
      const clone = element.cloneNode(true) as HTMLElement;
      clone.id = 'pdf-export-target';
      clone.style.width = '794px';
      clone.style.maxWidth = '794px';
      clone.style.margin = '0 auto';
      clone.style.padding = '36px';
      clone.style.backgroundColor = '#ffffff';
      clone.style.boxShadow = 'none';
      clone.style.border = 'none';
      clone.style.borderRadius = '0';

      tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.top = '0';
      tempContainer.style.left = '-99999px';
      tempContainer.style.width = '794px';
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.zIndex = '-9999';
      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      const clientSlug = (proposal.clientCompany || 'Client').replace(/[^a-zA-Z0-9]/g, '_');
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${clientSlug}_Proposal.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          scrollY: 0,
          scrollX: 0,
          windowWidth: 800,
          logging: false,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy'],
          avoid: ['.proposal-section-block', '.pdf-avoid-break'],
        },
      };

      await html2pdfFunc().set(opt).from(clone).save();
    } catch (err) {
      console.warn('html2pdf fallback to window.print:', err);
      window.print();
    } finally {
      if (tempContainer && document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="preview-modal-backdrop fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6">
      <div className="preview-modal-window bg-white rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Top Header (Hidden during Print) */}
        <div className="preview-modal-header px-6 py-4 bg-white text-slate-900 flex items-center justify-between border-b border-slate-200 shrink-0 print-hide">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white shadow-xs">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900">{proposal.title}</h2>
              <p className="text-xs text-slate-500">
                Prepared for <span className="text-slate-800 font-semibold">{proposal.clientCompany}</span> &bull; Status: <span className="capitalize text-emerald-600 font-semibold">{proposal.status.replace('_', ' ')}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Style Selector */}
            <div className="bg-slate-100 p-1 rounded-lg flex items-center space-x-1 border border-slate-200">
              <button
                onClick={() => setExportStyle('branded')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  exportStyle === 'branded'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Branded PDF
              </button>
              <button
                onClick={() => setExportStyle('plain')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  exportStyle === 'plain'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Plain Text
              </button>
            </div>

            <button
              onClick={handlePrint}
              title="Print Document (All Pages)"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors hidden sm:flex items-center space-x-1.5 text-xs font-medium cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Canvas View - Clean White Background */}
        <div className="preview-stage flex-1 overflow-y-auto bg-white p-6 sm:p-12 flex justify-center">
          <div
            ref={printRef}
            id="printable-proposal-document"
            className="w-full max-w-3xl bg-white text-slate-900 space-y-10"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            {/* Document Branded Header */}
            <div
              className="proposal-section-block border-b-2 pb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              style={{ borderColor: brandColor }}
            >
              <div>
                {exportStyle === 'branded' && settings.logoUrl && (
                  <img
                    src={settings.logoUrl}
                    alt={settings.agencyName}
                    className="h-12 w-auto object-contain mb-3 rounded"
                    onError={(e) => {
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

              <div className="text-left sm:text-right text-xs text-slate-600 space-y-1 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <p><span className="font-semibold text-slate-900">Proposal ID:</span> {proposal.id.toUpperCase()}</p>
                <p><span className="font-semibold text-slate-900">Date Issued:</span> {new Date(proposal.createdAt).toLocaleDateString()}</p>
                <p><span className="font-semibold text-slate-900">Version:</span> {proposal.versionCount}.0</p>
                <p><span className="font-semibold text-slate-900">Contact:</span> {settings.contactEmail}</p>
              </div>
            </div>

            {/* Client & Project Banner */}
            <div
              className="proposal-section-block rounded-xl p-6 text-white shadow-md space-y-3"
              style={{ backgroundColor: brandColor }}
            >
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
                <div key={sec.id} className="proposal-section-block pdf-avoid-break border-b border-slate-100 pb-8 last:border-0">
                  <div className="flex items-center space-x-2.5 mb-4">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-2xs shrink-0"
                      style={{ backgroundColor: accentColor }}
                    >
                      {idx + 1}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">{sec.title}</h3>
                  </div>

                  <div
                    className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-800 space-y-2"
                    dangerouslySetInnerHTML={{
                      __html: formatMarkdownToHtml(sec.content),
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Document Sign-off / Footer */}
            <div
              className="proposal-section-block border-t-2 pt-6 text-center text-xs text-slate-500 space-y-2"
              style={{ borderColor: brandColor }}
            >
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
