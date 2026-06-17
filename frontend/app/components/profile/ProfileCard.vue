<!-- frontend/app/components/profile/ProfileCard.vue -->
<script setup lang="ts">
defineProps<{
  user: {
    id: number
    fullName?: string | null
    title?: string | null
    location?: string | null
  }
}>()
</script>

<template>
  <NuxtLink
    :to="`/users/${user.id}`"
    class="group block border border-border border-l-2 border-l-transparent bg-card p-5 transition-colors hover:border-l-primary hover:bg-accent/30"
  >
    <div class="flex items-center gap-3">
      <UserAvatar :name="user.fullName" size="md" />
      <div class="min-w-0">
        <p class="truncate font-serif font-semibold">{{ user.fullName ?? 'Utilisateur' }}</p>
        <p v-if="user.title" class="truncate text-sm text-muted-foreground">{{ user.title }}</p>
      </div>
    </div>
    <p v-if="user.location" class="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon name="lucide:map-pin" class="h-3.5 w-3.5" />
      {{ user.location }}
    </p>
    <p class="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary">
      <Icon name="lucide:message-circle" class="h-4 w-4" />
      Discuter avec l'IA
      <Icon name="lucide:arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </p>
  </NuxtLink>
</template>
