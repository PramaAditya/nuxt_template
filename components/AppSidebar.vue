<script setup lang="ts">
import ApplicationIcon from "@/components/ApplicationIcon.vue"
import { Button } from "@/components/ui/button"
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
    url: "#",
    icon: "lucide:home",
  },
  {
    title: "Inbox",
    url: "#",
    icon: "lucide:inbox",
  },
  {
    title: "Calendar",
    url: "#",
    icon: "lucide:calendar",
  },
  {
    title: "Search",
    url: "#",
    icon: "lucide:search",
  },
  {
    title: "Settings",
    url: "#",
    icon: "lucide:settings",
  },
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
                    <a :href="item.url">
                      <Icon :name="item.icon" class="w-4 h-4" />
                      <span class="group-data-[state=collapsed]:hidden">{{item.title}}</span>
                    </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <Button as-child>
        <a href="/sign-out">
          <Icon name="lucide:log-out" class="w-4 h-4" />
          <span class="group-data-[state=collapsed]:hidden">Sign Out</span>
        </a>
      </Button>
    </SidebarFooter>
  </Sidebar>
</template>