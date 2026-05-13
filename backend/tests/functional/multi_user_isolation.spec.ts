import { test } from '@japa/runner'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Multi-user isolation', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function createUser(n: number) {
    return User.create({ email: `isolation${n}${Date.now()}@test.com`, password: 'password123' })
  }

  test('User A cannot read User B experiences', async ({ client }) => {
    const userA = await createUser(1)
    const userB = await createUser(2)

    // User A creates an experience
    const createRes = await client
      .post('/experiences')
      .loginAs(userA)
      .json({ title: 'Exp de A' })
    createRes.assertStatus(201)
    const slug = createRes.body().slug as string

    // User B cannot access it
    const readRes = await client.get(`/experiences/${slug}`).loginAs(userB)
    readRes.assertStatus(404)
  })

  test('User A cannot delete User B experiences', async ({ client }) => {
    const userA = await createUser(1)
    const userB = await createUser(2)

    const createRes = await client
      .post('/experiences')
      .loginAs(userA)
      .json({ title: 'Exp de A bis' })
    createRes.assertStatus(201)
    const slug = createRes.body().slug as string

    const deleteRes = await client.delete(`/experiences/${slug}`).loginAs(userB)
    deleteRes.assertStatus(404)
  })

  test('GET /experiences returns only the authenticated user experiences', async ({ client, assert }) => {
    const userA = await createUser(1)
    const userB = await createUser(2)

    await client.post('/experiences').loginAs(userA).json({ title: 'Exp only A' })
    const listRes = await client.get('/experiences').loginAs(userB)
    listRes.assertStatus(200)
    const body = listRes.body() as any[]
    assert.isTrue(body.every((e: any) => e.title !== 'Exp only A'))
  })
})
