<script setup lang="ts">
import type { Skill, SkillPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const route = useRoute()
const slug = route.params.slug as string

const { data: skill } = await useAsyncData<Skill>(
  `skill-${slug}`,
  () => queryCollection('skills').where('slug', '=', slug).first() as Promise<Skill>
)

if (!skill.value) await navigateTo('/profile/skills')

const { update, error } = useContentFile('skills')

async function handleSubmit(data: SkillPayload) {
  await update(slug, data)
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
      <span class="text-foreground">{{ skill?.title }}</span>
    </nav>
    <h1 class="text-2xl font-bold mb-6">Modifier la compétence</h1>
    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>
    <SkillForm :initial="skill" @submit="handleSubmit" @cancel="navigateTo('/profile/skills')" />
  </div>
</template>
