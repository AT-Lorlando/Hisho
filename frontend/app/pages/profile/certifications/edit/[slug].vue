<script setup lang="ts">
import type { Certification, CertificationPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const route = useRoute()
const slug = route.params.slug as string

const { data: certification } = await useAsyncData<Certification>(
  `certification-${slug}`,
  () => $fetch<Certification>(`/api/v1/certifications/${slug}`)
)

if (!certification.value) await navigateTo('/profile/certifications')

const { update, error } = useContentFile('certifications')

async function handleSubmit(data: CertificationPayload) {
  await update(slug, data)
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
      <span class="text-foreground">{{ certification?.title }}</span>
    </nav>
    <h1 class="text-2xl font-bold mb-6">Modifier la certification</h1>
    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>
    <CertificationForm :initial="certification" @submit="handleSubmit" @cancel="navigateTo('/profile/certifications')" />
  </div>
</template>
