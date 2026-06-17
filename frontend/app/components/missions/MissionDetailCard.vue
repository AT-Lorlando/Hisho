<!-- frontend/app/components/missions/MissionDetailCard.vue -->
<script setup lang="ts">
import type { Mission, SkillEntry } from '~/types/content'

const props = withDefaults(defineProps<{ mission: Mission; readonly?: boolean }>(), {
  readonly: false,
})
const emit = defineEmits<{ edit: []; delete: [] }>()

function levelStars(level: number): string {
  return '★'.repeat(level) + '☆'.repeat(5 - level)
}

// Group skills under their domain by NAME; skills with no/unknown domain go to "Autres".
const groups = computed(() => {
  const domains = props.mission.domains ?? []
  const skills = props.mission.skills ?? []
  const domainNames = new Set(domains.map((d) => d.name))
  const result: { name: string; level: number | null; skills: SkillEntry[] }[] = domains.map((d) => ({
    name: d.name,
    level: d.level,
    skills: skills.filter((s) => s.domain === d.name),
  }))
  const others = skills.filter((s) => !s.domain || !domainNames.has(s.domain))
  if (others.length) result.push({ name: 'Autres', level: null, skills: others })
  return result
})
</script>

<template>
  <div class="group flex items-start justify-between gap-4 rounded-2xl border border-border/50 bg-card/60 p-4 transition-all hover:border-primary/20 hover:bg-accent/20">
    <div class="min-w-0 flex-1 space-y-4">
      <div>
        <h3 class="text-sm font-semibold leading-tight text-foreground">{{ mission.title }}</h3>
        <p v-if="mission.startDate" class="mt-1 text-xs text-muted-foreground">
          {{ mission.startDate }} – {{ mission.endDate ?? 'En cours' }}
        </p>
      </div>

      <div v-if="groups.length" class="space-y-3">
        <div v-for="g in groups" :key="g.name" class="rounded-xl border border-border/40 bg-background/40 p-3">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-blue-400">{{ g.name }}</span>
          </div>
          <div v-if="g.skills.length" class="mt-3 flex flex-wrap gap-2">
            <div
              v-for="skill in g.skills"
              :key="skill.name"
              class="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/30 px-2.5 py-1.5"
            >
              <span class="text-xs font-medium text-foreground">{{ skill.name }}</span>
              <span class="font-mono text-[10px] tracking-tight text-yellow-400">{{ levelStars(skill.level) }}</span>
            </div>
          </div>
          <p v-else class="mt-2 text-xs italic text-muted-foreground">Aucun skill associé</p>
        </div>
      </div>

      <p v-if="mission.body" class="text-xs leading-relaxed text-muted-foreground">{{ mission.body }}</p>
    </div>

    <div v-if="!readonly" class="flex shrink-0 gap-1 pt-0.5 opacity-0 transition-opacity group-hover:opacity-100">
      <Button size="sm" variant="ghost" class="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" @click="emit('edit')">
        <Icon name="lucide:pencil" class="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" class="h-8 w-8 p-0 text-destructive" @click="emit('delete')">
        <Icon name="lucide:trash-2" class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>
