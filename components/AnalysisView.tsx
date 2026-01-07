
import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { SEOAnalysisResult, SEOAuditCategory } from '../types';
import { Language, translations } from '../translations';

interface Props {
  result: SEOAnalysisResult;
  sources: any[];
  lang: Language;
}

const AnalysisView: React.FC<Props> = ({ result, sources, lang }) => {
  const t = translations[lang];

  const radarData = [
    { subject: t.technicalSeo, A: result.categories.technical.score, B: result.competitorComparison?.competitorScore || 0, fullMark: 100 },
    { subject: t.contentAnalysis, A: result.categories.content.score, B: (result.competitorComparison?.competitorScore || 0) * 0.9, fullMark: 100 },
    { subject: 'Mobile', A: result.categories.mobile.score, B: (result.competitorComparison?.competitorScore || 0) * 0.85, fullMark: 100 },
    { subject: t.linkStrategy, A: result.categories.links.score, B: (result.competitorComparison?.competitorScore || 0) * 0.95, fullMark: 100 },
  ];

  const getColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Comparison & Score Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">{t.overallScore}</h3>
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{v: result.overallScore}, {v: 100-result.overallScore}]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} startAngle={90} endAngle={450} dataKey="v">
                  <Cell fill={getColor(result.overallScore)} />
                  <Cell fill="#f1f5f9" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-slate-900">{result.overallScore}</span>
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-500 text-center leading-relaxed">"{result.summary}"</p>
        </div>

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
                <Radar name="Your Site" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.4} />
                {result.competitorComparison && (
                  <Radar name="Competitor" dataKey="B" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
                )}
                <Legend verticalAlign="bottom" />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2. Competitor Gap Analysis (If exists) */}
      {result.competitorComparison && (
        <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M11 2a2 2 0 012 2v2a2 2 0 11-4 0V4a2 2 0 012-2zm0 13a3 3 0 100-6 3 3 0 000 6zm0 2a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-4 flex items-center">
              <span className="mr-3 p-2 bg-white/20 rounded-xl">VS</span>
              {t.comparisonTitle}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-indigo-100 font-bold uppercase tracking-wider text-xs mb-3">{t.advantages}</h4>
                <ul className="space-y-2">
                  {result.competitorComparison.advantagePoints.map((point, i) => (
                    <li key={i} className="flex items-center text-sm font-medium">
                      <svg className="w-5 h-5 mr-2 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl">
                <h4 className="text-indigo-100 font-bold uppercase tracking-wider text-xs mb-3">{t.gapAnalysis}</h4>
                <p className="text-sm leading-relaxed">{result.competitorComparison.gapAnalysis}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Detailed Audit & Evidence Snippets */}
      <div className="grid grid-cols-1 gap-8">
        {Object.entries(result.categories).map(([key, value]) => {
          const cat = value as SEOAuditCategory;
          return (
            <div key={key} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row">
              <div className="p-8 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-50">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-black text-slate-900 capitalize">{key} Audit</h4>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black ${getColor(cat.score).includes('10b') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {cat.score}/100
                  </span>
                </div>
                <div className="space-y-6">
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t.keyFindings}</h5>
                    <ul className="space-y-3">
                      {cat.findings.map((f, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start">
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 mr-3 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-6 border-t border-slate-50">
                    <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">{t.improvements}</h5>
                    <ul className="space-y-3">
                      {cat.recommendations.map((r, i) => (
                        <li key={i} className="text-sm text-indigo-700 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/30">
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Source Evidence & Logic Block */}
              <div className="p-8 md:w-2/3 bg-slate-50/50">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                  {t.evidenceLabel}
                </h5>
                <div className="space-y-6">
                  <div className="bg-slate-900 rounded-2xl p-6 font-mono text-sm overflow-x-auto text-emerald-400 shadow-inner">
                    <pre><code>{cat.evidenceSnippet || "// No specific snippet detected"}</code></pre>
                  </div>
                  <div className="flex items-start bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mr-4 shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div>
                      <h6 className="text-xs font-bold text-slate-900 mb-1">Diagnostic Basis</h6>
                      <p className="text-sm text-slate-500 leading-relaxed">{cat.logicBasis}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisView;
