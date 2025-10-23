<script setup lang="ts">
import type { UIMessage } from "ai";
import MarkdownRenderer from "../MarkdownRenderer.vue";
import Tool from "./Tool.vue";

defineProps<{
  message: UIMessage;
}>();
</script>

<template>
  <div
    class="flex mb-4"
    :class="{ 'justify-end': message.role === 'user' }"
  >
    <div
      class="p-2 rounded-lg"
      :class="{
        'bg-blue-100': message.role === 'user',
        'bg-transparent': message.role !== 'user',
      }"
    >
      <template v-for="(part, index) in message.parts" :key="index">
        <MarkdownRenderer
          v-if="part.type === 'text'"
          :content="part.text"
        />
        <Tool v-if="part.type.startsWith('tool-')" :part="part" />
      </template>
    </div>
  </div>
</template>