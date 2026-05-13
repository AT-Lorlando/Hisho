<script setup lang="ts">
import type { UserProfile, ProfilePayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { data: profile, refresh } = await useAsyncData<UserProfile>(
  'user-profile',
  () => $fetch<UserProfile>('/api/v1/profile')
)

const form = reactive<ProfilePayload>({
  fullName: profile.value?.fullName ?? '',
  title: profile.value?.title ?? '',
  bio: profile.value?.bio ?? '',
  location: profile.value?.location ?? '',
  phone: profile.value?.phone ?? '',
  availability: profile.value?.availability ?? '',
  dailyRate: profile.value?.dailyRate ?? '',
  linkedinUrl: profile.value?.linkedinUrl ?? '',
  githubUrl: profile.value?.githubUrl ?? '',
  websiteUrl: profile.value?.websiteUrl ?? '',
})

const isSaving = ref(false)
const isDeleting = ref(false)
const deleteConfirm = ref('')

async function handleSave() {
  isSaving.value = true
  try {
    await $fetch('/api/v1/profile', {
      method: 'PUT',
      body: form,
    })
    await refresh()
  } finally {
    isSaving.value = false
  }
}

async function handleDeleteAccount() {
  if (deleteConfirm.value !== 'SUPPRIMER') return
  isDeleting.value = true
  try {
    await $fetch('/api/v1/auth/account', { method: 'DELETE' })
    navigateTo('/login')
  } catch {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="p-8 max-w-2xl">
    <h1 class="text-2xl font-bold mb-6">Identité</h1>

    <form class="space-y-4" @submit.prevent="handleSave">
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <Label for="id-fullname">Nom complet</Label>
          <Input id="id-fullname" v-model="form.fullName" placeholder="Arnaud Thierry" />
        </div>
        <div class="space-y-1.5">
          <Label for="id-title">Titre professionnel</Label>
          <Input id="id-title" v-model="form.title" placeholder="Développeur Full-Stack Senior" />
        </div>

        <div class="space-y-1.5 col-span-2">
          <Label for="id-bio">Bio</Label>
          <textarea
            id="id-bio"
            v-model="form.bio"
            rows="4"
            placeholder="Description courte..."
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
          />
        </div>

        <div class="space-y-1.5">
          <Label for="id-location">Localisation</Label>
          <Input id="id-location" v-model="form.location" placeholder="Toulouse" />
        </div>
        <div class="space-y-1.5">
          <Label for="id-phone">Téléphone</Label>
          <Input id="id-phone" v-model="form.phone" placeholder="+33 6 00 00 00 00" />
        </div>

        <div class="space-y-1.5">
          <Label for="id-availability">Disponibilité</Label>
          <Input id="id-availability" v-model="form.availability" placeholder="Disponible dès juin 2025" />
        </div>
        <div class="space-y-1.5">
          <Label for="id-rate">TJM</Label>
          <Input id="id-rate" v-model="form.dailyRate" placeholder="600 € / jour" />
        </div>

        <div class="space-y-1.5">
          <Label for="id-linkedin">LinkedIn</Label>
          <Input id="id-linkedin" v-model="form.linkedinUrl" placeholder="https://linkedin.com/in/..." />
        </div>
        <div class="space-y-1.5">
          <Label for="id-github">GitHub</Label>
          <Input id="id-github" v-model="form.githubUrl" placeholder="https://github.com/..." />
        </div>

        <div class="space-y-1.5 col-span-2">
          <Label for="id-website">Site web</Label>
          <Input id="id-website" v-model="form.websiteUrl" placeholder="https://..." />
        </div>
      </div>

      <div class="flex justify-end pt-2">
        <Button type="submit" :disabled="isSaving">
          {{ isSaving ? 'Sauvegarde...' : 'Sauvegarder' }}
        </Button>
      </div>
    </form>

    <!-- Danger zone -->
    <div class="mt-12 border border-destructive/40 rounded-xl p-6 space-y-4">
      <h2 class="text-base font-semibold text-destructive">Zone dangereuse</h2>
      <p class="text-sm text-muted-foreground">
        Supprime ton compte et toutes les données associées (expériences, missions, compétences, domaines, certifications). Cette action est irréversible.
      </p>
      <div class="space-y-2">
        <Label for="delete-confirm" class="text-sm">
          Tape <strong class="text-destructive">SUPPRIMER</strong> pour confirmer
        </Label>
        <Input
          id="delete-confirm"
          v-model="deleteConfirm"
          placeholder="SUPPRIMER"
          class="max-w-xs border-destructive/40 focus-visible:ring-destructive"
        />
      </div>
      <Button
        variant="destructive"
        :disabled="deleteConfirm !== 'SUPPRIMER' || isDeleting"
        @click="handleDeleteAccount"
      >
        <Icon name="lucide:trash-2" class="w-4 h-4 mr-1.5" />
        {{ isDeleting ? 'Suppression...' : 'Supprimer mon compte' }}
      </Button>
    </div>
  </div>
</template>
