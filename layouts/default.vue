<script setup lang="ts">
import { useLogtoUser } from "#imports";
import LandingPage from '@/components/landing/Page.vue';
import AppSidebar from '@/components/AppSidebar.vue'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import ChatPane from '@/components/ChatPane.vue'
import { useChatPane } from '~/composables/useChatPane'
import { usePageFeatures } from '~/composables/usePageFeatures'
import { Button } from '@/components/ui/button'

const user = useLogtoUser();
const { isChatPaneOpen, openChatPane } = useChatPane()
const pageFeatures = usePageFeatures({ chat: false })
</script>
<template>
  <template v-if="user">
    <SidebarProvider>
      <AppSidebar />
      <ResizablePanelGroup direction="horizontal" class="w-full">
        <ResizablePanel :default-size="50">
          <main class="h-screen flex flex-col w-full">
            <header class="flex items-center justify-between p-4 border-b shrink-0">
              <div class="flex items-center gap-4">
                <SidebarTrigger />
                <h1 id="page-name-target" class="text-lg font-semibold" />
              </div>
              <div class="flex items-center gap-4">
                <Button v-if="pageFeatures.chat" @click="openChatPane">
                  Open Chat
                </Button>
                <div id="toolbar-target" />
              </div>
            </header>
            <div class="p-4 overflow-auto">
              <NuxtPage />
            </div>
          </main>
        </ResizablePanel>
        <template v-if="isChatPaneOpen">
          <ResizableHandle />
          <ResizablePanel :default-size="50">
            <ChatPane />
          </ResizablePanel>
        </template>
      </ResizablePanelGroup>
    </SidebarProvider>
    <Toaster />
  </template>
  <LandingPage v-else />
</template>
