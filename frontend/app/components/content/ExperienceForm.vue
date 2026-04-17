<script setup lang="ts">
import type { Experience, ExperiencePayload } from '~/types/content'

const props = defineProps<{ initial?: Experience | null }>()
const emit = defineEmits<{ submit: [data: ExperiencePayload]; cancel: [] }>()

const form = reactive<ExperiencePayload>({
  title: props.initial?.title ?? '',
  role: props.initial?.role ?? '',
  client: props.initial?.client ?? '',
  type: props.initial?.type ?? undefined,
  startDate: props.initial?.startDate ?? '',
  endDate: props.initial?.endDate ?? '',
  location: props.initial?.location ?? '',
  body: props.initial?.body ?? '',
})

function handleSubmit() {
  emit('submit', { ...form })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <Label for="title">Employeur *</Label>
        <Input id="title" v-model="form.title" placeholder="Neverhack" required />
      </div>
      <div class="space-y-1.5">
        <Label for="client">Client final (si ESN)</Label>
        <Input id="client" v-model="form.client" placeholder="Airbus Defence and Space" />
      </div>
      <div class="space-y-1.5">
        <Label for="role">Poste occupé</Label>
        <Input id="role" v-model="form.role" placeholder="Ingénieur DevSecOps" />
      </div>
      <div class="space-y-1.5">
        <Label for="type">Type de contrat</Label>
        <select
          id="type"
          v-model="form.type"
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">— choisir —</option>
          <option value="cdi">CDI</option>
          <option value="cdd">CDD</option>
          <option value="freelance">Freelance</option>
          <option value="alternance">Alternance</option>
          <option value="stage">Stage</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <Label for="startDate">Début</Label>
        <Input id="startDate" v-model="form.startDate" placeholder="2023-01" />
      </div>
      <div class="space-y-1.5">
        <Label for="endDate">Fin (vide = en cours)</Label>
        <Input id="endDate" v-model="form.endDate" placeholder="2025-06" />
      </div>
      <div class="space-y-1.5 col-span-2">
        <Label for="location">Localisation</Label>
        <Input id="location" v-model="form.location" placeholder="Toulouse" />
      </div>
    </div>

    <div class="space-y-1.5">
      <Label for="body">Contexte général (Markdown)</Label>
      <textarea
        id="body"
        v-model="form.body"
        rows="5"
        placeholder="Contexte de la mission longue durée, environnement, périmètre..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none font-mono"
      />
    </div>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="emit('cancel')">Annuler</Button>
      <Button type="submit">Sauvegarder → MD</Button>
    </div>
  </form>
</template>
