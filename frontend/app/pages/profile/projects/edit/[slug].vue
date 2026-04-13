<script setup lang="ts">
import type { Project, ProjectPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const route = useRoute()
const slug = route.params.slug as string

const { data: project } = await useAsyncData<Project>(
  `project-${slug}`,
  () => queryCollection('projects').where('slug', '=', slug).first() as Promise<Project>
)

if (!project.value) await navigateTo('/profile/projects')

const { update, error } = useContentFile('projects')

async function handleSubmit(data: ProjectPayload) {
  await update(slug, data)
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
      <span class="text-foreground">{{ project?.title }}</span>
    </nav>
    <h1 class="text-2xl font-bold mb-6">Modifier le projet</h1>
    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>
    <ProjectForm :initial="project" @submit="handleSubmit" @cancel="navigateTo('/profile/projects')" />
  </div>
</template>
