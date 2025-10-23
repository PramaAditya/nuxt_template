<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="sm" class="flex items-center gap-2">
        {{ selectedModel === "free" ? "Free" : "Premium" }}
        <Icon name="lucide:chevron-down" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-80">
      <DropdownMenuLabel>Model Selector</DropdownMenuLabel>
      <p class="text-xs text-muted-foreground px-2">
        Choose a model to chat with.
      </p>
      <DropdownMenuSeparator />
      <DropdownMenuRadioGroup v-model="selectedModel">
        <DropdownMenuRadioItem value="free">
          <div class="text-left">
            <p class="font-semibold">Free</p>
            <p class="text-xs text-muted-foreground">
              Fast and efficient for everyday tasks.
            </p>
          </div>
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="premium">
          <div class="text-left">
            <p class="font-semibold">Premium</p>
            <p class="text-xs text-muted-foreground">
              Smarter and more capable for complex queries.
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

const selectedModel = defineModel({
  type: String,
  required: true,
});
</script>
