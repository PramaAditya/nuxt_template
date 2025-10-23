<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, nextTick } from "vue";
import { Chat } from "@ai-sdk/vue";
import { DefaultChatTransport } from "ai";
import ModelSelector from "./Chat/ModelSelector.vue";
import MessageList from "./Chat/MessageList.vue";

const { $emitter } = useNuxtApp();
const input = ref("");
const selectedModel = ref("premium");
const messageContainer = ref<HTMLElement | null>(null);
const textarea = ref<HTMLTextAreaElement | null>(null);

const chat = new Chat({
  transport: new DefaultChatTransport({
    api: "/api/chat",
    body: {
      model: selectedModel.value,
    },
  }),
});

const handleSubmit = (e: Event) => {
  e.preventDefault();
  chat.sendMessage({ text: input.value });
  input.value = "";
  nextTick(() => {
    if (textarea.value) {
      textarea.value.style.height = "auto";
    }
  });
};

function handleIncomingMessage(message: string) {
  chat.sendMessage({ text: message });
}

onMounted(() => {
  $emitter.on("send-message-to-chat", handleIncomingMessage);
});

onUnmounted(() => {
  $emitter.off("send-message-to-chat", handleIncomingMessage);
});

watch(
  () => chat.messages,
  () => {
    console.log("Messages updated:", JSON.stringify(chat.messages, null, 2));
    nextTick(() => {
      if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
      }
    });
  },
  { deep: true }
);

watch(input, () => {
  if (textarea.value) {
    textarea.value.style.height = "auto";
    textarea.value.style.height = `${textarea.value.scrollHeight}px`;
  }
});
</script>

<template>
  <div class="flex flex-col h-full">
    <MessageList
      ref="messageContainer"
      :messages="chat.messages"
      :status="chat.status"
    />
    <form @submit.prevent="handleSubmit" id="messageInput" class="border mb-4 mx-4 rounded-lg bg-white/50 backdrop-blur-sm">
      <textarea
        ref="textarea"
        v-model="input"
        placeholder="Type your message..."
        class="px-3 py-4 w-full text-sm bg-transparent resize-none focus-visible:outline-none focus-visible:none disabled:cursor-not-allowed disabled:opacity-50"
        rows="1"
        style="max-height: 10rem"
        @keydown.enter.exact.prevent="handleSubmit"
      />
      <div class="flex gap-4 px-3 items-center mb-2">
        <ModelSelector v-model="selectedModel" />

        <button type="submit" class="ml-auto flex items-center justify-center p-2 rounded-full hover:bg-gray-200/50 transition cursor-pointer">
          <Icon name="lucide:send" class="w-6 h-6" />
        </button>
      </div>
    </form>
  </div>
</template>
