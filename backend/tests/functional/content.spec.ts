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

  test('POST /content/experiences creates a markdown file', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .post('/content/experiences')
      .loginAs(user)
      .json({
        title: 'Dev TypeScript',
        client: 'TestCorp',
        role: 'Développeur',
        startDate: '2024-01',
        stack: ['TypeScript'],
        tags: ['frontend'],
        highlights: ['Built stuff'],
        body: 'Description de la mission.',
      })

    response.assertStatus(201)
    response.assertBodyContains({ slug: 'dev-typescript' })
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
      .json({
        title: 'Cybersécurité',
        description: 'SOC, pentest, SIEM',
        body: 'Domaine principal.',
      })

    response.assertStatus(201)
    response.assertBodyContains({ slug: 'cybersecurite' })
  })

  test('PUT /content/:type/:slug updates existing file', async ({ client }) => {
    const user = await createUser()
    await client
      .post('/content/skills')
      .loginAs(user)
      .json({ title: 'TypeScript', category: 'Langage', level: 'expert', tags: [] })

    const response = await client
      .put('/content/skills/typescript')
      .loginAs(user)
      .json({ title: 'TypeScript', category: 'Langage', level: 'avancé', tags: ['frontend'] })

    response.assertStatus(200)
    response.assertBodyContains({ slug: 'typescript' })
  })

  test('DELETE /content/:type/:slug removes file', async ({ client }) => {
    const user = await createUser()
    await client
      .post('/content/projects')
      .loginAs(user)
      .json({ title: 'Mon Projet', type: 'personnel', status: 'en-cours', stack: [], tags: [] })

    const response = await client
      .delete('/content/projects/mon-projet')
      .loginAs(user)
    response.assertStatus(204)
  })

  test('DELETE /content/:type/:slug returns 404 for unknown slug', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .delete('/content/experiences/nonexistent-slug')
      .loginAs(user)
    response.assertStatus(404)
  })
})
