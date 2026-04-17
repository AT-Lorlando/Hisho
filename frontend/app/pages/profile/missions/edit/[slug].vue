<script setup lang="ts">
import type { Mission, MissionPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const route = useRoute()
const slug = route.params.slug as string

const { data: mission } = await useAsyncData<Mission>(
  `mission-edit-${slug}`,
  () => queryCollection('missions').where('slug', '=', slug).first() as Promise<Mission>
)

if (!mission.value) {
  await navigateTo('/profile/missions/perso')
}

const { update, isLoading, error } = useContentFile('missions')

async function handleSubmit(data: MissionPayload) {
  try {
    await update(slug, data)
    if (mission.value?.experience) {
      await navigateTo(`/profile/experiences/${mission.value.experience}`)
    } else {
      await navigateTo('/profile/missions/perso')
    }
  } catch {
    // error is set in error.value by useContentFile
  }
}

function handleCancel() {
  if (mission.value?.experience) {
    navigateTo(`/profile/experiences/${mission.value.experience}`)
  } else {
    navigateTo('/profile/missions/perso')
  }
}
</script>

<template>
  <div class="p-8 max-w-3xl">
    <nav class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <NuxtLink to="/profile/identity" class="hover:text-foreground">Mon profil</NuxtLink>
      <span>/</span>
      <NuxtLink
        :to="mission?.experience ? `/profile/experiences/${mission.experience}` : '/profile/missions/perso'"
        class="hover:text-foreground"
      >
        {{ mission?.experience ? 'Expérience' : 'Projets perso' }}
      </NuxtLink>
      <span>/</span>
      <span class="text-foreground">Modifier : {{ mission?.title }}</span>
    </nav>

    <h1 class="text-2xl font-bold mb-6">Modifier la mission</h1>

    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>

    <MissionForm :initial="mission" @submit="handleSubmit" @cancel="handleCancel" />
  </div>
</template>
