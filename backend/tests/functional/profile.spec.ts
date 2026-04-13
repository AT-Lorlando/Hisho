import { test } from '@japa/runner'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('ProfileController', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('GET /profile returns 401 when unauthenticated', async ({ client }) => {
    const response = await client.get('/profile')
    response.assertStatus(401)
  })

  test('GET /profile returns current user profile', async ({ client }) => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    })

    const response = await client.get('/profile').loginAs(user)
    response.assertStatus(200)
    response.assertBodyContains({ email: 'test@example.com', fullName: 'Test User' })
  })

  test('PUT /profile updates profile fields', async ({ client, assert }) => {
    const user = await User.create({
      email: 'test2@example.com',
      password: 'password123',
    })

    const response = await client
      .put('/profile')
      .loginAs(user)
      .json({
        title: 'Développeur Full-Stack',
        bio: 'Passionné de TypeScript',
        location: 'Paris',
        availability: 'Disponible',
      })

    response.assertStatus(200)
    response.assertBodyContains({
      title: 'Développeur Full-Stack',
      bio: 'Passionné de TypeScript',
      location: 'Paris',
    })

    await user.refresh()
    assert.equal(user.title, 'Développeur Full-Stack')
  })

  test('PUT /profile returns 401 when unauthenticated', async ({ client }) => {
    const response = await client.put('/profile').json({ title: 'Test' })
    response.assertStatus(401)
  })
})
