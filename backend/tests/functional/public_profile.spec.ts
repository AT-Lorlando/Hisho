import { test } from '@japa/runner'
import User from '#models/user'
import Experience from '#models/experience'
import Certification from '#models/certification'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('PublicProfileController', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function createUser() {
    return User.create({
      email: `pub${Date.now()}@test.com`,
      password: 'password123',
      fullName: 'Test User',
      title: 'Developer',
    })
  }

  test('GET /users returns list of users without sensitive fields', async ({ client, assert }) => {
    const user = await createUser()
    const res = await client.get('/users')
    res.assertStatus(200)
    const body = res.body() as any[]
    assert.isArray(body)
    const found = body.find((u: any) => u.id === user.id)
    assert.exists(found)
    assert.notProperty(found, 'email')
    assert.notProperty(found, 'password')
    assert.property(found, 'fullName')
    assert.property(found, 'title')
  })

  test('GET /users/:id/profile returns profile without sensitive fields', async ({ client, assert }) => {
    const user = await createUser()
    const res = await client.get(`/users/${user.id}/profile`)
    res.assertStatus(200)
    const body = res.body() as any
    assert.equal(body.id, user.id)
    assert.notProperty(body, 'email')
    assert.notProperty(body, 'password')
    assert.property(body, 'fullName')
  })

  test('GET /users/:id/profile returns 404 for unknown user', async ({ client }) => {
    const res = await client.get('/users/999999/profile')
    res.assertStatus(404)
  })

  test('GET /users/:id/experiences returns experiences without auth', async ({ client, assert }) => {
    const user = await createUser()
    await Experience.create({ slug: `pub-exp-${Date.now()}`, title: 'Public Exp', userId: user.id })
    const res = await client.get(`/users/${user.id}/experiences`)
    res.assertStatus(200)
    const body = res.body() as any[]
    assert.isArray(body)
    assert.isTrue(body.length > 0)
  })

  test('GET /users/:id/certifications returns certifications without auth', async ({ client, assert }) => {
    const user = await createUser()
    await Certification.create({
      slug: `pub-cert-${Date.now()}`,
      title: 'AWS SAA',
      organism: 'AWS',
      date: '2024-01',
      tags: [],
      userId: user.id,
    })
    const res = await client.get(`/users/${user.id}/certifications`)
    res.assertStatus(200)
    const body = res.body() as any[]
    assert.isArray(body)
    assert.isTrue(body.length > 0)
  })

  test('GET /users/:id/counts returns content counts without auth', async ({ client, assert }) => {
    const user = await createUser()
    const res = await client.get(`/users/${user.id}/counts`)
    res.assertStatus(200)
    const body = res.body() as any
    assert.property(body, 'experiences')
    assert.property(body, 'missions')
    assert.property(body, 'skills')
    assert.property(body, 'domains')
    assert.property(body, 'certifications')
  })
})
