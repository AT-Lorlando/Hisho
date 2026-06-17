<script setup lang="ts">
const { open } = useAiProfileFill()
</script>

<template>
  <button
    class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-primary bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95"
    @click="open"
  >
    <Icon name="lucide:sparkles" class="w-4 h-4" />
    <span>Remplir avec l'IA</span>
  </button>
</template>
