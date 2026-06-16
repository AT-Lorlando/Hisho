<script setup lang="ts">
import type { Mission, MissionPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { data: missions, refresh } = await useAsyncData<Mission[]>(
  'all-missions-perso',
  () => $fetch<Mission[]>('/api/v1/missions', { query: { type: 'perso' } }),
  { default: () => [] as Mission[] }
)

const { create, update, remove } = useContentFile('missions')

const isCreating = ref(false)
const editingSlug = ref<string | null>(null)

function startCreate() {
  editingSlug.value = null
  isCreating.value = true
}

async function handleCreate(data: MissionPayload) {
  await create(data)
  await refresh()
  isCreating.value = false
}

async function handleUpdate(slug: string, data: MissionPayload) {
  await update(slug, data)
  await refresh()
  editingSlug.value = null
}

async function handleDelete(slug: string) {
  if (!confirm('Supprimer ce projet ?')) return
  await remove(slug)
  await refresh()
}
</script>

<template>
  <div class="p-8 max-w-3xl space-y-4">
    <h1 class="text-2xl font-bold mb-6">Projets perso</h1>

    <template v-for="mission in missions" :key="mission.slug">
      <div v-if="editingSlug === mission.slug" class="border border-primary/40 rounded-xl p-5 bg-accent/10">
        <h2 class="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">Modifier le projet</h2>
        <MissionsMissionForm
          :initial="mission"
          @submit="(d) => handleUpdate(mission.slug, d)"
          @cancel="editingSlug = null"
        />
      </div>
      <MissionsMissionDetailCard
        v-else
        :mission="mission"
        @edit="() => { isCreating = false; editingSlug = mission.slug }"
        @delete="handleDelete(mission.slug)"
      />
    </template>

    <p v-if="!missions.length && !isCreating" class="text-sm text-muted-foreground text-center py-4">
      Aucun projet perso encore.
    </p>

    <div v-if="isCreating" class="border border-primary/40 rounded-xl p-5 bg-accent/10">
      <h2 class="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">Nouveau projet</h2>
      <MissionsMissionForm @submit="handleCreate" @cancel="isCreating = false" />
    </div>

    <div
      v-if="!isCreating"
      class="border border-dashed border-border rounded-xl p-5 flex items-center justify-center gap-2 text-sm text-muted-foreground cursor-pointer hover:border-primary/40 hover:text-primary transition-colors"
      @click="startCreate"
    >
      <Icon name="lucide:plus" class="w-4 h-4" />
      <span>Nouveau projet</span>
    </div>
  </div>
</template>
