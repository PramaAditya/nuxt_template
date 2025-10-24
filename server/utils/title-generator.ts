import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import type { ChatMessage } from '@prisma/client';

export async function generateTitle(messages: ChatMessage[]): Promise<string> {
  const prompt = `Generate a short, concise title (5 words or less) for the following conversation. Do not use markdown.\n\n${messages.map(m => `${m.role}: ${JSON.stringify(m.content)}`).join('\n')}`;
  console.debug('[server/utils/title-generator.ts] Generating title with prompt:', prompt);
  const { text } = await generateText({
    model: google('gemini-2.0-flash-lite'),
    prompt,
  });
  return text.replace(/[#*`]/g, '').trim();
}