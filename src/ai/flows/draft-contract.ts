'use server';
/**
 * @fileOverview A contract drafting assistant that generates a fair and balanced freelancer agreement.
 *
 * - draftContract - A function that handles the contract drafting process.
 * - DraftContractInput - The input type for the draftContract function.
 * - DraftContractOutput - The return type for the draftContract function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DraftContractInputSchema = z.object({
  clientName: z.string().describe("The full name of the client."),
  freelancerName: z.string().describe("The full name of the freelancer."),
  projectScope: z.string().describe("A detailed description of the project scope and deliverables."),
  paymentAmount: z.number().describe("The total payment amount for the project."),
  paymentTerms: z.string().describe("The terms of payment (e.g., upon completion, 50% upfront)."),
  deadline: z.string().describe("The project deadline date."),
});
export type DraftContractInput = z.infer<typeof DraftContractInputSchema>;

const DraftContractOutputSchema = z.object({
  contractText: z.string().describe('The full text of the generated freelancer agreement.'),
});
export type DraftContractOutput = z.infer<typeof DraftContractOutputSchema>;

export async function draftContract(input: DraftContractInput): Promise<DraftContractOutput> {
  return draftContractFlow(input);
}

const prompt = ai.definePrompt({
  name: 'draftContractPrompt',
  input: {schema: DraftContractInputSchema},
  output: {schema: DraftContractOutputSchema},
  prompt: `You are an expert legal assistant specializing in Indian contract law.

  Your task is to generate a fair and balanced freelancer agreement based on the details provided below. The agreement should protect both the client and the freelancer, and be clear, concise, and easy to understand. It should be suitable for use in India.

  **Contract Details:**
  - **Client Name:** {{{clientName}}}
  - **Freelancer Name:** {{{freelancerName}}}
  - **Project Scope & Deliverables:** {{{projectScope}}}
  - **Total Payment:** INR {{{paymentAmount}}}
  - **Payment Terms:** {{{paymentTerms}}}
  - **Project Deadline:** {{{deadline}}}

  **Generate a contract with the following sections:**
  1.  **Parties:** Clearly identify the Client and the Freelancer.
  2.  **Services:** Detail the scope of work based on the project scope provided.
  3.  **Payment:** Specify the amount and terms of payment.
  4.  **Term and Termination:** Include a standard termination clause (e.g., 14-day notice).
  5.  **Confidentiality:** A standard confidentiality clause.
  6.  **Intellectual Property:** A clause specifying that upon full payment, the ownership of the work product transfers to the client.
  7.  **Independent Contractor:** A clause clarifying that the freelancer is an independent contractor, not an employee.
  8.  **Governing Law:** State that the agreement is governed by the laws of India and jurisdiction is in a neutral city like Bengaluru.
  9.  **Signatures:** Placeholder for signatures of both parties.

  Ensure the language is professional and legally sound for the Indian context.
  `,
});

const draftContractFlow = ai.defineFlow(
  {
    name: 'draftContractFlow',
    inputSchema: DraftContractInputSchema,
    outputSchema: DraftContractOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
