<template>
  <div class="min-h-screen bg-background p-8">
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">Welcome</h1>
        <div v-if="isAuthenticated" class="flex gap-4 items-center">
          <span class="text-muted-foreground">{{ user?.email }}</span>
          <Button @click="handleLogout" variant="outline" :disabled="isLoading">
            Logout
          </Button>
        </div>
        <div v-else class="flex gap-4">
          <Button @click="navigateTo('/login')" variant="outline">
            Login
          </Button>
          <Button @click="navigateTo('/register')">
            Register
          </Button>
        </div>
      </div>

      <Card v-if="isAuthenticated">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent class="space-y-2">
          <div>
            <p class="text-sm font-medium">Full Name</p>
            <p class="text-muted-foreground">{{ user?.fullName || 'Not provided' }}</p>
          </div>
          <div>
            <p class="text-sm font-medium">Email</p>
            <p class="text-muted-foreground">{{ user?.email }}</p>
          </div>
          <div>
            <p class="text-sm font-medium">User ID</p>
            <p class="text-muted-foreground">{{ user?.id }}</p>
          </div>
        </CardContent>
      </Card>

      <Card v-else>
        <CardHeader>
          <CardTitle>Welcome to the App</CardTitle>
          <CardDescription>Please login or register to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-muted-foreground">
            This is a demo authentication system using AdonisJS session-based auth with Nuxt 4 and Pinia.
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, isAuthenticated, isLoading, logout } = useAuth()

const handleLogout = async () => {
  await logout()
}
</script>