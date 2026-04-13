<script setup lang="ts">
import type { Experience } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { items: experiences, refresh } = useContent<Experience>('experiences')
const { remove } = useContentFile('experiences')
const selectedSlug = ref<string | null>(null)

async function handleDelete(slug: string) {
  if (!confirm('Supprimer cette expérience ?')) return
  await remove(slug)
  if (selectedSlug.value === slug) selectedSlug.value = null
  await refresh()
}
</script>

<template>
  <ContentSplitView
    title="Expériences"
    :items="experiences ?? []"
    :selected-slug="selectedSlug"
    create-path="/profile/experiences/new"
    @select="selectedSlug = $event"
    @delete="handleDelete"
  >
    <template #list-item="{ item, isActive }">
      <ContentListItem
        :title="item.title"
        :meta="`${item.client} · ${item.startDate}`"
        :tags="item.stack ?? []"
        :has-ai-summary="!!item.aiSummary"
        :is-active="isActive"
      />
    </template>

    <template #preview="{ item }">
      <ContentPreview
        :title="`${item.title} — ${item.client}`"
        :meta-items="[
          { icon: 'lucide:calendar', label: `${item.startDate}${item.endDate ? ` – ${item.endDate}` : ' – en cours'}` },
          ...(item.location ? [{ icon: 'lucide:map-pin', label: item.location }] : []),
          { icon: 'lucide:user', label: item.role },
        ]"
        :tags="item.tags ?? []"
        :ai-summary="item.aiSummary"
        :highlights="item.highlights"
        :body="item.body"
        :slug="item.slug"
        :edit-path="`/profile/experiences/edit/${item.slug}`"
        @delete="handleDelete"
      />
    </template>
  </ContentSplitView>
</template>
