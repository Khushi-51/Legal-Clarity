import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-legal-clause.ts';
import '@/ai/flows/answer-document-questions.ts';
import '@/ai/flows/generate-plain-language-summary.ts';
import '@/ai/flows/detect-potential-risks.ts';
import '@/ai/flows/extract-obligations.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/suggest-negotiation-points.ts';
import '@/ai/flows/translate-text.ts';
import '@/ai/flows/draft-contract.ts';
