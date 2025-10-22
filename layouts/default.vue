<script setup lang="ts">
import { useLogtoUser } from "#imports";
import AppSidebar from '@/components/AppSidebar.vue'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'

const user = useLogtoUser();
</script>
<template>
  <template v-if="user">
    <SidebarProvider>
      <AppSidebar />
      <main class="h-screen flex flex-col w-full">
        <header class="flex items-center justify-between p-4 border-b shrink-0">
            <div class="flex items-center gap-4">
                <SidebarTrigger />
                <h1 id="page-name-target" class="text-lg font-semibold" />
            </div>
            <div id="toolbar-target" />
        </header>
        <div class="p-4 overflow-auto">
            <NuxtPage />
        </div>
      </main>
    </SidebarProvider>
    <Toaster />
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
