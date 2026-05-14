<script setup lang="ts">
definePageMeta({ auth: false })

const { data: users, error } = await useFetch<any[]>('/api/v1/users')
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Portfolios</h1>

    <div v-if="error" class="text-destructive">
      Impossible de charger la liste des utilisateurs.
    </div>

    <p v-else-if="!users || users.length === 0" class="text-muted-foreground">
      Aucun utilisateur trouvé.
    </p>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="user in users"
        :key="user.id"
        :to="`/users/${user.id}`"
        class="block border rounded-lg p-4 hover:bg-muted transition-colors"
      >
        <p class="font-semibold text-lg">{{ user.fullName ?? 'Utilisateur' }}</p>
        <p v-if="user.title" class="text-sm text-muted-foreground">{{ user.title }}</p>
        <p v-if="user.location" class="text-xs text-muted-foreground mt-1">{{ user.location }}</p>
      </NuxtLink>
    </div>
  </div>
</template>
