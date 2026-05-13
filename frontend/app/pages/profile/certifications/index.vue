<script setup lang="ts">
import type { Certification, CertificationPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { items: certifications, refresh } = useContent<Certification>('certifications')
const { create, update, remove } = useContentFile('certifications')

const isCreating = ref(false)
const editingSlug = ref<string | null>(null)

function startCreate() {
  editingSlug.value = null
  isCreating.value = true
}

async function handleCreate(data: CertificationPayload) {
  await create(data)
  await refresh()
  isCreating.value = false
}

async function handleUpdate(slug: string, data: CertificationPayload) {
  await update(slug, data)
  await refresh()
  editingSlug.value = null
}

async function handleDelete(slug: string) {
  if (!confirm('Supprimer cette certification ?')) return
  await remove(slug)
  await refresh()
}
</script>

<template>
  <div class="p-8 max-w-3xl space-y-4">
    <h1 class="text-2xl font-bold mb-6">Certifications</h1>

    <template v-for="cert in certifications" :key="cert.slug">
      <div v-if="editingSlug === cert.slug" class="border border-primary/40 rounded-xl p-5 bg-accent/10">
        <h2 class="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">Modifier la certification</h2>
        <CertificationsCertificationForm
          :initial="cert"
          @submit="(d) => handleUpdate(cert.slug, d)"
          @cancel="editingSlug = null"
        />
      </div>
      <CertificationsCertificationCard
        v-else
        :cert="cert"
        @edit="() => { isCreating = false; editingSlug = cert.slug }"
        @delete="handleDelete(cert.slug)"
      />
    </template>

    <p v-if="!certifications?.length && !isCreating" class="text-sm text-muted-foreground text-center py-4">
      Aucune certification encore.
    </p>

    <div v-if="isCreating" class="border border-primary/40 rounded-xl p-5 bg-accent/10">
      <h2 class="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">Nouvelle certification</h2>
      <CertificationsCertificationForm @submit="handleCreate" @cancel="isCreating = false" />
    </div>

    <div
      v-if="!isCreating"
      class="border border-dashed border-border rounded-xl p-5 flex items-center justify-center gap-2 text-sm text-muted-foreground cursor-pointer hover:border-primary/40 hover:text-primary transition-colors"
      @click="startCreate"
    >
      <Icon name="lucide:plus" class="w-4 h-4" />
      <span>Nouvelle certification</span>
    </div>
  </div>
</template>
