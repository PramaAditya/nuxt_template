<script setup lang="ts">
import { defineAsyncComponent, computed } from "vue";
import type { UIDataTypes, UIMessagePart } from "ai";
import ToolOutput from "../ToolOutput.vue";

const props = defineProps<{
  part: UIMessagePart<UIDataTypes, any>;
}>();

const toolName = computed(() => {
  if (props.part.type.startsWith("tool-")) {
    return props.part.type.substring("tool-".length);
  }
  return "unknown";
});

const ToolComponent = defineAsyncComponent(() => {
  const componentName = toolName.value.charAt(0).toUpperCase() + toolName.value.slice(1);
  return import(`./tools/${componentName}.vue`).catch(() => {
    return import(`./tools/Unknown.vue`);
  });
});
</script>

<template>
  <ToolOutput :part="part">
    <template #default="{ part }">
      <component :is="ToolComponent" :part="part" />
    </template>
  </ToolOutput>
</template>