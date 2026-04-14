<script setup lang="ts">
import type { Domain, DomainPayload } from '~/types/content'

const props = defineProps<{ initial?: Domain | null }>()
const emit = defineEmits<{ submit: [data: DomainPayload]; cancel: [] }>()

const form = reactive<DomainPayload>({
  title: props.initial?.title ?? '',
  description: props.initial?.description ?? '',
  order: props.initial?.order ?? undefined,
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
        <Label for="title">Nom du domaine *</Label>
        <Input id="title" v-model="form.title" placeholder="Cybersécurité" required />
      </div>
      <div class="space-y-1.5">
        <Label for="order">Ordre d'affichage</Label>
        <Input id="order" v-model.number="form.order" type="number" min="0" placeholder="1" />
      </div>
      <div class="space-y-1.5 col-span-2">
        <Label for="description">Description courte</Label>
        <Input id="description" v-model="form.description" placeholder="SOC, pentest, SIEM, CTF, PKI" />
      </div>
    </div>
    <div class="space-y-1.5">
      <Label for="body">Notes (Markdown)</Label>
      <textarea
        id="body"
        v-model="form.body"
        rows="5"
        placeholder="Positionnement, spécialisation, contexte d'utilisation..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none font-mono"
      />
    </div>
    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="emit('cancel')">Annuler</Button>
      <Button type="submit">Sauvegarder → MD</Button>
    </div>
  </form>
</template>
