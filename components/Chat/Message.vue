<script setup lang="ts">
import { ref } from "vue";
import type { UIMessage } from "ai";
import MarkdownRenderer from "../MarkdownRenderer.vue";
import Tool from "./Tool.vue";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const props = defineProps<{
  message: UIMessage;
}>();

const { $emitter } = useNuxtApp();

const isEditing = ref(false);
const editedText = ref("");

const onCopy = () => {
  const text = props.message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
  $emitter.emit("message:copy", text);
};

const onEdit = () => {
  isEditing.value = true;
  editedText.value = props.message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
};

const onCancelEdit = () => {
  isEditing.value = false;
};

const onSubmitEdit = () => {
  $emitter.emit("message:submit-edit", {
    id: props.message.id,
    content: editedText.value,
  });
  isEditing.value = false;
};

const onRetry = () => {
  $emitter.emit("message:retry", props.message.id);
};

const onDelete = () => {
  $emitter.emit("message:delete", props.message.id);
};
</script>

<template>
  <div
    class="flex flex-col gap-2 mb-4 group"
    :class="{ 'items-end': message.role === 'user' }"
  >
    <div
      class="p-2 rounded-lg"
      :class="{
        'bg-blue-100': message.role === 'user',
        'bg-transparent': message.role !== 'user',
      }"
    >
      <template v-if="!isEditing">
        <template v-for="(part, index) in message.parts" :key="index">
          <MarkdownRenderer
            v-if="part.type === 'text'"
            :content="part.text"
          />
          <Tool v-if="part.type.startsWith('tool-')" :part="part" />
        </template>
      </template>
      <template v-else>
        <textarea
          v-model="editedText"
          class="w-full p-2 rounded bg-white"
          @keydown.ctrl.enter="onSubmitEdit"
        ></textarea>
        <div class="flex justify-end gap-2 mt-0">
          <span class="cursor-pointer text-xs p-1 gap-1 flex items-center hover:bg-accent/10" @click="onCancelEdit">
            Cancel
          </span>
          <span class="cursor-pointer text-xs p-1 gap-1 flex items-center hover:bg-accent/10" @click="onSubmitEdit">
            Send Edit
            <Icon
              name="lucide:send"
              class="w-4 h-4 cursor-pointer"
              
            />
          </span>
        </div>
      </template>
    </div>
    <div
      v-if="!isEditing"
      class="flex items-center gap-3 px-2 opacity-0 group-hover:opacity-80 hover:opacity-100 transition-all ml-2"
    >
      <Icon
        name="lucide:copy"
        class="w-4 h-4 cursor-pointer p-2"
        @click="onCopy"
      />
      <Icon
        v-if="message.role === 'user'"
        name="lucide:pencil"
        class="w-4 h-4 cursor-pointer p-2"
        @click="onEdit"
      />
      <Icon
        v-if="message.role !== 'user'"
        name="lucide:refresh-cw"
        class="w-4 h-4 cursor-pointer p-2"
        @click="onRetry"
      />
      <AlertDialog>
        <AlertDialogTrigger>
          <Icon
            v-if="message.role === 'user'"
            name="lucide:trash"
            class="w-4 h-4 cursor-pointer p-2"
          />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              message and all subsequent messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction @click="onDelete">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
</template>