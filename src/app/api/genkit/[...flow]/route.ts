'use server';

import {defineFlow} from 'genkit/next';
import '@/ai/flows/natural-language-to-command';

export const {GET, POST} = defineFlow();
