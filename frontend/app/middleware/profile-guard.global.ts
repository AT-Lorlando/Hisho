export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return // relative URLs can't be fetched server-side
  if (!to.path.startsWith('/profile')) return
  const { requireAuth } = useAuth()
  await requireAuth()
})
