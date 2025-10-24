<script setup lang="ts">
import type { ChatSession } from "@prisma/client";
import { formatRelativeTime } from "~/utils/format-relative-time";

const { $emitter } = useNuxtApp();

const { data: conversations, pending } = await useFetch<ChatSession[]>("/api/chats?limit=3");

function selectConversation(sessionId: string) {
  $emitter.emit("loadChat", sessionId);
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full">
    <div class="text-2xl font-semibold mb-4">Welcome to the Chat</div>
    <div v-if="pending">Loading recent chats...</div>
    <div v-else-if="conversations && conversations.length > 0" class="flex flex-col gap-2">
      <p class="text-sm text-gray-500 mb-2">Or load a recent conversation:</p>
      <button
        v-for="convo in conversations"
        :key="convo.id"
        @click="selectConversation(convo.id)"
        class="p-2 text-left rounded-md hover:bg-gray-100"
      >
        <p class="font-semibold">{{ convo.title }}</p>
        <p class="text-xs text-gray-500">{{ formatRelativeTime(convo.createdAt as any) }}</p>
      </button>
    </div>
  </div>
</template>