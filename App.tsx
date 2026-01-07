
import React, { useState, useEffect } from 'react';
import { SEOAnalysisResult } from './types';
import { performSEOAnalysis } from './services/geminiService';
import { Language, translations } from './translations';
import AnalysisView from './components/AnalysisView';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh');
  const [url, setUrl] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isObjectionLoading, setIsObjectionLoading] = useState(false);
  const [result, setResult] = useState<SEOAnalysisResult | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const t = translations[lang];

  const loadingMessages = {
    en: [
      "Analyzing site structure and DOM nodes...",
      "Extracting FAQ Schema and structured data...",
      "Comparing with competitor performance...",
      "Benchmarking keyword density & semantic gaps...",
      "Generating diagnostic evidence snippets...",
      "Finalizing deep audit report..."
    ],
    zh: [
      "正在分析网站结构与 DOM 节点...",
      "正在提取 FAQ Schema 及结构化数据...",
      "正在与竞品进行实时性能对比...",
      "正在进行关键词密度与语义差距分析...",
      "正在生成诊断依据与代码片段...",
      "正在完成深度审计报告..."
    ]
  };

  useEffect(() => {
    let interval: any;
    if (isLoading || isObjectionLoading) {
      let idx = 0;
      const currentMessages = loadingMessages[lang];
      setStatusMessage(currentMessages[0]);
      interval = setInterval(() => {
        idx = (idx + 1) % currentMessages.length;
        setStatusMessage(currentMessages[idx]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading, isObjectionLoading, lang]);

  const handleAudit = async (e?: React.FormEvent, objectionCode?: string) => {
    if (e) e.preventDefault();
    if (!url) return;

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http')) formattedUrl = 'https://' + formattedUrl;

    let formattedComp = competitorUrl.trim();
    if (formattedComp && !formattedComp.startsWith('http')) formattedComp = 'https://' + formattedComp;

    if (objectionCode) {
      setIsObjectionLoading(true);
    } else {
      setIsLoading(true);
    }
    
    setError(null);

    try {
      const response = await performSEOAnalysis(formattedUrl, formattedComp || null, lang, objectionCode);
      setResult(response.data);
      setSources(response.sources);
      if (objectionCode) {
        alert(t.objectionSuccess);
      }
    } catch (err: any) {
      console.error(err);
      setError(lang === 'zh' ? "分析失败。请检查网址或稍后重试。" : "Audit failed. Please check the URLs or try again later.");
    } finally {
      setIsLoading(false);
      setIsObjectionLoading(false);
    }
  };

  const handleObjectionSubmit = (code: string) => {
    handleAudit(undefined, code);
  };

  return (
    <div className="min-h-screen pb-20">
      <nav className="sticky top-0 z-50 glass-morphism border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">SEOSage<span className="text-indigo-600">Pro</span></span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center bg-slate-100 p-1.5 rounded-full border border-slate-200">
              <button onClick={() => setLang('zh')} className={`px-4 py-1.5 text-xs font-black rounded-full transition-all ${lang === 'zh' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>中文</button>
              <button onClick={() => setLang('en')} className={`px-4 py-1.5 text-xs font-black rounded-full transition-all ${lang === 'en' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>EN</button>
            </div>
            <button className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-slate-800 transition-all active:scale-95">{t.upgrade}</button>
          </div>
        </div>
      </nav>

      <header className="pt-24 pb-16 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-[1.1]">
          {t.heroTitlePart1} <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-fuchsia-600">{t.heroTitleGradient}</span>
        </h1>
        <p className="text-xl text-slate-500 mb-14 max-w-2xl mx-auto leading-relaxed font-medium">
          {t.heroSubtitle}
        </p>

        <form onSubmit={handleAudit} className="max-w-3xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow bg-white p-2 rounded-3xl shadow-xl border border-slate-200 flex items-center px-4">
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t.inputPlaceholder}
                className="w-full py-4 bg-transparent border-none focus:ring-0 text-slate-900 text-lg font-bold outline-none"
              />
            </div>
            <div className="flex-grow bg-white/50 p-2 rounded-3xl shadow-sm border border-dashed border-slate-300 flex items-center px-4">
              <input 
                type="text" 
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                placeholder={t.competitorPlaceholder}
                className="w-full py-4 bg-transparent border-none focus:ring-0 text-slate-600 text-sm font-medium outline-none italic"
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={isLoading || !url}
            className={`w-full py-5 rounded-3xl font-black text-lg text-white shadow-2xl transition-all flex items-center justify-center ${
              isLoading ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
            }`}
          >
            {isLoading ? t.auditing : t.analyzeBtn}
          </button>
        </form>

        {(isLoading || isObjectionLoading) && (
          <div className="mt-12">
            <div className="flex justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
              <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
            </div>
            <p className="text-indigo-600 font-black tracking-widest text-xs uppercase">{statusMessage}</p>
          </div>
        )}

        {error && (
          <div className="mt-12 p-6 bg-rose-50 text-rose-700 rounded-3xl border border-rose-100 max-w-xl mx-auto font-bold flex items-center">
            <svg className="w-6 h-6 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            {error}
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-6">
        {result ? (
          <AnalysisView 
            result={result} 
            sources={sources} 
            lang={lang} 
            onObjectionSubmit={handleObjectionSubmit}
            isObjectionLoading={isObjectionLoading}
          />
        ) : !isLoading && (
          <div className="py-20 grid grid-cols-1 md:grid-cols-3 gap-12 text-center opacity-40">
            <FeatureIcon title={t.technicalSeo} desc={t.technicalDesc} icon="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            <FeatureIcon title={t.contentAnalysis} desc={t.contentDesc} icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            <FeatureIcon title={t.linkStrategy} desc={t.linkDesc} icon="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </div>
        )}
      </main>
    </div>
  );
};

const FeatureIcon = ({title, desc, icon}: any) => (
  <div className="flex flex-col items-center">
    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}/></svg>
    </div>
    <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 font-medium px-4">{desc}</p>
  </div>
);

export default App;
