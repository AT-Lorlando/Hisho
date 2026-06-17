<!-- frontend/app/pages/users/index.vue -->
<script setup lang="ts">
definePageMeta({ auth: false })

const { data: users, error } = await useFetch<
  { id: number; fullName: string | null; title?: string | null; location?: string | null }[]
>('/api/v1/users')
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <header class="mb-8">
      <h1 class="text-3xl font-bold">Profils</h1>
      <p class="mt-1 text-muted-foreground">Choisis un portfolio et discute avec l'IA à son sujet.</p>
    </header>

    <div v-if="error" class="border-t border-border p-8 text-center text-sm text-muted-foreground italic">
      Impossible de charger la liste des profils.
    </div>

    <div v-else-if="!users || users.length === 0" class="border-t border-border p-8 text-center text-sm text-muted-foreground italic">
      Aucun profil pour l'instant.
      <NuxtLink to="/register" class="text-primary hover:underline">Crée le premier</NuxtLink>.
    </div>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ProfileCard v-for="user in users" :key="user.id" :user="user" />
    </div>
  </div>
</template>
