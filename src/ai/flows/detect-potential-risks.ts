// src/ai/flows/detect-potential-risks.ts
'use server';
/**
 * @fileOverview Detects potential risks within a legal document, tailored to the Indian legal context.
 *
 * - detectPotentialRisks - A function that identifies and flags potential risks within a legal document.
 * - DetectPotentialRisksInput - The input type for the detectPotentialRisks function.
 * - DetectPotentialRisksOutput - The return type for the detectPotentialRisks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectPotentialRisksInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the legal document to analyze.'),
});
export type DetectPotentialRisksInput = z.infer<typeof DetectPotentialRisksInputSchema>;

const RiskItemSchema = z.object({
  risk: z.string().describe('The description of the potential risk.'),
  severity: z
    .enum(['High', 'Medium', 'Low'])
    .describe('The severity level of the risk.'),
});

const DetectPotentialRisksOutputSchema = z.object({
  risks: z
    .array(RiskItemSchema)
    .describe('A list of potential risks identified in the document.'),
});
export type DetectPotentialRisksOutput = z.infer<typeof DetectPotentialRisksOutputSchema>;

export async function detectPotentialRisks(input: DetectPotentialRisksInput): Promise<DetectPotentialRisksOutput> {
  return detectPotentialRisksFlow(input);
}

const detectPotentialRisksPrompt = ai.definePrompt({
  name: 'detectPotentialRisksPrompt',
  input: {schema: DetectPotentialRisksInputSchema},
  output: {schema: DetectPotentialRisksOutputSchema},
  prompt: `You are an AI legal assistant specializing in identifying potential risks in legal documents within the Indian legal context.

  Analyze the following legal document text and identify any potential risks, hidden fees, unfavorable clauses, or other issues that a user should be aware of. For each risk, provide a severity level ('High', 'Medium', or 'Low').

  Document Text: {{{documentText}}}

  Consider the Indian legal context, including relevant laws, regulations, and common legal practices.

  Output a list of objects, where each object has a "risk" (string) and "severity" ('High', 'Medium', or 'Low').
  `,
});

const detectPotentialRisksFlow = ai.defineFlow(
  {
    name: 'detectPotentialRisksFlow',
    inputSchema: DetectPotentialRisksInputSchema,
    outputSchema: DetectPotentialRisksOutputSchema,
  },
  async input => {
    const {output} = await detectPotentialRisksPrompt(input);
    return output!;
  }
);
