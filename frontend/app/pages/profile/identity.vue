<script setup lang="ts">
definePageMeta({ layout: 'profile' })

const { profile, isLoading, loadProfile, update } = useProfile()
onMounted(loadProfile)

async function handleSubmit(data: any) {
  try {
    await update(data)
  } catch {
    // erreur affichée via error du composable
  }
}

async function handleCompiled() {
  await loadProfile()
}
</script>

<template>
  <div class="p-8 max-w-3xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Identité</h1>
      <p class="text-muted-foreground text-sm mt-1">Informations de base de ton profil professionnel.</p>
    </div>

    <div v-if="isLoading" class="text-muted-foreground text-sm">Chargement...</div>

    <template v-else>
      <IdentityForm :profile="profile" @submit="handleSubmit" />
      <CompileButton :profile="profile" class="mt-6" @compiled="handleCompiled" />
    </template>
  </div>
</template>
