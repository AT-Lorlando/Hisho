import { test } from '@japa/runner'
import User from '#models/user'
import Experience from '#models/experience'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('MissionsController', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function createUser() {
    return User.create({ email: `u${Date.now()}@test.com`, password: 'password123' })
  }

  async function createExperience(userId: number) {
    const slug = `testexp-${Date.now()}`
    const exp = await Experience.create({ slug, title: `TestExp ${Date.now()}`, userId })
    return { slug, exp }
  }

  test('POST /missions creates a pro mission linked to experience', async ({ client }) => {
    const user = await createUser()
    const { slug: expSlug } = await createExperience(user.id)
    const response = await client
      .post('/missions')
      .loginAs(user)
      .json({
        title: 'Déploiement SIEM ELK',
        type: 'pro',
        experience: expSlug,
        domains: [{ name: 'Cybersécurité', level: 3 }],
        skills: [{ name: 'ELK Stack', level: 4 }, { name: 'Docker', level: 3 }],
        startDate: '2023-06',
      })
    response.assertStatus(201)
    response.assertBodyContains({ slug: 'deploiement-siem-elk' })
  })

  test('POST /missions creates a perso mission without experience', async ({ client }) => {
    const user = await createUser()
    const uniqueTitle = `Homelab-${Date.now()}`
    const response = await client
      .post('/missions')
      .loginAs(user)
      .json({
        title: uniqueTitle,
        type: 'perso',
        domains: [{ name: 'Infrastructure', level: 3 }],
        skills: [{ name: 'Docker', level: 3 }],
      })
    response.assertStatus(201)
    response.assertBodyContains({ slug: response.body().slug })
  })

  test('GET /missions?type=perso returns only perso missions', async ({ client, assert }) => {
    const user = await createUser()
    const postRes = await client.post('/missions').loginAs(user).json({ title: 'Perso Project', type: 'perso' })
    postRes.assertStatus(201)
    const response = await client.get('/missions?type=perso').loginAs(user)
    response.assertStatus(200)
    const body = response.body() as any[]
    assert.isArray(body)
    assert.isAbove(body.length, 0)
    assert.isTrue(body.every((m: any) => m.type === 'perso'))
  })

  test('GET /missions?experience=slug returns missions for that experience', async ({
    client,
    assert,
  }) => {
    const user = await createUser()
    const { slug: expSlug } = await createExperience(user.id)
    const postRes = await client
      .post('/missions')
      .loginAs(user)
      .json({ title: 'Mission 1', type: 'pro', experience: expSlug })
    postRes.assertStatus(201)
    const response = await client.get(`/missions?experience=${expSlug}`).loginAs(user)
    response.assertStatus(200)
    const body = response.body() as any[]
    assert.isArray(body)
    assert.isAbove(body.length, 0)
    assert.isTrue(body.every((m: any) => m.experience === expSlug))
  })

  test('GET /missions/:slug returns experience as slug string', async ({ client }) => {
    const user = await createUser()
    const { slug: expSlug } = await createExperience(user.id)
    await client
      .post('/missions')
      .loginAs(user)
      .json({ title: 'SIEM ELK', type: 'pro', experience: expSlug })
    const response = await client.get('/missions/siem-elk').loginAs(user)
    response.assertStatus(200)
    response.assertBodyContains({ experience: expSlug })
  })

  test('DELETE /missions/:slug deletes mission', async ({ client }) => {
    const user = await createUser()
    await client.post('/missions').loginAs(user).json({ title: 'To Delete', type: 'perso' })
    const response = await client.delete('/missions/to-delete').loginAs(user)
    response.assertStatus(204)
  })

  test('GET /missions/:slug returns persisted SkillEntry domains and skills', async ({ client }) => {
    const user = await createUser()
    const { slug: expSlug } = await createExperience(user.id)
    const postRes = await client
      .post('/missions')
      .loginAs(user)
      .json({
        title: 'Round Trip Test',
        type: 'pro',
        experience: expSlug,
        domains: [{ name: 'Cybersécurité', level: 3 }],
        skills: [{ name: 'ELK Stack', level: 4 }, { name: 'Docker', level: 3 }],
      })
    postRes.assertStatus(201)
    const response = await client.get('/missions/round-trip-test').loginAs(user)
    response.assertStatus(200)
    response.assertBodyContains({
      domains: [{ name: 'Cybersécurité', level: 3 }],
      skills: [{ name: 'ELK Stack', level: 4 }, { name: 'Docker', level: 3 }],
    })
  })

  test('POST /missions rejects SkillEntry with invalid level', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .post('/missions')
      .loginAs(user)
      .json({
        title: 'Bad Level',
        type: 'perso',
        domains: [{ name: 'Cybersécurité', level: 6 }],
      })
    response.assertStatus(422)
  })
})
