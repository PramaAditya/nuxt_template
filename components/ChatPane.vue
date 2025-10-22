<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { Chat } from '@ai-sdk/vue';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MarkdownRenderer from './MarkdownRenderer.vue';
import TypingIndicator from './TypingIndicator.vue';

interface ChatMessage extends UIMessage {
  metadata?: {
    usage?: {
      inputTokens?: number;
      outputTokens?: number;
      totalTokens?: number;
      reasoningTokens?: number;
      cachedInputTokens?: number;
    };
  };
}

const { $emitter } = useNuxtApp();
const input = ref('');
const selectedModel = ref('premium');
const messageContainer = ref<HTMLElement | null>(null);

const chat = new Chat({
  transport: new DefaultChatTransport({
    api: '/api/chat',
    body: {
      model: selectedModel.value,
    },
  }),
});

const handleSubmit = (e: Event) => {
  e.preventDefault();
  chat.sendMessage({ text: input.value });
  input.value = '';
};

function handleIncomingMessage(message: string) {
  chat.sendMessage({ text: message });
}

onMounted(() => {
  $emitter.on('send-message-to-chat', handleIncomingMessage);
});

onUnmounted(() => {
  $emitter.off('send-message-to-chat', handleIncomingMessage);
});

watch(() => chat.messages, () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
  });
}, { deep: true });
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="p-4 border-b">
      <select v-model="selectedModel" class="w-full p-2 border rounded">
        <option value="free">Free Model</option>
        <option value="premium">Premium Model</option>
      </select>
    </div>
    <div ref="messageContainer" class="flex-1 p-4 overflow-y-auto">
      <div v-for="m in chat.messages" :key="m.id" class="flex mb-4" :class="{ 'justify-end': m.role === 'user' }">
        <div class="p-2 rounded-lg" :class="{ 'bg-blue-100': m.role === 'user', 'bg-transparent': m.role !== 'user' }">
          <template v-for="part in m.parts" :key="part.type">
            <MarkdownRenderer v-if="part.type === 'text'" :content="part.text" />
          </template>
          <div v-if="m.role !== 'user' && (m as ChatMessage).metadata?.usage" class="flex items-center gap-4 text-xs text-gray-500 mt-2">
            <div class="flex items-center gap-1">
              <Icon name="lucide:arrow-down" class="w-3 h-3" />
              <span>{{ (m as ChatMessage).metadata?.usage?.inputTokens }}</span>
            </div>
            <div class="flex items-center gap-1">
              <Icon name="lucide:arrow-up" class="w-3 h-3" />
              <span>{{ (m as ChatMessage).metadata?.usage?.outputTokens }}</span>
            </div>
            <div v-if="(m as ChatMessage).metadata?.usage?.reasoningTokens" class="flex items-center gap-1">
              <Icon name="lucide:brain-circuit" class="w-3 h-3" />
              <span>{{ (m as ChatMessage).metadata?.usage?.reasoningTokens }}</span>
            </div>
            <div class="flex items-center gap-1">
              <Icon name="lucide:arrow-left-right" class="w-3 h-3" />
              <span>{{ (m as ChatMessage).metadata?.usage?.totalTokens }}</span>
            </div>
          </div>
        </div>
      </div>
      <TypingIndicator v-if="chat.status === 'submitted'" />
    </div>
    <div class="p-4 border-t">
      <form @submit.prevent="handleSubmit">
        <div class="flex gap-4">
          <Input v-model="input" placeholder="Type your message..." />
          <Button type="submit">Send</Button>
        </div>
      </form>
    </div>
  </div>
</template>