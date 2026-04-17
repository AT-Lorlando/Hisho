<script setup lang="ts">
import type { Mission, MissionPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const route = useRoute()
const typeParam = (route.query.type as string) ?? 'pro'
const experienceParam = (route.query.experience as string) ?? ''

const initial = computed<Partial<Mission>>(() => ({
  type: typeParam as 'pro' | 'perso',
  experience: experienceParam || undefined,
}))

const { create, isLoading, error } = useContentFile('missions')

async function handleSubmit(data: MissionPayload) {
  try {
    await create(data)
    if (experienceParam) {
      await navigateTo(`/profile/experiences/${experienceParam}`)
    } else {
      await navigateTo('/profile/missions/perso')
    }
  } catch {
    // error is set in error.value by useContentFile
  }
}

function handleCancel() {
  if (experienceParam) {
    navigateTo(`/profile/experiences/${experienceParam}`)
  } else {
    navigateTo('/profile/missions/perso')
  }
}

const backLabel = experienceParam ? 'Expérience' : 'Projets perso'
const backPath = experienceParam ? `/profile/experiences/${experienceParam}` : '/profile/missions/perso'
</script>

<template>
  <div class="p-8 max-w-3xl">
    <nav class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <NuxtLink to="/profile/identity" class="hover:text-foreground">Mon profil</NuxtLink>
      <span>/</span>
      <NuxtLink :to="backPath" class="hover:text-foreground">{{ backLabel }}</NuxtLink>
      <span>/</span>
      <span class="text-foreground">Nouvelle mission</span>
    </nav>

    <h1 class="text-2xl font-bold mb-6">
      {{ typeParam === 'perso' ? 'Nouveau projet perso' : 'Nouvelle mission pro' }}
    </h1>

    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>

    <MissionForm :initial="initial as any" @submit="handleSubmit" @cancel="handleCancel" />
  </div>
</template>
