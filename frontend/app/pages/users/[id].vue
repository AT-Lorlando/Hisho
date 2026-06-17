<!-- frontend/app/pages/users/[id].vue -->
<script setup lang="ts">
import type { Mission } from '~/types/content'

definePageMeta({ auth: false })

const route = useRoute()
const id = route.params.id as string

const [profile, experiences, missions, skills, certifications] = await Promise.all([
  $fetch<any>(`/api/v1/users/${id}/profile`).catch(() => null),
  $fetch<any[]>(`/api/v1/users/${id}/experiences`).catch(() => []),
  $fetch<Mission[]>(`/api/v1/users/${id}/missions`).catch(() => []),
  $fetch<any[]>(`/api/v1/users/${id}/skills`).catch(() => []),
  $fetch<any[]>(`/api/v1/users/${id}/certifications`).catch(() => []),
])

if (!profile) {
  throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })
}

const persoMissions = computed(() => missions.filter((m) => m.type === 'perso'))

const missionsByExp = computed(() => {
  const map: Record<string, Mission[]> = {}
  for (const m of missions) {
    if (m.experience) {
      const key = m.experience as string
      if (!map[key]) map[key] = []
      map[key]!.push(m)
    }
  }
  return map
})

const skillsByDomain = computed(() => {
  const map: Record<string, any[]> = {}
  for (const s of skills) {
    const key = s.domain?.title ?? 'Sans domaine'
    if (!map[key]) map[key] = []
    map[key].push(s)
  }
  return map
})

const activeTab = ref<'experiences' | 'projects' | 'skills' | 'certifications'>('experiences')

const tabs = computed(() => [
  { key: 'experiences' as const, label: 'Expériences', count: experiences.length },
  { key: 'projects' as const, label: 'Projets perso', count: persoMissions.value.length },
  { key: 'skills' as const, label: 'Compétences', count: skills.length },
  { key: 'certifications' as const, label: 'Certifications', count: certifications.length },
])

const links = computed(() =>
  [
    { url: profile.linkedinUrl, label: 'LinkedIn', icon: 'lucide:linkedin' },
    { url: profile.githubUrl, label: 'GitHub', icon: 'lucide:github' },
    { url: profile.websiteUrl, label: 'Site web', icon: 'lucide:globe' },
  ].filter((l) => l.url)
)

