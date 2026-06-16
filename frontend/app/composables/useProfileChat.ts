import type { ChatMessage } from '~/types/content'

export function useProfileChat(userId: string | number) {
  const messages = ref<ChatMessage[]>([])
  const input = ref('')
  const isStreaming = ref(false)
  const error = ref<string | null>(null)
  const rateLimited = ref(false)

  async function send() {
    const text = input.value.trim()
    if (!text || isStreaming.value || rateLimited.value) return

    messages.value.push({ role: 'user', content: text })
    input.value = ''
    error.value = null
    isStreaming.value = true

    // History sent to the server (system prompt + profile context are built server-side).
    const payload = messages.value.map((m) => ({ role: m.role, content: m.content }))
    const assistant = reactive<ChatMessage>({ role: 'assistant', content: '' })
    messages.value.push(assistant)

    try {
      const res = await fetch(`/api/v1/users/${userId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload }),
      })

      if (res.status === 429) {
        rateLimited.value = true
        const data = await res.json().catch(() => ({}))
        error.value = data?.message ?? "Limite d'utilisation atteinte. Réessaie plus tard."
        messages.value.pop() // drop the empty assistant bubble
        return
      }
      if (!res.ok || !res.body) throw new Error('Réponse invalide du serveur.')

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
            isThinking?: boolean
            message?: string
          }
          if (data.type === 'chunk' && data.content && !data.isThinking) {
            assistant.content += data.content
          } else if (data.type === 'error') {
            error.value = data.message ?? "L'IA n'a pas pu répondre."
          }
        }
      }
      if (!assistant.content && !error.value) error.value = "L'IA n'a pas répondu."
    } catch (e: any) {
      error.value = e?.message ?? 'Erreur réseau.'
    } finally {
      // Remove the assistant bubble if it stayed empty (error path).
      if (messages.value.at(-1)?.role === 'assistant' && !messages.value.at(-1)?.content) {
        messages.value.pop()
      }
      isStreaming.value = false
    }
  }

  function reset() {
    messages.value = []
    input.value = ''
    error.value = null
    rateLimited.value = false
  }

  return { messages, input, isStreaming, error, rateLimited, send, reset }
}
