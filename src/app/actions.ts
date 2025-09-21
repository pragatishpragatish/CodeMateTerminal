'use server';

import { naturalLanguageToCommand } from '@/ai/flows/natural-language-to-command';

export async function getCommandSuggestion(query: string) {
  if (!query.trim()) {
    return 'Please provide a query.';
  }
  try {
    const result = await naturalLanguageToCommand({ query });
    return result.command;
  } catch (error) {
    console.error('Error getting command suggestion:', error);
    return `Sorry, I could not generate a command for: "${query}"`;
  }
}
