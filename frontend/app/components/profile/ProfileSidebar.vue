<script setup lang="ts">
const route = useRoute()
const counts = useContentCounts()
const { user, logout } = useAuth()

const sections = [
  { label: 'Identité', path: '/profile/identity', icon: 'lucide:user', key: null },
  { label: 'Domaines', path: '/profile/domains', icon: 'lucide:layers', key: 'domains' as const },
  { label: 'Compétences', path: '/profile/skills', icon: 'lucide:zap', key: 'skills' as const },
  { label: 'Expériences pro', path: '/profile/experiences', icon: 'lucide:briefcase', key: 'experiences' as const },
  { label: 'Projets perso', path: '/profile/missions/perso', icon: 'lucide:target', key: 'missions' as const },
  { label: 'Certifications', path: '/profile/certifications', icon: 'lucide:award', key: 'certifications' as const },
]

function isActive(path: string) {
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="w-52 shrink-0 border-r border-border bg-background flex flex-col">
    <!-- Header -->
    <div class="px-4 py-4 border-b border-border">
      <NuxtLink to="/profile" class="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity">
        Hisho
      </NuxtLink>
    </div>

    <!-- Nav links -->
    <div class="flex-1 py-3 px-2 flex flex-col gap-1 overflow-auto">
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
    </div>

    <!-- Footer user -->
    <div class="px-3 py-3 border-t border-border">
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs text-muted-foreground truncate">{{ user?.email }}</span>
        <Button variant="ghost" size="sm" class="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-foreground" @click="logout">
          <Icon name="lucide:log-out" class="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  </nav>
</template>
