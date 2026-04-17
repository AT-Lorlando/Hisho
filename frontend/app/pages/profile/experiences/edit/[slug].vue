<script setup lang="ts">
import type { Experience, ExperiencePayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const route = useRoute()
const slug = route.params.slug as string

const { data: experience } = await useAsyncData<Experience>(
  `experience-${slug}`,
  () => queryCollection('experiences').where('slug', '=', slug).first() as Promise<Experience>
)

if (!experience.value) {
  await navigateTo('/profile/experiences')
}

const { update, isLoading, error } = useContentFile('experiences')

async function handleSubmit(data: ExperiencePayload) {
  await update(slug, data)
  await navigateTo(`/profile/experiences/${slug}`)
}
</script>

<template>
  <div class="p-8 max-w-3xl">
    <nav class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <NuxtLink to="/profile/identity" class="hover:text-foreground">Mon profil</NuxtLink>
      <span>/</span>
      <NuxtLink to="/profile/experiences" class="hover:text-foreground">Expériences pro</NuxtLink>
      <span>/</span>
      <NuxtLink :to="`/profile/experiences/${slug}`" class="hover:text-foreground">{{ experience?.title }}</NuxtLink>
      <span>/</span>
      <span class="text-foreground">Modifier</span>
    </nav>

    <h1 class="text-2xl font-bold mb-6">Modifier l'expérience</h1>

    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>

    <ExperienceForm
      :initial="experience"
      @submit="handleSubmit"
      @cancel="navigateTo(`/profile/experiences/${slug}`)"
    />
  </div>
</template>
