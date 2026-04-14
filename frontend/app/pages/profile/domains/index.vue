<script setup lang="ts">
import type { Domain } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { items: domains, refresh } = useContent<Domain>('domains')
const { remove } = useContentFile('domains')
const selectedSlug = ref<string | null>(null)

async function handleDelete(slug: string) {
  if (!confirm('Supprimer ce domaine ?')) return
  await remove(slug)
  if (selectedSlug.value === slug) selectedSlug.value = null
  await refresh()
}
</script>

<template>
  <ContentSplitView
    title="Domaines"
    :items="domains ?? []"
    :selected-slug="selectedSlug"
    create-path="/profile/domains/new"
    @select="selectedSlug = $event"
    @delete="handleDelete"
  >
    <template #list-item="{ item, isActive }">
      <ContentListItem
        :title="item.title"
        :meta="item.description ?? ''"
        :tags="[]"
        :has-ai-summary="false"
        :is-active="isActive"
      />
    </template>

    <template #preview="{ item }">
      <ContentPreview
        :title="item.title"
        :meta-items="[
          ...(item.description ? [{ icon: 'lucide:info', label: item.description }] : []),
          ...(item.order !== undefined ? [{ icon: 'lucide:list-ordered', label: `Ordre : ${item.order}` }] : []),
        ]"
        :tags="[]"
        :ai-summary="item.aiSummary"
        :body="item.body"
        :slug="item.slug"
        :edit-path="`/profile/domains/edit/${item.slug}`"
        @delete="handleDelete"
      />
    </template>
  </ContentSplitView>
</template>
