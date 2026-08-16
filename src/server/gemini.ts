import { GoogleGenAI, Type } from '@google/genai';
import { ProposalSection, MANDATORY_SECTIONS } from '../types.js';

function getGenAIClient(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const PREFERRED_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash'];

async function generateContentWithRetry(
  ai: GoogleGenAI,
  options: {
    contents: string;
    config: any;
  }
) {
  let lastError: any = null;

  for (const modelName of PREFERRED_MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: options.contents,
          config: options.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMessage = err?.message || String(err);
        const isUnavailable =
          errMessage.includes('503') ||
          errMessage.includes('UNAVAILABLE') ||
          errMessage.includes('high demand') ||
          errMessage.includes('RESOURCE_EXHAUSTED') ||
          errMessage.includes('429');

        if (isUnavailable) {
          console.warn(
            `Gemini API warning [Model: ${modelName}, Attempt: ${attempt}/3]: ${errMessage}. Retrying in ${attempt * 1000}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        } else {
          // If non-transient error, break attempt loop and try next model or fail
          break;
        }
      }
    }
  }

  throw lastError;
}

export interface GenerateProposalParams {
  clientName: string;
  clientCompany: string;
  clientEmail?: string;
  serviceType: string;
  serviceDescription: string;
  keyChallenges?: string;
  tone?: string;
  templateCategory?: string;
  customPromptNotes?: string;
  agencyName?: string;
  customSystemPrompt?: string;
}

export async function generateFullProposal(params: GenerateProposalParams): Promise<ProposalSection[]> {
  const systemInstruction =
    params.customSystemPrompt ||
    `You are a senior proposal consultant working at a top-tier digital transformation agency. Your responsibility is to write polished, professional, client-ready proposals suitable for enterprise and startup clients. Use formal business language, avoid unnecessary fluff, never invent pricing, and always produce clearly structured sections with headings. If required information is missing, use professional placeholders instead of hallucinating facts.

CRITICAL PRICING RULE:
For Section 8 (Pricing), if specific numbers/quotes are not provided in the prompt, you MUST write EXACTLY:
"Pricing will be finalized after requirement discussion."
Do NOT invent cost estimates, hourly rates, or dollar figures under any circumstances.`;

  const promptText = `Generate a full 16-section agency proposal with the following client details:

Agency Name: ${params.agencyName || 'Apex Digital Transformations'}
Client Name: ${params.clientName}
Client Company: ${params.clientCompany}
Client Email: ${params.clientEmail || 'N/A'}
Service Type / Category: ${params.serviceType}
Service Description & Objectives: ${params.serviceDescription}
Key Client Challenges / Pain Points: ${params.keyChallenges || 'Standard digital transformation requirements.'}
Desired Tone: ${params.tone || 'Professional & Formal'}
Special Agency Instructions: ${params.customPromptNotes || 'Ensure technical accuracy and executive readability.'}

Return JSON with exactly 16 objects representing each section in order:
1. Cover Page (cover_page)
2. Executive Summary (executive_summary)
3. Understanding Client Requirements (understanding_requirements)
4. Proposed Solution (proposed_solution)
5. Scope of Work (scope_of_work)
6. Deliverables (deliverables)
7. Timeline (timeline)
8. Pricing (pricing)
9. Assumptions (assumptions)
10. Exclusions (exclusions)
11. Risks (risks)
12. Acceptance Criteria (acceptance_criteria)
13. Support & Maintenance (support_maintenance)
14. Terms & Conditions (terms_conditions)
15. Next Steps (next_steps)
16. Thank You (thank_you)

Content for each section should be rich Markdown format with clean sub-headings, bullet points, and tables where appropriate.`;

  try {
    const ai = getGenAIClient();
    const response = await generateContentWithRetry(ai, {
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              key: { type: Type.STRING, description: 'Section key identifier e.g. cover_page' },
              title: { type: Type.STRING, description: 'Numbered section title e.g. 1. Cover Page' },
              content: { type: Type.STRING, description: 'Rich markdown content for the section' },
            },
            required: ['key', 'title', 'content'],
          },
        },
      },
    });

    const text = response.text ? response.text.trim() : '[]';
    const parsedSections = JSON.parse(text) as Array<{ key: string; title: string; content: string }>;

    // Map & validate all 16 mandatory sections exist
    const mappedSections: ProposalSection[] = MANDATORY_SECTIONS.map((mandatory, index) => {
      const found = parsedSections.find((s) => s.key === mandatory.key);
      let content = found ? found.content : `### ${mandatory.title}\n\n[Section content pending configuration]`;

      if (mandatory.key === 'pricing' && !content.includes('Pricing will be finalized')) {
        // Enforce pricing rule if model accidentally generated numbers
        content = `### 8. Pricing\n\nPricing will be finalized after requirement discussion.`;
      }

      return {
        id: `sec-${Date.now()}-${index + 1}`,
        key: mandatory.key,
        title: mandatory.title,
        content,
        isCustomized: false,
        lastUpdated: new Date().toISOString(),
      };
    });

    return mappedSections;
  } catch (err: any) {
    console.warn('Gemini AI generation fallback activated:', err?.message || err);
    // Fallback proposal generator if AI API key or network fails, so app never crashes!
    return MANDATORY_SECTIONS.map((m, idx) => ({
      id: `sec-fallback-${idx}`,
      key: m.key,
      title: m.title,
      content:
        m.key === 'pricing'
          ? `### 8. Pricing\n\nPricing will be finalized after requirement discussion.`
          : `### ${m.title}\n\n**Client:** ${params.clientCompany} (${params.clientName})\n**Service:** ${params.serviceType}\n\n${params.serviceDescription}\n\n*(Generated via proposal template framework)*`,
      isCustomized: false,
      lastUpdated: new Date().toISOString(),
    }));
  }
}

export async function regenerateProposalSection(params: {
  sectionKey: string;
  sectionTitle: string;
  currentContent: string;
  instructions: string;
  clientCompany: string;
  serviceType: string;
  customSystemPrompt?: string;
}): Promise<string> {
  const systemInstruction =
    params.customSystemPrompt ||
    `You are an expert agency proposal consultant. Your task is to rewrite or expand a single specific section of a client proposal according to the user's instructions. Keep the language formal, precise, and executive-ready.`;

  const promptText = `Refine and regenerate the section "${params.sectionTitle}" for client "${params.clientCompany}" (${params.serviceType}).

CURRENT SECTION CONTENT:
${params.currentContent}

REGENERATION INSTRUCTIONS / NOTES:
${params.instructions}

CRITICAL RULE:
If this section is Section 8 (Pricing) and no exact cost numbers are provided, maintain the placeholder "Pricing will be finalized after requirement discussion." Do not hallucinate prices.

Return the updated Markdown content for this section directly.`;

  try {
    const ai = getGenAIClient();
    const response = await generateContentWithRetry(ai, {
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text ? response.text.trim() : params.currentContent;
  } catch (err: any) {
    console.warn('Gemini section regeneration fallback activated:', err?.message || err);
    return `${params.currentContent}\n\n*Updated Note:* ${params.instructions}`;
  }
}

