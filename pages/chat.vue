<script setup lang="ts">
import { usePageFeatures } from '~/composables/usePageFeatures';

usePageFeatures({
  chat: true,
});
</script>

<template>
  <div>
    <h1>Chat Page</h1>
    <p>This page has the chat feature enabled.</p>
  </div>
</template>