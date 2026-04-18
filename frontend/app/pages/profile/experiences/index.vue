<!-- frontend/app/pages/profile/experiences/index.vue -->
<script setup lang="ts">
import type { Experience, ExperiencePayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { items: experiences, refresh } = useContent<Experience>('experiences')
const { create, update, remove } = useContentFile('experiences')

const isCreating = ref(false)
const editingSlug = ref<string | null>(null)

function startCreate() {
  editingSlug.value = null
  isCreating.value = true
}

function startEdit(slug: string) {
  isCreating.value = false
  editingSlug.value = slug
}

function closeForm() {
  isCreating.value = false
  editingSlug.value = null
}

async function handleCreate(data: ExperiencePayload) {
  await create(data)
  await refresh()
  closeForm()
}

async function handleUpdate(slug: string, data: ExperiencePayload) {
  await update(slug, data)
  await refresh()
  closeForm()
}

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
      <Button v-if="!isCreating" size="sm" @click="startCreate">
        <Icon name="lucide:plus" class="w-4 h-4 mr-1" /> Nouvelle expérience
      </Button>
    </div>

    <!-- Formulaire de création inline -->
    <div v-if="isCreating" class="border border-primary/40 rounded-lg p-5 mb-4 bg-accent/10">
      <h2 class="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">Nouvelle expérience</h2>
      <ContentExperienceForm @submit="handleCreate" @cancel="closeForm" />
    </div>

    <div v-if="!experiences?.length && !isCreating" class="text-sm text-muted-foreground py-12 text-center">
      Aucune expérience encore.
      <button class="text-primary underline ml-1" @click="startCreate">Créer la première</button>
    </div>

    <div class="space-y-3">
      <template v-for="exp in experiences" :key="exp.slug">
        <!-- Mode édition inline -->
        <div v-if="editingSlug === exp.slug" class="border border-primary/40 rounded-lg p-5 bg-accent/10">
          <h2 class="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">Modifier l'expérience</h2>
          <ContentExperienceForm
            :initial="exp"
            @submit="(d) => handleUpdate(exp.slug, d)"
            @cancel="closeForm"
          />
        </div>

        <!-- Mode lecture -->
        <div
          v-else
          class="border border-border rounded-lg p-4 hover:bg-accent/20 transition-colors group"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <NuxtLink
                  :to="`/profile/experiences/${exp.slug}`"
                  class="font-semibold text-sm hover:text-primary transition-colors"
                >
                  {{ exp.title }}
                </NuxtLink>
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
              <p v-if="exp.missionCount" class="text-xs text-muted-foreground mt-1">
                {{ exp.missionCount }} mission{{ exp.missionCount! > 1 ? 's' : '' }}
              </p>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm" variant="ghost"
              class="h-7 px-2 text-muted-foreground"
              @click="startEdit(exp.slug)"
            >
              <Icon name="lucide:pencil" class="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm" variant="ghost"
              class="h-7 px-2 text-destructive"
              @click="handleDelete(exp.slug)"
            >
              <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
