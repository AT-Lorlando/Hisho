<!-- frontend/app/components/guest/GuestHeader.vue -->
<script setup lang="ts">
const { isAuthenticated, user } = useAuth()
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-border bg-background">
    <div class="container mx-auto flex h-14 items-center justify-between px-4">
      <NuxtLink to="/" class="flex items-center gap-2 font-serif text-lg font-semibold">
        <span
          class="inline-flex h-7 w-7 items-center justify-center bg-primary font-serif text-sm text-primary-foreground"
        >秘</span>
        Hisho
      </NuxtLink>

      <nav class="flex items-center gap-2">
        <Button as-child variant="ghost" size="sm">
          <NuxtLink to="/users">Profils</NuxtLink>
        </Button>

        <Button v-if="isAuthenticated" as-child variant="ghost" size="sm">
          <NuxtLink to="/profile" class="flex items-center gap-2">
            <UserAvatar :name="user?.fullName ?? user?.email" size="sm" />
            <span class="hidden sm:inline">Mon profil</span>
          </NuxtLink>
        </Button>

        <template v-else>
          <Button as-child variant="ghost" size="sm">
            <NuxtLink to="/login">Connexion</NuxtLink>
          </Button>
          <Button as-child size="sm">
            <NuxtLink to="/register">S'inscrire</NuxtLink>
          </Button>
        </template>
      </nav>
    </div>
  </header>
</template>
