import { test } from '@japa/runner'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('CompetencyController', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function createUser() {
    return User.create({ email: `u${Date.now()}@test.com`, password: 'password123' })
  }

  test('GET /competencies returns 401 when unauthenticated', async ({ client }) => {
    const response = await client.get('/competencies')
    response.assertStatus(401)
  })

  test('GET /competencies returns empty ratings for new user', async ({ client }) => {
    const user = await createUser()
    const response = await client.get('/competencies').loginAs(user)
    response.assertStatus(200)
    response.assertBody({ skills: {}, domains: {} })
  })

  test('PUT /competencies/skill/elk-stack upserts a skill rating', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .put('/competencies/skill/elk-stack')
      .loginAs(user)
      .json({ level: 4 })
    response.assertStatus(200)
    response.assertBodyContains({ type: 'skill', slug: 'elk-stack', level: 4 })
  })

  test('PUT /competencies/skill/elk-stack updates existing rating', async ({ client }) => {
    const user = await createUser()
    await client.put('/competencies/skill/elk-stack').loginAs(user).json({ level: 3 })
    const response = await client
      .put('/competencies/skill/elk-stack')
      .loginAs(user)
      .json({ level: 5 })
    response.assertStatus(200)
    response.assertBodyContains({ level: 5 })
  })

  test('PUT /competencies/:type/:slug returns 422 for level out of range', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .put('/competencies/skill/nuxt')
      .loginAs(user)
      .json({ level: 6 })
    response.assertStatus(422)
  })

  test('PUT /competencies/:type/:slug returns 422 for level 0', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .put('/competencies/skill/nuxt')
      .loginAs(user)
      .json({ level: 0 })
    response.assertStatus(422)
  })

  test('PUT /competencies/:type/:slug returns 400 for invalid type', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .put('/competencies/invalid/nuxt')
      .loginAs(user)
      .json({ level: 3 })
    response.assertStatus(400)
  })

  test('DELETE /competencies/domain/cybersecurite removes a rating', async ({ client }) => {
    const user = await createUser()
    await client.put('/competencies/domain/cybersecurite').loginAs(user).json({ level: 4 })
    const response = await client.delete('/competencies/domain/cybersecurite').loginAs(user)
    response.assertStatus(204)
  })

  test('DELETE /competencies/:type/:slug returns 404 for unknown rating', async ({ client }) => {
    const user = await createUser()
    const response = await client.delete('/competencies/skill/nonexistent').loginAs(user)
    response.assertStatus(404)
  })

  test('GET /competencies returns ratings after upserts', async ({ client }) => {
    const user = await createUser()
    await client.put('/competencies/skill/elk-stack').loginAs(user).json({ level: 4 })
    await client.put('/competencies/domain/cybersecurite').loginAs(user).json({ level: 3 })
    const response = await client.get('/competencies').loginAs(user)
    response.assertStatus(200)
    response.assertBodyContains({ skills: { 'elk-stack': 4 }, domains: { cybersecurite: 3 } })
  })
})
