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
  { title: 'Choisis un profil', text: "Parcours les portfolios publics et ouvre celui qui t'intéresse." },
  { title: 'Pose tes questions', text: "Interroge l'assistant sur les expériences, compétences et projets." },
  { title: 'Réponses factuelles', text: "L'IA répond uniquement à partir des données réelles du profil." },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden border-b border-border">
      <span
        aria-hidden="true"
        class="pointer-events-none absolute -top-10 -right-6 select-none font-serif text-[18rem] leading-none text-primary/[0.06]"
      >秘</span>
      <div class="relative container mx-auto px-4 py-24">
        <p class="font-serif text-xl text-primary">秘</p>
        <h1 class="mt-6 max-w-3xl font-serif text-5xl leading-[1.1] font-semibold md:text-6xl">
          Portfolios augmentés.
        </h1>
        <div class="mt-5 h-px w-16 bg-primary" />
        <p class="mt-6 max-w-xl text-lg text-muted-foreground">
          Un secrétaire IA pour votre parcours professionnel. Posez vos questions sur un profil —
          l'assistant répond à partir de ses expériences, compétences et projets réels.
        </p>
        <div class="mt-10 flex items-center gap-6">
          <Button as-child size="lg">
            <NuxtLink to="/users">Découvrir</NuxtLink>
          </Button>
          <NuxtLink
            to="/register"
            class="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary"
          >
            Créer mon profil
            <Icon name="lucide:arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Featured profiles -->
    <section class="container mx-auto px-4 py-16">
      <div class="mb-8 flex items-end justify-between">
        <div>
          <h2 class="font-serif text-3xl font-semibold">Profils à explorer</h2>
          <p class="mt-1 text-sm text-muted-foreground">Choisis un profil et discute avec l'IA à son sujet.</p>
        </div>
        <Button as-child variant="ghost" size="sm">
          <NuxtLink to="/users">Voir tout</NuxtLink>
        </Button>
      </div>

      <p v-if="error" class="border-t border-border pt-6 text-sm text-muted-foreground italic">
        Impossible de charger les profils pour le moment.
      </p>
      <p v-else-if="featured.length === 0" class="border-t border-border pt-6 text-sm text-muted-foreground italic">
        Aucun profil pour l'instant.
        <NuxtLink to="/register" class="text-primary hover:underline">Crée le premier</NuxtLink>.
      </p>
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProfileCard v-for="u in featured" :key="u.id" :user="u" />
      </div>
    </section>

    <!-- How it works -->
    <section class="border-t border-border bg-muted/30">
      <div class="container mx-auto px-4 py-16">
        <h2 class="mb-10 font-serif text-3xl font-semibold">Comment ça marche</h2>
        <div class="grid grid-cols-1 gap-px overflow-hidden border-y border-border bg-border md:grid-cols-3">
          <div v-for="(step, i) in steps" :key="step.title" class="bg-background p-6">
            <span class="font-serif text-3xl text-primary">{{ String(i + 1).padStart(2, '0') }}</span>
            <h3 class="mt-3 font-serif text-lg font-semibold">{{ step.title }}</h3>
            <p class="mt-1.5 text-sm text-muted-foreground">{{ step.text }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
