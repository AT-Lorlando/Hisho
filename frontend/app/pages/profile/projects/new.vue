<script setup lang="ts">
import type { ProjectPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { create, error } = useContentFile('projects')

async function handleSubmit(data: ProjectPayload) {
  await create(data)
  await navigateTo('/profile/projects')
}
</script>

<template>
  <div class="p-8 max-w-3xl">
    <nav class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <NuxtLink to="/profile/identity" class="hover:text-foreground">Mon profil</NuxtLink>
      <span>/</span>
      <NuxtLink to="/profile/projects" class="hover:text-foreground">Projets</NuxtLink>
      <span>/</span>
      <span class="text-foreground">Nouveau projet</span>
    </nav>
    <h1 class="text-2xl font-bold mb-6">Nouveau projet</h1>
    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>
    <ProjectForm @submit="handleSubmit" @cancel="navigateTo('/profile/projects')" />
  </div>
</template>
