<!-- frontend/app/components/ui/tag-input/TagInput.vue -->
<script setup lang="ts">
const props = defineProps<{
  modelValue: string[]
  placeholder?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

const inputRef = ref<HTMLInputElement | null>(null)
const inputVal = ref('')

function addTag() {
  const trimmed = inputVal.value.trim().replace(/,$/, '')
  if (trimmed && !props.modelValue.includes(trimmed)) {
    emit('update:modelValue', [...props.modelValue, trimmed])
  }
  inputVal.value = ''
}

function removeTag(index: number) {
  const next = [...props.modelValue]
  next.splice(index, 1)
  emit('update:modelValue', next)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag()
  } else if (e.key === 'Backspace' && inputVal.value === '' && props.modelValue.length > 0) {
    removeTag(props.modelValue.length - 1)
  }
}
</script>

<template>
  <div
    class="flex flex-wrap gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[38px] cursor-text focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0"
    @click="inputRef?.focus()"
  >
    <span
      v-for="(tag, i) in modelValue"
      :key="tag"
      class="inline-flex items-center gap-1 bg-primary/10 text-primary rounded px-2 py-0.5 text-xs font-medium"
    >
      {{ tag }}
      <button type="button" class="hover:text-destructive transition-colors leading-none" @click.stop="removeTag(i)">
        <Icon name="lucide:x" class="w-3 h-3" />
      </button>
    </span>
    <input
      ref="inputRef"
      v-model="inputVal"
      :placeholder="modelValue.length === 0 ? (placeholder ?? '') : ''"
      class="flex-1 min-w-[100px] outline-none bg-transparent text-sm placeholder:text-muted-foreground"
      @keydown="handleKeydown"
      @blur="addTag"
    />
  </div>
</template>
