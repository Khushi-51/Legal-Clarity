'use server';

/**
 * @fileOverview Generates a plain-language summary of a legal document, tailored to the Indian context.
 *
 * - generatePlainLanguageSummary - A function that generates the plain language summary.
 * - GeneratePlainLanguageSummaryInput - The input type for the generatePlainLanguageSummary function.
 * - GeneratePlainLanguageSummaryOutput - The return type for the generatePlainLanguageSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePlainLanguageSummaryInputSchema = z.object({
  legalDocumentText: z.string().describe('The text of the legal document to summarize.'),
});
export type GeneratePlainLanguageSummaryInput = z.infer<typeof GeneratePlainLanguageSummaryInputSchema>;

const GeneratePlainLanguageSummaryOutputSchema = z.object({
  plainLanguageSummary: z.string().describe('A plain-language summary of the legal document, tailored to the Indian context.'),
});
export type GeneratePlainLanguageSummaryOutput = z.infer<typeof GeneratePlainLanguageSummaryOutputSchema>;

export async function generatePlainLanguageSummary(input: GeneratePlainLanguageSummaryInput): Promise<GeneratePlainLanguageSummaryOutput> {
  return generatePlainLanguageSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePlainLanguageSummaryPrompt',
  input: {schema: GeneratePlainLanguageSummaryInputSchema},
  output: {schema: GeneratePlainLanguageSummaryOutputSchema},
  prompt: `You are a legal expert specializing in simplifying complex legal documents for a general audience in India.

  Given the following legal document text, generate a plain-language summary that is easy to understand, avoids legal jargon, and is tailored to the Indian context and terminology. Consider that the audience may not be familiar with the English legal system.

  Legal Document Text: {{{legalDocumentText}}}
  `,
});

const generatePlainLanguageSummaryFlow = ai.defineFlow(
  {
    name: 'generatePlainLanguageSummaryFlow',
    inputSchema: GeneratePlainLanguageSummaryInputSchema,
    outputSchema: GeneratePlainLanguageSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
