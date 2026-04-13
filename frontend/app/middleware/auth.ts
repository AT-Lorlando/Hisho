export default defineNuxtRouteMiddleware(async () => {
  const { requireAuth } = useAuth()
  await requireAuth()
})
