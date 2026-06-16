<!-- frontend/app/pages/login.vue -->
<script setup lang="ts">
const { login, isLoading } = useAuth()
const email = ref('')
const password = ref('')

async function handleLogin() {
  try {
    await login(email.value, password.value)
    await navigateTo('/profile')
  } catch {}
}
</script>

<template>
  <div class="flex flex-col items-center justify-center px-4 py-16">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold tracking-tight">Bon retour 👋</h1>
      <p class="mt-1 text-sm text-muted-foreground">Connecte-toi pour gérer ton portfolio.</p>
    </div>
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Se connecter</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="handleLogin">
          <div class="space-y-1.5">
            <Label for="email">Email</Label>
            <Input id="email" v-model="email" type="email" placeholder="vous@exemple.com" required :disabled="isLoading" />
          </div>
          <div class="space-y-1.5">
            <Label for="password">Mot de passe</Label>
            <Input id="password" v-model="password" type="password" placeholder="••••••••" required :disabled="isLoading" />
          </div>
          <Button type="submit" class="w-full" :disabled="isLoading">
            {{ isLoading ? 'Connexion...' : 'Se connecter' }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex justify-center">
        <p class="text-sm text-muted-foreground">
          Pas encore de compte ?
          <NuxtLink to="/register" class="text-primary hover:underline">S'inscrire</NuxtLink>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
