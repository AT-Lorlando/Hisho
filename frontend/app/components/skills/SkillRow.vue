<script setup lang="ts">
import type { Skill } from '~/types/content'

defineProps<{ skill: Skill }>()
const emit = defineEmits<{ edit: []; delete: [] }>()
</script>

<template>
  <div class="group flex items-center justify-between gap-3 py-2 px-3 rounded-lg hover:bg-accent/30 transition-colors">
    <div class="flex items-center gap-3 min-w-0 flex-1">
      <span class="text-sm font-medium truncate">{{ skill.title }}</span>
      <span v-if="skill.yearsOfExperience" class="text-xs text-muted-foreground shrink-0">
        {{ skill.yearsOfExperience }} an{{ skill.yearsOfExperience > 1 ? 's' : '' }}
      </span>
    </div>
    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
      <Button size="sm" variant="ghost" class="h-6 w-6 p-0 text-muted-foreground" @click="emit('edit')">
        <Icon name="lucide:pencil" class="w-3 h-3" />
      </Button>
      <Button size="sm" variant="ghost" class="h-6 w-6 p-0 text-destructive" @click="emit('delete')">
        <Icon name="lucide:trash-2" class="w-3 h-3" />
      </Button>
    </div>
  </div>
</template>
