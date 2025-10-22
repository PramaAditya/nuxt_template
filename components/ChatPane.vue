<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { Chat } from '@ai-sdk/vue';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { Button } from '@/components/ui/button';
import MarkdownRenderer from './MarkdownRenderer.vue';
import TypingIndicator from './TypingIndicator.vue';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ToolOutput from './ToolOutput.vue';

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
const textarea = ref<HTMLTextAreaElement | null>(null);

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
  nextTick(() => {
    if (textarea.value) {
      textarea.value.style.height = 'auto';
    }
  });
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
  console.log('Messages updated:', JSON.stringify(chat.messages, null, 2));
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
  });
}, { deep: true });

watch(input, () => {
  if (textarea.value) {
    textarea.value.style.height = 'auto';
    textarea.value.style.height = `${textarea.value.scrollHeight}px`;
  }
});
</script>

<template>
  <div class="flex flex-col h-full">
    <div ref="messageContainer" class="flex-1 p-4 overflow-y-auto">
      <div v-for="m in chat.messages" :key="m.id" class="flex mb-4" :class="{ 'justify-end': m.role === 'user' }">
        <div class="p-2 rounded-lg" :class="{ 'bg-blue-100': m.role === 'user', 'bg-transparent': m.role !== 'user' }">
          <template v-for="part in m.parts" :key="part.type">
            <MarkdownRenderer v-if="part.type === 'text'" :content="part.text" />
            <ToolOutput v-if="part.type.startsWith('tool-')" :part="part">
              <template #default="{ part }">
                <div v-if="part.type === 'tool-calculator'">
                  <div class="pl-6 mt-2">
                    <p class="text-xs text-gray-500">EXPRESSION</p>
                    <code class="block p-2 mt-1 text-sm bg-gray-200/50 rounded-md">{{ (part.input as { expression: string }).expression }}</code>
                  </div>
                  <template v-if="part.state === 'output-available'">
                    <div class="pl-6 mt-2">
                      <p class="text-xs text-gray-500">RESULT</p>
                      <code class="block p-2 mt-1 text-sm font-bold text-gray-800 bg-green-200/50 rounded-md">{{ (part.output as { result: number }).result }}</code>
                    </div>
                  </template>
                  <template v-else-if="part.state === 'input-available'">
                    <div class="pl-6 mt-2">
                      <p class="text-xs text-gray-500">RESULT</p>
                      <p class="mt-1 text-sm text-gray-500">Calculating...</p>
                    </div>
                  </template>
                </div>
              </template>
            </ToolOutput>
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
          <Popover>
            <PopoverTrigger as-child>
              <Button variant="outline">{{ selectedModel === 'free' ? 'Free' : 'Premium' }}</Button>
            </PopoverTrigger>
            <PopoverContent class="w-80">
              <div class="grid gap-4">
                <div class="space-y-2">
                  <h4 class="font-medium leading-none">Model Selector</h4>
                  <p class="text-sm text-muted-foreground">
                    Choose a model to chat with.
                  </p>
                </div>
                <div class="grid gap-2">
                  <Button variant="ghost" @click="selectedModel = 'free'" class="w-full justify-start">
                    <div class="text-left">
                      <p class="font-semibold">Free</p>
                      <p class="text-xs text-muted-foreground">Fast and efficient for everyday tasks.</p>
                    </div>
                  </Button>
                  <Button variant="ghost" @click="selectedModel = 'premium'" class="w-full justify-start">
                    <div class="text-left">
                      <p class="font-semibold">Premium</p>
                      <p class="text-xs text-muted-foreground">Smarter and more capable for complex queries.</p>
                    </div>
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <textarea
            ref="textarea"
            v-model="input"
            placeholder="Type your message..."
            class="flex-1 px-3 py-2 text-sm bg-transparent border rounded-md resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            rows="1"
            style="max-height: 10rem;"
            @keydown.enter.exact.prevent="handleSubmit"
          />
          <Button type="submit">Send</Button>
        </div>
      </form>
    </div>
  </div>
</template>