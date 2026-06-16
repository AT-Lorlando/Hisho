<script setup lang="ts">
definePageMeta({ auth: false })

const route = useRoute()
const id = route.params.id as string

const [profile, experiences, skills, certifications] = await Promise.all([
  $fetch<any>(`/api/v1/users/${id}/profile`).catch(() => null),
  $fetch<any[]>(`/api/v1/users/${id}/experiences`).catch(() => []),
  $fetch<any[]>(`/api/v1/users/${id}/skills`).catch(() => []),
  $fetch<any[]>(`/api/v1/users/${id}/certifications`).catch(() => []),
])

if (!profile) {
  throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })
}

const activeTab = ref<'experiences' | 'skills' | 'certifications'>('experiences')
</script>

<template>
  <div class="container mx-auto px-4 py-8 grid gap-8 lg:grid-cols-3">
    <div class="lg:col-span-2 min-w-0">
    <!-- Profile header -->
    <div class="mb-8 border-b pb-6">
      <h1 class="text-3xl font-bold">{{ profile.fullName ?? 'Utilisateur' }}</h1>
      <p v-if="profile.title" class="text-lg text-muted-foreground mt-1">{{ profile.title }}</p>
      <p v-if="profile.bio" class="mt-3 max-w-2xl">{{ profile.bio }}</p>

      <div class="flex flex-wrap gap-3 mt-4 text-sm text-muted-foreground">
        <span v-if="profile.location">{{ profile.location }}</span>
        <a v-if="profile.linkedinUrl" :href="profile.linkedinUrl" target="_blank" rel="noopener" class="hover:text-foreground">LinkedIn</a>
        <a v-if="profile.githubUrl" :href="profile.githubUrl" target="_blank" rel="noopener" class="hover:text-foreground">GitHub</a>
        <a v-if="profile.websiteUrl" :href="profile.websiteUrl" target="_blank" rel="noopener" class="hover:text-foreground">Site web</a>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 border-b mb-6">
      <button
        class="px-4 py-2 text-sm font-medium transition-colors"
        :class="activeTab === 'experiences' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'"
        @click="activeTab = 'experiences'"
      >
        Expériences ({{ experiences.length }})
      </button>
      <button
        class="px-4 py-2 text-sm font-medium transition-colors"
        :class="activeTab === 'skills' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'"
        @click="activeTab = 'skills'"
      >
        Compétences ({{ skills.length }})
      </button>
      <button
        class="px-4 py-2 text-sm font-medium transition-colors"
        :class="activeTab === 'certifications' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'"
        @click="activeTab = 'certifications'"
      >
        Certifications ({{ certifications.length }})
      </button>
    </div>

    <!-- Experiences tab -->
    <div v-if="activeTab === 'experiences'">
      <div v-if="experiences.length === 0" class="text-sm text-muted-foreground rounded-md border border-dashed p-6 text-center">Aucune expérience renseignée.</div>
      <div v-for="exp in experiences" :key="exp.slug" class="border rounded-lg p-4 mb-3">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-semibold">{{ exp.title }}</h3>
            <p v-if="exp.role" class="text-sm text-muted-foreground">{{ exp.role }}</p>
            <p v-if="exp.client" class="text-sm text-muted-foreground">{{ exp.client }}</p>
          </div>
          <div class="text-xs text-muted-foreground text-right">
            <span v-if="exp.startDate">{{ exp.startDate }}</span>
            <span v-if="exp.startDate && exp.endDate"> → </span>
            <span v-if="exp.endDate">{{ exp.endDate }}</span>
            <span v-else-if="exp.startDate"> → présent</span>
          </div>
        </div>
        <p v-if="exp.body" class="text-sm mt-2 line-clamp-3">{{ exp.body }}</p>
        <p class="text-xs text-muted-foreground mt-2">{{ exp.missionCount }} mission(s)</p>
      </div>
    </div>

    <!-- Skills tab -->
    <div v-if="activeTab === 'skills'">
      <div v-if="skills.length === 0" class="text-sm text-muted-foreground rounded-md border border-dashed p-6 text-center">Aucune compétence renseignée.</div>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="skill in skills"
          :key="skill.slug"
          class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm"
        >
          {{ skill.title }}
          <span v-if="skill.level" class="text-xs text-muted-foreground">· {{ skill.level }}/5</span>
        </span>
      </div>
    </div>

    <!-- Certifications tab -->
    <div v-if="activeTab === 'certifications'">
      <div v-if="certifications.length === 0" class="text-sm text-muted-foreground rounded-md border border-dashed p-6 text-center">Aucune certification renseignée.</div>
      <div v-for="cert in certifications" :key="cert.slug" class="border rounded-lg p-4 mb-3">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-semibold">{{ cert.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ cert.organism }}</p>
          </div>
          <div class="text-xs text-muted-foreground">{{ cert.date }}</div>
        </div>
        <div v-if="cert.tags?.length" class="flex flex-wrap gap-1 mt-2">
          <span v-for="tag in cert.tags" :key="tag" class="text-xs bg-muted px-2 py-0.5 rounded">{{ tag }}</span>
        </div>
      </div>
    </div>
    </div>

    <aside class="lg:col-span-1">
      <div class="lg:sticky lg:top-8">
        <ProfileChatPanel :user-id="id" :name="profile.fullName" />
      </div>
    </aside>
  </div>
</template>
