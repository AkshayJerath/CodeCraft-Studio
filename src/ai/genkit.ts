import {genkit} from 'genkit';
import {openAICompatible} from '@genkit-ai/compat-oai';

export const ai = genkit({
  plugins: [
    openAICompatible({
      name: 'groq',
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
    }),
  ],
  model: 'groq/llama-3.3-70b-versatile',
});
