<script setup lang="ts">
import type { SkillPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { create, error } = useContentFile('skills')

async function handleSubmit(data: SkillPayload) {
  await create(data)
  await navigateTo('/profile/skills')
}
</script>

<template>
  <div class="p-8 max-w-3xl">
    <nav class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <NuxtLink to="/profile/identity" class="hover:text-foreground">Mon profil</NuxtLink>
      <span>/</span>
      <NuxtLink to="/profile/skills" class="hover:text-foreground">Compétences</NuxtLink>
      <span>/</span>
      <span class="text-foreground">Nouvelle compétence</span>
    </nav>
    <h1 class="text-2xl font-bold mb-6">Nouvelle compétence</h1>
    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>
    <SkillForm @submit="handleSubmit" @cancel="navigateTo('/profile/skills')" />
  </div>
</template>
