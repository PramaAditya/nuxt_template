<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "vue-sonner"

const { data: user, refresh } = await useFetch("/api/me")

const name = ref(user.value?.name ?? "")
const picture = ref(user.value?.picture ?? "")

async function updateUser() {
  await $fetch("/api/me", {
    method: "PUT",
    body: {
      name: name.value,
      picture: picture.value,
    },
  })

  toast.success("Profile updated", {
    description: "Your profile has been updated successfully.",
  })

  await refreshNuxtData()
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold">
      Edit Profile
    </h1>
    <form class="mt-4 space-y-4" @submit.prevent="updateUser">
      <div class="space-y-2">
        <Label for="name">Name</Label>
        <Input id="name" v-model="name" />
      </div>
      <div class="space-y-2">
        <Label for="picture">Picture URL</Label>
        <Input id="picture" v-model="picture" />
      </div>
      <Button type="submit">
        Save
      </Button>
    </form>
  </div>
</template>