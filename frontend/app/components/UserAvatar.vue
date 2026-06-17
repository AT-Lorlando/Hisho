<!-- frontend/app/components/profile/UserAvatar.vue -->
<script setup lang="ts">
const props = withDefaults(
  defineProps<{ name?: string | null; size?: 'sm' | 'md' | 'lg' }>(),
  { name: null, size: 'md' }
)

const initials = computed(() => {
  const n = (props.name ?? '').trim()
  if (!n) return ''
  const parts = n.split(/\s+/).filter(Boolean)
  const first = parts[0] ?? ''
  const last = parts[parts.length - 1] ?? ''
  const letters = parts.length === 1 ? first.slice(0, 2) : (first[0] ?? '') + (last[0] ?? '')
  return letters.toUpperCase()
})

const sizeClass = computed(
  () =>
    ({
      sm: 'h-8 w-8 text-xs',
      md: 'h-12 w-12 text-base',
      lg: 'h-20 w-20 text-2xl',
    })[props.size]
)
</script>

<template>
  <div
    class="inline-flex shrink-0 select-none items-center justify-center rounded-full bg-primary font-serif font-semibold text-primary-foreground"
    :class="sizeClass"
  >
    <span v-if="initials">{{ initials }}</span>
    <Icon v-else name="lucide:user" class="h-1/2 w-1/2" />
  </div>
</template>
