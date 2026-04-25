<script setup lang="ts">
import type { Mission, MissionPayload, SkillEntry } from '~/types/content'

interface FormEntry extends SkillEntry {
  _key: number
}

const props = defineProps<{
  initial?: Mission | null
  experienceSlug?: string
}>()
const emit = defineEmits<{ submit: [data: MissionPayload]; cancel: [] }>()

let _keyCounter = 0

const form = reactive({
  title: props.initial?.title ?? '',
  type: (props.initial?.type ?? 'pro') as 'pro' | 'perso',
  experience: props.experienceSlug ?? props.initial?.experience ?? '',
  client: props.initial?.client ?? '',
  startDate: props.initial?.startDate,
  endDate: props.initial?.endDate,
  domains: (props.initial?.domains?.map((d) => ({ ...d, _key: ++_keyCounter })) ?? []) as FormEntry[],
  skills: (props.initial?.skills?.map((s) => ({ ...s, _key: ++_keyCounter })) ?? []) as FormEntry[],
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

function addDomain() {
  form.domains.push({ name: '', level: 3 as const, _key: ++_keyCounter })
}

function removeDomain(i: number) {
  form.domains.splice(i, 1)
}

function addSkill() {
  form.skills.push({ name: '', level: 3 as const, _key: ++_keyCounter })
}

function removeSkill(i: number) {
  form.skills.splice(i, 1)
}

function handleSubmit() {
  const payload: MissionPayload = {
    title: form.title,
    type: form.type,
    startDate: form.startDate || undefined,
    endDate: form.endDate || undefined,
    domains: form.domains.filter((d) => d.name.trim()),
    skills: form.skills.filter((s) => s.name.trim()),
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

    <!-- Domains -->
    <div class="space-y-2">
      <Label>Domaines</Label>
      <div v-for="(entry, i) in form.domains" :key="entry._key" class="flex gap-2 items-center">
        <Input
          v-model="entry.name"
          class="flex-1"
          placeholder="Cybersécurité"
        />
        <select
          v-model.number="entry.level"
          class="rounded-md border border-input bg-background px-2 py-2 text-sm w-40 shrink-0"
        >
          <option :value="1">1 — Notions</option>
          <option :value="2">2 — Débutant</option>
          <option :value="3">3 — Intermédiaire</option>
          <option :value="4">4 — Avancé</option>
          <option :value="5">5 — Expert</option>
        </select>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="h-9 w-9 p-0 text-muted-foreground shrink-0"
          @click="removeDomain(i)"
        >
          <Icon name="lucide:x" class="w-3.5 h-3.5" />
        </Button>
      </div>
      <Button type="button" variant="outline" size="sm" @click="addDomain">
        <Icon name="lucide:plus" class="w-3.5 h-3.5 mr-1" />
        Ajouter un domaine
      </Button>
    </div>

    <!-- Skills -->
    <div class="space-y-2">
      <Label>Compétences</Label>
      <div v-for="(entry, i) in form.skills" :key="entry._key" class="flex gap-2 items-center">
        <Input
          v-model="entry.name"
          class="flex-1"
          placeholder="ELK Stack"
        />
        <select
          v-model.number="entry.level"
          class="rounded-md border border-input bg-background px-2 py-2 text-sm w-40 shrink-0"
        >
          <option :value="1">1 — Notions</option>
          <option :value="2">2 — Débutant</option>
          <option :value="3">3 — Intermédiaire</option>
          <option :value="4">4 — Avancé</option>
          <option :value="5">5 — Expert</option>
        </select>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="h-9 w-9 p-0 text-muted-foreground shrink-0"
          @click="removeSkill(i)"
        >
          <Icon name="lucide:x" class="w-3.5 h-3.5" />
        </Button>
      </div>
      <Button type="button" variant="outline" size="sm" @click="addSkill">
        <Icon name="lucide:plus" class="w-3.5 h-3.5 mr-1" />
        Ajouter une compétence
      </Button>
    </div>

    <div class="space-y-1.5">
      <Label for="ms-body">Description</Label>
      <textarea
        id="ms-body"
        v-model="form.body"
        rows="4"
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
