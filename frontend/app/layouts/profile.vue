<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>

<template>
  <div class="min-h-screen flex bg-background">
    <ProfileSidebar />
    <main class="flex-1 overflow-auto">
      <slot />
    </main>
  </div>
</template>
