export default defineNuxtRouteMiddleware(async () => {
  const { requireGuest } = useAuth()
  await requireGuest()
})
