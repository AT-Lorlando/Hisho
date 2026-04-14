<script setup lang="ts">
const { isAuthenticated } = useAuth()
await navigateTo(isAuthenticated.value ? '/profile' : '/login', { replace: true })
</script>
