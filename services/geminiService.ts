
import { GoogleGenAI, Type } from "@google/genai";
import { SEOAnalysisResult } from "../types";
import { Language } from "../translations";

export const performSEOAnalysis = async (url: string, competitorUrl: string | null, lang: Language): Promise<{ data: SEOAnalysisResult; sources: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const languageName = lang === 'zh' ? 'Chinese (Simplified)' : 'English';

  const prompt = `Perform a deep SEO audit for ${url}. ${competitorUrl ? `Compare it against ${competitorUrl}.` : ''}
  
  For EACH SEO category (technical, content, mobile, links), you MUST provide:
  1. findings: Array of issues or positive points.
  2. evidenceSnippet: A block of simulated or detected HTML/Code structure that proves your finding (e.g. JSON-LD for FAQ, meta tags structure, or DOM hierarchy).
  3. logicBasis: Explain the logic/SEO principle behind why this structure is good or bad.
  
  If a competitor is provided, provide a 'competitorComparison' object analyzing the score gap and specific advantages.
  
  All text responses must be in ${languageName}.
  `;

  const categorySchema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER },
      label: { type: Type.STRING },
      findings: { type: Type.ARRAY, items: { type: Type.STRING } },
      recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
      evidenceSnippet: { type: Type.STRING, description: "Simulated HTML/Structure code snippet related to the analysis" },
      logicBasis: { type: Type.STRING, description: "The underlying SEO logic for this finding" }
    },
    required: ["score", "label", "findings", "recommendations", "evidenceSnippet", "logicBasis"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          url: { type: Type.STRING },
          metadata: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "description", "keywords"]
          },
          categories: {
            type: Type.OBJECT,
            properties: {
              technical: categorySchema,
              content: categorySchema,
              mobile: categorySchema,
              links: categorySchema
            },
            required: ["technical", "content", "mobile", "links"]
          },
          summary: { type: Type.STRING },
          competitorComparison: {
            type: Type.OBJECT,
            properties: {
              competitorUrl: { type: Type.STRING },
              competitorScore: { type: Type.NUMBER },
              advantagePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              gapAnalysis: { type: Type.STRING }
            }
          }
        },
        required: ["overallScore", "url", "metadata", "categories", "summary"]
      }
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const result: SEOAnalysisResult = JSON.parse(response.text || '{}');

  return { data: result, sources };
};
