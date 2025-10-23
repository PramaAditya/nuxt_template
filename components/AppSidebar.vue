<script setup lang="ts">
import ApplicationIcon from "@/components/ApplicationIcon.vue"
import UserDropdown from "@/components/UserDropdown.vue"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: "lucide:home",
  },
  {
    title: "Chat",
    url: "/chat",
    icon: "lucide:message-circle",
  },
  {
    title: "Chat 2",
    url: "/chat-2",
    icon: "lucide:message-square",
  },
  // {
  //   title: "Calendar",
  //   url: "#",
  //   icon: "lucide:calendar",
  // },
  // {
  //   title: "Search",
  //   url: "#",
  //   icon: "lucide:search",
  // },
  // {
  //   title: "Settings",
  //   url: "#",
  //   icon: "lucide:settings",
  // },
];
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <ApplicationIcon />
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel class="group-data-[state=collapsed]:hidden">Application</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
              <SidebarMenuItem v-for="item in items" :key="item.title">
                <SidebarMenuButton asChild>
                    <NuxtLink  :href="item.url">
                      <Icon :name="item.icon" class="w-4 h-4" />
                      <span class="group-data-[state=collapsed]:hidden">{{item.title}}</span>
                    </NuxtLink >
                </SidebarMenuButton>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <UserDropdown />
    </SidebarFooter>
  </Sidebar>
</template>