<script setup lang="ts">
import type { Experience, Mission } from '~/types/content'

definePageMeta({ layout: 'profile' })

const route = useRoute()
const slug = route.params.slug as string

const { data: experience } = await useAsyncData<Experience>(
  `experience-detail-${slug}`,
  () => $fetch<Experience>(`/api/v1/experiences/${slug}`)
)

if (!experience.value) {
  await navigateTo('/profile/experiences')
}

const { data: missions, refresh: refreshMissions } = await useAsyncData<Mission[]>(
  `missions-of-${slug}`,
  () => $fetch<Mission[]>(`/api/v1/missions?experience=${slug}`),
  { default: () => [] }
)

const { remove: removeMission } = useContentFile('missions')

async function handleDeleteMission(mslug: string) {
  if (!confirm('Supprimer cette mission ?')) return
  await removeMission(mslug)
  await refreshMissions()
}

function typeLabel(type?: string) {
  const map: Record<string, string> = {
    cdi: 'CDI', cdd: 'CDD', freelance: 'Freelance',
    alternance: 'Alternance', stage: 'Stage',
  }
  return type ? (map[type] ?? type) : ''
}
</script>

<template>
  <div class="p-8 max-w-4xl">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <NuxtLink to="/profile/identity" class="hover:text-foreground">Mon profil</NuxtLink>
      <span>/</span>
      <NuxtLink to="/profile/experiences" class="hover:text-foreground">Expériences pro</NuxtLink>
      <span>/</span>
      <span class="text-foreground">{{ experience?.title }}</span>
    </nav>

    <!-- En-tête employeur -->
    <div class="border border-border rounded-lg p-6 mb-8">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <h1 class="text-2xl font-bold">{{ experience?.title }}</h1>
            <span
              v-if="experience?.type"
              class="text-xs bg-primary/10 text-primary rounded px-2 py-0.5 font-medium"
            >{{ typeLabel(experience.type) }}</span>
          </div>
          <p v-if="experience?.role" class="text-muted-foreground">{{ experience.role }}</p>
          <p v-if="experience?.client" class="text-sm text-muted-foreground mt-1">
            <Icon name="lucide:building" class="w-3.5 h-3.5 inline mr-1" />{{ experience.client }}
          </p>
          <div class="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span v-if="experience?.startDate">
              <Icon name="lucide:calendar" class="w-3.5 h-3.5 inline mr-1" />
              {{ experience.startDate }} – {{ experience.endDate ?? 'en cours' }}
            </span>
            <span v-if="experience?.location">
              <Icon name="lucide:map-pin" class="w-3.5 h-3.5 inline mr-1" />{{ experience.location }}
            </span>
          </div>
        </div>
        <Button as-child size="sm" variant="outline">
          <NuxtLink :to="`/profile/experiences/edit/${slug}`">
            <Icon name="lucide:pencil" class="w-3.5 h-3.5 mr-1" /> Modifier
          </NuxtLink>
        </Button>
      </div>
      <div v-if="experience?.body" class="mt-4 pt-4 border-t border-border text-sm text-muted-foreground whitespace-pre-wrap">
        {{ experience.body }}
      </div>
    </div>

    <!-- Section missions -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="font-semibold text-lg">Missions</h2>
      <Button as-child size="sm">
        <NuxtLink :to="`/profile/missions/new?experience=${slug}&type=pro`">
          <Icon name="lucide:plus" class="w-4 h-4 mr-1" /> Ajouter une mission
        </NuxtLink>
      </Button>
    </div>

    <div v-if="!missions?.length" class="text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-lg">
      Aucune mission encore pour cette expérience.
      <NuxtLink :to="`/profile/missions/new?experience=${slug}&type=pro`" class="text-primary underline ml-1">
        Ajouter la première
      </NuxtLink>
    </div>

    <div class="space-y-3">
      <div
        v-for="mission in missions"
        :key="mission.slug"
        class="border border-border rounded-lg p-4 group hover:bg-accent/20 transition-colors"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <h3 class="font-medium text-sm">{{ mission.title }}</h3>
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
              @click="handleDeleteMission(mission.slug)"
            >
              <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
