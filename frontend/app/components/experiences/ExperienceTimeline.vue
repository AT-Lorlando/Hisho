<script setup lang="ts">
import type { Experience, Mission } from '~/types/content'

const props = defineProps<{
  experiences: Experience[]
  missionsByExp: Record<string, Mission[]>
}>()

/** Convert "YYYY-MM" string to a monotonic month index */
function toMonthIndex(ym: string): number {
  const [y, m] = ym.split('-').map(Number)
  return y * 12 + m
}

const now = new Date()
const nowIndex = now.getFullYear() * 12 + (now.getMonth() + 1)

/** Resolve endDate — null/undefined means "en cours" → today */
function resolveEnd(endDate: string | undefined | null): number {
  return endDate ? toMonthIndex(endDate) : nowIndex
}

/** Global date bounds across all experiences and their missions */
const bounds = computed(() => {
  const mins: number[] = []
  const maxs: number[] = []

  for (const exp of props.experiences) {
    if (!exp.startDate) continue
    mins.push(toMonthIndex(exp.startDate))
    maxs.push(resolveEnd(exp.endDate))

    for (const m of props.missionsByExp[exp.slug] ?? []) {
      if (!m.startDate) continue
      mins.push(toMonthIndex(m.startDate))
      maxs.push(resolveEnd(m.endDate))
    }
  }

  if (mins.length === 0) return null
  return { min: Math.min(...mins), max: Math.max(...maxs) }
})

/** Convert a month index to a left-offset percentage */
function pct(idx: number): number {
  if (!bounds.value) return 0
  const { min, max } = bounds.value
  const total = max - min
  if (total === 0) return 0
  return ((idx - min) / total) * 100
}

/** Year labels to render on the X axis */
const yearMarkers = computed(() => {
  if (!bounds.value) return []
  const { min, max } = bounds.value
  const markers: { year: number; left: number }[] = []
  for (let y = Math.floor(min / 12); y <= Math.floor(max / 12); y++) {
    const janIdx = y * 12 + 1
    if (janIdx >= min) {
      markers.push({ year: y, left: pct(janIdx) })
    }
  }
  return markers
})

/** Experiences that have at least a startDate */
const experiencesWithDates = computed(() =>
  props.experiences.filter((e) => !!e.startDate)
)

/** Missions of an experience that have at least a startDate */
function missionsWithDates(expSlug: string): Mission[] {
  return (props.missionsByExp[expSlug] ?? []).filter((m) => !!m.startDate)
}

function expBarStyle(exp: Experience): Record<string, string> {
  if (!bounds.value || !exp.startDate) return {}
  const start = toMonthIndex(exp.startDate)
  const end = resolveEnd(exp.endDate)
  return {
    left: pct(start) + '%',
    width: Math.max(pct(end) - pct(start), 0.5) + '%',
    minWidth: '4px',
  }
}

function missionBarStyle(m: Mission): Record<string, string> {
  if (!bounds.value || !m.startDate) return {}
  const start = toMonthIndex(m.startDate)
  const end = resolveEnd(m.endDate)
  return {
    left: pct(start) + '%',
    width: Math.max(pct(end) - pct(start), 0.5) + '%',
    minWidth: '4px',
  }
}
</script>

<template>
  <div v-if="bounds && bounds.max > bounds.min" class="mb-8 rounded border border-border bg-card p-4 overflow-x-auto">
    <h2 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Timeline</h2>

    <!-- X axis — year labels -->
    <div class="relative ml-44 h-5 mb-1 border-b border-border/40">
      <span
        v-for="m in yearMarkers"
        :key="m.year"
        class="absolute text-xs text-muted-foreground bottom-1"
        :style="{ left: m.left + '%' }"
      >
        {{ m.year }}
      </span>
    </div>

    <!-- One group per experience -->
    <div v-for="exp in experiencesWithDates" :key="exp.slug" class="mb-1.5">

      <!-- Experience bar row -->
      <div class="flex items-center gap-2">
        <div class="w-44 shrink-0 text-xs font-medium text-right pr-3 truncate text-muted-foreground">
          {{ exp.title }}
        </div>
        <div class="relative flex-1 h-7">
          <div
            class="absolute inset-y-0 rounded bg-primary/20 border border-primary/40 flex items-center px-2 overflow-hidden"
            :style="expBarStyle(exp)"
          >
            <span class="text-xs font-medium truncate text-primary/80 select-none">{{ exp.title }}</span>
          </div>
        </div>
      </div>

      <!-- Mission sub-bar rows -->
      <div
        v-for="m in missionsWithDates(exp.slug)"
        :key="m.slug"
        class="flex items-center gap-2 mt-0.5"
      >
        <div class="w-44 shrink-0 text-[10px] text-right pr-3 truncate text-muted-foreground/50">
          {{ m.title }}
        </div>
        <div class="relative flex-1 h-5">
          <div
            class="absolute inset-y-0 rounded bg-primary/50 flex items-center px-1.5 overflow-hidden"
            :style="missionBarStyle(m)"
          >
            <span class="text-[10px] truncate text-white/90 select-none">{{ m.title }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
