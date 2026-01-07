
import React, { useState, useRef } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip
} from 'recharts';
import { SEOAnalysisResult, SEOAuditCategory, SchemaItem } from '../types';
import { Language, translations } from '../translations';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// --- Sub-Components ---

const StatusIcon = ({ status }: { status: SchemaItem['status'] }) => {
  switch (status) {
    case 'detected': 
      return (
        <span className="text-emerald-500 bg-emerald-100 p-1.5 rounded-full">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
          </svg>
        </span>
      );
    case 'warning': 
      return (
        <span className="text-amber-500 bg-amber-100 p-1.5 rounded-full">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
          </svg>
        </span>
      );
    default: 
      return (
        <span className="text-slate-300 bg-slate-100 p-1.5 rounded-full">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
          </svg>
        </span>
      );
  }
};

const CodeBlock = ({ code, label, variant = 'detected' }: { code?: string, label: string, variant?: 'detected' | 'recommended' }) => {
  if (!code) return null;
  const isRec = variant === 'recommended';
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2">
        <h5 className={`text-[10px] font-bold uppercase tracking-widest ${isRec ? 'text-indigo-500' : 'text-slate-400'}`}>
          {label}
        </h5>
        {isRec && <span className="text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">PRO RECOMMENDATION</span>}
      </div>
      <div className={`rounded-2xl p-6 font-mono text-xs overflow-x-auto shadow-inner border max-h-[300px] ${
        isRec ? 'bg-indigo-950 text-indigo-200 border-indigo-800' : 'bg-slate-900 text-emerald-400 border-slate-800'
      }`}>
        <pre><code>{code}</code></pre>
      </div>
    </div>
  );
};

