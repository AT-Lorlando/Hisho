<script setup lang="ts">
const route = useRoute()
const counts = useContentCounts()

const sections = [
  { label: 'Identité', path: '/profile/identity', icon: 'lucide:user', key: null },
  { label: 'Expériences', path: '/profile/experiences', icon: 'lucide:briefcase', key: 'experiences' as const },
  { label: 'Compétences', path: '/profile/skills', icon: 'lucide:zap', key: 'skills' as const },
  { label: 'Projets', path: '/profile/projects', icon: 'lucide:rocket', key: 'projects' as const },
  { label: 'Certifications', path: '/profile/certifications', icon: 'lucide:award', key: 'certifications' as const },
]

function isActive(path: string) {
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="w-52 shrink-0 border-r border-border bg-background flex flex-col py-4 px-2 gap-1">
    <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">
      Mon Profil
    </p>
    <NuxtLink
      v-for="section in sections"
      :key="section.path"
      :to="section.path"
      class="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors"
      :class="isActive(section.path)
        ? 'bg-accent text-accent-foreground font-medium'
        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'"
    >
      <span class="flex items-center gap-2">
        <Icon :name="section.icon" class="w-4 h-4" />
        {{ section.label }}
      </span>
      <span
        v-if="section.key && counts && (counts as any)[section.key] > 0"
        class="text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5"
      >
        {{ (counts as any)[section.key] }}
      </span>
    </NuxtLink>
  </nav>
</template>
