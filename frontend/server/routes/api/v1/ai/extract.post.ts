import { proxyRequest } from 'h3'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  // 10-minute timeout — reasoning models can be slow on long profiles
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10 * 60 * 1000)
  event.node.req.on('close', () => clearTimeout(timer))
  return proxyRequest(event, `${config.apiUrl}/ai/extract`, {
    fetchOptions: { signal: controller.signal },
  })
})