const ScoreOverview = ({ score, summary, title }: { score: number, summary: string, title: string }) => {
  const getColor = (s: number) => {
    if (s >= 80) return '#10b981';
    if (s >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">{title}</h3>
      <div className="relative w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={[{v: score}, {v: 100-score}]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} startAngle={90} endAngle={450} dataKey="v">
              <Cell fill={getColor(score)} />
              <Cell fill="#f1f5f9" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black text-slate-900">{score}</span>
        </div>
      </div>
      <p className="mt-6 text-sm text-slate-500 text-center leading-relaxed italic">"{summary}"</p>
    </div>
  );
};

const CategoryCard = ({ title, category, labels }: { title: string, category: SEOAuditCategory, labels: any }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col lg:flex-row group transition-all hover:border-indigo-200">
    <div className="p-8 lg:w-2/5 border-b lg:border-b-0 lg:border-r border-slate-50">
      <div className="flex items-center justify-between mb-8">
        <h4 className="text-xl font-black text-slate-900 capitalize">{title}</h4>
        <span className={`px-4 py-1.5 rounded-full text-xs font-black ${category.score >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {category.score}/100
        </span>
      </div>
      
      <div className="space-y-8">
        <div>
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{labels.findings}</h5>
          <ul className="space-y-4">
            {category.findings.map((f, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 mr-3 shrink-0 shadow-sm shadow-indigo-200" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-6 border-t border-slate-50">
          <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">{labels.improvements}</h5>
          <ul className="space-y-3">
            {category.recommendations.map((r, i) => (
              <li key={i} className="text-sm text-indigo-700 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/30 font-semibold leading-relaxed">
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    <div className="p-8 lg:w-3/5 bg-slate-50/50 group-hover:bg-white transition-colors">
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6">
          <CodeBlock code={category.evidenceSnippet} label={labels.evidence} variant="detected" />
          {category.recommendedSnippet && (
            <CodeBlock code={category.recommendedSnippet} label={labels.recommended} variant="recommended" />
          )}
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mr-4 shrink-0 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <h6 className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Diagnostic Logic</h6>
            <p className="text-sm text-slate-700 font-medium leading-relaxed italic">
              {category.logicBasis || "Applying standard SEO hierarchy and schema formatting rules."}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Main Component ---

interface Props {
  result: SEOAnalysisResult;
  sources: any[];
  lang: Language;
  onObjectionSubmit: (code: string) => void;
  isObjectionLoading: boolean;
}

const AnalysisView: React.FC<Props> = ({ result, sources, lang, onObjectionSubmit, isObjectionLoading }) => {
  const t = translations[lang];
  const [objectionCode, setObjectionCode] = useState('');
  const [showObjectionForm, setShowObjectionForm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const radarData = [
    { subject: t.technicalSeo, A: result.categories.technical.score, B: result.competitorComparison?.competitorScore || 0 },
    { subject: t.contentAnalysis, A: result.categories.content.score, B: (result.competitorComparison?.competitorScore || 0) * 0.9 },
    { subject: 'Mobile', A: result.categories.mobile.score, B: (result.competitorComparison?.competitorScore || 0) * 0.85 },
    { subject: t.linkStrategy, A: result.categories.links.score, B: (result.competitorComparison?.competitorScore || 0) * 0.95 },
  ];

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f8fafc',
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll('svg').forEach(svg => {
            const box = svg.getBoundingClientRect();
            svg.setAttribute('width', box.width.toString());
            svg.setAttribute('height', box.height.toString());
          });
        },
        ignoreElements: (el) => el.classList.contains('no-export')
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`SEO_Report_${result.url.replace(/https?:\/\/|www\.|\//g, '_')}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
      alert(lang === 'zh' ? '导出 PDF 失败，请重试。' : 'Failed to export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Controls */}
      <div className="flex justify-end gap-3 no-export">
        <button 
          onClick={handleExportPDF}
          disabled={isExporting}
          className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center shadow-lg transition-all active:scale-95 ${
            isExporting ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {isExporting && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
          {isExporting ? t.exportingPdf : t.exportPdf}
        </button>
      </div>

      <div ref={reportRef} className="space-y-12">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ScoreOverview score={result.overallScore} summary={result.summary} title={t.overallScore} />
          
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
              {result.competitorComparison ? t.comparisonTitle : t.scoreBreakdown}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{fontSize: 12, fontWeight: 600}} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name={t.primarySite} dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.4} />
                  {result.competitorComparison && (
                    <Radar name={t.competitorSite} dataKey="B" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
                  )}
                  <Legend verticalAlign="bottom" />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Grounding Sources (Mandatory for Search Grounding) */}
        {sources && sources.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
              {t.groundingSources}
            </h3>
            <div className="flex flex-wrap gap-4">
              {sources.map((source, idx) => {
                const title = source.web?.title || source.title || `Source ${idx + 1}`;
                const uri = source.web?.uri || source.uri;
                if (!uri) return null;
                return (
                  <a 
                    key={idx}
                    href={uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-full border border-slate-200 transition-colors flex items-center"
                  >
                    <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    {title}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Schema Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">{t.schemaTitle}</h3>
              <p className="text-slate-500 text-sm font-medium">{result.schemaAnalysis.comparisonSummary}</p>
            </div>
            <button 
              onClick={() => setShowObjectionForm(!showObjectionForm)}
              className="no-export px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-full hover:bg-slate-800 transition-all flex items-center shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              {t.objectionTitle}
            </button>
          </div>

          {showObjectionForm && (
            <div className="mb-8 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 animate-in slide-in-from-top-4 no-export">
              <h4 className="text-sm font-black text-indigo-900 mb-2">{t.objectionTitle}</h4>
              <p className="text-xs text-indigo-700 mb-4">{t.objectionSubtitle}</p>
              <textarea 
                value={objectionCode}
                onChange={(e) => setObjectionCode(e.target.value)}
                placeholder={t.objectionPlaceholder}
                className="w-full h-32 p-4 bg-white border border-indigo-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
              />
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => onObjectionSubmit(objectionCode)}
                  disabled={isObjectionLoading || !objectionCode.trim()}
                  className={`px-6 py-2 rounded-full text-xs font-black text-white shadow-xl transition-all ${isObjectionLoading ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                  {isObjectionLoading ? t.auditing : t.reAnalyzeBtn}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest px-2 border-l-4 border-indigo-600 ml-1">{t.primarySite} Roadmap</h4>
            <div className="grid grid-cols-1 gap-6">
              {result.schemaAnalysis.primarySchemas.map((s, i) => (
                <div key={i} className={`p-8 rounded-3xl border transition-all ${
                  s.status === 'detected' ? 'bg-emerald-50/20 border-emerald-100' : 
                  s.status === 'warning' ? 'bg-amber-50/20 border-amber-100' : 'bg-rose-50/20 border-rose-100'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <StatusIcon status={s.status} />
                    <span className="text-lg font-black text-slate-900">{s.type}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed max-w-3xl">{s.details}</p>
                  {s.recommendedSnippet && <CodeBlock code={s.recommendedSnippet} label={t.recommendedLabel} variant="recommended" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="space-y-8">
          <h3 className="text-2xl font-black text-slate-900 px-2">{t.structuralAnalysis}</h3>
          <div className="grid grid-cols-1 gap-8">
            {/* Explicitly cast entries to handle potential TypeScript inference issues where it might think the category is an empty object */}
            {(Object.entries(result.categories) as [string, SEOAuditCategory][]).map(([key, cat]) => (
              <CategoryCard 
                key={key} 
                title={key} 
                category={cat} 
                labels={{
                  findings: t.keyFindings,
                  improvements: t.improvements,
                  evidence: t.evidenceLabel,
                  recommended: t.recommendedLabel
                }} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
