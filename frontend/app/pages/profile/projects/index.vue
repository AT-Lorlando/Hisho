<script setup lang="ts">
import type { Project } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { items: projects, refresh } = useContent<Project>('projects')
const { remove } = useContentFile('projects')
const selectedSlug = ref<string | null>(null)

async function handleDelete(slug: string) {
  if (!confirm('Supprimer ce projet ?')) return
  await remove(slug)
  if (selectedSlug.value === slug) selectedSlug.value = null
  await refresh()
}
</script>

<template>
  <ContentSplitView
    title="Projets"
    :items="projects ?? []"
    :selected-slug="selectedSlug"
    create-path="/profile/projects/new"
    @select="selectedSlug = $event"
    @delete="handleDelete"
  >
    <template #list-item="{ item, isActive }">
      <ContentListItem
        :title="item.title"
        :meta="item.stack?.slice(0, 2).join(', ') ?? ''"
        :tags="[]"
        :has-ai-summary="!!item.aiSummary"
        :is-active="isActive"
      />
    </template>

    <template #preview="{ item }">
      <ContentPreview
        :title="item.title"
        :meta-items="[
          ...(item.startDate ? [{ icon: 'lucide:calendar', label: `${item.startDate}${item.endDate ? ` – ${item.endDate}` : ' – en cours'}` }] : []),
          ...(item.url ? [{ icon: 'lucide:link', label: item.url }] : []),
        ]"
        :tags="item.stack ?? []"
        :ai-summary="item.aiSummary"
        :body="item.body"
        :slug="item.slug"
        :edit-path="`/profile/projects/edit/${item.slug}`"
        @delete="handleDelete"
      />
    </template>
  </ContentSplitView>
</template>
