<script setup lang="ts">
import { computed } from 'vue';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { UIDataTypes, UIMessagePart } from 'ai';

const props = defineProps<{
  part: UIMessagePart<UIDataTypes, any>;
}>();

const toolName = computed(() => {
  if (props.part.type.startsWith('tool-')) {
    const name = props.part.type.substring('tool-'.length);
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return 'Tool';
});

const toolIcon = computed(() => {
  if (props.part.type === 'tool-calculator') {
    return 'lucide:calculator';
  }
  return 'lucide:wrench';
});
</script>

<template>
  <Collapsible class="p-3 my-2 border rounded-md bg-gray-50/50">
    <CollapsibleTrigger class="w-full">
      <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Icon :name="toolIcon" class="w-4 h-4" />
        <span>{{ toolName }}</span>
        <Icon name="lucide:chevrons-up-down" class="w-4 h-4 ml-auto" />
      </div>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <slot :part="part" />
    </CollapsibleContent>
  </Collapsible>
</template>