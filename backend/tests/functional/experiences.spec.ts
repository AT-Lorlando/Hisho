import { test } from '@japa/runner'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('ExperiencesController', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function createUser() {
    return User.create({ email: `u${Date.now()}@test.com`, password: 'password123' })
  }

  function uniqueTitle() {
    return `TestExp${Date.now()}`
  }

  test('GET /experiences returns 401 when unauthenticated', async ({ client }) => {
    const response = await client.get('/experiences')
    response.assertStatus(401)
  })

  test('POST /experiences creates experience and returns slug', async ({ client }) => {
    const user = await createUser()
    const title = uniqueTitle()
    const response = await client
      .post('/experiences')
      .loginAs(user)
      .json({ title, role: 'DevSecOps', type: 'cdi', startDate: '2023-01' })
    response.assertStatus(201)
    const body = response.body() as any
    response.assertBodyContains({ slug: body.slug })
  })

  test('GET /experiences returns list with missionCount', async ({ client, assert }) => {
    const user = await createUser()
    await client.post('/experiences').loginAs(user).json({ title: uniqueTitle() })
    const response = await client.get('/experiences').loginAs(user)
    response.assertStatus(200)
    const body = response.body() as any[]
    assert.isArray(body)
    assert.property(body[0], 'missionCount')
  })

  test('GET /experiences/:slug returns experience', async ({ client }) => {
    const user = await createUser()
    const title = uniqueTitle()
    const created = await client.post('/experiences').loginAs(user).json({ title })
    const { slug } = created.body() as any
    const response = await client.get(`/experiences/${slug}`).loginAs(user)
    response.assertStatus(200)
    response.assertBodyContains({ slug, title })
  })

  test('GET /experiences/:slug returns 404 for unknown slug', async ({ client }) => {
    const user = await createUser()
    const response = await client.get('/experiences/unknown-slug-xyz').loginAs(user)
    response.assertStatus(404)
  })

  test('PUT /experiences/:slug updates experience', async ({ client }) => {
    const user = await createUser()
    const title = uniqueTitle()
    const created = await client.post('/experiences').loginAs(user).json({ title })
    const { slug } = created.body() as any
    const response = await client
      .put(`/experiences/${slug}`)
      .loginAs(user)
      .json({ title: `${title} Updated`, role: 'Senior DevSecOps' })
    response.assertStatus(200)
  })

  test('DELETE /experiences/:slug deletes experience', async ({ client }) => {
    const user = await createUser()
    const title = uniqueTitle()
    const created = await client.post('/experiences').loginAs(user).json({ title })
    const { slug } = created.body() as any
    const response = await client.delete(`/experiences/${slug}`).loginAs(user)
    response.assertStatus(204)
  })

  test('POST /experiences returns 409 for duplicate slug', async ({ client }) => {
    const user = await createUser()
    const title = uniqueTitle()
    await client.post('/experiences').loginAs(user).json({ title })
    const response = await client.post('/experiences').loginAs(user).json({ title })
    response.assertStatus(409)
  })
})
