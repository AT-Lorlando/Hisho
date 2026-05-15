<script setup lang="ts">
const {
  isOpen,
  profileText,
  extractedData,
  streamingContent,
  isExtracting,
  isImporting,
  importResult,
  extractError,
  close,
  reset,
  extract,
  importProfile,
  downloadJson,
  downloadRawJson,
  loadJsonFile,
  rawJsonOnError,
} = useAiProfileFill()

const fileInput = ref<HTMLInputElement | null>(null)

async function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  await loadJsonFile(file)
  if (fileInput.value) fileInput.value.value = ''
}

const hasExtractedContent = computed(
  () =>
    (extractedData.value?.experiences?.length ?? 0) > 0 ||
    (extractedData.value?.missions?.length ?? 0) > 0
)
</script>

<template>
  <Dialog :open="isOpen" @update:open="(v) => { if (!v) close() }">
    <DialogContent class="w-4/5 h-[85vh] flex flex-col p-0 gap-0" @update:open="(v: boolean) => { if (!v) close() }">
      <!-- Header -->
      <DialogHeader class="px-6 py-4 border-b border-border shrink-0">
        <div class="flex items-center justify-between">
          <DialogTitle class="flex items-center gap-2">
            <Icon name="lucide:sparkles" class="w-5 h-5 text-primary" />
            Remplir mon profil avec l'IA
          </DialogTitle>
          <Button variant="ghost" size="sm" class="h-8 w-8 p-0" @click="close">
            <Icon name="lucide:x" class="w-4 h-4" />
          </Button>
        </div>
      </DialogHeader>

      <!-- Body — 2 columns -->
      <div class="flex flex-1 min-h-0">
        <!-- Left: input -->
        <div class="flex flex-col flex-1 border-r border-border min-w-0">
          <div class="flex-1 p-4">
            <p class="text-sm text-muted-foreground mb-3">
              Décris ton parcours, tes projets, tes expériences… L'IA analysera le tout pour extraire tes données.
            </p>
            <textarea
              v-model="profileText"
              rows="16"
              placeholder="Ex : J'ai travaillé 3 ans chez Acme Corp comme développeur full-stack (TypeScript, Nuxt, AdonisJS). Ensuite j'ai fait du freelance sur des missions courtes. J'ai aussi un projet perso : Hisho, un outil de gestion de portfolio…"
              class="w-full h-[calc(100%-3rem)] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              :disabled="isExtracting"
            />
          </div>
          <div class="border-t border-border p-4 flex items-center justify-between shrink-0">
            <Button
              variant="outline"
              size="sm"
              class="text-xs text-muted-foreground"
              :disabled="!profileText.trim() && !hasExtractedContent"
              @click="reset"
            >
              <Icon name="lucide:trash-2" class="w-3 h-3 mr-1" />
              Effacer
            </Button>
            <Button
              size="sm"
              :disabled="!profileText.trim() || isExtracting"
              @click="extract"
            >
              <Icon
                :name="isExtracting ? 'lucide:loader-circle' : 'lucide:scan-text'"
                class="w-4 h-4 mr-1.5"
                :class="{ 'animate-spin': isExtracting }"
              />
              Analyser mon profil
            </Button>
          </div>
        </div>

        <!-- Right: recap -->
        <div class="w-80 shrink-0 flex flex-col">
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <!-- Streaming progress -->
            <div v-if="isExtracting" class="space-y-2">
              <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Icon name="lucide:loader-circle" class="w-3 h-3 animate-spin" />
                Génération en cours…
              </p>
              <pre class="text-xs text-foreground/80 whitespace-pre-wrap break-words font-mono bg-muted/50 rounded-md p-3 max-h-96 overflow-y-auto leading-relaxed">{{ streamingContent || '…' }}</pre>
            </div>

            <!-- Empty state -->
            <div
              v-else-if="!hasExtractedContent && !extractError"
              class="text-sm text-muted-foreground text-center py-8 space-y-2"
            >
              <Icon name="lucide:scan-text" class="w-8 h-8 mx-auto opacity-30" />
              <p>Décris ton parcours puis clique sur <strong>Analyser mon profil</strong> pour voir ce que l'IA a compris.</p>
            </div>

            <!-- Extract error -->
            <div v-if="extractError" class="rounded-lg bg-destructive/10 text-destructive text-sm p-3 space-y-2">
              <p>{{ extractError }}</p>
              <Button
                v-if="rawJsonOnError"
                variant="outline"
                size="sm"
                class="w-full text-xs"
                @click="downloadRawJson"
              >
                <Icon name="lucide:file-down" class="w-3.5 h-3.5 mr-1.5" />
                Télécharger JSON brut (à corriger manuellement)
              </Button>
            </div>

            <!-- Extracted experiences -->
            <div v-if="(extractedData?.experiences?.length ?? 0) > 0">
              <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Expériences ({{ extractedData!.experiences!.length }})
              </h3>
              <div
                v-for="(exp, i) in extractedData!.experiences"
                :key="i"
                class="rounded-lg border border-border p-3 text-sm space-y-1 mb-2"
              >
                <p class="font-medium">{{ exp.title }}</p>
                <p class="text-muted-foreground text-xs">{{ exp.role }} · {{ exp.type }}</p>
                <p v-if="exp.client" class="text-muted-foreground text-xs">{{ exp.client }}</p>
                <p v-if="(exp.missions?.length ?? 0) > 0" class="text-xs text-muted-foreground">
                  {{ exp.missions!.length }} mission(s) liée(s)
                </p>
              </div>
            </div>

            <!-- Extracted perso missions -->
            <div v-if="(extractedData?.missions?.length ?? 0) > 0">
              <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Projets perso ({{ extractedData!.missions!.length }})
              </h3>
              <div
                v-for="(mission, i) in extractedData!.missions"
                :key="i"
                class="rounded-lg border border-border p-3 text-sm space-y-1 mb-2"
              >
                <p class="font-medium">{{ mission.title }}</p>
                <p v-if="(mission.domains?.length ?? 0) > 0" class="text-xs text-blue-600">
                  {{ mission.domains.map((d: { name: string }) => d.name).join(', ') }}
                </p>
                <p v-if="(mission.skills?.length ?? 0) > 0" class="text-xs text-muted-foreground">
                  {{ mission.skills.map((s: { name: string }) => s.name).join(', ') }}
                </p>
              </div>
            </div>

            <!-- Import result -->
            <div v-if="importResult" class="space-y-2">
              <div
                v-for="item in importResult.created"
                :key="item"
                class="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded px-2 py-1"
              >
                <Icon name="lucide:check" class="w-3 h-3 shrink-0" />
                {{ item }}
              </div>
              <div
                v-for="err in importResult.errors"
                :key="err"
                class="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded px-2 py-1"
              >
                <Icon name="lucide:alert-circle" class="w-3 h-3 shrink-0 mt-0.5" />
                {{ err }}
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="border-t border-border p-4 space-y-2 shrink-0">
            <!-- Download / Upload JSON -->
            <div class="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                class="flex-1 text-xs"
                :disabled="!hasExtractedContent"
                @click="downloadJson"
              >
                <Icon name="lucide:file-down" class="w-3.5 h-3.5 mr-1.5" />
                Télécharger JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                class="flex-1 text-xs"
                @click="fileInput?.click()"
              >
                <Icon name="lucide:file-up" class="w-3.5 h-3.5 mr-1.5" />
                Charger JSON
              </Button>
              <input
                ref="fileInput"
                type="file"
                accept=".json,application/json"
                class="hidden"
                @change="handleFileChange"
              />
            </div>

            <!-- Import button -->
            <Button
              class="w-full"
              :disabled="!hasExtractedContent || isImporting || !!importResult"
              @click="importProfile"
            >
              <Icon
                :name="isImporting ? 'lucide:loader-circle' : 'lucide:download'"
                class="w-4 h-4 mr-1.5"
                :class="{ 'animate-spin': isImporting }"
              />
              {{ importResult ? 'Import terminé' : 'Importer dans mon profil' }}
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
