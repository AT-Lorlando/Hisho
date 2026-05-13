<script setup lang="ts">
import type { Certification, CertificationPayload } from '~/types/content'
import { type DateValue, CalendarDate } from '@internationalized/date'

const props = defineProps<{ initial?: Certification | null }>()
const emit = defineEmits<{ submit: [data: CertificationPayload]; cancel: [] }>()

function fromString(s: string | undefined): DateValue | undefined {
  if (!s) return undefined
  const [y, m, d] = s.split('-').map(Number)
  return new CalendarDate(y, m, d || 1)
}

const form = reactive({
  title: props.initial?.title ?? '',
  organism: props.initial?.organism ?? '',
  credentialId: props.initial?.credentialId ?? '',
  url: props.initial?.url ?? '',
  tags: props.initial?.tags ?? ([] as string[]),
})

const dateValue = ref<DateValue | undefined>(fromString(props.initial?.date))
const expiryValue = ref<DateValue | undefined>(fromString(props.initial?.expiry))

function handleSubmit() {
  if (!dateValue.value) return
  emit('submit', {
    title: form.title,
    organism: form.organism,
    date: dateValue.value.toString(),
    expiry: expiryValue.value?.toString(),
    credentialId: form.credentialId || undefined,
    url: form.url || undefined,
    tags: form.tags,
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <Label for="cert-title">Titre *</Label>
        <Input id="cert-title" v-model="form.title" placeholder="AWS Solutions Architect Associate" required />
      </div>
      <div class="space-y-1.5">
        <Label for="cert-org">Organisme *</Label>
        <Input id="cert-org" v-model="form.organism" placeholder="Amazon Web Services" required />
      </div>

      <div class="space-y-1.5">
        <Label>Date d'obtention *</Label>
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline" class="w-full justify-start text-left font-normal" :class="!dateValue && 'text-muted-foreground'">
              <Icon name="lucide:calendar" class="mr-2 h-4 w-4" />
              {{ dateValue ? dateValue.toString() : 'Choisir une date' }}
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0">
            <Calendar v-model="dateValue" />
          </PopoverContent>
        </Popover>
      </div>

      <div class="space-y-1.5">
        <Label>Date d'expiration</Label>
        <div class="flex gap-2">
          <Popover>
            <PopoverTrigger as-child>
              <Button variant="outline" class="flex-1 justify-start text-left font-normal" :class="!expiryValue && 'text-muted-foreground'">
                <Icon name="lucide:calendar" class="mr-2 h-4 w-4" />
                {{ expiryValue ? expiryValue.toString() : 'Optionnel' }}
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
              <Calendar v-model="expiryValue" />
            </PopoverContent>
          </Popover>
          <Button
            v-if="expiryValue"
            type="button"
            variant="ghost"
            size="sm"
            class="h-9 w-9 p-0 text-muted-foreground shrink-0"
            @click="expiryValue = undefined"
          >
            <Icon name="lucide:x" class="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div class="space-y-1.5">
        <Label for="cert-id">ID de certification</Label>
        <Input id="cert-id" v-model="form.credentialId" placeholder="ABC123" />
      </div>
      <div class="space-y-1.5">
        <Label for="cert-url">URL de vérification</Label>
        <Input id="cert-url" v-model="form.url" placeholder="https://..." />
      </div>

      <div class="space-y-1.5 col-span-2">
        <Label>Tags</Label>
        <UiTagInput v-model="form.tags" placeholder="cloud, aws..." />
      </div>
    </div>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="emit('cancel')">Annuler</Button>
      <Button type="submit" :disabled="!dateValue">Sauvegarder</Button>
    </div>
  </form>
</template>
