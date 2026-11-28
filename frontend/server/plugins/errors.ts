export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (err, { event }) => {
    ;(event ? useRequestLogger(event) : logger).error({ event: 'server.error', err }, 'unhandled server error')
  })
})
