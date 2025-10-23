# How to Save Chat Sessions to a Database in Vue.js with the Vercel AI SDK

This guide provides a step-by-step walkthrough on how to implement chat session persistence in a Vue.js application (specifically using Nuxt.js for the server-side) with the Vercel AI SDK.

## 1. Backend: API Route Setup

The core logic for saving chat messages resides on the server. We'll create an API endpoint that handles the chat stream and saves the conversation to a database when it's complete.

### `server/api/chat.post.ts`

This file defines a POST endpoint that receives messages, streams a response from the AI, and saves the full conversation history upon completion using the `onFinish` callback.

```typescript
import { openai } from '@ai-sdk/openai';
import { saveChat, loadChat } from '~/server/utils/chat-store'; // We'll define these next
import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
  const { messages, chatId }: { messages: UIMessage[]; chatId: string } =
    await readBody(event);

  // 1. Load previous messages from the database
  const previousMessages = await loadChat(chatId);
  const allMessages = [...previousMessages, ...messages];

  // 2. Stream the AI response
  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages: convertToModelMessages(allMessages),
  });

  // 3. Save the full conversation on completion
  return result.toUIMessageStreamResponse({
    originalMessages: allMessages,
    onFinish: ({ messages }) => {
      saveChat({ chatId, messages });
    },
  });
});
```

## 2. Backend: Database Utilities

You'll need utility functions to interact with your database. The following is a conceptual example. You can replace this with your actual database logic (e.g., using Prisma, Drizzle, or any other ORM).

### `server/utils/chat-store.ts` (Example)

```typescript
import { UIMessage } from 'ai';

// This is a placeholder for your actual database logic.
const chatStorage = new Map<string, UIMessage[]>();

export async function saveChat({
  chatId,
  messages,
}: {
  chatId: string;
  messages: UIMessage[];
}): Promise<void> {
  console.log(`Saving chat ${chatId}`);
  chatStorage.set(chatId, messages);
}

export async function loadChat(chatId: string): Promise<UIMessage[]> {
  console.log(`Loading chat ${chatId}`);
  return chatStorage.get(chatId) || [];
}
```

## 3. Frontend: Vue Component

The frontend will use the `@ai-sdk/vue` package to manage the chat interface.

### Installation

First, ensure you have the package installed:
```bash
npm install @ai-sdk/vue ai
```

### Chat Component (`components/Chat.vue`)

This component will:
- Fetch the initial chat history when it mounts.
- Use the `Chat` class from `@ai-sdk/vue` to handle user input and display messages.
- Automatically call the backend API to get AI responses and trigger the save mechanism.

```vue
<script setup lang="ts">
import { Chat } from "@ai-sdk/vue";
import { ref, onMounted } from "vue";
import { type UIMessage } from "ai";

// This function would fetch initial messages for a given chat session
async function fetchInitialMessages(chatId: string): Promise<UIMessage[]> {
  // You might want a dedicated GET endpoint for this
  const response = await fetch(`/api/chat/history?id=${chatId}`);
  if (!response.ok) {
    return [];
  }
  return response.json();
}

const chatId = "session-123"; // This should be dynamic in a real application
const input = ref("");
const chat = ref<Chat | null>(null);
const isLoading = ref(true);

onMounted(async () => {
  const initialMessages = await fetchInitialMessages(chatId);
  chat.value = new Chat({
    api: "/api/chat", // Your chat API endpoint
    id: chatId,
    initialMessages,
  });
  isLoading.value = false;
});

const handleSubmit = (e: Event) => {
  e.preventDefault();
  if (chat.value && input.value) {
    chat.value.sendMessage({ text: input.value });
    input.value = "";
  }
};
</script>

<template>
  <div>
    <div v-if="!isLoading && chat">
      <div v-for="m in chat.messages" :key="m.id">
        <strong>{{ m.role === "user" ? "User: " : "AI: " }}</strong>
        <span v-for="(part, partIndex) in m.parts" :key="partIndex">
          <template v-if="part.type === 'text'">{{ part.text }}</template>
        </span>
      </div>

      <form @submit="handleSubmit">
        <input v-model="input" placeholder="Type your message..." />
        <button type="submit">Send</button>
      </form>
    </div>
    <div v-else>
      <p>Loading chat history...</p>
    </div>
  </div>
</template>
```

## Summary of the Flow

1.  The Vue component mounts and calls `fetchInitialMessages` to get the chat history.
2.  A new `Chat` instance is created with the initial messages.
3.  The user types a message and submits the form.
4.  `chat.sendMessage` sends the new message to your `/api/chat` endpoint.
5.  The server loads the previous messages, adds the new one, and streams the AI response back to the client.
6.  When the stream is finished, the `onFinish` callback on the server is executed, saving the entire, updated conversation to the database.