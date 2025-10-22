<script setup lang="ts">
import { marked } from 'marked';
import { computed } from 'vue';

const props = defineProps<{
  content: string;
}>();

const renderedContent = computed(() => {
  return marked(props.content);
});
</script>

<template>
  <div class="prose-chat" v-html="renderedContent"></div>
</template>