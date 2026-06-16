import { proxyRequest } from 'h3'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5 * 60 * 1000)
  event.node.req.on('close', () => clearTimeout(timer))
  return proxyRequest(event, `${config.apiUrl}/users/${id}/chat`, {
    fetchOptions: { signal: controller.signal },
  })
})
