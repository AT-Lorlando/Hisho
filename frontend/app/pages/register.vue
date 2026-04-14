<script setup lang="ts">
import { toast } from 'vue-sonner'
definePageMeta({ middleware: 'guest' })

const { register, isLoading } = useAuth()
const email = ref('')
const password = ref('')
const fullName = ref('')

async function handleRegister() {
  if (password.value.length < 8) {
    toast.error('Le mot de passe doit contenir au moins 8 caractères')
    return
  }
  try {
    await register(email.value, password.value, fullName.value || undefined)
    await navigateTo('/profile')
  } catch {}
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-background">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold tracking-tight">Hisho</h1>
      <p class="text-sm text-muted-foreground mt-1">Votre portfolio technique, augmenté par l'IA</p>
    </div>
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="handleRegister">
          <div class="space-y-1.5">
            <Label for="fullName">Nom complet</Label>
            <Input id="fullName" v-model="fullName" type="text" placeholder="Jean Dupont" :disabled="isLoading" />
          </div>
          <div class="space-y-1.5">
            <Label for="email">Email</Label>
            <Input id="email" v-model="email" type="email" placeholder="vous@exemple.com" required :disabled="isLoading" />
          </div>
          <div class="space-y-1.5">
            <Label for="password">Mot de passe</Label>
            <Input id="password" v-model="password" type="password" placeholder="••••••••" required :disabled="isLoading" />
            <p class="text-xs text-muted-foreground">8 caractères minimum</p>
          </div>
          <Button type="submit" class="w-full" :disabled="isLoading">
            {{ isLoading ? 'Création...' : 'Créer mon compte' }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex justify-center">
        <p class="text-sm text-muted-foreground">
          Déjà un compte ?
          <NuxtLink to="/login" class="text-primary hover:underline">Se connecter</NuxtLink>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
