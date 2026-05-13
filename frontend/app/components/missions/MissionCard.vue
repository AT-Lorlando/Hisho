<script setup lang="ts">
import type { Mission } from '~/types/content'

defineProps<{ mission: Mission }>()
const emit = defineEmits<{ edit: []; delete: [] }>()

function levelDots(level: number): string {
  return '●'.repeat(level) + '○'.repeat(5 - level)
}
</script>

<template>
  <div class="group border border-border rounded-xl p-5 bg-card hover:border-border/80 transition-colors">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <p class="font-semibold text-base leading-tight">{{ mission.title }}</p>
        <p v-if="mission.startDate" class="text-xs text-muted-foreground mt-0.5">
          {{ mission.startDate }} – {{ mission.endDate ?? 'en cours' }}
        </p>

        <div v-if="mission.domains?.length" class="flex flex-wrap gap-x-3 gap-y-1 mt-2">
          <span
            v-for="d in mission.domains"
            :key="d.name"
            class="text-xs flex items-center gap-1"
          >
            <span class="text-blue-500/80 font-medium">{{ d.name }}</span>
            <span class="tracking-tighter text-blue-400/60 font-mono text-[10px]">{{ levelDots(d.level) }}</span>
          </span>
        </div>

        <div v-if="mission.skills?.length" class="flex flex-wrap gap-x-3 gap-y-1 mt-1">
          <span
            v-for="s in mission.skills"
            :key="s.name"
            class="text-xs text-muted-foreground flex items-center gap-1"
          >
            <span class="font-medium">{{ s.name }}</span>
            <span class="tracking-tighter text-muted-foreground/60 font-mono text-[10px]">{{ levelDots(s.level) }}</span>
          </span>
        </div>
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
  </div>
</template>
