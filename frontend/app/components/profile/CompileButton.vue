<script setup lang="ts">
import type { UserProfile } from '~/types/content'

const props = defineProps<{ profile: UserProfile | null }>()
const emit = defineEmits<{ compiled: [] }>()

const { compile } = useProfile()
const counts = useContentCounts()
const isCompiling = ref(false)

const totalFiles = computed(() =>
  (counts.value?.experiences ?? 0) +
  (counts.value?.skills ?? 0) +
  (counts.value?.projects ?? 0) +
  (counts.value?.certifications ?? 0)
)

const lastCompiled = computed(() => {
  if (!props.profile?.lastCompiledAt) return 'Jamais'
  return new Date(props.profile.lastCompiledAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
})

async function handleCompile() {
  isCompiling.value = true
  try {
    await compile()
    emit('compiled')
  } finally {
    isCompiling.value = false
  }
}
</script>

<template>
  <div class="border-t border-border pt-6 space-y-3">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium">État du profil</p>
        <p class="text-xs text-muted-foreground mt-0.5">
          {{ totalFiles }} fichier{{ totalFiles > 1 ? 's' : '' }} au total · Dernière compilation : {{ lastCompiled }}
        </p>
      </div>
      <Button
        variant="secondary"
        :disabled="isCompiling"
        @click="handleCompile"
      >
        <Icon name="lucide:zap" class="w-4 h-4 mr-1.5" />
        {{ isCompiling ? 'Compilation...' : 'Compiler le profil' }}
      </Button>
    </div>
  </div>
</template>
