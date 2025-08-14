<script setup lang="ts">
import { useLogtoUser } from "#imports";
import AppSidebar from '@/components/AppSidebar.vue'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

const user = useLogtoUser();
</script>
<template>
  <template v-if="user">
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        <slot />
      </main>
    </SidebarProvider>
  </template>
  <main class="h-screen w-screen flex items-center justify-center" v-else>
    <Button :as-child="true">
      <a href="/sign-in">
        <Icon name="streamline-logos:google-logo-solid" class="w-4 h-4 mr-2" />
        Sign in using Google
      </a>
    </Button>
  </main>
</template>
