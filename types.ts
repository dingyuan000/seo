
export interface SEOAuditCategory {
  score: number;
  label: string;
  findings: string[];
  recommendations: string[];
  evidenceSnippet?: string; // 诊断到的模块源码或结构解析
  logicBasis?: string;       // 诊断逻辑依据
}

export interface SEOAnalysisResult {
  overallScore: number;
  url: string;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  categories: {
    technical: SEOAuditCategory;
    content: SEOAuditCategory;
    mobile: SEOAuditCategory;
    links: SEOAuditCategory;
  };
  summary: string;
  competitorComparison?: {
    competitorUrl: string;
    competitorScore: number;
    advantagePoints: string[];
    gapAnalysis: string;
  };
}

export interface GroundingSource {
  title: string;
  uri: string;
}
