'use server';

/**
 * @fileOverview Suggests the optimal video resolution based on network speed.
 *
 * - suggestVideoResolution - A function that suggests the optimal video resolution.
 * - SuggestVideoResolutionInput - The input type for the suggestVideoResolution function.
 * - SuggestVideoResolutionOutput - The return type for the suggestVideoResolution function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestVideoResolutionInputSchema = z.object({
  networkSpeedMbps: z
    .number()
    .describe('The current network speed in megabits per second.'),
});
export type SuggestVideoResolutionInput = z.infer<
  typeof SuggestVideoResolutionInputSchema
>;

const SuggestVideoResolutionOutputSchema = z.object({
  suggestedResolution: z
    .string()
    .describe(
      'The suggested video resolution (e.g., 360p, 480p, 720p, 1080p) for smooth playback.'
    ),
  reason: z
    .string()
    .describe(
      'The reason for suggesting the resolution based on the network speed.'
    ),
});
export type SuggestVideoResolutionOutput = z.infer<
  typeof SuggestVideoResolutionOutputSchema
>;

export async function suggestVideoResolution(
  input: SuggestVideoResolutionInput
): Promise<SuggestVideoResolutionOutput> {
  return suggestVideoResolutionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestVideoResolutionPrompt',
  input: {schema: SuggestVideoResolutionInputSchema},
  output: {schema: SuggestVideoResolutionOutputSchema},
  prompt: `You are an expert in video streaming and network optimization.

  Based on the user's network speed (in Mbps), suggest the optimal video resolution for a smooth viewing experience without buffering. Consider the following resolutions:

  - 360p: Suitable for low network speeds.
  - 480p: A good balance between quality and speed.
  - 720p: High definition, requires a decent network speed.
  - 1080p: Full HD, requires a fast network speed.

  Network Speed: {{{networkSpeedMbps}}} Mbps

  Provide the suggested resolution and a brief reason for your suggestion.
  `,
});

const suggestVideoResolutionFlow = ai.defineFlow(
  {
    name: 'suggestVideoResolutionFlow',
    inputSchema: SuggestVideoResolutionInputSchema,
    outputSchema: SuggestVideoResolutionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
