<script setup lang="ts">
import type { Mission, MissionPayload } from '~/types/content'

const props = defineProps<{ initial?: Mission | null }>()
const emit = defineEmits<{ submit: [data: MissionPayload]; cancel: [] }>()

const form = reactive<MissionPayload>({
  title: props.initial?.title ?? '',
  type: props.initial?.type ?? 'pro',
  experience: props.initial?.experience ?? '',
  client: props.initial?.client ?? '',
  startDate: props.initial?.startDate ?? '',
  endDate: props.initial?.endDate ?? '',
  body: props.initial?.body ?? '',
})

const domainsInput = ref((props.initial?.domains ?? []).join(', '))
const skillsInput = ref((props.initial?.skills ?? []).join(', '))

function handleSubmit() {
  const payload: MissionPayload = {
    ...form,
    domains: domainsInput.value.split(',').map(s => s.trim()).filter(Boolean),
    skills: skillsInput.value.split(',').map(s => s.trim()).filter(Boolean),
  }
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
        <Label for="title">Titre de la mission *</Label>
        <Input id="title" v-model="form.title" placeholder="Déploiement SIEM ELK" required />
      </div>
      <div class="space-y-1.5">
        <Label for="type">Type</Label>
        <select
          id="type"
          v-model="form.type"
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="pro">Pro</option>
          <option value="perso">Perso</option>
        </select>
      </div>

      <template v-if="form.type === 'pro'">
        <div class="space-y-1.5">
          <Label for="experience">Slug de l'expérience parente</Label>
          <Input id="experience" v-model="form.experience" placeholder="neverhack" />
        </div>
        <div class="space-y-1.5">
          <Label for="client">Client final</Label>
          <Input id="client" v-model="form.client" placeholder="Airbus Defence and Space" />
        </div>
      </template>

      <div class="space-y-1.5">
        <Label for="startDate">Début</Label>
        <Input id="startDate" v-model="form.startDate" placeholder="2023-06" />
      </div>
      <div class="space-y-1.5">
        <Label for="endDate">Fin (vide = en cours)</Label>
        <Input id="endDate" v-model="form.endDate" placeholder="2024-01" />
      </div>
    </div>

    <div class="space-y-1.5">
      <Label for="domains">Domaines (séparés par virgule)</Label>
      <Input id="domains" v-model="domainsInput" placeholder="Cybersécurité, Infrastructure" />
    </div>

    <div class="space-y-1.5">
      <Label for="skills">Compétences (séparées par virgule)</Label>
      <Input id="skills" v-model="skillsInput" placeholder="ELK Stack, Docker, Python" />
    </div>

    <div class="space-y-1.5">
      <Label for="body">Description (Markdown)</Label>
      <textarea
        id="body"
        v-model="form.body"
        rows="6"
        placeholder="Description brute et factuelle. Contexte, chiffres, ce qui distingue..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none font-mono"
      />
    </div>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="emit('cancel')">Annuler</Button>
      <Button type="submit">Sauvegarder → MD</Button>
    </div>
  </form>
</template>
