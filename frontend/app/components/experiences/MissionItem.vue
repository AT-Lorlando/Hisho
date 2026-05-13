<script setup lang="ts">
import type { Mission } from '~/types/content'

defineProps<{ mission: Mission }>()
const emit = defineEmits<{ edit: []; delete: [] }>()

function levelDots(level: number): string {
  return '●'.repeat(level) + '○'.repeat(5 - level)
}
</script>

<template>
  <div class="group flex items-start justify-between gap-3 py-2 px-1 hover:bg-accent/30 transition-colors">
    <div class="min-w-0 flex-1">
      <p class="text-sm font-medium leading-tight">{{ mission.title }}</p>
      <p v-if="mission.startDate" class="text-xs text-muted-foreground mt-0.5">
        {{ mission.startDate }} – {{ mission.endDate ?? 'en cours' }}
      </p>

      <!-- Domains with level dots -->
      <div v-if="mission.domains?.length" class="flex flex-col flex-wrap gap-x-3 gap-y-1 mt-1.5">
        <span
          v-for="d in mission.domains"
          :key="d.name"
          class="text-xs text-muted-foreground flex items-center gap-1"
        >
          <span class="text-blue-500/80 font-medium">{{ d.name }}</span>
          <span class="tracking-tighter text-blue-400/60 font-mono text-[10px]">{{ levelDots(d.level) }}</span>
        </span>
      </div>

      <!-- Skills with level dots -->
      <div v-if="mission.skills?.length" class="flex flex-wrap gap-x-3 gap-y-1 mt-1">
        <span
          v-for="s in mission.skills"
          :key="s.name"
          class="text-xs text-muted-foreground flex items-center gap-1 border border-muted/50 rounded px-1.5 py-1"
        >
          <span class="font-medium">{{ s.name }}</span>
        </span>
      </div>
    </div>

    <!-- Action buttons (hover) -->
    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pt-0.5">
      <Button size="sm" variant="ghost" class="h-6 w-6 p-0 text-muted-foreground" @click="emit('edit')">
        <Icon name="lucide:pencil" class="w-3 h-3" />
      </Button>
      <Button size="sm" variant="ghost" class="h-6 w-6 p-0 text-destructive" @click="emit('delete')">
        <Icon name="lucide:trash-2" class="w-3 h-3" />
      </Button>
    </div>
  </div>
</template>
