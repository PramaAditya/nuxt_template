import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

interface ChatMode {
  id: string;
  systemPrompt: string;
  tools: Record<string, any>;
}

const modesDir = join(process.cwd(), 'server/ai-chat/modes');

const chatModes: Record<string, ChatMode> = {};

const modeDirs = readdirSync(modesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

for (const mode of modeDirs) {
  const promptPath = join(modesDir, mode, 'prompt.md');
  const toolsPath = join(modesDir, mode, 'tools.ts');

  try {
    const systemPrompt = readFileSync(promptPath, 'utf-8');
    const { tools } = await import(toolsPath);

    chatModes[mode] = {
      id: mode,
      systemPrompt,
      tools,
    };
  } catch (error) {
    console.warn(`Could not load chat mode "${mode}":`, error);
  }
}

export const getChatMode = (mode: string): ChatMode | undefined => {
  return chatModes[mode];
}

export const getAvailableChatModes = (): string[] => {
  return Object.keys(chatModes);
}