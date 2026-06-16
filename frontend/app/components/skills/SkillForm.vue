<script setup lang="ts">
import type { Domain, Skill, SkillPayload } from '~/types/content'

const props = defineProps<{
  initial?: Skill | null
  domains: Domain[]
}>()
const emit = defineEmits<{
  submit: [data: SkillPayload]
  cancel: []
  domainCreated: []
}>()

const form = reactive<SkillPayload>({
  title: props.initial?.title ?? '',
  domainSlug: props.initial?.domain?.slug ?? undefined,
  level: props.initial?.level ?? undefined,
  yearsOfExperience: props.initial?.yearsOfExperience,
})

const isAddingDomain = ref(false)
const newDomainTitle = ref('')

async function createDomain() {
  if (!newDomainTitle.value.trim()) return
  const res = await $fetch<{ slug: string }>('/api/v1/domains', {
    method: 'POST',
    body: { title: newDomainTitle.value.trim() },
  })
  form.domainSlug = res.slug
  newDomainTitle.value = ''
  isAddingDomain.value = false
  emit('domainCreated')
}

function handleSubmit() {
  emit('submit', {
    title: form.title,
    domainSlug: form.domainSlug || undefined,
    level: form.level || undefined,
    yearsOfExperience: form.yearsOfExperience || undefined,
  })
}
</script>

<template>
  <form class="space-y-3" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-1.5">
        <Label for="sk-title">Compétence *</Label>
        <Input id="sk-title" v-model="form.title" placeholder="TypeScript" required />
      </div>
      <div class="space-y-1.5">
        <Label for="sk-years">Années d'expérience</Label>
        <Input id="sk-years" v-model.number="form.yearsOfExperience" type="number" min="0" max="30" placeholder="3" />
      </div>
    </div>

    <div class="space-y-1.5">
      <Label for="sk-level">Niveau</Label>
      <select
        id="sk-level"
        v-model.number="form.level"
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        <option :value="undefined">— non défini —</option>
        <option v-for="n in 5" :key="n" :value="n">{{ n }}/5</option>
      </select>
    </div>

    <div class="space-y-1.5">
      <Label for="sk-domain">Domaine</Label>
      <div v-if="!isAddingDomain" class="flex gap-2">
        <select
          id="sk-domain"
          v-model="form.domainSlug"
          class="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">— choisir —</option>
          <option v-for="d in domains" :key="d.slug" :value="d.slug">{{ d.title }}</option>
        </select>
        <Button type="button" variant="outline" size="sm" class="shrink-0" @click="isAddingDomain = true">
          <Icon name="lucide:plus" class="w-3.5 h-3.5 mr-1" />
          Nouveau
        </Button>
      </div>
      <div v-else class="flex gap-2">
        <Input v-model="newDomainTitle" placeholder="Nom du domaine" class="flex-1" @keydown.enter.prevent="createDomain" />
        <Button type="button" size="sm" @click="createDomain">Créer</Button>
        <Button type="button" variant="ghost" size="sm" @click="isAddingDomain = false; newDomainTitle = ''">
          <Icon name="lucide:x" class="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-1">
      <Button type="button" variant="outline" @click="emit('cancel')">Annuler</Button>
      <Button type="submit">Sauvegarder</Button>
    </div>
  </form>
</template>
