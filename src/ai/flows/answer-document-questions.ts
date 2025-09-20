'use server';

/**
 * @fileOverview Answers questions about a legal document, grounded in the document content and Indian legal knowledge.
 *
 * - answerDocumentQuestions - A function that answers questions about a legal document.
 * - AnswerDocumentQuestionsInput - The input type for the answerDocumentQuestions function.
 * - AnswerDocumentQuestionsOutput - The return type for the answerDocumentQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerDocumentQuestionsInputSchema = z.object({
  documentContent: z.string().describe('The text content of the legal document.'),
  question: z.string().describe('The question to be answered about the document.'),
});
export type AnswerDocumentQuestionsInput = z.infer<
  typeof AnswerDocumentQuestionsInputSchema
>;

const AnswerDocumentQuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the question, grounded in the document content and relevant Indian legal knowledge.'),
});
export type AnswerDocumentQuestionsOutput = z.infer<
  typeof AnswerDocumentQuestionsOutputSchema
>;

export async function answerDocumentQuestions(
  input: AnswerDocumentQuestionsInput
): Promise<AnswerDocumentQuestionsOutput> {
  return answerDocumentQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerDocumentQuestionsPrompt',
  input: {schema: AnswerDocumentQuestionsInputSchema},
  output: {schema: AnswerDocumentQuestionsOutputSchema},
  prompt: `You are a legal expert specializing in Indian law.

  You will answer questions about a legal document, grounding your answers in the document content and your knowledge of Indian law.

  Document Content: {{{documentContent}}}

  Question: {{{question}}}

  Answer:`,
});

const answerDocumentQuestionsFlow = ai.defineFlow(
  {
    name: 'answerDocumentQuestionsFlow',
    inputSchema: AnswerDocumentQuestionsInputSchema,
    outputSchema: AnswerDocumentQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
