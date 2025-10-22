<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { Chat } from '@ai-sdk/vue';
import { DefaultChatTransport } from 'ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const { $emitter } = useNuxtApp();
const input = ref('');
const selectedModel = ref('premium');

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
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="p-4 border-b">
      <select v-model="selectedModel" class="w-full p-2 border rounded">
        <option value="free">Free Model</option>
        <option value="premium">Premium Model</option>
      </select>
    </div>
    <div class="flex-1 p-4 overflow-y-auto">
      <div v-for="m in chat.messages" :key="m.id" class="mb-4">
        <div v-if="m.role === 'user'" class="text-right">
          <span class="p-2 bg-blue-100 rounded-lg">
            <template v-for="part in m.parts" :key="part.type">
              <span v-if="part.type === 'text'">{{ part.text }}</span>
            </template>
          </span>
        </div>
        <div v-else>
          <span class="p-2 bg-gray-100 rounded-lg">
            <template v-for="part in m.parts" :key="part.type">
              <span v-if="part.type === 'text'">{{ part.text }}</span>
            </template>
          </span>
        </div>
      </div>
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