const chatRef = ref<HTMLElement | null>(null)
function scrollToChat() {
  chatRef.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-3">
    <div class="min-w-0 lg:col-span-2">
      <!-- Profile header -->
      <div class="mb-8 border-b pb-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <UserAvatar :name="profile.fullName" size="lg" />
          <div class="min-w-0">
            <h1 class="text-3xl font-bold">{{ profile.fullName ?? 'Utilisateur' }}</h1>
            <p v-if="profile.title" class="mt-1 text-lg text-muted-foreground">{{ profile.title }}</p>
            <p v-if="profile.location" class="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Icon name="lucide:map-pin" class="h-3.5 w-3.5" />{{ profile.location }}
            </p>
          </div>
        </div>

        <p v-if="profile.bio" class="mt-4 max-w-2xl text-sm leading-relaxed">{{ profile.bio }}</p>

        <div v-if="links.length" class="mt-4 flex flex-wrap gap-2">
          <Button v-for="link in links" :key="link.label" as-child variant="outline" size="sm">
            <a :href="link.url" target="_blank" rel="noopener">
              <Icon :name="link.icon" class="h-4 w-4" />{{ link.label }}
            </a>
          </Button>
        </div>

        <Button class="mt-5 w-full lg:hidden" @click="scrollToChat">
          <Icon name="lucide:message-circle" class="h-4 w-4" />
          Poser une question sur ce profil
        </Button>
      </div>

      <!-- Timeline overview -->
      <div v-if="experiences.length" class="mb-8">
        <ExperiencesExperienceTimeline :experiences="experiences" :missions-by-exp="missionsByExp" />
      </div>

      <!-- Tabs -->
      <div class="mb-6 inline-flex flex-wrap rounded-lg bg-muted p-1 text-sm">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="rounded-md px-4 py-1.5 font-medium transition-colors"
          :class="activeTab === tab.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }} <span class="text-xs opacity-70">({{ tab.count }})</span>
        </button>
      </div>

      <!-- Experiences (with their missions) -->
      <div v-if="activeTab === 'experiences'" class="space-y-4">
        <div v-if="experiences.length === 0" class="border-t border-border p-6 text-center text-sm text-muted-foreground italic">
          Aucune expérience renseignée.
        </div>
        <div v-for="exp in experiences" :key="exp.slug" class="rounded border border-border bg-card p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="font-semibold">{{ exp.title }}</h3>
              <p v-if="exp.role" class="text-sm text-muted-foreground">{{ exp.role }}</p>
              <p v-if="exp.client" class="flex items-center gap-1 text-sm text-muted-foreground">
                <Icon name="lucide:building" class="h-3 w-3" />{{ exp.client }}
              </p>
            </div>
            <div class="shrink-0 text-right text-xs text-muted-foreground">
              <span v-if="exp.startDate">{{ exp.startDate }}</span>
              <span v-if="exp.startDate && exp.endDate"> → </span>
              <span v-if="exp.endDate">{{ exp.endDate }}</span>
              <span v-else-if="exp.startDate"> → présent</span>
            </div>
          </div>
          <p v-if="exp.body" class="mt-2 text-sm">{{ exp.body }}</p>
          <div v-if="(missionsByExp[exp.slug] ?? []).length" class="mt-4 space-y-3">
            <MissionsMissionDetailCard
              v-for="m in missionsByExp[exp.slug]"
              :key="m.slug"
              :mission="m"
              readonly
            />
          </div>
        </div>
      </div>

      <!-- Personal projects -->
      <div v-if="activeTab === 'projects'" class="space-y-3">
        <div v-if="persoMissions.length === 0" class="border-t border-border p-6 text-center text-sm text-muted-foreground italic">
          Aucun projet personnel.
        </div>
        <MissionsMissionDetailCard v-for="m in persoMissions" :key="m.slug" :mission="m" readonly />
      </div>

      <!-- Skills grouped by domain -->
      <div v-if="activeTab === 'skills'" class="space-y-6">
        <div v-if="skills.length === 0" class="border-t border-border p-6 text-center text-sm text-muted-foreground italic">
          Aucune compétence renseignée.
        </div>
        <div v-for="(domainSkills, domainName) in skillsByDomain" :key="domainName">
          <h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{{ domainName }}</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="skill in domainSkills"
              :key="skill.slug"
              class="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1 text-sm"
            >
              {{ skill.title }}
              <span v-if="skill.level" class="text-xs text-muted-foreground">{{ skill.level }}/5</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Certifications -->
      <div v-if="activeTab === 'certifications'" class="space-y-3">
        <div v-if="certifications.length === 0" class="border-t border-border p-6 text-center text-sm text-muted-foreground italic">
          Aucune certification renseignée.
        </div>
        <div v-for="cert in certifications" :key="cert.slug" class="rounded border border-border bg-card p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="font-semibold">{{ cert.title }}</h3>
              <p class="text-sm text-muted-foreground">{{ cert.organism }}</p>
            </div>
            <div class="shrink-0 text-xs text-muted-foreground">{{ cert.date }}</div>
          </div>
          <div v-if="cert.tags?.length" class="mt-2 flex flex-wrap gap-1">
            <span v-for="tag in cert.tags" :key="tag" class="rounded bg-muted px-2 py-0.5 text-xs">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <aside ref="chatRef" class="lg:col-span-1">
      <div class="lg:sticky lg:top-20">
        <ProfileChatPanel :user-id="id" :name="profile.fullName" />
      </div>
    </aside>
  </div>
</template>
