// This file is machine-generated - edit with care!

'use server';

/**
 * @fileOverview Converts natural language queries into terminal commands.
 *
 * - naturalLanguageToCommand - A function that translates natural language into terminal commands.
 * - NaturalLanguageToCommandInput - The input type for the naturalLanguageToCommand function.
 * - NaturalLanguageToCommandOutput - The return type for the naturalLanguageToCommand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NaturalLanguageToCommandInputSchema = z.object({
  query: z.string().describe('The natural language query to translate.'),
});
export type NaturalLanguageToCommandInput = z.infer<typeof NaturalLanguageToCommandInputSchema>;

const NaturalLanguageToCommandOutputSchema = z.object({
  command: z.string().describe('The translated terminal command.'),
});
export type NaturalLanguageToCommandOutput = z.infer<typeof NaturalLanguageToCommandOutputSchema>;

export async function naturalLanguageToCommand(input: NaturalLanguageToCommandInput): Promise<NaturalLanguageToCommandOutput> {
  return naturalLanguageToCommandFlow(input);
}

const prompt = ai.definePrompt({
  name: 'naturalLanguageToCommandPrompt',
  input: {schema: NaturalLanguageToCommandInputSchema},
  output: {schema: NaturalLanguageToCommandOutputSchema},
  prompt: `Translate the following natural language query into a terminal command:\n\nQuery: {{{query}}}\n\nCommand: `,
});

const naturalLanguageToCommandFlow = ai.defineFlow(
  {
    name: 'naturalLanguageToCommandFlow',
    inputSchema: NaturalLanguageToCommandInputSchema,
    outputSchema: NaturalLanguageToCommandOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
