<script setup lang="ts">
import type { Experience, ExperiencePayload, Mission, MissionPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { items: experiences, refresh: refreshExperiences } = useContent<Experience>('experiences')
const { data: allMissions, refresh: refreshMissions } = await useAsyncData<Mission[]>(
  'all-missions',
  () => $fetch<Mission[]>('/api/v1/missions'),
  { default: () => [] as Mission[] }
)

const { create: createExperience, update: updateExperience, remove: removeExperience } =
  useContentFile('experiences')
const { create: createMission, update: updateMission, remove: removeMission } =
  useContentFile('missions')

const isCreating = ref(false)
const editingSlug = ref<string | null>(null)

const missionsByExp = computed(() => {
  const map: Record<string, Mission[]> = {}
  for (const m of allMissions.value ?? []) {
    if (m.experience) {
      if (!map[m.experience]) map[m.experience] = []
      map[m.experience].push(m)
    }
  }
  return map
})

function startCreate() {
  editingSlug.value = null
  isCreating.value = true
}

async function handleCreate(data: ExperiencePayload) {
  await createExperience(data)
  await refreshExperiences()
  isCreating.value = false
}

async function handleUpdate(slug: string, data: ExperiencePayload) {
  await updateExperience(slug, data)
  await refreshExperiences()
  editingSlug.value = null
}

async function handleDelete(slug: string) {
  if (!confirm('Supprimer cette expérience et toutes ses missions ?')) return
  await removeExperience(slug)
  await refreshExperiences()
  await refreshMissions()
}

async function handleMissionCreate(data: MissionPayload) {
  await createMission(data)
  await refreshMissions()
}

async function handleMissionUpdate(mslug: string, data: MissionPayload) {
  await updateMission(mslug, data)
  await refreshMissions()
}

async function handleMissionDelete(mslug: string) {
  await removeMission(mslug)
  await refreshMissions()
}
</script>

<template>
  <div class="p-8 max-w-3xl space-y-4">
    <h1 class="text-2xl font-bold mb-6">Expériences pro</h1>

    <!-- Global timeline -->
    <ExperiencesExperienceTimeline
      :experiences="experiences ?? []"
      :missions-by-exp="missionsByExp"
    />

    <!-- Experience cards -->
    <template v-for="exp in experiences" :key="exp.slug">
      <!-- Inline edit form -->
      <div v-if="editingSlug === exp.slug" class="border border-primary/40 rounded p-5 bg-accent/10">
        <h2 class="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">
          Modifier l'expérience
        </h2>
        <ExperiencesExperienceForm
          :initial="exp"
          @submit="(d) => handleUpdate(exp.slug, d)"
          @cancel="editingSlug = null"
        />
      </div>

      <!-- Experience card with inline missions -->
      <ExperiencesExperienceCard
        v-else
        :experience="exp"
        :missions="missionsByExp[exp.slug] ?? []"
        @edit="() => { isCreating = false; editingSlug = exp.slug }"
        @delete="handleDelete(exp.slug)"
        @mission-create="handleMissionCreate"
        @mission-update="handleMissionUpdate"
        @mission-delete="handleMissionDelete"
      />
    </template>

    <!-- Empty state -->
    <p
      v-if="!experiences?.length && !isCreating"
      class="text-sm text-muted-foreground text-center py-4"
    >
      Aucune expérience encore.
    </p>

    <!-- Create form inline -->
    <div v-if="isCreating" class="border border-primary/40 rounded p-5 bg-accent/10">
      <h2 class="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">
        Nouvelle expérience
      </h2>
      <ExperiencesExperienceForm
        @submit="handleCreate"
        @cancel="isCreating = false"
      />
    </div>

    <!-- Skeleton "new experience" card -->
    <div
      v-if="!isCreating"
      class="border border-border rounded p-5 flex items-center justify-center gap-2 text-sm text-muted-foreground cursor-pointer transition-colors hover:border-primary"
      @click="startCreate"
    >
      <Icon name="lucide:plus" class="w-4 h-4" />
      <span>Nouvelle expérience</span>
    </div>
  </div>
</template>
