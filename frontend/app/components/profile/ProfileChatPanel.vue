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
  <Card class="flex h-[70vh] max-h-[620px] flex-col overflow-hidden">
    <CardHeader class="border-b bg-muted/30 py-3">
      <CardTitle class="flex items-center gap-2 text-base">
        <span class="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border">
          <Icon name="lucide:sparkles" class="h-4 w-4 text-primary" />
        </span>
        Discuter avec l'IA
      </CardTitle>
      <p class="text-xs text-muted-foreground">
        Réponses factuelles, basées uniquement sur ce profil.
      </p>
    </CardHeader>

    <div ref="scrollEl" class="flex-1 space-y-3 overflow-y-auto p-4">
      <div v-if="messages.length === 0" class="space-y-2">
        <p class="text-sm text-muted-foreground">Suggestions :</p>
        <button
          v-for="s in suggestions"
          :key="s"
          class="block w-full rounded border border-border px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
          :disabled="isStreaming || rateLimited"
          @click="ask(s)"
        >
          {{ s }}
        </button>
      </div>

      <div
        v-for="(m, i) in messages"
        :key="i"
        class="flex"
        :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[85%] whitespace-pre-wrap break-words rounded px-3 py-2 text-sm"
          :class="m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'"
        >
          {{ m.content }}<span
            v-if="isStreaming && i === messages.length - 1 && m.role === 'assistant'"
            class="animate-pulse"
          >▍</span>
        </div>
      </div>

      <div v-if="error" class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
        {{ error }}
      </div>
    </div>

    <div class="flex items-end gap-2 border-t p-3">
      <textarea
        v-model="input"
        rows="1"
        :placeholder="rateLimited ? 'Limite atteinte' : 'Écris ta question…'"
        class="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        :disabled="isStreaming || rateLimited"
        @keydown="onEnter"
      />
      <Button size="icon" :disabled="!input.trim() || isStreaming || rateLimited" @click="send">
        <Icon
          :name="isStreaming ? 'lucide:loader-circle' : 'lucide:send'"
          class="h-4 w-4"
          :class="{ 'animate-spin': isStreaming }"
        />
      </Button>
    </div>
  </Card>
</template>
