'use server';

/**
 * @fileOverview Extracts obligations of each party from a legal document, distinguishing "What YOU must do" versus "What THEY must do", tailored to Indian legal standards.
 *
 * - extractObligations - A function that extracts obligations from a legal document.
 * - ExtractObligationsInput - The input type for the extractObligations function.
 * - ExtractObligationsOutput - The return type for the extractObligations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractObligationsInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the legal document to analyze.'),
  userParty: z
    .string()
    .describe('The name or identifier of the user in the legal document.'),
  otherParty: z
    .string()
    .describe('The name or identifier of the other party in the legal document.'),
});
export type ExtractObligationsInput = z.infer<typeof ExtractObligationsInputSchema>;

const ExtractObligationsOutputSchema = z.object({
  userObligations: z
    .array(z.string())
    .describe('A list of obligations for the user.'),
  otherPartyObligations: z
    .array(z.string())
    .describe('A list of obligations for the other party.'),
});
export type ExtractObligationsOutput = z.infer<typeof ExtractObligationsOutputSchema>;

export async function extractObligations(input: ExtractObligationsInput): Promise<ExtractObligationsOutput> {
  return extractObligationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractObligationsPrompt',
  input: {schema: ExtractObligationsInputSchema},
  output: {schema: ExtractObligationsOutputSchema},
  prompt: `You are an AI assistant specializing in analyzing legal documents, specifically under Indian law.

  Your task is to extract the obligations of each party involved in the legal document. The document text is provided below.

  You should identify the obligations of "{{{userParty}}}" and "{{{otherParty}}}", listing each obligation clearly.

  Document Text: {{{documentText}}}

  Format your response as a JSON object with two keys:
  - userObligations: An array of strings, where each string is an obligation of {{{userParty}}}.
  - otherPartyObligations: An array of strings, where each string is an obligation of {{{otherParty}}}.

  Example:
  {
    "userObligations": ["Pay the monthly rent on time.", "Maintain the property in good condition."],
    "otherPartyObligations": ["Provide a safe and habitable property.", "Make necessary repairs to the property."]
  }

  Ensure that the obligations are specific and directly derived from the document text. Focus on obligations enforceable under Indian law and common legal practices.
  Consider any India-specific clauses or legal precedents that may influence the interpretation of obligations.
`,
});

const extractObligationsFlow = ai.defineFlow(
  {
    name: 'extractObligationsFlow',
    inputSchema: ExtractObligationsInputSchema,
    outputSchema: ExtractObligationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
