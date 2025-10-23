<script setup lang="ts">
import type { ToolUIPart } from "ai";
import type { UITools } from "~/types/tools";

defineProps<{
  part: ToolUIPart<UITools>;
}>();
</script>

<template>
  <div v-if="part.type === 'tool-calculator'" class="flex gap-2 items-center">
    <div v-if="part.input" class="">
      <code class="block p-2 mt-1 text-sm bg-gray-200/50 rounded-md">{{
        part.input.expression
      }}</code>
    </div>
    <Icon name="lucide:equal"/>
    <template v-if="part.state === 'output-available'">
      <div class="">
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
      <div class="">
        <code
          class="block p-2 mt-1 text-sm font-bold text-gray-800 bg-gray-200/50 rounded-md"
          >Calculating...</code
        >
      </div>
    </template>
  </div>
</template>
