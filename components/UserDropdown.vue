<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const { data: user, pending } = useFetch("/api/me", {
  lazy: true,
});
</script>

<template>
  <div v-if="pending" class="flex items-center gap-2">
    <Skeleton class="w-8 h-8 rounded-full" />
    <Skeleton class="w-24 h-4" />
  </div>
  <DropdownMenu v-else-if="user">
    <DropdownMenuTrigger as-child>
      <div
        class="flex items-center gap-2 justify-start w-full group-data-[state=collapsed]:justify-center cursor-pointer"
      >
        <Avatar class="w-7 h-7">
          <AvatarImage :src="user.picture ?? ''" :alt="user.name ?? ''" />
          <AvatarFallback>{{ user.name?.[0] }}</AvatarFallback>
        </Avatar>
        <span class="font-medium group-data-[state=collapsed]:hidden w-full">{{
          user.name
        }}</span>
      </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem as-child>
        <NuxtLink to="/profile"> Edit Profile </NuxtLink>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem as-child>
        <a href="/sign-out"> Sign Out </a>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
