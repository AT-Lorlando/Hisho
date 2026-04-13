<script setup lang="ts">
import type { Skill, SkillPayload } from '~/types/content'

const props = defineProps<{ initial?: Skill | null }>()
const emit = defineEmits<{ submit: [data: SkillPayload]; cancel: [] }>()

const form = reactive<SkillPayload>({
  title: props.initial?.title ?? '',
  category: props.initial?.category ?? '',
  level: props.initial?.level ?? 'intermédiaire',
  tags: props.initial?.tags ?? [],
  yearsOfExperience: props.initial?.yearsOfExperience ?? undefined,
  lastUsed: props.initial?.lastUsed ?? '',
  contexts: props.initial?.contexts ?? '',
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
        <Label for="title">Compétence *</Label>
        <Input id="title" v-model="form.title" placeholder="TypeScript" required />
      </div>
      <div class="space-y-1.5">
        <Label for="category">Catégorie *</Label>
        <select id="category" v-model="form.category" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
          <option value="">— Choisir —</option>
          <option>Langage</option>
          <option>Framework</option>
          <option>Outil</option>
          <option>Cloud</option>
          <option>Méthode</option>
          <option>Base de données</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <Label for="level">Niveau *</Label>
        <select id="level" v-model="form.level" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="débutant">Débutant</option>
          <option value="intermédiaire">Intermédiaire</option>
          <option value="avancé">Avancé</option>
          <option value="expert">Expert</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <Label for="yearsOfExperience">Années d'expérience</Label>
        <Input id="yearsOfExperience" v-model.number="form.yearsOfExperience" type="number" min="0" max="30" placeholder="3" />
      </div>
      <div class="space-y-1.5">
        <Label for="lastUsed">Dernière utilisation</Label>
        <Input id="lastUsed" v-model="form.lastUsed" placeholder="2024-06" />
      </div>
      <div class="space-y-1.5">
        <Label for="tags">Tags (séparés par virgule)</Label>
        <Input id="tags" v-model="tagsInput" placeholder="frontend, backend, typage" />
      </div>
    </div>

    <div class="space-y-1.5">
      <Label for="contexts">Contextes d'utilisation</Label>
      <textarea
        id="contexts"
        v-model="form.contexts"
        rows="3"
        placeholder="Développement full-stack, typage strict, generics..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
      />
    </div>

    <div class="space-y-1.5">
      <Label for="body">Notes (Markdown)</Label>
      <textarea
        id="body"
        v-model="form.body"
        rows="3"
        placeholder="Notes complémentaires..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none font-mono"
      />
    </div>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="emit('cancel')">Annuler</Button>
      <Button type="submit">Sauvegarder → MD</Button>
    </div>
  </form>
</template>
