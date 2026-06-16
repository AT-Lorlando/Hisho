<!-- frontend/app/layouts/default.vue -->
<template>
  <div class="flex min-h-screen flex-col bg-background">
    <GuestHeader />
    <main class="flex-1">
      <slot />
    </main>
    <GuestFooter />
  </div>
</template>
