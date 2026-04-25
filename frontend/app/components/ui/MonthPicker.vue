<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'

const props = defineProps<{
  modelValue?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const df = new DateFormatter('fr-FR', { year: 'numeric', month: 'short' })
const open = ref(false)

const calendarValue = computed<DateValue | undefined>(() => {
  if (!props.modelValue) return undefined
  const match = props.modelValue.match(/^(\d{4})-(\d{2})$/)
  if (!match) return undefined
  const year = parseInt(match[1], 10)
  const month = parseInt(match[2], 10)
  if (month < 1 || month > 12) return undefined
  return new CalendarDate(year, month, 1)
})

function onSelect(val: DateValue | undefined) {
  if (!val) {
    emit('update:modelValue', undefined)
  } else {
    emit('update:modelValue', `${val.year}-${String(val.month).padStart(2, '0')}`)
  }
  open.value = false
}

function clear(e: Event) {
  e.stopPropagation()
  emit('update:modelValue', undefined)
}
</script>

<template>
  <div class="relative">
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          type="button"
          variant="outline"
          :class="['w-full justify-start text-left font-normal', !modelValue ? 'text-muted-foreground pr-3' : 'pr-8']"
        >
          <Icon name="lucide:calendar" class="mr-2 h-4 w-4 shrink-0" />
          <span class="flex-1 truncate">
            {{ calendarValue ? df.format(calendarValue.toDate(getLocalTimeZone())) : (placeholder ?? 'Sélectionner un mois') }}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0" align="start">
        <Calendar
          :model-value="calendarValue"
          layout="month-and-year"
          initial-focus
          @update:model-value="onSelect"
        />
      </PopoverContent>
    </Popover>
    <button
      v-if="modelValue"
      type="button"
      class="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-foreground focus:outline-none rounded"
      aria-label="Effacer"
      @click="clear"
    >
      <Icon name="lucide:x" class="h-3 w-3" />
    </button>
  </div>
</template>
