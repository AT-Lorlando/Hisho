<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-300"
    :class="{ 'opacity-0 pointer-events-none': !show }"
  >
    <div class="flex flex-col items-center gap-4">
      <div class="relative w-16 h-16">
        <div class="absolute inset-0 rounded-full border-4 border-primary/30"></div>
        <div class="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      <p v-if="message" class="text-sm text-muted-foreground">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  message?: string
}

withDefaults(defineProps<Props>(), {
  message: 'Loading...',
})
</script>
