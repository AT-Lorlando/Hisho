// backend/tests/functional/ai_import.spec.ts
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Skill from '#models/skill'
import Mission from '#models/mission'

test.group('AiController.importProfile — skill domains', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function createUser() {
    return User.create({ email: `imp${Date.now()}@test.com`, password: 'password123' })
  }

  test('assigns each skill its own domain even when the mission has multiple domains', async ({ client, assert }) => {
    const user = await createUser()
    const payload = {
      missions: [
        {
          title: `MultiDomain ${Date.now()}`,
          domains: [
            { name: 'DevOps', level: 3 },
            { name: 'Réseaux', level: 3 },
          ],
          skills: [
            { name: 'Docker', level: 4, domain: 'DevOps' },
            { name: 'Nginx', level: 3, domain: 'Réseaux' },
          ],
        },
      ],
    }
    const res = await client.post('/ai/import').loginAs(user).json(payload)
    res.assertStatus(200)

    const docker = await Skill.query().where('userId', user.id).where('slug', 'docker').preload('domain').first()
    assert.exists(docker)
    assert.equal(docker!.domain?.title, 'DevOps')

    const nginx = await Skill.query().where('userId', user.id).where('slug', 'nginx').preload('domain').first()
    assert.exists(nginx)
    assert.equal(nginx!.domain?.title, 'Réseaux')
  })

  test('derives mission.domains from skill domains so cards group them (not "Autres")', async ({ client, assert }) => {
    const user = await createUser()
    const payload = {
      missions: [
        {
          // No mission-level `domains` — only per-skill domains (as the AI extraction produces)
          title: `Derive ${Date.now()}`,
          skills: [
            { name: 'Vue', level: 4, domain: 'Frontend' },
            { name: 'Nuxt', level: 4, domain: 'Frontend' },
            { name: 'Postgres', level: 3, domain: 'Backend' },
          ],
        },
      ],
    }
    const res = await client.post('/ai/import').loginAs(user).json(payload)
    res.assertStatus(200)

    const mission = await Mission.query().where('userId', user.id).firstOrFail()
    const domainNames = (mission.domains ?? []).map((d) => d.name).sort()
    assert.deepEqual(domainNames, ['Backend', 'Frontend'])
  })

  test('falls back to the single mission domain when a skill has no domain', async ({ client, assert }) => {
    const user = await createUser()
    const payload = {
      missions: [
        {
          title: `Mono ${Date.now()}`,
          domains: [{ name: 'DevOps', level: 3 }],
          skills: [{ name: 'Terraform', level: 3 }],
        },
      ],
    }
    const res = await client.post('/ai/import').loginAs(user).json(payload)
    res.assertStatus(200)

    const tf = await Skill.query().where('userId', user.id).where('slug', 'terraform').preload('domain').first()
    assert.exists(tf)
    assert.equal(tf!.domain?.title, 'DevOps')
  })
})
