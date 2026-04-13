<script setup lang="ts">
import type { Certification, CertificationPayload } from '~/types/content'

const props = defineProps<{ initial?: Certification | null }>()
const emit = defineEmits<{ submit: [data: CertificationPayload]; cancel: [] }>()

const form = reactive<CertificationPayload>({
  title: props.initial?.title ?? '',
  organism: props.initial?.organism ?? '',
  date: props.initial?.date ?? '',
  expiry: props.initial?.expiry ?? '',
  credentialId: props.initial?.credentialId ?? '',
  url: props.initial?.url ?? '',
  tags: props.initial?.tags ?? [],
  body: props.initial?.body ?? '',
})

const tagsInput = ref((props.initial?.tags ?? []).join(', '))

function handleSubmit() {
  form.tags = tagsInput.value.split(',').map(s => s.trim()).filter(Boolean)
  emit('submit', { ...form })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <Label for="title">Certification *</Label>
        <Input id="title" v-model="form.title" placeholder="AWS Solutions Architect Associate" required />
      </div>
      <div class="space-y-1.5">
        <Label for="organism">Organisme *</Label>
        <Input id="organism" v-model="form.organism" placeholder="Amazon Web Services" required />
      </div>
      <div class="space-y-1.5">
        <Label for="date">Date d'obtention *</Label>
        <Input id="date" v-model="form.date" placeholder="2023-06" required />
      </div>
      <div class="space-y-1.5">
        <Label for="expiry">Date d'expiration</Label>
        <Input id="expiry" v-model="form.expiry" placeholder="2026-06" />
      </div>
      <div class="space-y-1.5">
        <Label for="credentialId">ID de la certification</Label>
        <Input id="credentialId" v-model="form.credentialId" placeholder="ABC123XYZ" />
      </div>
      <div class="space-y-1.5">
        <Label for="url">URL de vérification</Label>
        <Input id="url" v-model="form.url" placeholder="https://credentials.example.com/..." />
      </div>
    </div>

    <div class="space-y-1.5">
      <Label for="tags">Tags (séparés par virgule)</Label>
      <Input id="tags" v-model="tagsInput" placeholder="cloud, aws, architecture" />
    </div>

    <div class="space-y-1.5">
      <Label for="body">Notes personnelles (Markdown)</Label>
      <textarea
        id="body"
        v-model="form.body"
        rows="3"
        placeholder="Notes sur la préparation, ressources utilisées..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none font-mono"
      />
    </div>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="emit('cancel')">Annuler</Button>
      <Button type="submit">Sauvegarder → MD</Button>
    </div>
  </form>
</template>
