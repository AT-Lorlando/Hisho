<!-- frontend/app/components/missions/MissionSkillsEditor.vue -->
<script setup lang="ts">
import type { Domain, SkillEntry } from '~/types/content'

const model = defineModel<SkillEntry[]>({ required: true })

interface Row { name: string; level: number; domain: string; _key: number }
let _k = 0
const rows = ref<Row[]>(
  (model.value ?? []).map((s) => ({ name: s.name, level: s.level, domain: s.domain ?? '', _key: ++_k }))
)

const { items: domains, refresh } = useContent<Domain>('domains')

function emitModel() {
  model.value = rows.value
    .filter((r) => r.name.trim())
    .map((r) => ({
      name: r.name.trim(),
      level: r.level as 1 | 2 | 3 | 4 | 5,
      domain: r.domain || undefined,
    }))
}
watch(rows, emitModel, { deep: true })

function addRow() {
  rows.value.push({ name: '', level: 3, domain: '', _key: ++_k })
}
function removeRow(i: number) {
  rows.value.splice(i, 1)
}

const creatingFor = ref<number | null>(null)
const newDomain = ref('')
async function createDomain(i: number) {
  const title = newDomain.value.trim()
  if (!title) return
  await $fetch('/api/v1/domains', { method: 'POST', body: { title } })
  await refresh()
  rows.value[i]!.domain = title
  newDomain.value = ''
  creatingFor.value = null
}
</script>

<template>
  <div class="space-y-2">
    <Label>Compétences</Label>
    <div v-for="(row, i) in rows" :key="row._key" class="flex flex-wrap items-center gap-2">
      <Input v-model="row.name" class="min-w-32 flex-1" placeholder="Vue.js" />

      <select
        v-model.number="row.level"
        class="w-28 shrink-0 rounded-md border border-input bg-background px-2 py-2 text-sm"
      >
        <option :value="1">1 — Notions</option>
        <option :value="2">2 — Débutant</option>
        <option :value="3">3 — Intermédiaire</option>
        <option :value="4">4 — Avancé</option>
        <option :value="5">5 — Expert</option>
      </select>

      <template v-if="creatingFor === i">
        <Input v-model="newDomain" class="w-40 shrink-0" placeholder="Nouveau domaine" @keydown.enter.prevent="createDomain(i)" />
        <Button type="button" size="sm" class="shrink-0" @click="createDomain(i)">OK</Button>
      </template>
      <template v-else>
        <select
          v-model="row.domain"
          class="w-40 shrink-0 rounded-md border border-input bg-background px-2 py-2 text-sm"
        >
          <option value="">— domaine —</option>
          <option v-for="d in domains ?? []" :key="d.slug" :value="d.title">{{ d.title }}</option>
        </select>
        <Button type="button" variant="outline" size="sm" class="h-9 w-9 shrink-0 p-0" title="Nouveau domaine" @click="creatingFor = i">
          <Icon name="lucide:plus" class="h-3.5 w-3.5" />
        </Button>
      </template>

      <Button type="button" variant="ghost" size="sm" class="h-9 w-9 shrink-0 p-0 text-muted-foreground" @click="removeRow(i)">
        <Icon name="lucide:x" class="h-3.5 w-3.5" />
      </Button>
    </div>

    <Button type="button" variant="outline" size="sm" @click="addRow">
      <Icon name="lucide:plus" class="mr-1 h-3.5 w-3.5" />Ajouter une compétence
    </Button>
  </div>
</template>
