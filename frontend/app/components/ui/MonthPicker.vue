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
  const [year, month] = props.modelValue.split('-').map(Number)
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
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        type="button"
        variant="outline"
        :class="['w-full justify-start text-left font-normal', !modelValue && 'text-muted-foreground']"
      >
        <Icon name="lucide:calendar" class="mr-2 h-4 w-4 shrink-0" />
        <span class="flex-1">
          {{ calendarValue ? df.format(calendarValue.toDate(getLocalTimeZone())) : (placeholder ?? 'Sélectionner un mois') }}
        </span>
        <Icon
          v-if="modelValue"
          name="lucide:x"
          class="h-3 w-3 text-muted-foreground hover:text-foreground"
          @click.stop="clear"
        />
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
</template>
