import type { ExtractedProfile, ImportResult } from '~/types/content'

// Singleton state — shared across all component instances
const isOpen = ref(false)
const profileText = ref('')
const extractedData = ref<ExtractedProfile | null>(null)
const isExtracting = ref(false)
const isImporting = ref(false)
const importResult = ref<ImportResult | null>(null)
const extractError = ref<string | null>(null)
const rawJsonOnError = ref<string | null>(null)

export function useAiProfileFill() {
  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function reset() {
    profileText.value = ''
    extractedData.value = null
    importResult.value = null
    extractError.value = null
    rawJsonOnError.value = null
  }

  async function extract() {
    if (!profileText.value.trim()) return
    isExtracting.value = true
    extractError.value = null
    extractedData.value = null

    try {
      const res = await $fetch<ExtractedProfile>('/api/v1/ai/extract', {
        method: 'POST',
        body: { message: profileText.value },
      })
      extractedData.value = res
      rawJsonOnError.value = null
    } catch (e: any) {
      extractError.value = e.data?.message ?? "L'IA n'a pas pu extraire les données. Essaie de reformuler."
      rawJsonOnError.value = e.data?.rawJson ?? null
    } finally {
      isExtracting.value = false
    }
  }

  async function importProfile() {
    if (!extractedData.value) return
    isImporting.value = true
    importResult.value = null

    try {
      const res = await $fetch<ImportResult>('/api/v1/ai/import', {
        method: 'POST',
        body: extractedData.value,
      })
      importResult.value = res
    } catch (e: any) {
      importResult.value = { created: [], errors: [e.data?.message ?? "Erreur lors de l'import"] }
    } finally {
      isImporting.value = false
    }
  }

  function downloadRawJson() {
    if (!rawJsonOnError.value) return
    const blob = new Blob([rawJsonOnError.value], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `profil-ia-brut-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function downloadJson() {
    if (!extractedData.value) return
    const blob = new Blob([JSON.stringify(extractedData.value, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `profil-ia-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function loadJsonFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string) as ExtractedProfile
          extractedData.value = parsed
          importResult.value = null
          extractError.value = null
          resolve()
        } catch {
          extractError.value = 'Fichier JSON invalide.'
          reject()
        }
      }
      reader.readAsText(file)
    })
  }

  return {
    isOpen,
    profileText,
    extractedData,
    isExtracting,
    isImporting,
    importResult,
    extractError,
    open,
    close,
    reset,
    extract,
    importProfile,
    downloadJson,
    downloadRawJson,
    loadJsonFile,
    rawJsonOnError,
  }
}
