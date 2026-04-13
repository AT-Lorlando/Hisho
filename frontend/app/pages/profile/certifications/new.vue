<script setup lang="ts">
import type { CertificationPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { create, error } = useContentFile('certifications')

async function handleSubmit(data: CertificationPayload) {
  await create(data)
  await navigateTo('/profile/certifications')
}
</script>

<template>
  <div class="p-8 max-w-3xl">
    <nav class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <NuxtLink to="/profile/identity" class="hover:text-foreground">Mon profil</NuxtLink>
      <span>/</span>
      <NuxtLink to="/profile/certifications" class="hover:text-foreground">Certifications</NuxtLink>
      <span>/</span>
      <span class="text-foreground">Nouvelle certification</span>
    </nav>
    <h1 class="text-2xl font-bold mb-6">Nouvelle certification</h1>
    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>
    <CertificationForm @submit="handleSubmit" @cancel="navigateTo('/profile/certifications')" />
  </div>
</template>
