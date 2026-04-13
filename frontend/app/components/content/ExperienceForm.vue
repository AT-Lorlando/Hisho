<script setup lang="ts">
import type { Experience, ExperiencePayload } from '~/types/content'

const props = defineProps<{ initial?: Experience | null }>()
const emit = defineEmits<{ submit: [data: ExperiencePayload]; cancel: [] }>()

const form = reactive<ExperiencePayload>({
  title: props.initial?.title ?? '',
  client: props.initial?.client ?? '',
  role: props.initial?.role ?? '',
  type: props.initial?.type ?? 'mission',
  startDate: props.initial?.startDate ?? '',
  endDate: props.initial?.endDate ?? '',
  location: props.initial?.location ?? '',
  stack: props.initial?.stack ?? [],
  tags: props.initial?.tags ?? [],
  highlights: props.initial?.highlights ?? [],
  body: props.initial?.body ?? '',
})

const stackInput = ref((props.initial?.stack ?? []).join(', '))
const tagsInput = ref((props.initial?.tags ?? []).join(', '))
const highlightsInput = ref((props.initial?.highlights ?? []).join('\n'))

function handleSubmit() {
  form.stack = stackInput.value.split(',').map(s => s.trim()).filter(Boolean)
  form.tags = tagsInput.value.split(',').map(s => s.trim()).filter(Boolean)
  form.highlights = highlightsInput.value.split('\n').map(s => s.trim()).filter(Boolean)
  emit('submit', { ...form })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <Label for="title">Titre de la mission *</Label>
        <Input id="title" v-model="form.title" placeholder="Développeur Full-Stack" required />
      </div>
      <div class="space-y-1.5">
        <Label for="client">Client *</Label>
        <Input id="client" v-model="form.client" placeholder="Acme Corp" required />
      </div>
      <div class="space-y-1.5">
        <Label for="role">Rôle *</Label>
        <Input id="role" v-model="form.role" placeholder="Senior Developer" required />
      </div>
      <div class="space-y-1.5">
        <Label for="type">Type</Label>
        <select id="type" v-model="form.type" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="mission">Mission</option>
          <option value="emploi">Emploi</option>
          <option value="freelance">Freelance</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <Label for="startDate">Début *</Label>
        <Input id="startDate" v-model="form.startDate" placeholder="2024-01" required />
      </div>
      <div class="space-y-1.5">
        <Label for="endDate">Fin (vide = en cours)</Label>
        <Input id="endDate" v-model="form.endDate" placeholder="2024-06" />
      </div>
      <div class="space-y-1.5 col-span-2">
        <Label for="location">Localisation</Label>
        <Input id="location" v-model="form.location" placeholder="Paris (hybride)" />
      </div>
    </div>

    <div class="space-y-1.5">
      <Label for="stack">Stack (séparés par virgule)</Label>
      <Input id="stack" v-model="stackInput" placeholder="TypeScript, Nuxt 3, AdonisJS" />
    </div>

    <div class="space-y-1.5">
      <Label for="tags">Tags (séparés par virgule)</Label>
      <Input id="tags" v-model="tagsInput" placeholder="fullstack, api-rest, agile" />
    </div>

    <div class="space-y-1.5">
      <Label for="highlights">Réalisations clés (une par ligne)</Label>
      <textarea
        id="highlights"
        v-model="highlightsInput"
        rows="4"
        placeholder="Refonte complète de l'UI en Nuxt 3&#10;API REST avec auth session&#10;–40% temps de chargement"
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
      />
    </div>

    <div class="space-y-1.5">
      <Label for="body">Description (Markdown)</Label>
      <textarea
        id="body"
        v-model="form.body"
        rows="5"
        placeholder="Description détaillée de la mission, contexte métier..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none font-mono"
      />
    </div>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="emit('cancel')">Annuler</Button>
      <Button type="submit">Sauvegarder → MD</Button>
    </div>
  </form>
</template>
