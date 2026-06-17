<script setup lang="ts">
import type { Domain } from '~/types/content'

defineProps<{ domain: Domain }>()
const emit = defineEmits<{ edit: []; delete: [] }>()
</script>

<template>
  <div class="group flex items-start justify-between gap-3 border border-border bg-card p-4 transition-colors hover:border-primary">
    <div class="min-w-0 flex-1">
      <p class="font-serif font-semibold text-sm leading-tight">{{ domain.title }}</p>
      <p v-if="domain.description" class="text-xs text-muted-foreground mt-0.5">{{ domain.description }}</p>
    </div>
    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
      <Button size="sm" variant="ghost" class="h-7 w-7 p-0 text-muted-foreground" @click="emit('edit')">
        <Icon name="lucide:pencil" class="w-3.5 h-3.5" />
      </Button>
      <Button size="sm" variant="ghost" class="h-7 w-7 p-0 text-destructive" @click="emit('delete')">
        <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
      </Button>
    </div>
  </div>
</template>
