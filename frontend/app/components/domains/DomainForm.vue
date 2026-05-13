<script setup lang="ts">
import type { Domain, DomainPayload } from '~/types/content'

const props = defineProps<{ initial?: Domain | null }>()
const emit = defineEmits<{ submit: [data: DomainPayload]; cancel: [] }>()

const form = reactive<DomainPayload>({
  title: props.initial?.title ?? '',
  description: props.initial?.description ?? '',
})

function handleSubmit() {
  emit('submit', {
    title: form.title,
    description: form.description || undefined,
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <Label for="dom-title">Nom *</Label>
        <Input id="dom-title" v-model="form.title" placeholder="Frontend" required />
      </div>
      <div class="space-y-1.5">
        <Label for="dom-desc">Description</Label>
        <Input id="dom-desc" v-model="form.description" placeholder="Développement d'interfaces web" />
      </div>
    </div>
    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="emit('cancel')">Annuler</Button>
      <Button type="submit">Sauvegarder</Button>
    </div>
  </form>
</template>
