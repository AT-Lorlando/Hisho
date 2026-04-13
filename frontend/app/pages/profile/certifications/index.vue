<script setup lang="ts">
import type { Certification } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { items: certifications, refresh } = useContent<Certification>('certifications')
const { remove } = useContentFile('certifications')
const selectedSlug = ref<string | null>(null)

async function handleDelete(slug: string) {
  if (!confirm('Supprimer cette certification ?')) return
  await remove(slug)
  if (selectedSlug.value === slug) selectedSlug.value = null
  await refresh()
}
</script>

<template>
  <ContentSplitView
    title="Certifications"
    :items="certifications ?? []"
    :selected-slug="selectedSlug"
    create-path="/profile/certifications/new"
    @select="selectedSlug = $event"
    @delete="handleDelete"
  >
    <template #list-item="{ item, isActive }">
      <ContentListItem
        :title="item.title"
        :meta="`${item.organism} · ${item.date}`"
        :tags="item.tags ?? []"
        :has-ai-summary="!!item.aiSummary"
        :is-active="isActive"
      />
    </template>

    <template #preview="{ item }">
      <ContentPreview
        :title="item.title"
        :meta-items="[
          { icon: 'lucide:building', label: item.organism },
          { icon: 'lucide:calendar', label: item.date },
          ...(item.expiry ? [{ icon: 'lucide:calendar-x', label: `Expire : ${item.expiry}` }] : []),
          ...(item.credentialId ? [{ icon: 'lucide:hash', label: item.credentialId }] : []),
        ]"
        :tags="item.tags ?? []"
        :ai-summary="item.aiSummary"
        :body="item.body"
        :slug="item.slug"
        :edit-path="`/profile/certifications/edit/${item.slug}`"
        @delete="handleDelete"
      />
    </template>
  </ContentSplitView>
</template>
