<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import type { ChatSession } from "@prisma/client";
import { formatRelativeTime } from "~/utils/format-relative-time";

const { $emitter } = useNuxtApp();

const { data: conversations, pending, refresh } = await useFetch<ChatSession[]>("/api/chats");

function selectConversation(sessionId: string) {
  $emitter.emit("loadChat", sessionId);
}
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <button
        @click="() => refresh()"
        class="flex items-center justify-center p-2 rounded-full hover:bg-gray-200/50 transition cursor-pointer"
      >
        <Icon name="lucide:history" class="w-6 h-6" />
      </button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Chat History</DialogTitle>
        <DialogDescription>
          Select a conversation to load into the chat.
        </DialogDescription>
      </DialogHeader>
      <div class="flex flex-col gap-2">
        <div v-if="pending">Loading...</div>
        <DialogClose
          as-child
          v-for="convo in conversations"
          :key="convo.id"
        >
          <button
            @click="selectConversation(convo.id)"
            class="p-2 text-left rounded-md hover:bg-gray-100"
          >
            <p class="font-semibold">{{ convo.title }}</p>
            <p class="text-xs text-gray-500">{{ formatRelativeTime(convo.createdAt as any) }}</p>
          </button>
        </DialogClose>
      </div>
    </DialogContent>
  </Dialog>
</template>