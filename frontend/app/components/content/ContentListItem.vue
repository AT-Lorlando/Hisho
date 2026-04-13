<script setup lang="ts">
defineProps<{
  title: string
  meta: string
  tags: string[]
  hasAiSummary: boolean
  isActive: boolean
}>()
</script>

<template>
  <div
    class="px-3 py-2.5 cursor-pointer border-l-2 transition-colors"
    :class="isActive
      ? 'border-l-primary bg-accent text-accent-foreground'
      : 'border-l-transparent hover:bg-accent/50'"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium truncate">{{ title }}</p>
        <p class="text-xs text-muted-foreground mt-0.5 truncate">{{ meta }}</p>
        <div v-if="tags.length" class="flex flex-wrap gap-1 mt-1.5">
          <span
            v-for="tag in tags.slice(0, 3)"
            :key="tag"
            class="text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5"
          >{{ tag }}</span>
        </div>
      </div>
      <div
        class="w-2 h-2 rounded-full mt-1.5 shrink-0"
        :class="hasAiSummary ? 'bg-green-500' : 'bg-red-400'"
        :title="hasAiSummary ? 'Résumé IA généré' : 'Pas de résumé IA'"
      />
    </div>
  </div>
</template>
