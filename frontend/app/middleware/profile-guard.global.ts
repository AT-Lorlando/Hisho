export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/profile')) return
  const { requireAuth } = useAuth()
  await requireAuth()
})
