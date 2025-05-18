// 'use server';
/**
 * @fileOverview Provides AI-powered code suggestions as the user types in the editor.
 *
 * - codeCompletion - A function that handles the code completion process.
 * - CodeCompletionInput - The input type for the codeCompletion function.
 * - CodeCompletionOutput - The return type for the codeCompletion function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeCompletionInputSchema = z.object({
  codePrefix: z.string().describe('The code prefix that the user has already typed.'),
  language: z.string().describe('The programming language of the code.'),
});
export type CodeCompletionInput = z.infer<typeof CodeCompletionInputSchema>;

const CodeCompletionOutputSchema = z.object({
  completion: z.string().describe('The AI-powered code completion suggestion.'),
});
export type CodeCompletionOutput = z.infer<typeof CodeCompletionOutputSchema>;

export async function codeCompletion(input: CodeCompletionInput): Promise<CodeCompletionOutput> {
  return codeCompletionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codeCompletionPrompt',
  input: {schema: CodeCompletionInputSchema},
  output: {schema: CodeCompletionOutputSchema},
  prompt: `You are an AI code assistant that provides code completion suggestions based on the code prefix and programming language provided.

  Language: {{{language}}}
  Code Prefix: {{{codePrefix}}}

  Completion:`,
});

const codeCompletionFlow = ai.defineFlow(
  {
    name: 'codeCompletionFlow',
    inputSchema: CodeCompletionInputSchema,
    outputSchema: CodeCompletionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
