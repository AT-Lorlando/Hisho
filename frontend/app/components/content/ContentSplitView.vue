<script setup lang="ts">
defineProps<{
  title: string
  items: any[]
  selectedSlug: string | null
  createPath: string
}>()

const emit = defineEmits<{
  select: [slug: string]
  delete: [slug: string]
}>()

const slots = defineSlots<{
  'list-item': (props: { item: any; isActive: boolean }) => any
  'preview': (props: { item: any }) => any
  'empty': () => any
}>()
</script>

<template>
  <div class="flex h-[calc(100vh-0px)]">
    <!-- List panel -->
    <div class="w-56 shrink-0 border-r border-border flex flex-col">
      <div class="flex items-center justify-between px-3 py-3 border-b border-border">
        <h2 class="font-semibold text-sm">{{ title }}</h2>
        <Button size="sm" variant="ghost" as-child class="h-7 px-2">
          <NuxtLink :to="createPath">
            <Icon name="lucide:plus" class="w-4 h-4" />
          </NuxtLink>
        </Button>
      </div>

      <div class="flex-1 overflow-auto divide-y divide-border">
        <div
          v-for="item in items"
          :key="item.slug"
          @click="emit('select', item.slug)"
        >
          <slot name="list-item" :item="item" :is-active="item.slug === selectedSlug" />
        </div>

        <div v-if="!items?.length" class="px-3 py-6 text-center text-xs text-muted-foreground">
          Aucun fichier encore.<br />
          <NuxtLink :to="createPath" class="text-primary underline mt-1 inline-block">Créer le premier</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Preview panel -->
    <div class="flex-1 overflow-hidden">
      <template v-if="selectedSlug && items?.find(i => i.slug === selectedSlug)">
        <slot name="preview" :item="items.find(i => i.slug === selectedSlug)" />
      </template>
      <div v-else class="flex items-center justify-center h-full text-muted-foreground text-sm">
        <slot name="empty">
          Sélectionne un élément dans la liste.
        </slot>
      </div>
    </div>
  </div>
</template>
