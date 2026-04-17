<script setup lang="ts">
import type { Skill } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { aggregated } = useAggregatedSkills()

const documented = computed(() => aggregated.value.filter(e => e.documented))
const undocumented = computed(() => aggregated.value.filter(e => !e.documented))

const { remove } = useContentFile('skills')

async function handleDelete(slug: string) {
  if (!confirm('Supprimer cette compétence ?')) return
  await remove(slug)
  await refreshNuxtData('agg-skill-docs')
}
</script>

<template>
  <div class="p-8 max-w-4xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Compétences</h1>
      <Button as-child size="sm">
        <NuxtLink to="/profile/skills/new">
          <Icon name="lucide:plus" class="w-4 h-4 mr-1" /> Nouvelle compétence
        </NuxtLink>
      </Button>
    </div>

    <!-- Compétences documentées -->
    <section v-if="documented.length" class="mb-8">
      <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Documentées ({{ documented.length }})
      </h2>
      <div class="space-y-2">
        <div
          v-for="entry in documented"
          :key="entry.slug"
          class="border border-border rounded-lg px-4 py-3 flex items-center justify-between gap-3 group hover:bg-accent/20 transition-colors"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-medium text-sm">{{ entry.name }}</span>
              <span class="text-xs bg-green-500/10 text-green-600 rounded px-1.5 py-0.5 font-medium">Documenté</span>
              <span v-if="(entry.metadata as Skill)?.domain" class="text-xs text-muted-foreground">
                {{ (entry.metadata as Skill).domain }}
              </span>
              <span v-if="(entry.metadata as Skill)?.yearsOfExperience" class="text-xs text-muted-foreground">
                · {{ (entry.metadata as Skill).yearsOfExperience }} ans
              </span>
              <span v-if="entry.missionCount > 0" class="text-xs text-muted-foreground">
                · {{ entry.missionCount }} mission{{ entry.missionCount > 1 ? 's' : '' }}
              </span>
            </div>
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button size="sm" variant="ghost" class="h-7 px-2 text-muted-foreground" as-child>
              <NuxtLink :to="`/profile/skills/edit/${entry.slug}`">
                <Icon name="lucide:pencil" class="w-3.5 h-3.5" />
              </NuxtLink>
            </Button>
            <Button
              size="sm" variant="ghost"
              class="h-7 px-2 text-destructive"
              @click="handleDelete(entry.slug)"
            >
              <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Compétences non documentées -->
    <section v-if="undocumented.length">
      <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Mentionnées dans les missions ({{ undocumented.length }})
      </h2>
      <div class="space-y-2">
        <div
          v-for="entry in undocumented"
          :key="entry.slug"
          class="border border-dashed border-border rounded-lg px-4 py-3 flex items-center justify-between gap-3"
        >
          <div class="flex items-center gap-2">
            <span class="font-medium text-sm text-muted-foreground">{{ entry.name }}</span>
            <span class="text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5">Non documenté</span>
            <span v-if="entry.missionCount > 0" class="text-xs text-muted-foreground">
              {{ entry.missionCount }} mission{{ entry.missionCount > 1 ? 's' : '' }}
            </span>
          </div>
          <Button size="sm" variant="ghost" class="h-7 px-2 text-muted-foreground text-xs" as-child>
            <NuxtLink to="/profile/skills/new">
              <Icon name="lucide:file-plus" class="w-3.5 h-3.5 mr-1" /> Documenter
            </NuxtLink>
          </Button>
        </div>
      </div>
    </section>

    <div v-if="!aggregated.length" class="text-sm text-muted-foreground py-12 text-center">
      Aucune compétence encore — ajoutez des missions avec des compétences ou créez une compétence manuellement.
    </div>
  </div>
</template>
