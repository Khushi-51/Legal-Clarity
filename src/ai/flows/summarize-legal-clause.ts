// Summarizes individual clauses within a legal document, tailored for Indian law.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLegalClauseInputSchema = z.object({
  clauseText: z
    .string()
    .describe('The text of the legal clause to summarize.'),
  documentContext: z
    .string()
    .optional()
    .describe('Optional context of the document for better summarization.'),
});
export type SummarizeLegalClauseInput = z.infer<typeof SummarizeLegalClauseInputSchema>;

const SummarizeLegalClauseOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the legal clause.'),
});
export type SummarizeLegalClauseOutput = z.infer<typeof SummarizeLegalClauseOutputSchema>;

export async function summarizeLegalClause(
  input: SummarizeLegalClauseInput
): Promise<SummarizeLegalClauseOutput> {
  return summarizeLegalClauseFlow(input);
}

const summarizeLegalClausePrompt = ai.definePrompt({
  name: 'summarizeLegalClausePrompt',
  input: {schema: SummarizeLegalClauseInputSchema},
  output: {schema: SummarizeLegalClauseOutputSchema},
  prompt: `You are an expert in Indian law. Summarize the following legal clause in a concise and easy-to-understand manner, considering the Indian legal context. Also take into account provided document context if it is available.

Clause Text: {{{clauseText}}}

Document Context: {{{documentContext}}}

Summary:`,
});

const summarizeLegalClauseFlow = ai.defineFlow(
  {
    name: 'summarizeLegalClauseFlow',
    inputSchema: SummarizeLegalClauseInputSchema,
    outputSchema: SummarizeLegalClauseOutputSchema,
  },
  async input => {
    const {output} = await summarizeLegalClausePrompt(input);
    return output!;
  }
);
