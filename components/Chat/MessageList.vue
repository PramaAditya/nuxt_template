<script setup lang="ts">
import type { UIMessage } from "ai";
import type { Chat } from "@ai-sdk/vue";
import Message from "./Message.vue";
import TypingIndicator from "../TypingIndicator.vue";

defineProps<{
  messages: UIMessage[];
  status: InstanceType<typeof Chat>['status'];
}>();
</script>

<template>
  <div class="flex-1 p-4 overflow-y-auto">
    <Message v-for="m in messages" :key="m.id" :message="m" />
    <TypingIndicator v-if="status === 'submitted'" />
  </div>
</template>