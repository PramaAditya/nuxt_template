<script setup lang="ts">
import { computed, ref, watch, nextTick } from "vue";
import type { UIMessage } from "ai";
import type { Chat } from "@ai-sdk/vue";
import Message from "./Message.vue";
import TypingIndicator from "../TypingIndicator.vue";

const props = defineProps<{
  messages: UIMessage[];
  status: InstanceType<typeof Chat>['status'];
}>();

const root = ref<HTMLElement | null>(null);

const showTypingIndicator = computed(() => {
  return props.status === 'submitted' || (props.status === 'streaming' && props.messages.at(-1)?.role === 'user');
});

watch(() => props.messages, () => {
  nextTick(() => {
    if (root.value) {
      root.value.scrollTop = root.value.scrollHeight;
    }
  });
}, { deep: true });
</script>

<template>
  <div ref="root" class="flex-1 p-4 overflow-y-auto">
    <Message v-for="m in messages" :key="m.id" :message="m" />
    <TypingIndicator v-if="showTypingIndicator" />
  </div>
</template>