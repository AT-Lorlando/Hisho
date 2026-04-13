<script setup lang="ts">
defineProps<{
  title: string
  metaItems: { icon: string; label: string }[]
  tags: string[]
  aiSummary?: string
  highlights?: string[]
  body?: string
  slug: string
  editPath: string
}>()

const emit = defineEmits<{ delete: [slug: string] }>()
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
      <h2 class="font-semibold text-sm truncate">{{ title }}</h2>
      <div class="flex gap-2 shrink-0">
        <Button size="sm" variant="outline" as-child>
          <NuxtLink :to="editPath">
            <Icon name="lucide:pencil" class="w-3.5 h-3.5 mr-1" />
            Modifier
          </NuxtLink>
        </Button>
        <Button size="sm" variant="ghost" class="text-destructive hover:text-destructive" @click="emit('delete', slug)">
          <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto px-4 py-4 space-y-4">
      <!-- Meta -->
      <div class="flex flex-wrap gap-2">
        <span
          v-for="item in metaItems"
          :key="item.label"
          class="flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded px-2 py-1"
        >
          <Icon :name="item.icon" class="w-3 h-3" />
          {{ item.label }}
        </span>
      </div>

      <!-- Tags -->
      <div v-if="tags.length" class="flex flex-wrap gap-1.5">
        <span
          v-for="tag in tags"
          :key="tag"
          class="text-xs bg-primary/10 text-primary rounded px-2 py-0.5"
        >{{ tag }}</span>
      </div>

      <!-- Résumé IA -->
      <div v-if="aiSummary" class="bg-amber-500/10 border border-amber-500/20 rounded-md p-3">
        <p class="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-1">
          <Icon name="lucide:zap" class="w-3 h-3" />
          Résumé IA
        </p>
        <p class="text-sm text-muted-foreground">{{ aiSummary }}</p>
      </div>

      <!-- Highlights -->
      <div v-if="highlights?.length">
        <p class="text-xs font-medium text-muted-foreground mb-1.5">Réalisations clés</p>
        <ul class="space-y-1">
          <li v-for="h in highlights" :key="h" class="text-sm flex items-start gap-2">
            <Icon name="lucide:check" class="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
            {{ h }}
          </li>
        </ul>
      </div>

      <!-- Body Markdown -->
      <div v-if="body" class="prose prose-sm dark:prose-invert max-w-none">
        <ContentRenderer :value="{ body }" />
      </div>
    </div>
  </div>
</template>
