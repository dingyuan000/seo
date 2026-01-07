
import { GoogleGenAI, Type } from "@google/genai";
import { SEOAnalysisResult } from "../types";
import { Language } from "../translations";

export const performSEOAnalysis = async (
  url: string, 
  competitorUrl: string | null, 
  lang: Language,
  objectionCode?: string
): Promise<{ data: SEOAnalysisResult; sources: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const languageName = lang === 'zh' ? 'Chinese (Simplified)' : 'English';

  const prompt = `Perform a deep SEO audit for ${url}. ${competitorUrl ? `Compare it against ${competitorUrl}.` : ''}
  
  ${objectionCode ? `
  USER SOURCE CODE OBJECTION:
  The user has provided the following specific source code snippet:
  \`\`\`html
  ${objectionCode}
  \`\`\`
  IMPORTANT: If this code contains schemas (like FAQPage or BreadcrumbList) that were previously missed, update the status to 'detected'.
  ` : ''}

  CRITICAL INSTRUCTIONS FOR SCHEMA & SOURCE CORRECTION:
  1. **BreadcrumbList Schema**: 
     - Check if a valid BreadcrumbList schema exists.
     - If missing or invalid, generate a recommended JSON-LD BreadcrumbList snippet based on the URL structure of ${url}.
     - Use standard schema.org properties (itemListElement, ListItem, position, name, item).
  
  2. **FAQPage Schema**:
     - Identify if the page contains FAQ content (questions and answers).
     - Provide a recommended top-level FAQPage JSON-LD snippet.
     - Ensure it follows the latest Google guidelines for rich results (mainEntity: Question -> acceptedAnswer: Answer).
     - If FAQs are currently nested inside other schemas (like Product), explain why moving them to a top-level FAQPage is better for rich snippets.

  3. **Structural Issues**:
     - For any structural issues found (e.g., heading hierarchy, missing meta tags), provide a 'recommendedSnippet' in standard HTML or JSON-LD format.

  For EACH SEO category (technical, content, mobile, links):
  - evidenceSnippet: What you detected in the source.
  - recommendedSnippet: Precise code to fix the issue.
  - logicBasis: The SEO impact and reasoning behind the recommendation.

  For the 'schemaAnalysis' object:
  - primarySchemas: List the status of major schemas (Article, Product, BreadcrumbList, FAQPage, etc.). 
  - ALWAYS include 'recommendedSnippet' for missing BreadcrumbList and FAQPage if applicable.
  
  All text responses must be in ${languageName}.
  `;

  const schemaItemType = {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING },
      status: { type: Type.STRING, enum: ["detected", "missing", "warning"] },
      details: { type: Type.STRING },
      recommendedSnippet: { type: Type.STRING, description: "Corrected or missing Schema JSON-LD code" }
    },
    required: ["type", "status", "details"]
  };

  const categorySchema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER },
      label: { type: Type.STRING },
      findings: { type: Type.ARRAY, items: { type: Type.STRING } },
      recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
      evidenceSnippet: { type: Type.STRING },
      recommendedSnippet: { type: Type.STRING, description: "Corrected code snippet for the issue" },
      logicBasis: { type: Type.STRING }
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
          schemaAnalysis: {
            type: Type.OBJECT,
            properties: {
              primarySchemas: { type: Type.ARRAY, items: schemaItemType },
              competitorSchemas: { type: Type.ARRAY, items: schemaItemType },
              comparisonSummary: { type: Type.STRING }
            },
            required: ["primarySchemas", "comparisonSummary"]
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
        required: ["overallScore", "url", "metadata", "categories", "schemaAnalysis", "summary"]
      }
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const result: SEOAnalysisResult = JSON.parse(response.text || '{}');

  return { data: result, sources };
};
