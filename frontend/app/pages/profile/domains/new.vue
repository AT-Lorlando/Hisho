<script setup lang="ts">
import type { DomainPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { create, error } = useContentFile('domains')

async function handleSubmit(data: DomainPayload) {
  await create(data)
  await navigateTo('/profile/domains')
}
</script>

<template>
  <div class="p-8 max-w-3xl">
    <nav class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <NuxtLink to="/profile" class="hover:text-foreground">Mon profil</NuxtLink>
      <span>/</span>
      <NuxtLink to="/profile/domains" class="hover:text-foreground">Domaines</NuxtLink>
      <span>/</span>
      <span class="text-foreground">Nouveau domaine</span>
    </nav>
    <h1 class="text-2xl font-bold mb-6">Nouveau domaine</h1>
    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>
    <DomainForm @submit="handleSubmit" @cancel="navigateTo('/profile/domains')" />
  </div>
</template>
