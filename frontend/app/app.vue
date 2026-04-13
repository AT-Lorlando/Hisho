<template>
  <div>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster position="bottom-right" />
  </div>
</template>

<script setup lang="ts">
import 'vue-sonner/style.css'
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}
.page-enter-from {
  opacity: 0;
  filter: blur(1rem);
}
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
