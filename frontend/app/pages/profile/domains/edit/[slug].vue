<script setup lang="ts">
import type { Domain, DomainPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const route = useRoute()
const slug = route.params.slug as string

const { data: domain } = await useAsyncData<Domain>(
  `domain-${slug}`,
  () => queryCollection('domains').where('slug', '=', slug).first() as Promise<Domain>
)

if (!domain.value) await navigateTo('/profile/domains')

const { update, error } = useContentFile('domains')

async function handleSubmit(data: DomainPayload) {
  await update(slug, data)
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
      <span class="text-foreground">{{ domain?.title }}</span>
    </nav>
    <h1 class="text-2xl font-bold mb-6">Modifier le domaine</h1>
    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>
    <DomainForm :initial="domain" @submit="handleSubmit" @cancel="navigateTo('/profile/domains')" />
  </div>
</template>
