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
        :meta="`${item.type} · ${item.status}`"
        :tags="item.stack ?? []"
        :has-ai-summary="!!item.aiSummary"
        :is-active="isActive"
      />
    </template>

    <template #preview="{ item }">
      <ContentPreview
        :title="item.title"
        :meta-items="[
          { icon: 'lucide:tag', label: item.type },
          { icon: 'lucide:activity', label: item.status },
          ...(item.url ? [{ icon: 'lucide:link', label: 'Voir le projet' }] : []),
        ]"
        :tags="item.tags ?? []"
        :ai-summary="item.aiSummary"
        :body="item.body"
        :slug="item.slug"
        :edit-path="`/profile/projects/edit/${item.slug}`"
        @delete="handleDelete"
      />
    </template>
  </ContentSplitView>
</template>
