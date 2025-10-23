# Chat Mode Refactoring Plan

This plan outlines the steps to refactor the chat API to support different agent modes.

## 1. Restructure Chat Modes (Done)

- [x] Create a new directory structure for chat modes.
- [x] Each mode has its own directory (e.g., `server/ai-chat/modes/default`, `server/ai-chat/modes/baqir`).
- [x] Each mode directory contains a `prompt.md` file.

## 2. Create Tool Configurations

I will now create the tool configurations for each chat mode.

### `default` Mode

The `default` mode will not have any tools.

**File:** `server/ai-chat/modes/default/tools.ts`
```typescript
export const tools = {};
```

### `baqir` Mode

The `baqir` mode will have the `calculator` tool.

**File:** `server/ai-chat/modes/baqir/tools.ts`
```typescript
import { calculatorTool } from '~/server/tools/calculator';

export const tools = {
  calculator: calculatorTool,
};
```

## 3. Implement Dynamic Mode Loader

I will create a central loader to automatically discover and register all available chat modes.

**File:** `server/ai-chat/modes/index.ts`
```typescript
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

  const systemPrompt = readFileSync(promptPath, 'utf-8');
  const { tools } = await import(toolsPath);

  chatModes[mode] = {
    id: mode,
    systemPrompt,
    tools,
  };
}

export const getChatMode = (mode: string): ChatMode | undefined => {
  return chatModes[mode];
}

export const getAvailableChatModes = (): string[] => {
  return Object.keys(chatModes);
}
```

## 4. Update Chat API

I will refactor the main chat API endpoint to use the new dynamic mode loader.

**File:** `server/api/chat.post.ts` (partial)
```typescript
// ... imports
import { getChatMode } from '~/server/ai-chat/modes';
import { renderTemplate } from '~/server/utils/templating';

// ... (inside defineEventHandler)

const { messages, model: requestedModel, mode }: { messages: UIMessage[], model: 'free' | 'premium', mode: string } = await readBody(event);

const chatMode = getChatMode(mode);

if (!chatMode) {
  throw createError({
    statusCode: 400,
    statusMessage: `Bad Request: Invalid chat mode "${mode}"`,
  });
}

const systemPrompt = renderTemplate(chatMode.systemPrompt, {
  datetime: new Date().toISOString(),
});

const result = await streamText({
  model: google(modelName),
  system: systemPrompt,
  messages: convertToModelMessages(messages),
  tools: chatMode.tools,
  // ...
});
```

## 5. Update Client-side

The client-side will need to be updated to send the selected chat mode in the request body. This will likely involve adding a dropdown or some other UI element to select the mode.

This part of the plan is out of scope for the current task, but it's important to note.