<!-- frontend/app/components/experiences/MissionForm.vue -->
<script setup lang="ts">
import type { Mission, MissionPayload, SkillEntry } from '~/types/content'

const props = defineProps<{
  initial?: Mission | null
  experienceSlug?: string
}>()
const emit = defineEmits<{ submit: [data: MissionPayload]; cancel: [] }>()

const form = reactive({
  title: props.initial?.title ?? '',
  type: (props.initial?.type ?? 'pro') as 'pro' | 'perso',
  experience: props.experienceSlug ?? props.initial?.experience ?? '',
  client: props.initial?.client ?? '',
  startDate: props.initial?.startDate,
  endDate: props.initial?.endDate,
  skills: (props.initial?.skills ?? []) as SkillEntry[],
  body: props.initial?.body ?? '',
})

watch(
  () => props.experienceSlug,
  (val) => {
    form.experience = val ?? ''
  }
)

watch(
  () => form.type,
  (val) => {
    if (val === 'perso') {
      form.experience = ''
      form.client = ''
    }
  }
)

function handleSubmit() {
  const payload: MissionPayload = {
    title: form.title,
    type: form.type,
    startDate: form.startDate || undefined,
    endDate: form.endDate || undefined,
    skills: form.skills,
    body: form.body || undefined,
  }
  if (form.type === 'pro') {
    if (form.experience) payload.experience = form.experience
    if (form.client) payload.client = form.client
  }
  emit('submit', payload)
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <Label for="ms-title">Titre *</Label>
        <Input id="ms-title" v-model="form.title" placeholder="Déploiement SIEM ELK" required />
      </div>
      <div class="space-y-1.5">
        <Label for="ms-type">Type</Label>
        <select
          id="ms-type"
          v-model="form.type"
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="pro">Pro</option>
          <option value="perso">Perso</option>
        </select>
      </div>

      <template v-if="form.type === 'pro'">
        <div v-if="!experienceSlug" class="space-y-1.5">
          <Label for="ms-experience">Expérience parente (slug)</Label>
          <Input id="ms-experience" v-model="form.experience" placeholder="neverhack" />
        </div>
        <div class="space-y-1.5" :class="experienceSlug ? 'col-span-2' : ''">
          <Label for="ms-client">Client final</Label>
          <Input id="ms-client" v-model="form.client" placeholder="Airbus Defence and Space" />
        </div>
      </template>

      <div class="space-y-1.5">
        <Label>Début</Label>
        <UiMonthPicker v-model="form.startDate" placeholder="Début" />
      </div>
      <div class="space-y-1.5">
        <Label>Fin (vide = en cours)</Label>
        <UiMonthPicker v-model="form.endDate" placeholder="En cours" />
      </div>
    </div>

    <MissionsMissionSkillsEditor v-model="form.skills" />

    <div class="space-y-1.5">
      <Label for="ms-body">Description</Label>
      <textarea
        id="ms-body"
        v-model="form.body"
        rows="4"
        placeholder="Contexte, chiffres, ce qui distingue..."
        class="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
      />
    </div>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="emit('cancel')">Annuler</Button>
      <Button type="submit">Sauvegarder</Button>
    </div>
  </form>
</template>
