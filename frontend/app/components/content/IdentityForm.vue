<script setup lang="ts">
import type { UserProfile } from '~/types/content'

const props = defineProps<{ profile: UserProfile | null }>()
const emit = defineEmits<{ submit: [data: Partial<UserProfile>] }>()

const form = reactive({
  fullName: props.profile?.fullName ?? '',
  title: props.profile?.title ?? '',
  bio: props.profile?.bio ?? '',
  location: props.profile?.location ?? '',
  phone: props.profile?.phone ?? '',
  linkedinUrl: props.profile?.linkedinUrl ?? '',
  githubUrl: props.profile?.githubUrl ?? '',
  websiteUrl: props.profile?.websiteUrl ?? '',
  availability: props.profile?.availability ?? '',
  dailyRate: props.profile?.dailyRate ?? '',
})

watch(() => props.profile, (p) => {
  if (!p) return
  form.fullName = p.fullName ?? ''
  form.title = p.title ?? ''
  form.bio = p.bio ?? ''
  form.location = p.location ?? ''
  form.phone = p.phone ?? ''
  form.linkedinUrl = p.linkedinUrl ?? ''
  form.githubUrl = p.githubUrl ?? ''
  form.websiteUrl = p.websiteUrl ?? ''
  form.availability = p.availability ?? ''
  form.dailyRate = p.dailyRate ?? ''
})

function handleSubmit() {
  emit('submit', { ...form })
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <Label for="fullName">Nom complet</Label>
        <Input id="fullName" v-model="form.fullName" placeholder="Jean Dupont" />
      </div>
      <div class="space-y-1.5">
        <Label for="title">Titre professionnel</Label>
        <Input id="title" v-model="form.title" placeholder="Ingénieur DevSecOps" />
      </div>
      <div class="space-y-1.5">
        <Label for="location">Localisation</Label>
        <Input id="location" v-model="form.location" placeholder="Paris, France" />
      </div>
      <div class="space-y-1.5">
        <Label for="phone">Téléphone</Label>
        <Input id="phone" v-model="form.phone" placeholder="+33 6 00 00 00 00" />
      </div>
      <div class="space-y-1.5">
        <Label for="availability">Disponibilité</Label>
        <Input id="availability" v-model="form.availability" placeholder="Disponible immédiatement" />
      </div>
      <div class="space-y-1.5">
        <Label for="dailyRate">TJM</Label>
        <Input id="dailyRate" v-model="form.dailyRate" placeholder="600 €/jour" />
      </div>
    </div>

    <div class="space-y-1.5">
      <Label for="bio">Bio</Label>
      <textarea
        id="bio"
        v-model="form.bio"
        rows="4"
        placeholder="Ingénieur avec 8 ans d'expérience en DevSecOps, spécialisé en..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
      />
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="space-y-1.5">
        <Label for="linkedinUrl">LinkedIn</Label>
        <Input id="linkedinUrl" v-model="form.linkedinUrl" placeholder="https://linkedin.com/in/..." />
      </div>
      <div class="space-y-1.5">
        <Label for="githubUrl">GitHub</Label>
        <Input id="githubUrl" v-model="form.githubUrl" placeholder="https://github.com/..." />
      </div>
      <div class="space-y-1.5">
        <Label for="websiteUrl">Site web</Label>
        <Input id="websiteUrl" v-model="form.websiteUrl" placeholder="https://..." />
      </div>
    </div>

    <div class="flex justify-end">
      <Button type="submit">Sauvegarder</Button>
    </div>
  </form>
</template>
