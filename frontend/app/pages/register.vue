<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>Enter your information to create your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div class="space-y-2">
            <Label for="fullName">Full Name (Optional)</Label>
            <Input
              id="fullName"
              v-model="fullName"
              type="text"
              placeholder="John Doe"
              :disabled="isLoading"
            />
          </div>
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="john@example.com"
              required
              :disabled="isLoading"
            />
          </div>
          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
              :disabled="isLoading"
            />
            <p class="text-xs text-muted-foreground">
              Password must be at least 8 characters long
            </p>
          </div>
          <Button type="submit" class="w-full" :disabled="isLoading">
            {{ isLoading ? 'Creating account...' : 'Create Account' }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex justify-center">
        <p class="text-sm text-muted-foreground">
          Already have an account?
          <NuxtLink to="/login" class="text-primary hover:underline">
            Login
          </NuxtLink>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

definePageMeta({
  middleware: 'guest'
})

const { register, isLoading } = useAuth()

const email = ref('')
const password = ref('')
const fullName = ref('')

const handleRegister = async () => {
  if (password.value.length < 8) {
    toast.error('Password must be at least 8 characters long')
    return
  }

  try {
    await register(email.value, password.value, fullName.value || undefined)
    await navigateTo('/')
  } catch (error) {
    // Error toast is already shown by custom fetch
  }
}
</script>
