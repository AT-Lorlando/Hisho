<script setup lang="ts">
import type { Mission } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { data: missions, refresh } = await useAsyncData<Mission[]>(
  'missions-perso',
  () => $fetch<Mission[]>('/api/v1/missions?type=perso'),
  { default: () => [] }
)

const { remove } = useContentFile('missions')

async function handleDelete(slug: string) {
  if (!confirm('Supprimer ce projet ?')) return
  await remove(slug)
  await refresh()
}
</script>

<template>
  <div class="p-8 max-w-4xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Projets perso</h1>
      <Button as-child size="sm">
        <NuxtLink to="/profile/missions/new?type=perso">
          <Icon name="lucide:plus" class="w-4 h-4 mr-1" /> Nouveau projet
        </NuxtLink>
      </Button>
    </div>

    <div v-if="!missions?.length" class="text-sm text-muted-foreground py-12 text-center">
      Aucun projet perso encore.
      <NuxtLink to="/profile/missions/new?type=perso" class="text-primary underline ml-1">Créer le premier</NuxtLink>
    </div>

    <div class="space-y-3">
      <div
        v-for="mission in missions"
        :key="mission.slug"
        class="border border-border rounded-lg p-4 group hover:bg-accent/20 transition-colors"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <h2 class="font-semibold text-sm">{{ mission.title }}</h2>
            <p v-if="mission.startDate" class="text-xs text-muted-foreground mt-0.5">
              {{ mission.startDate }} – {{ mission.endDate ?? 'en cours' }}
            </p>
            <div v-if="mission.domains?.length || mission.skills?.length" class="flex flex-wrap gap-1 mt-2">
              <span
                v-for="d in mission.domains"
                :key="`d-${d}`"
                class="text-xs bg-blue-500/10 text-blue-600 rounded px-1.5 py-0.5"
              >{{ d }}</span>
              <span
                v-for="s in mission.skills"
                :key="`s-${s}`"
                class="text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5"
              >{{ s }}</span>
            </div>
            <p v-if="mission.body" class="text-xs text-muted-foreground mt-2 line-clamp-2">{{ mission.body }}</p>
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button
              size="sm" variant="ghost"
              class="h-7 px-2 text-muted-foreground"
              @click="navigateTo(`/profile/missions/edit/${mission.slug}`)"
            >
              <Icon name="lucide:pencil" class="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm" variant="ghost"
              class="h-7 px-2 text-destructive"
              @click="handleDelete(mission.slug)"
            >
              <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
