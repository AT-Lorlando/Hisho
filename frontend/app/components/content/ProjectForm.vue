<script setup lang="ts">
import type { Project, ProjectPayload } from '~/types/content'

const props = defineProps<{ initial?: Project | null }>()
const emit = defineEmits<{ submit: [data: ProjectPayload]; cancel: [] }>()

const form = reactive<ProjectPayload>({
  title: props.initial?.title ?? '',
  type: props.initial?.type ?? 'personnel',
  status: props.initial?.status ?? 'en-cours',
  startDate: props.initial?.startDate ?? '',
  endDate: props.initial?.endDate ?? '',
  stack: props.initial?.stack ?? [],
  tags: props.initial?.tags ?? [],
  url: props.initial?.url ?? '',
  demo: props.initial?.demo ?? '',
  body: props.initial?.body ?? '',
})

const stackInput = ref((props.initial?.stack ?? []).join(', '))
const tagsInput = ref((props.initial?.tags ?? []).join(', '))

function handleSubmit() {
  form.stack = stackInput.value.split(',').map(s => s.trim()).filter(Boolean)
  form.tags = tagsInput.value.split(',').map(s => s.trim()).filter(Boolean)
  emit('submit', { ...form })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <Label for="title">Nom du projet *</Label>
        <Input id="title" v-model="form.title" placeholder="Mon Super Projet" required />
      </div>
      <div class="space-y-1.5">
        <Label for="type">Type</Label>
        <select id="type" v-model="form.type" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="personnel">Personnel</option>
          <option value="professionnel">Professionnel</option>
          <option value="open-source">Open Source</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <Label for="status">Statut</Label>
        <select id="status" v-model="form.status" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="en-cours">En cours</option>
          <option value="terminé">Terminé</option>
          <option value="abandonné">Abandonné</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <Label for="startDate">Début</Label>
        <Input id="startDate" v-model="form.startDate" placeholder="2024-01" />
      </div>
      <div class="space-y-1.5">
        <Label for="url">URL du projet</Label>
        <Input id="url" v-model="form.url" placeholder="https://github.com/..." />
      </div>
      <div class="space-y-1.5">
        <Label for="demo">URL démo</Label>
        <Input id="demo" v-model="form.demo" placeholder="https://demo.monprojet.dev" />
      </div>
    </div>

    <div class="space-y-1.5">
      <Label for="stack">Stack (séparés par virgule)</Label>
      <Input id="stack" v-model="stackInput" placeholder="Nuxt 4, AdonisJS, PostgreSQL" />
    </div>

    <div class="space-y-1.5">
      <Label for="tags">Tags (séparés par virgule)</Label>
      <Input id="tags" v-model="tagsInput" placeholder="fullstack, ia, portfolio" />
    </div>

    <div class="space-y-1.5">
      <Label for="body">Description (Markdown)</Label>
      <textarea
        id="body"
        v-model="form.body"
        rows="5"
        placeholder="Description du projet, objectifs, apprentissages..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none font-mono"
      />
    </div>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="emit('cancel')">Annuler</Button>
      <Button type="submit">Sauvegarder → MD</Button>
    </div>
  </form>
</template>
