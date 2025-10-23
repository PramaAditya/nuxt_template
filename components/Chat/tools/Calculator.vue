<script setup lang="ts">
import type { ToolUIPart } from "ai";
import type { UITools } from "~/types/tools";

defineProps<{
  part: ToolUIPart<UITools>;
}>();
</script>

<template>
  <div v-if="part.type === 'tool-calculator'">
    <div v-if="part.input" class="pl-6 mt-2">
      <p class="text-xs text-gray-500">EXPRESSION</p>
      <code
        class="block p-2 mt-1 text-sm bg-gray-200/50 rounded-md"
        >{{
          part.input.expression
        }}</code
      >
    </div>
    <template v-if="part.state === 'output-available'">
      <div class="pl-6 mt-2">
        <p class="text-xs text-gray-500">RESULT</p>
        <code
          v-if="'result' in part.output"
          class="block p-2 mt-1 text-sm font-bold text-gray-800 bg-green-200/50 rounded-md"
          >{{ part.output.result }}</code
        >
        <code
          v-else
          class="block p-2 mt-1 text-sm font-bold text-gray-800 bg-red-200/50 rounded-md"
          >{{ part.output.error }}</code
        >
      </div>
    </template>
    <template v-else-if="part.state === 'input-available'">
      <div class="pl-6 mt-2">
        <p class="text-xs text-gray-500">RESULT</p>
        <p class="mt-1 text-sm text-gray-500">Calculating...</p>
      </div>
    </template>
  </div>
</template>