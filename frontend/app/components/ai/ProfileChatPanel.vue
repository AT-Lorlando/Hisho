<!-- frontend/app/components/ai/ProfileChatPanel.vue -->
<script setup lang="ts">
const props = defineProps<{ userId: string | number; name?: string | null }>()

const { messages, input, isStreaming, error, rateLimited, send } = useProfileChat(props.userId)

const scrollEl = ref<HTMLElement | null>(null)
watch(
  () => messages.value.map((m) => m.content).join('|'),
  async () => {
    await nextTick()
    if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
  }
)

const suggestions = [
  'Quelles sont ses principales compétences ?',
  'Quelles expériences a-t-il/elle eues ?',
  'Quelles technologies maîtrise-t-il/elle ?',
]

function ask(q: string) {
  input.value = q
  send()
}

function onEnter(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}
</script>

<template>
  <Card class="flex flex-col h-[70vh] max-h-[600px]">
    <CardHeader class="border-b py-3">
      <CardTitle class="flex items-center gap-2 text-base">
        <Icon name="lucide:message-circle" class="w-4 h-4 text-primary" />
        Poser une question sur ce profil
      </CardTitle>
      <p class="text-xs text-muted-foreground">Réponses factuelles, basées uniquement sur ce profil.</p>
    </CardHeader>

    <div ref="scrollEl" class="flex-1 overflow-y-auto p-4 space-y-3">
      <!-- Empty state with suggestions -->
      <div v-if="messages.length === 0" class="space-y-2">
        <p class="text-sm text-muted-foreground">Suggestions :</p>
        <button
          v-for="s in suggestions"
          :key="s"
          class="block w-full text-left text-sm rounded-md border border-border px-3 py-2 hover:bg-muted transition-colors"
          :disabled="isStreaming || rateLimited"
          @click="ask(s)"
        >
          {{ s }}
        </button>
      </div>

      <!-- Conversation -->
      <div
        v-for="(m, i) in messages"
        :key="i"
        class="flex"
        :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words"
          :class="m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'"
        >
          {{ m.content }}<span v-if="isStreaming && i === messages.length - 1 && m.role === 'assistant'" class="animate-pulse">▍</span>
        </div>
      </div>

      <div v-if="error" class="rounded-md bg-destructive/10 text-destructive text-sm p-3">
        {{ error }}
      </div>
    </div>

    <div class="border-t p-3 flex items-end gap-2">
      <textarea
        v-model="input"
        rows="1"
        :placeholder="rateLimited ? 'Limite atteinte' : 'Écris ta question…'"
        class="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        :disabled="isStreaming || rateLimited"
        @keydown="onEnter"
      />
      <Button size="icon" :disabled="!input.trim() || isStreaming || rateLimited" @click="send">
        <Icon :name="isStreaming ? 'lucide:loader-circle' : 'lucide:send'" class="w-4 h-4" :class="{ 'animate-spin': isStreaming }" />
      </Button>
    </div>
  </Card>
</template>
