<script setup lang="ts">
import { useLogtoUser } from "#imports";
import LandingPage from '@/components/landing/Page.vue';
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
  <LandingPage v-else />
</template>
