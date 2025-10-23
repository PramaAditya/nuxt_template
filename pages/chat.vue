<script setup lang="ts">
import { usePageFeatures } from "~/composables/usePageFeatures";

usePageFeatures({
  chat: true,
});
</script>

<template>
  <Teleport to="#page-name-target"> Chat Page </Teleport>
  <div>
    <p>This page has the chat feature enabled.</p>
  </div>
</template>
