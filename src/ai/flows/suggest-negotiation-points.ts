'use server';

/**
 * @fileOverview Suggests negotiation points for a specific legal risk.
 *
 * - suggestNegotiationPoints - A function that suggests negotiation points.
 * - SuggestNegotiationPointsInput - The input type for the suggestNegotiationPoints function.
 * - SuggestNegotiationPointsOutput - The return type for the suggestNegotiationPoints function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNegotiationPointsInputSchema = z.object({
  risk: z
    .string()
    .describe('The description of the legal risk to get negotiation points for.'),
});
export type SuggestNegotiationPointsInput = z.infer<
  typeof SuggestNegotiationPointsInputSchema
>;

const SuggestNegotiationPointsOutputSchema = z.object({
  suggestion: z
    .string()
    .describe('Actionable negotiation points for the identified risk.'),
});
export type SuggestNegotiationPointsOutput = z.infer<
  typeof SuggestNegotiationPointsOutputSchema
>;

export async function suggestNegotiationPoints(
  input: SuggestNegotiationPointsInput
): Promise<SuggestNegotiationPointsOutput> {
  return suggestNegotiationPointsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNegotiationPointsPrompt',
  input: {schema: SuggestNegotiationPointsInputSchema},
  output: {schema: SuggestNegotiationPointsOutputSchema},
  prompt: `You are a negotiation assistant specializing in Indian law.

  Given the following legal risk, provide a concise and actionable suggestion for negotiation. The suggestion should be a specific point the user can bring up.

  Example Risk: "The agreement allows for termination with only a 7-day notice period, which is very short."
  Example Suggestion: "Request to extend the notice period for termination from 7 days to a more standard 30 days to allow for adequate time to find alternatives."

  Risk: {{{risk}}}

  Suggestion:`,
});

const suggestNegotiationPointsFlow = ai.defineFlow(
  {
    name: 'suggestNegotiationPointsFlow',
    inputSchema: SuggestNegotiationPointsInputSchema,
    outputSchema: SuggestNegotiationPointsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
