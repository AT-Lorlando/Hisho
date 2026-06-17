<script setup lang="ts">
import { Divide } from 'lucide-vue-next';
import type { Experience, Mission, MissionPayload } from '~/types/content'

const props = defineProps<{
  experience: Experience
  missions: Mission[]
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  missionCreate: [data: MissionPayload]
  missionUpdate: [slug: string, data: MissionPayload]
  missionDelete: [slug: string]
}>()

const isAddingMission = ref(false)
const editingMissionSlug = ref<string | null>(null)
const expanded = ref(true)

function startEditMission(slug: string) {
  isAddingMission.value = false
  editingMissionSlug.value = slug
}

function startAddMission() {
  editingMissionSlug.value = null
  isAddingMission.value = true
}

function onMissionCreate(data: MissionPayload) {
  emit('missionCreate', data)
  isAddingMission.value = false
}

function onMissionUpdate(slug: string, data: MissionPayload) {
  emit('missionUpdate', slug, data)
  editingMissionSlug.value = null
}

function onMissionDelete(slug: string) {
  if (!confirm('Supprimer cette mission ?')) return
  emit('missionDelete', slug)
}

const TYPE_LABELS: Record<string, string> = {
  cdi: 'CDI',
  cdd: 'CDD',
  freelance: 'Freelance',
  alternance: 'Alternance',
  stage: 'Stage',
}
</script>

<template>
  <div class="border border-border rounded-xl p-5 bg-card hover:border-border/80 transition-colors">
    <!-- Experience header -->
    <div class="flex items-start justify-between gap-3 mb-1">
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 flex-wrap">
          <h2 class="font-semibold text-base leading-tight">{{ experience.title }}</h2>
          <span
            v-if="experience.type"
            class="text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5 font-medium shrink-0"
          >{{ TYPE_LABELS[experience.type] ?? experience.type }}</span>
        </div>
        <p v-if="experience.role" class="text-sm text-muted-foreground mt-0.5">{{ experience.role }}</p>
        <div class="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
          <span v-if="experience.client" class="flex items-center gap-1">
            <Icon name="lucide:building" class="w-3 h-3" />{{ experience.client }}
          </span>
          <span v-if="experience.startDate">
            <Icon name="lucide:calendar" class="w-3 h-3 inline mr-0.5" />
            {{ experience.startDate }} – {{ experience.endDate ?? 'en cours' }}
          </span>
          <span v-if="experience.location" class="flex items-center gap-1">
            <Icon name="lucide:map-pin" class="w-3 h-3" />{{ experience.location }}
          </span>
        </div>
      </div>

      <!-- Experience actions -->
      <div class="flex gap-1 shrink-0">
        <Button
          size="sm"
          variant="ghost"
          class="h-7 w-7 p-0 text-muted-foreground"
          @click="emit('edit')"
        >
          <Icon name="lucide:pencil" class="w-3.5 h-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          class="h-7 w-7 p-0 text-destructive"
          @click="emit('delete')"
        >
          <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>

    <!-- Missions toggle -->
    <button
      type="button"
      class="mt-3 flex w-full items-center gap-2 border-t border-border/40 pt-3 text-xs font-medium text-muted-foreground hover:text-foreground"
      @click="expanded = !expanded"
    >
      <Icon :name="expanded ? 'lucide:chevron-down' : 'lucide:chevron-right'" class="h-4 w-4" />
      {{ missions.length }} mission{{ missions.length > 1 ? 's' : '' }}
    </button>

    <div v-show="expanded" class="mt-3 divide-y divide-border">
      <!-- Mission rows -->

         <template v-for="m in missions" :key="m.slug">
           <!-- Inline edit form -->
           <div v-if="editingMissionSlug === m.slug" class="rounded-lg border border-primary/40 p-4 bg-accent/10 mb-2">
             <ExperiencesMissionForm
             :initial="m"
             :experience-slug="experience.slug"
             @submit="(d) => onMissionUpdate(m.slug, d)"
             @cancel="editingMissionSlug = null"
             />
            </div>

        <!-- Mission display -->
        <MissionsMissionDetailCard
          v-else
          :mission="m"
          @edit="startEditMission(m.slug)"
          @delete="onMissionDelete(m.slug)"
        />
      </template>

      <!-- Add mission inline form -->
      <div v-if="isAddingMission" class="rounded-lg border border-primary/40 p-4 bg-accent/10 mt-2">
        <ExperiencesMissionForm
          :experience-slug="experience.slug"
          @submit="onMissionCreate"
          @cancel="isAddingMission = false"
        />
      </div>

      <!-- Add mission skeleton row -->
      <div
        v-if="!isAddingMission"
        class="flex items-center gap-2 px-1 py-2 rounded-lg text-xs text-muted-foreground cursor-pointer hover:text-primary hover:bg-accent/30 transition-colors mt-1"
        @click="startAddMission"
      >
        <Icon name="lucide:plus" class="w-3.5 h-3.5" />
        <span>Ajouter une mission</span>
      </div>
    </div>
  </div>
</template>
