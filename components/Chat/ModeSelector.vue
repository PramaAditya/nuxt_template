<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="sm" class="flex items-center gap-2 capitalize">
        {{ selectedMode }}
        <Icon name="lucide:chevron-down" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-80">
      <DropdownMenuLabel>Mode Selector</DropdownMenuLabel>
      <p class="text-xs text-muted-foreground px-2">
        Choose a mode to chat with.
      </p>
      <DropdownMenuSeparator />
      <DropdownMenuRadioGroup v-model="selectedMode">
        <DropdownMenuRadioItem value="default">
          <div class="text-left">
            <p class="font-semibold">Default</p>
            <p class="text-xs text-muted-foreground">
              A general-purpose AI assistant.
            </p>
          </div>
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="baqir">
          <div class="text-left">
            <p class="font-semibold">Baqir</p>
            <p class="text-xs text-muted-foreground">
              A friendly math tutor for elementary students.
            </p>
          </div>
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script lang="ts" setup>
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const selectedMode = defineModel({
  type: String,
  required: true,
});
</script>