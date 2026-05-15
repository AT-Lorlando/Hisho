<script setup lang="ts">
const {
  isProgressOpen,
  isProgressExpanded,
  isExtracting,
  isImporting,
  streamingContent,
  extractedData,
  extractError,
  rawJsonOnError,
  importResult,
  importProfile,
  downloadJson,
  downloadRawJson,
  dismissProgress,
} = useAiProfileFill()

const scrollEl = ref<HTMLElement | null>(null)

watch(streamingContent, async () => {
  await nextTick()
  if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
})

const hasResult = computed(
  () => (extractedData.value?.experiences?.length ?? 0) + (extractedData.value?.missions?.length ?? 0) > 0
)

const statusLabel = computed(() => {
  if (isExtracting.value) return 'Analyse en cours…'
  if (extractError.value) return 'Erreur'
  if (hasResult.value) return 'Analyse terminée'
  if (extractedData.value) return 'Aucun contenu extrait'
  return ''
})
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="isProgressOpen"
      class="fixed bottom-4 right-4 z-50 w-96 rounded-xl border border-border bg-background shadow-lg flex flex-col overflow-hidden"
    >
      <!-- Header -->
      <div
        class="flex items-center gap-2 px-4 py-3 border-b border-border cursor-pointer select-none"
        @click="isProgressExpanded = !isProgressExpanded"
      >
        <Icon
          :name="isExtracting ? 'lucide:loader-circle' : extractError ? 'lucide:alert-circle' : 'lucide:sparkles'"
          class="w-4 h-4 shrink-0"
          :class="{
            'animate-spin text-primary': isExtracting,
            'text-destructive': extractError,
            'text-primary': !isExtracting && !extractError,
          }"
        />
        <span class="flex-1 text-sm font-medium truncate">{{ statusLabel }}</span>
        <Icon
          :name="isProgressExpanded ? 'lucide:chevron-down' : 'lucide:chevron-up'"
          class="w-4 h-4 text-muted-foreground"
        />
        <button
          v-if="!isExtracting"
          class="ml-1 p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          @click.stop="dismissProgress"
        >
          <Icon name="lucide:x" class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Body -->
      <div v-if="isProgressExpanded" class="flex flex-col min-h-0">
        <!-- Streaming content -->
        <div
          v-if="streamingContent"
          ref="scrollEl"
          class="max-h-72 overflow-y-auto p-3 bg-muted/40"
        >
          <pre class="text-xs font-mono whitespace-pre-wrap break-words leading-relaxed text-foreground/80">{{ streamingContent }}</pre>
        </div>

        <!-- Error -->
        <div v-if="extractError" class="px-4 py-3 text-sm text-destructive space-y-2">
          <p>{{ extractError }}</p>
          <button
            v-if="rawJsonOnError"
            class="text-xs underline"
            @click="downloadRawJson"
          >
            Télécharger JSON brut
          </button>
        </div>

        <!-- Result summary + actions -->
        <div v-if="extractedData" class="px-4 py-3 space-y-3 border-t border-border">
          <p class="text-sm text-muted-foreground">
            <span v-if="hasResult">
              {{ extractedData.experiences?.length ?? 0 }} expérience(s),
              {{ extractedData.missions?.length ?? 0 }} projet(s) perso
            </span>
            <span v-else class="italic">Aucun contenu structuré extrait.</span>
          </p>

          <!-- Import result -->
          <div v-if="importResult" class="space-y-1">
            <p class="text-xs text-green-700 font-medium">{{ importResult.created.length }} élément(s) importé(s)</p>
            <p v-if="importResult.errors.length" class="text-xs text-destructive">
              {{ importResult.errors.length }} erreur(s)
            </p>
          </div>

          <!-- Action buttons -->
          <div v-if="!importResult" class="flex gap-2">
            <button
              class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-input bg-background hover:bg-muted transition-colors"
              :disabled="!hasResult"
              @click="downloadJson"
            >
              <Icon name="lucide:file-down" class="w-3.5 h-3.5" />
              Télécharger JSON
            </button>
            <button
              class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              :disabled="!hasResult || isImporting"
              @click="importProfile"
            >
              <Icon
                :name="isImporting ? 'lucide:loader-circle' : 'lucide:download'"
                class="w-3.5 h-3.5"
                :class="{ 'animate-spin': isImporting }"
              />
              Importer
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(1rem);
  opacity: 0;
}
</style>
