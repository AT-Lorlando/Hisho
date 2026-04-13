<script setup lang="ts">
import type { ExperiencePayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { create, isLoading, error } = useContentFile('experiences')

async function handleSubmit(data: ExperiencePayload) {
  const { slug } = await create(data)
  await navigateTo(`/profile/experiences`)
}
</script>

<template>
  <div class="p-8 max-w-3xl">
    <nav class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <NuxtLink to="/profile/identity" class="hover:text-foreground">Mon profil</NuxtLink>
      <span>/</span>
      <NuxtLink to="/profile/experiences" class="hover:text-foreground">Expériences</NuxtLink>
      <span>/</span>
      <span class="text-foreground">Nouvelle expérience</span>
    </nav>

    <h1 class="text-2xl font-bold mb-6">Nouvelle expérience</h1>

    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>

    <ExperienceForm @submit="handleSubmit" @cancel="navigateTo('/profile/experiences')" />
  </div>
</template>
