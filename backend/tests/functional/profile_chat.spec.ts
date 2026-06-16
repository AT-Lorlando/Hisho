import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Skill from '#models/skill'
import aiService from '#services/ai_service'
import { rateLimiter } from '#services/rate_limiter'

test.group('PublicProfileController.chat', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => {
    rateLimiter.reset()
    // Stub the LLM so tests never hit a real endpoint.
    aiService.chat = async (_system, _messages, onChunk) => {
      onChunk?.('Réponse de test.', false)
      return 'Réponse de test.'
    }
  })

  async function createUserWithContent() {
    const user = await User.create({
      email: `chat${Date.now()}@test.com`,
      password: 'password123',
      fullName: 'Chat User',
      title: 'Developer',
    })
    await Skill.create({ slug: `ts-${Date.now()}`, title: 'TypeScript', level: 5, userId: user.id })
    return user
  }

  test('404 for unknown user', async ({ client }) => {
    const res = await client.post('/users/999999/chat').json({ messages: [{ role: 'user', content: 'Salut' }] })
    res.assertStatus(404)
  })

  test('422 when messages are missing/invalid', async ({ client }) => {
    const user = await createUserWithContent()
    const res = await client.post(`/users/${user.id}/chat`).json({ messages: [] })
    res.assertStatus(422)
  })

  test('streams an SSE answer for a profile with content', async ({ client, assert }) => {
    const user = await createUserWithContent()
    const res = await client.post(`/users/${user.id}/chat`).json({ messages: [{ role: 'user', content: 'Quelles compétences ?' }] })
    res.assertStatus(200)
    const text = res.text()
    assert.include(text, '"type":"chunk"')
    assert.include(text, 'Réponse de test.')
    assert.include(text, '"type":"done"')
  })

  test('emits an error event when the profile is empty', async ({ client, assert }) => {
    const user = await User.create({
      email: `empty${Date.now()}@test.com`,
      password: 'password123',
      fullName: 'Empty User',
    })
    const res = await client.post(`/users/${user.id}/chat`).json({ messages: [{ role: 'user', content: 'Salut' }] })
    res.assertStatus(200)
    assert.include(res.text(), '"type":"error"')
  })

  test('429 once the per-IP limit (2 in .env.test) is exceeded', async ({ client, assert }) => {
    const user = await createUserWithContent()
    const body = { messages: [{ role: 'user', content: 'Salut' }] }
    await client.post(`/users/${user.id}/chat`).json(body)
    await client.post(`/users/${user.id}/chat`).json(body)
    const res = await client.post(`/users/${user.id}/chat`).json(body)
    res.assertStatus(429)
    assert.property(res.body(), 'message')
  })
})
