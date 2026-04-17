<script setup lang="ts">
import type { Experience } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { items: experiences, refresh } = useContent<Experience>('experiences')
const { remove } = useContentFile('experiences')

async function handleDelete(slug: string) {
  if (!confirm('Supprimer cette expérience ?')) return
  await remove(slug)
  await refresh()
}

function typeLabel(type?: string) {
  const map: Record<string, string> = {
    cdi: 'CDI', cdd: 'CDD', freelance: 'Freelance',
    alternance: 'Alternance', stage: 'Stage',
  }
  return type ? (map[type] ?? type) : ''
}
</script>

<template>
  <div class="p-8 max-w-4xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Expériences pro</h1>
      <Button as-child size="sm">
        <NuxtLink to="/profile/experiences/new">
          <Icon name="lucide:plus" class="w-4 h-4 mr-1" /> Nouvelle expérience
        </NuxtLink>
      </Button>
    </div>

    <div v-if="!experiences?.length" class="text-sm text-muted-foreground py-12 text-center">
      Aucune expérience encore.
      <NuxtLink to="/profile/experiences/new" class="text-primary underline ml-1">Créer la première</NuxtLink>
    </div>

    <div class="space-y-3">
      <div
        v-for="exp in experiences"
        :key="exp.slug"
        class="border border-border rounded-lg p-4 hover:bg-accent/30 transition-colors cursor-pointer group"
        @click="navigateTo(`/profile/experiences/${exp.slug}`)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="font-semibold text-sm">{{ exp.title }}</h2>
              <span
                v-if="exp.type"
                class="text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5 font-medium"
              >{{ typeLabel(exp.type) }}</span>
            </div>
            <p v-if="exp.role" class="text-sm text-muted-foreground mt-0.5">{{ exp.role }}</p>
            <p v-if="exp.client" class="text-xs text-muted-foreground mt-0.5">
              <Icon name="lucide:building" class="w-3 h-3 inline mr-1" />{{ exp.client }}
            </p>
          </div>
          <div class="text-right shrink-0">
            <p v-if="exp.startDate" class="text-xs text-muted-foreground">
              {{ exp.startDate }} – {{ exp.endDate ?? 'en cours' }}
            </p>
            <p v-if="exp.missions?.length" class="text-xs text-muted-foreground mt-1">
              {{ exp.missions.length }} mission{{ exp.missions.length > 1 ? 's' : '' }}
            </p>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm" variant="ghost"
            class="h-7 px-2 text-muted-foreground"
            @click.stop="navigateTo(`/profile/experiences/edit/${exp.slug}`)"
          >
            <Icon name="lucide:pencil" class="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm" variant="ghost"
            class="h-7 px-2 text-destructive"
            @click.stop="handleDelete(exp.slug)"
          >
            <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
