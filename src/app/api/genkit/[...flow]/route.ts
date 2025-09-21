'use server';

import {defineFlow} from '@genkit-ai/next/server';
import '@/ai/flows/natural-language-to-command';

export const {GET, POST} = defineFlow();
