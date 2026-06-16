<!-- frontend/app/components/skills/SkillRow.vue -->
<script setup lang="ts">
import type { Skill } from '~/types/content'

defineProps<{ skill: Skill }>()
const emit = defineEmits<{ edit: []; delete: [] }>()
</script>

<template>
  <div class="group relative rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
    <div class="flex items-start justify-between gap-2">
      <span class="min-w-0 truncate font-medium">{{ skill.title }}</span>
      <div class="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button size="sm" variant="ghost" class="h-6 w-6 p-0 text-muted-foreground" @click="emit('edit')">
          <Icon name="lucide:pencil" class="h-3 w-3" />
        </Button>
        <Button size="sm" variant="ghost" class="h-6 w-6 p-0 text-destructive" @click="emit('delete')">
          <Icon name="lucide:trash-2" class="h-3 w-3" />
        </Button>
      </div>
    </div>

    <div v-if="skill.level" class="mt-3">
      <div class="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>Niveau</span>
        <span class="font-medium text-foreground">{{ skill.level }}/5</span>
      </div>
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div class="h-full rounded-full bg-primary transition-all" :style="{ width: `${(skill.level / 5) * 100}%` }" />
      </div>
    </div>
    <p v-else class="mt-3 text-xs italic text-muted-foreground">Niveau non défini</p>

    <p v-if="skill.yearsOfExperience" class="mt-2 text-xs text-muted-foreground">
      {{ skill.yearsOfExperience }} an{{ skill.yearsOfExperience > 1 ? 's' : '' }} d'expérience
    </p>
  </div>
</template>
