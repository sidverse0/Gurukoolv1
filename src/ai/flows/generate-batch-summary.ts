'use server';

/**
 * @fileOverview Generates a summary of a batch based on the provided JSON data.
 *
 * - generateBatchSummary - A function that takes a JSON data URL and returns a summary of the batch.
 * - GenerateBatchSummaryInput - The input type for the generateBatchSummary function.
 * - GenerateBatchSummaryOutput - The return type for the generateBatchSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBatchSummaryInputSchema = z.object({
  jsonDataUrl: z
    .string()
    .describe('The URL of the JSON data containing batch details.'),
});
export type GenerateBatchSummaryInput = z.infer<typeof GenerateBatchSummaryInputSchema>;

const GenerateBatchSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the batch details.'),
});
export type GenerateBatchSummaryOutput = z.infer<typeof GenerateBatchSummaryOutputSchema>;

export async function generateBatchSummary(input: GenerateBatchSummaryInput): Promise<GenerateBatchSummaryOutput> {
  return generateBatchSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBatchSummaryPrompt',
  input: {schema: GenerateBatchSummaryInputSchema},
  output: {schema: GenerateBatchSummaryOutputSchema},
  prompt: `You are an expert learning facilitator and your goal is to summarize course materials for potential students.

  Please generate a concise summary of the batch details provided in the JSON data from the following URL:
  {{{jsonDataUrl}}}
  Make sure to mention key topics and the overall learning outcomes for students.
  If there are any videos, mention a summary of the topics that the videos cover.`,
});

const generateBatchSummaryFlow = ai.defineFlow(
  {
    name: 'generateBatchSummaryFlow',
    inputSchema: GenerateBatchSummaryInputSchema,
    outputSchema: GenerateBatchSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
