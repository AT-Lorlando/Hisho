import { test } from '@japa/runner'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const TMP_DIR = join(process.cwd(), 'tests', '_content_tmp_functional')

test.group('ContentController', (group) => {
  group.setup(() => {
    mkdirSync(TMP_DIR, { recursive: true })
    process.env.CONTENT_DIR = TMP_DIR
  })

  group.teardown(() => {
    rmSync(TMP_DIR, { recursive: true, force: true })
    delete process.env.CONTENT_DIR
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function createUser() {
    return User.create({ email: `u${Date.now()}@test.com`, password: 'password123' })
  }

  test('POST /content/:type returns 401 when unauthenticated', async ({ client }) => {
    const response = await client.post('/content/experiences').json({ title: 'Test' })
    response.assertStatus(401)
  })

  test('POST /content/experiences creates an employer file', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .post('/content/experiences')
      .loginAs(user)
      .json({
        title: 'Neverhack',
        role: 'Ingénieur DevSecOps',
        client: 'Airbus Defence and Space',
        type: 'cdi',
        startDate: '2023-01',
        location: 'Toulouse',
        missions: ['deploiement-siem-elk'],
        body: 'Mission longue durée.',
      })
    response.assertStatus(201)
    response.assertBodyContains({ slug: 'neverhack' })
  })

  test('POST /content/missions creates a pro mission file', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .post('/content/missions')
      .loginAs(user)
      .json({
        title: 'Déploiement SIEM ELK',
        type: 'pro',
        experience: 'neverhack',
        client: 'Airbus Defence and Space',
        domains: ['Cybersécurité', 'Infrastructure'],
        skills: ['ELK Stack', 'Docker'],
        startDate: '2023-06',
        body: '25M logs/jour.',
      })
    response.assertStatus(201)
    response.assertBodyContains({ slug: 'deploiement-siem-elk' })
  })

  test('POST /content/missions creates a perso mission file', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .post('/content/missions')
      .loginAs(user)
      .json({
        title: 'Homelab Infrastructure',
        type: 'perso',
        domains: ['Infrastructure'],
        skills: ['Docker', 'Ansible'],
        body: 'Infra perso.',
      })
    response.assertStatus(201)
    response.assertBodyContains({ slug: 'homelab-infrastructure' })
  })

  test('POST /content/:type returns 400 for invalid type', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .post('/content/invalid-type')
      .loginAs(user)
      .json({ title: 'Test' })
    response.assertStatus(400)
  })

  test('POST /content/domains creates a domain file', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .post('/content/domains')
      .loginAs(user)
      .json({ title: 'Cybersécurité', description: 'SOC, pentest, SIEM', body: 'Domaine principal.' })
    response.assertStatus(201)
    response.assertBodyContains({ slug: 'cybersecurite' })
  })

  test('PUT /content/:type/:slug updates existing file', async ({ client }) => {
    const user = await createUser()
    await client
      .post('/content/missions')
      .loginAs(user)
      .json({ title: 'Mission Test', type: 'perso', body: 'v1' })
    const response = await client
      .put('/content/missions/mission-test')
      .loginAs(user)
      .json({ title: 'Mission Test', type: 'perso', body: 'v2 updated' })
    response.assertStatus(200)
  })

  test('DELETE /content/:type/:slug removes file', async ({ client }) => {
    const user = await createUser()
    await client
      .post('/content/missions')
      .loginAs(user)
      .json({ title: 'Mission Delete', type: 'perso', body: '' })
    const response = await client
      .delete('/content/missions/mission-delete')
      .loginAs(user)
    response.assertStatus(204)
  })

  test('DELETE /content/:type/:slug returns 404 for unknown slug', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .delete('/content/missions/nonexistent-slug')
      .loginAs(user)
    response.assertStatus(404)
  })
})
