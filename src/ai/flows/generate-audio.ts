'use server';

/**
 * @fileOverview A text-to-speech AI flow that generates audio from a given text.
 *
 * - generateAudio - A function that takes a string and returns audio data.
 * - GenerateAudioInput - The input type for the generateAudio function.
 * - GenerateAudioOutput - The return type for the generateAudio function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const GenerateAudioInputSchema = z.string();
export type GenerateAudioInput = z.infer<typeof GenerateAudioInputSchema>;

const GenerateAudioOutputSchema = z.object({
  media: z.string().describe('The base64 encoded WAV audio data URI.'),
});
export type GenerateAudioOutput = z.infer<typeof GenerateAudioOutputSchema>;

export async function generateAudio(
  input: GenerateAudioInput
): Promise<GenerateAudioOutput> {
  return generateAudioFlow(input);
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const generateAudioFlow = ai.defineFlow(
  {
    name: 'generateAudioFlow',
    inputSchema: GenerateAudioInputSchema,
    outputSchema: GenerateAudioOutputSchema,
  },
  async (query) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: query,
    });
    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    return {
      media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);
