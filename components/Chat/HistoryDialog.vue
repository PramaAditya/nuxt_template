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
import type { UIMessage } from "ai";

const { $emitter } = useNuxtApp();

const sampleConversations: { title: string; messages: UIMessage[] }[] = [
  {
    title: "Vue.js History",
    messages: [
      {
        id: "hist-1",
        role: "user",
        parts: [{ type: "text", text: "Tell me about Vue.js history." }],
      },
      {
        id: "hist-2",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Vue.js was created by Evan You and first released in 2014.",
          },
        ],
      },
    ],
  },
  {
    title: "Nuxt 3 Features",
    messages: [
      {
        id: "nuxt-1",
        role: "user",
        parts: [{ type: "text", text: "What are the key features of Nuxt 3?" }],
      },
      {
        id: "nuxt-2",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Nuxt 3 features a new server engine (Nitro), Vue 3 support, and TypeScript integration.",
          },
        ],
      },
    ],
  },
];

function selectConversation(messages: UIMessage[]) {
  $emitter.emit("loadChat", messages);
}
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <button
        class="flex items-center justify-center p-2 rounded-full hover:bg-gray-200/50 transition cursor-pointer"
      >
        <Icon name="lucide:history" class="w-6 h-6" />
      </button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Chat History</DialogTitle>
        <DialogDescription>
          Select a sample conversation to load into the chat.
        </DialogDescription>
      </DialogHeader>
      <div class="flex flex-col gap-2">
        <DialogClose
          as-child
          v-for="(convo, index) in sampleConversations"
          :key="index"
        >
          <button
            @click="selectConversation(convo.messages)"
            class="p-2 text-left rounded-md hover:bg-gray-100"
          >
            <p class="font-semibold">{{ convo.title }}</p>
          </button>
        </DialogClose>
      </div>
    </DialogContent>
  </Dialog>
</template>