import type { ExtractedProfile, ImportResult } from '~/types/content'

// Singleton state — shared across all component instances
const isOpen = ref(false)
const isProgressOpen = ref(false)
const isProgressExpanded = ref(true)
const profileText = ref('')
const extractedData = ref<ExtractedProfile | null>(null)
const streamingContent = ref('')
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
    streamingContent.value = ''
    importResult.value = null
    extractError.value = null
    rawJsonOnError.value = null
  }

  async function extract() {
    if (!profileText.value.trim()) return
    // Close the input dialog and open the floating progress panel
    isOpen.value = false
    isProgressOpen.value = true
    isProgressExpanded.value = true
    isExtracting.value = true
    extractError.value = null
    extractedData.value = null
    streamingContent.value = ''
    importResult.value = null
    rawJsonOnError.value = null

    try {
      const res = await fetch('/api/v1/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: profileText.value }),
      })

      if (!res.body) throw new Error('Pas de réponse du serveur.')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue
          const data = JSON.parse(part.slice(6)) as {
            type: 'chunk' | 'done' | 'error'
            content?: string
            result?: ExtractedProfile
            message?: string
            rawJson?: string | null
          }

          if (data.type === 'chunk' && data.content) {
            streamingContent.value += data.content
          } else if (data.type === 'done' && data.result) {
            extractedData.value = data.result
          } else if (data.type === 'error') {
            extractError.value = data.message ?? "L'IA n'a pas pu extraire les données."
            rawJsonOnError.value = data.rawJson ?? null
          }
        }
      }
    } catch (e: any) {
      // Ignore AbortError — happens when client navigates away intentionally
      if (e?.name !== 'AbortError') {
        extractError.value = e.message ?? "L'IA n'a pas pu extraire les données. Essaie de reformuler."
      }
    } finally {
      isExtracting.value = false
    }
  }

  function dismissProgress() {
    if (isExtracting.value) return // don't close while running
    isProgressOpen.value = false
    streamingContent.value = ''
    extractedData.value = null
    importResult.value = null
    extractError.value = null
    rawJsonOnError.value = null
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
    isProgressOpen,
    isProgressExpanded,
    profileText,
    extractedData,
    streamingContent,
    isExtracting,
    isImporting,
    importResult,
    extractError,
    rawJsonOnError,
    open,
    close,
    reset,
    extract,
    importProfile,
    downloadJson,
    downloadRawJson,
    loadJsonFile,
    dismissProgress,
  }
}
