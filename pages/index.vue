<script setup lang="ts">
import { Button } from "@/components/ui/button"

const user = useLogtoUser();
</script>
<template>
    <Teleport to="#page-name-target">
      Dashboard
    </Teleport>
    <Teleport to="#toolbar-target">
      <Button>
          <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
          New
      </Button>
    </Teleport>
  {{user}}
</template>
