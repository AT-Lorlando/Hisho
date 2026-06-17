<!-- frontend/app/components/missions/MissionForm.vue -->
<script setup lang="ts">
import type { Mission, MissionPayload, SkillEntry } from '~/types/content'

const props = defineProps<{ initial?: Mission | null }>()
const emit = defineEmits<{ submit: [data: MissionPayload]; cancel: [] }>()

const form = reactive({
  title: props.initial?.title ?? '',
  startDate: props.initial?.startDate,
  endDate: props.initial?.endDate,
  skills: (props.initial?.skills ?? []) as SkillEntry[],
})

function handleSubmit() {
  emit('submit', {
    title: form.title,
    type: 'perso',
    startDate: form.startDate || undefined,
    endDate: form.endDate || undefined,
    skills: form.skills,
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-2 gap-4">
      <div class="col-span-2 space-y-1.5">
        <Label for="mp-title">Titre *</Label>
        <Input id="mp-title" v-model="form.title" placeholder="Hisho" required />
      </div>
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

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="emit('cancel')">Annuler</Button>
      <Button type="submit">Sauvegarder</Button>
    </div>
  </form>
</template>
