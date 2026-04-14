<script setup lang="ts">
import type { Skill } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { items: skills, refresh } = useContent<Skill>('skills')
const { remove } = useContentFile('skills')
const selectedSlug = ref<string | null>(null)

async function handleDelete(slug: string) {
  if (!confirm('Supprimer cette compétence ?')) return
  await remove(slug)
  if (selectedSlug.value === slug) selectedSlug.value = null
  await refresh()
}
</script>

<template>
  <ContentSplitView
    title="Compétences"
    :items="skills ?? []"
    :selected-slug="selectedSlug"
    create-path="/profile/skills/new"
    @select="selectedSlug = $event"
    @delete="handleDelete"
  >
    <template #list-item="{ item, isActive }">
      <ContentListItem
        :title="item.title"
        :meta="`${item.domain}${item.yearsOfExperience ? ` · ${item.yearsOfExperience} ans` : ''}`"
        :tags="[]"
        :has-ai-summary="!!item.aiSummary"
        :is-active="isActive"
      />
    </template>

    <template #preview="{ item }">
      <ContentPreview
        :title="item.title"
        :meta-items="[
          { icon: 'lucide:layers', label: item.domain },
          ...(item.yearsOfExperience ? [{ icon: 'lucide:clock', label: `${item.yearsOfExperience} ans d'expérience` }] : []),
        ]"
        :tags="[]"
        :ai-summary="item.aiSummary"
        :body="item.body"
        :slug="item.slug"
        :edit-path="`/profile/skills/edit/${item.slug}`"
        @delete="handleDelete"
      />
    </template>
  </ContentSplitView>
</template>
