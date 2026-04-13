<script setup lang="ts">
import type { UserProfile } from '~/types/content'

const props = defineProps<{ profile: UserProfile | null }>()
const emit = defineEmits<{ submit: [data: Partial<UserProfile>] }>()

const form = reactive({
  fullName: props.profile?.fullName ?? '',
  title: props.profile?.title ?? '',
  bio: props.profile?.bio ?? '',
  location: props.profile?.location ?? '',
  linkedinUrl: props.profile?.linkedinUrl ?? '',
  githubUrl: props.profile?.githubUrl ?? '',
  websiteUrl: props.profile?.websiteUrl ?? '',
  phone: props.profile?.phone ?? '',
  availability: props.profile?.availability ?? '',
  dailyRate: props.profile?.dailyRate ?? '',
})

watch(() => props.profile, (p) => {
  if (!p) return
  Object.assign(form, {
    fullName: p.fullName ?? '',
    title: p.title ?? '',
    bio: p.bio ?? '',
    location: p.location ?? '',
    linkedinUrl: p.linkedinUrl ?? '',
    githubUrl: p.githubUrl ?? '',
    websiteUrl: p.websiteUrl ?? '',
    phone: p.phone ?? '',
    availability: p.availability ?? '',
    dailyRate: p.dailyRate ?? '',
  })
})

const availabilityOptions = ['Disponible', 'En mission', 'À l\'écoute']
</script>

<template>
  <form class="space-y-4" @submit.prevent="emit('submit', { ...form })">
    <!-- Nom + Titre -->
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <Label for="fullName">Nom complet</Label>
        <Input id="fullName" v-model="form.fullName" placeholder="Jean Dupont" />
      </div>
      <div class="space-y-1.5">
        <Label for="title">Titre / Poste actuel</Label>
        <Input id="title" v-model="form.title" placeholder="Développeur Full-Stack Senior" />
      </div>
    </div>

    <!-- Email (read-only) -->
    <div class="space-y-1.5">
      <Label>Email</Label>
      <Input :value="profile?.email" disabled class="opacity-60" />
      <p class="text-xs text-muted-foreground">Modifiable depuis les paramètres du compte.</p>
    </div>

    <!-- Bio -->
    <div class="space-y-1.5">
      <Label for="bio">Bio courte</Label>
      <textarea
        id="bio"
        v-model="form.bio"
        rows="3"
        placeholder="Développeur passionné avec 5 ans d'expérience..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
      />
    </div>

    <!-- Location + Disponibilité + TJM -->
    <div class="grid grid-cols-3 gap-4">
      <div class="space-y-1.5">
        <Label for="location">Localisation</Label>
        <Input id="location" v-model="form.location" placeholder="Paris, France" />
      </div>
      <div class="space-y-1.5">
        <Label for="availability">Disponibilité</Label>
        <select
          id="availability"
          v-model="form.availability"
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">— Choisir —</option>
          <option v-for="opt in availabilityOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <Label for="dailyRate">TJM (€)</Label>
        <Input id="dailyRate" v-model="form.dailyRate" placeholder="650" />
      </div>
    </div>

    <!-- Liens -->
    <div class="grid grid-cols-3 gap-4">
      <div class="space-y-1.5">
        <Label for="linkedin">LinkedIn</Label>
        <Input id="linkedin" v-model="form.linkedinUrl" placeholder="https://linkedin.com/in/..." />
      </div>
      <div class="space-y-1.5">
        <Label for="github">GitHub</Label>
        <Input id="github" v-model="form.githubUrl" placeholder="https://github.com/..." />
      </div>
      <div class="space-y-1.5">
        <Label for="website">Site web</Label>
        <Input id="website" v-model="form.websiteUrl" placeholder="https://monsite.dev" />
      </div>
    </div>

    <!-- Téléphone -->
    <div class="space-y-1.5">
      <Label for="phone">Téléphone</Label>
      <Input id="phone" v-model="form.phone" placeholder="+33 6 12 34 56 78" class="max-w-xs" />
    </div>

    <div class="flex justify-end">
      <Button type="submit">Sauvegarder</Button>
    </div>
  </form>
</template>
