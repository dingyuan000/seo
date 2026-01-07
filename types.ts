
export interface SEOAuditCategory {
  score: number;
  label: string;
  findings: string[];
  recommendations: string[];
  evidenceSnippet?: string;      // 诊断到的源码
  recommendedSnippet?: string;   // 修正后的参考代码
  logicBasis?: string;           // 诊断逻辑
}

export interface SchemaItem {
  type: string;
  status: 'detected' | 'missing' | 'warning';
  details: string;
  recommendedSnippet?: string;   // 修正后的标准 Schema 代码
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
  schemaAnalysis: {
    primarySchemas: SchemaItem[];
    competitorSchemas?: SchemaItem[];
    comparisonSummary: string;
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
