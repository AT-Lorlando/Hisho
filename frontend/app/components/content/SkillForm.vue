<script setup lang="ts">
import type { Domain, Skill, SkillPayload } from '~/types/content'

const props = defineProps<{ initial?: Skill | null }>()
const emit = defineEmits<{ submit: [data: SkillPayload]; cancel: [] }>()

const { items: domains } = useContent<Domain>('domains')

const form = reactive<SkillPayload>({
  title: props.initial?.title ?? '',
  domain: props.initial?.domain ?? '',
  yearsOfExperience: props.initial?.yearsOfExperience ?? undefined,
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
        <Label for="title">Compétence *</Label>
        <Input id="title" v-model="form.title" placeholder="ELK Stack" required />
      </div>
      <div class="space-y-1.5">
        <Label for="domain">Domaine *</Label>
        <input
          id="domain"
          v-model="form.domain"
          list="domain-list"
          required
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Cybersécurité"
        />
        <datalist id="domain-list">
          <option v-for="d in domains" :key="d.slug" :value="d.title" />
        </datalist>
      </div>
      <div class="space-y-1.5">
        <Label for="years">Années d'expérience</Label>
        <Input id="years" v-model.number="form.yearsOfExperience" type="number" min="0" max="30" placeholder="3" />
      </div>
    </div>

    <div class="space-y-1.5">
      <Label for="body">Contexte d'utilisation (Markdown)</Label>
      <textarea
        id="body"
        v-model="form.body"
        rows="7"
        placeholder="Décris comment tu utilises cette techno : projets, contexte, ce qui te distingue, niveau implicite...&#10;&#10;Exemple : 3 déploiements ELK sur systèmes sensibles (prod). Ingestion multi-sources (syslog, beats, API), dashboards Kibana custom, alerting Watcher. Utilisé en contexte SOC pour la détection d'anomalies."
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none font-mono"
      />
    </div>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="emit('cancel')">Annuler</Button>
      <Button type="submit">Sauvegarder → MD</Button>
    </div>
  </form>
</template>
