<!-- frontend/app/components/content/MissionForm.vue -->
<script setup lang="ts">
import type { Mission, MissionPayload } from '~/types/content'

const props = defineProps<{
  initial?: Mission | null
  experienceSlug?: string
}>()
const emit = defineEmits<{ submit: [data: MissionPayload]; cancel: [] }>()

const form = reactive<MissionPayload>({
  title: props.initial?.title ?? '',
  type: props.initial?.type ?? 'pro',
  experience: props.experienceSlug ?? props.initial?.experience ?? '',
  client: props.initial?.client ?? '',
  startDate: props.initial?.startDate ?? '',
  endDate: props.initial?.endDate ?? '',
  domains: [...(props.initial?.domains ?? [])],
  skills: [...(props.initial?.skills ?? [])],
  body: props.initial?.body ?? '',
})

watch(
  () => props.experienceSlug,
  (val) => { if (val) form.experience = val },
)

function handleSubmit() {
  const payload: MissionPayload = { ...form }
  if (payload.type === 'perso') {
    delete payload.experience
    delete payload.client
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
        <Label for="ms-start">Début</Label>
        <input
          id="ms-start"
          v-model="form.startDate"
          type="month"
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div class="space-y-1.5">
        <Label for="ms-end">Fin (vide = en cours)</Label>
        <input
          id="ms-end"
          v-model="form.endDate"
          type="month"
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
    </div>

    <div class="space-y-1.5">
      <Label>Domaines</Label>
      <TagInput v-model="form.domains" placeholder="Ajouter un domaine (Entrée ou virgule)..." />
    </div>

    <div class="space-y-1.5">
      <Label>Compétences</Label>
      <TagInput v-model="form.skills" placeholder="Ajouter une compétence (Entrée ou virgule)..." />
    </div>

    <div class="space-y-1.5">
      <Label for="ms-body">Description</Label>
      <textarea
        id="ms-body"
        v-model="form.body"
        rows="5"
        placeholder="Contexte, chiffres, ce qui distingue..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none font-mono"
      />
    </div>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="emit('cancel')">Annuler</Button>
      <Button type="submit">Sauvegarder</Button>
    </div>
  </form>
</template>
