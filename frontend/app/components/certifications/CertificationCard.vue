<script setup lang="ts">
import type { Certification } from '~/types/content'

const props = defineProps<{ cert: Certification }>()
const emit = defineEmits<{ edit: []; delete: [] }>()

function formatDate(d: string): string {
  const [y, m] = d.split('-')
  const months = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sep.', 'oct.', 'nov.', 'déc.']
  return `${months[Number(m) - 1]} ${y}`
}

function expiryStatus(expiry: string | undefined): 'expired' | 'soon' | null {
  if (!expiry) return null
  const normalized = expiry.length === 7 ? expiry + '-01' : expiry
  const exp = new Date(normalized)
  if (isNaN(exp.getTime())) return null
  const now = new Date()
  if (exp < now) return 'expired'
  const threeMonths = new Date()
  threeMonths.setMonth(threeMonths.getMonth() + 3)
  if (exp < threeMonths) return 'soon'
  return null
}

const status = computed(() => expiryStatus(props.cert.expiry))
</script>

<template>
  <div class="group border border-border rounded-xl p-5 bg-card hover:border-border/80 transition-colors">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 flex-wrap">
          <p class="font-semibold text-base leading-tight">{{ cert.title }}</p>
          <span
            v-if="status === 'expired'"
            class="text-xs bg-destructive/10 text-destructive rounded px-1.5 py-0.5 font-medium shrink-0"
          >Expiré</span>
          <span
            v-else-if="status === 'soon'"
            class="text-xs bg-orange-500/10 text-orange-500 rounded px-1.5 py-0.5 font-medium shrink-0"
          >Bientôt</span>
        </div>
        <p class="text-sm text-muted-foreground mt-0.5">{{ cert.organism }}</p>
        <p class="text-xs text-muted-foreground mt-1">
          Obtenu : {{ formatDate(cert.date) }}
          <span v-if="cert.expiry">· Expire : {{ formatDate(cert.expiry) }}</span>
        </p>
        <div v-if="cert.tags?.length" class="flex flex-wrap gap-1.5 mt-2">
          <span
            v-for="tag in cert.tags"
            :key="tag"
            class="text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5"
          >{{ tag }}</span>
        </div>
      </div>
      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button size="sm" variant="ghost" class="h-7 w-7 p-0 text-muted-foreground" @click="emit('edit')">
          <Icon name="lucide:pencil" class="w-3.5 h-3.5" />
        </Button>
        <Button size="sm" variant="ghost" class="h-7 w-7 p-0 text-destructive" @click="emit('delete')">
          <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  </div>
</template>
