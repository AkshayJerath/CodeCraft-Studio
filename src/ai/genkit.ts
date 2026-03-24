import {genkit} from 'genkit';
import {openAI} from '@genkit-ai/openai';

export const ai = genkit({
  plugins: [
    openAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
    }),
  ],
  model: 'openai/llama-3.3-70b-versatile',
});
