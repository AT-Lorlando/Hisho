<!-- frontend/app/pages/index.vue -->
<script setup lang="ts">
definePageMeta({ auth: false })

const { isAuthenticated } = useAuth()
if (isAuthenticated.value) {
  await navigateTo('/profile')
}

const { data: users, error } = await useFetch<
  { id: number; fullName: string | null; title?: string | null; location?: string | null }[]
>('/api/v1/users')

const featured = computed(() => (users.value ?? []).slice(0, 6))

const steps = [
  { icon: 'lucide:user-search', title: 'Choisis un profil', text: "Parcours les portfolios publics et ouvre celui qui t'intéresse." },
  { icon: 'lucide:message-circle', title: 'Pose tes questions', text: "Interroge l'assistant sur les expériences, compétences et projets." },
  { icon: 'lucide:badge-check', title: 'Réponses factuelles', text: "L'IA répond uniquement à partir des données réelles du profil." },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden border-b border-border">
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
      <div class="container relative mx-auto px-4 py-20 text-center">
        <h1 class="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
          Explorez des portfolios <span class="text-primary">augmentés par l'IA</span>
        </h1>
        <p class="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Posez vos questions sur un profil — l'assistant répond à partir de ses expériences,
          compétences et projets réels.
        </p>
        <div class="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button as-child size="lg">
            <NuxtLink to="/users">Explorer les profils</NuxtLink>
          </Button>
          <Button as-child size="lg" variant="outline">
            <NuxtLink to="/register">Créer mon profil</NuxtLink>
          </Button>
        </div>
      </div>
    </section>

    <!-- Featured profiles -->
    <section class="container mx-auto px-4 py-16">
      <div class="mb-8 flex items-end justify-between">
        <div>
          <h2 class="text-2xl font-bold">Profils à explorer</h2>
          <p class="text-sm text-muted-foreground">Choisis un profil et discute avec l'IA à son sujet.</p>
        </div>
        <Button as-child variant="ghost" size="sm">
          <NuxtLink to="/users">Voir tout</NuxtLink>
        </Button>
      </div>

      <div v-if="error" class="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        Impossible de charger les profils pour le moment.
      </div>
      <div v-else-if="featured.length === 0" class="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        Aucun profil pour l'instant. <NuxtLink to="/register" class="text-primary hover:underline">Crée le premier</NuxtLink>.
      </div>
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProfileCard v-for="u in featured" :key="u.id" :user="u" />
      </div>
    </section>

    <!-- How it works -->
    <section class="border-t border-border bg-muted/30">
      <div class="container mx-auto px-4 py-16">
        <h2 class="mb-10 text-center text-2xl font-bold">Comment ça marche</h2>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div v-for="step in steps" :key="step.title" class="rounded-xl border border-border bg-card p-6">
            <div class="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <Icon :name="step.icon" class="h-5 w-5 text-primary" />
            </div>
            <h3 class="font-semibold">{{ step.title }}</h3>
            <p class="mt-1.5 text-sm text-muted-foreground">{{ step.text }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
