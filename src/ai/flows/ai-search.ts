'use server';

/**
 * @fileOverview An AI search agent that answers user queries.
 *
 * - aiSearch - A function that takes a query and returns a structured answer.
 * - AiSearchInput - The input type for the aiSearch function.
 * - AiSearchOutput - The return type for the aiSearch function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiSearchInputSchema = z.object({
  query: z.string().describe('The user\'s search query.'),
});
export type AiSearchInput = z.infer<typeof AiSearchInputSchema>;

const AiSearchOutputSchema = z.object({
  summary: z.string().describe('A detailed summary answering the user\'s query.'),
  keyPoints: z.array(z.string()).describe('A list of key points from the summary.'),
});
export type AiSearchOutput = z.infer<typeof AiSearchOutputSchema>;

export async function aiSearch(input: AiSearchInput): Promise<AiSearchOutput> {
  return aiSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSearchPrompt',
  input: { schema: AiSearchInputSchema },
  output: { schema: AiSearchOutputSchema },
  prompt: `You are an expert educator and academic assistant for a learning platform. Your goal is to provide clear, concise, and accurate answers to user queries related to educational topics.

  Query: {{{query}}}

  Based on the query, provide a detailed summary and then extract the most important key points. The response should be structured to be easily digestible for a student.`,
});

const aiSearchFlow = ai.defineFlow(
  {
    name: 'aiSearchFlow',
    inputSchema: AiSearchInputSchema,
    outputSchema: AiSearchOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
