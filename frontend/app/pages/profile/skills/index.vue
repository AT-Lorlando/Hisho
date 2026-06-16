<script setup lang="ts">
import type { Domain, Skill, SkillPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { items: skills, refresh: refreshSkills } = useContent<Skill>('skills')
const { items: domains, refresh: refreshDomains } = useContent<Domain>('domains')
const { create, update, remove } = useContentFile('skills')

const isCreating = ref(false)
const editingSlug = ref<string | null>(null)

const grouped = computed(() => {
  const map: Record<string, Skill[]> = {}
  for (const s of skills.value ?? []) {
    const key = s.domain?.title ?? 'Sans domaine'
    if (!map[key]) map[key] = []
    map[key].push(s)
  }
  return map
})

function startCreate() {
  editingSlug.value = null
  isCreating.value = true
}

function startEdit(slug: string) {
  isCreating.value = false
  editingSlug.value = slug
}

async function handleCreate(data: SkillPayload) {
  await create(data)
  await refreshSkills()
  isCreating.value = false
}

async function handleUpdate(slug: string, data: SkillPayload) {
  await update(slug, data)
  await refreshSkills()
  editingSlug.value = null
}

async function handleDelete(slug: string) {
  if (!confirm('Supprimer cette compétence ?')) return
  await remove(slug)
  await refreshSkills()
}

async function handleDomainCreated() {
  await refreshDomains()
}

</script>

<template>
  <div class="p-8 max-w-5xl space-y-6">
    <h1 class="text-2xl font-bold mb-2">Compétences</h1>

    <!-- Grouped by domain -->
    <div v-for="(domainSkills, domainName) in grouped" :key="domainName" class="space-y-2">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{{ domainName }}</h2>
        <span class="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">{{ domainSkills.length }}</span>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <template v-for="skill in domainSkills" :key="skill.slug">
          <!-- Inline edit form spans the full row -->
          <div
            v-if="editingSlug === skill.slug"
            class="rounded-xl border border-primary/40 bg-accent/10 p-4 sm:col-span-2 lg:col-span-3"
          >
            <SkillsSkillForm
              :initial="skill"
              :domains="domains ?? []"
              @submit="(d) => handleUpdate(skill.slug, d)"
              @cancel="editingSlug = null"
              @domain-created="handleDomainCreated"
            />
          </div>
          <SkillsSkillRow
            v-else
            :skill="skill"
            @edit="startEdit(skill.slug)"
            @delete="handleDelete(skill.slug)"
          />
        </template>
      </div>
    </div>

    <p v-if="!skills?.length && !isCreating" class="text-sm text-muted-foreground text-center py-4">
      Aucune compétence encore.
    </p>

    <!-- Global create form -->
    <div v-if="isCreating" class="border border-primary/40 rounded-xl p-5 bg-accent/10">
      <h2 class="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">Nouvelle compétence</h2>
      <SkillsSkillForm
        :domains="domains ?? []"
        @submit="handleCreate"
        @cancel="isCreating = false"
        @domain-created="handleDomainCreated"
      />
    </div>

    <div
      v-if="!isCreating"
      class="border border-dashed border-border rounded-xl p-5 flex items-center justify-center gap-2 text-sm text-muted-foreground cursor-pointer hover:border-primary/40 hover:text-primary transition-colors"
      @click="startCreate"
    >
      <Icon name="lucide:plus" class="w-4 h-4" />
      <span>Nouvelle compétence</span>
    </div>
  </div>
</template>
