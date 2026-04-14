<script setup lang="ts">
import type { Project, ProjectPayload } from '~/types/content'

const props = defineProps<{ initial?: Project | null }>()
const emit = defineEmits<{ submit: [data: ProjectPayload]; cancel: [] }>()

const form = reactive<ProjectPayload>({
  title: props.initial?.title ?? '',
  startDate: props.initial?.startDate ?? '',
  endDate: props.initial?.endDate ?? '',
  stack: props.initial?.stack ?? [],
  url: props.initial?.url ?? '',
  body: props.initial?.body ?? '',
})

const stackInput = ref((props.initial?.stack ?? []).join(', '))

function handleSubmit() {
  form.stack = stackInput.value.split(',').map(s => s.trim()).filter(Boolean)
  emit('submit', { ...form })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1.5 col-span-2">
        <Label for="title">Nom du projet *</Label>
        <Input id="title" v-model="form.title" placeholder="Hisho" required />
      </div>
      <div class="space-y-1.5">
        <Label for="startDate">Début</Label>
        <Input id="startDate" v-model="form.startDate" placeholder="2024-04" />
      </div>
      <div class="space-y-1.5">
        <Label for="endDate">Fin (vide = en cours)</Label>
        <Input id="endDate" v-model="form.endDate" placeholder="2024-12" />
      </div>
      <div class="space-y-1.5 col-span-2">
        <Label for="stack">Stack (séparés par virgule)</Label>
        <Input id="stack" v-model="stackInput" placeholder="Nuxt 4, AdonisJS, PostgreSQL, Claude API" />
      </div>
      <div class="space-y-1.5 col-span-2">
        <Label for="url">URL</Label>
        <Input id="url" v-model="form.url" placeholder="https://github.com/..." />
      </div>
    </div>

    <div class="space-y-1.5">
      <Label for="body">Description (Markdown)</Label>
      <textarea
        id="body"
        v-model="form.body"
        rows="6"
        placeholder="Objectifs, apprentissages, contexte, statut actuel..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none font-mono"
      />
    </div>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="emit('cancel')">Annuler</Button>
      <Button type="submit">Sauvegarder → MD</Button>
    </div>
  </form>
</template>
