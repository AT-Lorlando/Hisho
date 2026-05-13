<script setup lang="ts">
const { isAuthenticated } = useAuth()
await navigateTo(isAuthenticated.value ? '/profile/experiences' : '/login', { replace: true })
</script>
