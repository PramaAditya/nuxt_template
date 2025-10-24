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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const { $emitter } = useNuxtApp();

const props = defineProps<{
  sessionId: string | null;
}>();

const { data: conversations, pending, refresh } = await useFetch<ChatSession[]>("/api/chats");

function selectConversation(sessionId: string) {
  $emitter.emit("loadChat", sessionId);
}

async function deleteConversation(sessionId: string) {
  await $fetch(`/api/chat/${sessionId}`, {
    method: 'DELETE',
  });
  if (props.sessionId === sessionId) {
    $emitter.emit('current-chat-deleted');
  }
  refresh();
  $emitter.emit('refresh-welcome');
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
        <div
          v-for="convo in conversations"
          :key="convo.id"
          class="p-2 text-left rounded-md hover:bg-gray-100 flex justify-between items-center"
        >
          <DialogClose as-child>
            <button @click="selectConversation(convo.id)" class="flex-grow text-left">
              <p class="font-semibold">{{ convo.title }} <span v-if="convo.id === sessionId" class="text-xs text-gray-500">(current)</span></p>
              <p class="text-xs text-gray-500">{{ formatRelativeTime(convo.createdAt as any) }}</p>
            </button>
          </DialogClose>
          <AlertDialog>
            <AlertDialogTrigger as-child>
              <button class="text-red-500 p-2 hover:bg-red-100 rounded">
                <Icon name="lucide:trash" class="w-4 h-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the chat session.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction @click="deleteConversation(convo.id)">Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>