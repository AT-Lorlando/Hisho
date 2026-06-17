<script setup lang="ts">
import type { Domain, DomainPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { items: domains, refresh } = useContent<Domain>('domains')
const { create, update, remove } = useContentFile('domains')

const isCreating = ref(false)
const editingSlug = ref<string | null>(null)

function startCreate() {
  editingSlug.value = null
  isCreating.value = true
}

async function handleCreate(data: DomainPayload) {
  await create(data)
  await refresh()
  isCreating.value = false
}

async function handleUpdate(slug: string, data: DomainPayload) {
  await update(slug, data)
  await refresh()
  editingSlug.value = null
}

async function handleDelete(slug: string) {
  if (!confirm('Supprimer ce domaine ?')) return
  await remove(slug)
  await refresh()
}
</script>

<template>
  <div class="p-8 max-w-3xl space-y-4">
    <h1 class="text-2xl font-bold mb-6">Domaines</h1>

    <template v-for="domain in domains" :key="domain.slug">
      <div v-if="editingSlug === domain.slug" class="border border-primary/40 rounded p-5 bg-accent/10">
        <h2 class="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">Modifier le domaine</h2>
        <DomainsDomainForm
          :initial="domain"
          @submit="(d) => handleUpdate(domain.slug, d)"
          @cancel="editingSlug = null"
        />
      </div>
      <DomainsDomainCard
        v-else
        :domain="domain"
        @edit="() => { isCreating = false; editingSlug = domain.slug }"
        @delete="handleDelete(domain.slug)"
      />
    </template>

    <p v-if="!domains?.length && !isCreating" class="text-sm text-muted-foreground text-center py-4">
      Aucun domaine encore.
    </p>

    <div v-if="isCreating" class="border border-primary/40 rounded p-5 bg-accent/10">
      <h2 class="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">Nouveau domaine</h2>
      <DomainsDomainForm @submit="handleCreate" @cancel="isCreating = false" />
    </div>

    <div
      v-if="!isCreating"
      class="border border-border rounded p-5 flex items-center justify-center gap-2 text-sm text-muted-foreground cursor-pointer transition-colors hover:border-primary"
      @click="startCreate"
    >
      <Icon name="lucide:plus" class="w-4 h-4" />
      <span>Nouveau domaine</span>
    </div>
  </div>
</template>
