<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, nextTick } from "vue";
import { Chat } from "@ai-sdk/vue";
import { DefaultChatTransport, type UIMessage } from "ai";
import ModelSelector from "./Chat/ModelSelector.vue";
import ModeSelector from "./Chat/ModeSelector.vue";
import MessageList from "./Chat/MessageList.vue";
import HistoryDialog from "./Chat/HistoryDialog.vue";
import Welcome from "./Chat/Welcome.vue";
import { toast } from "vue-sonner";

const { $emitter } = useNuxtApp();
const route = useRoute();
const input = ref("");
const selectedModel = ref("free");
const selectedMode = ref("default");
const messageContainer = ref<HTMLElement | null>(null);
const textarea = ref<HTMLTextAreaElement | null>(null);

const sessionId = ref<string | null>(null);
const sourceUrl = ref<string | null>(null);
const chatTitle = ref<string>('Chat');

const showOpenInOriginalPage = computed(() => {
  if (!sourceUrl.value) return false;
  return sourceUrl.value !== route.path;
});

const chat = new Chat({
  transport: new DefaultChatTransport({
    api: "/api/chat",
    body: () => ({
      model: selectedModel.value,
      mode: selectedMode.value,
      sessionId: sessionId.value,
      sourceUrl: route.path,
    }),
  }),
});

async function handleLoadChat(newSessionId: string) {
  const { data: session, error } = await useFetch<any>(`/api/chat/${newSessionId}`);
  if (error.value) {
    toast.error("Failed to load chat session.");
    return;
  }
  if (session.value) {
    chat.messages.splice(0, chat.messages.length);
    chat.messages.push(...session.value.messages.map((m: any) => ({
      id: m.id,
      role: m.role,
      parts: m.content,
    })));
    sessionId.value = newSessionId;
    sourceUrl.value = session.value.sourceUrl;
    chatTitle.value = session.value.title;
  }
}

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

const handleCopy = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
};

function handleEdit({ id, content }: { id: string; content: string }) {
  const messageIndex = chat.messages.findIndex((m) => m.id === id);
  if (messageIndex === -1) return;

  chat.messages.splice(messageIndex);
  chat.sendMessage({ text: content });
}

const handleRetry = (id: string) => {
  chat.regenerate({ messageId: id });
};

const handleDelete = async (id: string) => {
  const messageIndex = chat.messages.findIndex((m) => m.id === id);
  if (messageIndex === -1) return;

  await $fetch(`/api/chat/message/${id}`, {
    method: 'PATCH' as any,
  });

  chat.messages.splice(messageIndex);
};

onMounted(() => {
  $emitter.on("send-message-to-chat", handleIncomingMessage);
  $emitter.on("message:copy", handleCopy);
  $emitter.on("message:submit-edit", handleEdit);
  $emitter.on("message:retry", handleRetry);
  $emitter.on("message:delete", handleDelete);
  $emitter.on("loadChat", handleLoadChat);
});

onUnmounted(() => {
  $emitter.off("send-message-to-chat", handleIncomingMessage);
  $emitter.off("message:copy", handleCopy);
  $emitter.off("message:submit-edit", handleEdit);
  $emitter.off("message:retry", handleRetry);
  $emitter.off("message:delete", handleDelete);
  $emitter.off("loadChat", handleLoadChat);
});

watch(
  () => chat.messages,
  (messages) => {
    for (const message of messages) {
      for (const part of message.parts) {
        if (part.type === 'data-custom' && (part.data as any).sessionId) {
          sessionId.value = (part.data as any).sessionId;
        }
      }
    }
    // console.log("Messages updated:", JSON.stringify(chat.messages, null, 2));
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
  <aside class="flex flex-col h-full">
    <header
      class="flex items-center justify-between p-4 border-b shrink-0 h-16"
    >
      <div class="flex items-center gap-4">
        <h1 class="text-lg font-semibold" >{{ chatTitle }}</h1>
        <NuxtLink v-if="showOpenInOriginalPage" :to="sourceUrl ?? ''" class="text-sm p-2 hover:bg-gray-200 rounded">
          <Icon name="lucide:external-link" class="w-4 h-4" />
        </NuxtLink>
      </div>
      <HistoryDialog />
    </header>
    <MessageList
      ref="messageContainer"
      :messages="chat.messages"
      :status="chat.status"
    />
    <Welcome v-if="chat.messages.length === 0" />
    <form
      @submit.prevent="handleSubmit"
      id="messageInput"
      class="border mb-4 mx-4 rounded-lg bg-white/50 backdrop-blur-sm"
    >
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

        <ModeSelector v-model="selectedMode" />

        <button
          type="submit"
          class="ml-auto flex items-center justify-center p-2 rounded-full hover:bg-gray-200/50 transition cursor-pointer"
        >
          <Icon name="lucide:send" class="w-6 h-6" />
        </button>
      </div>
    </form>
  </aside>
</template>
