import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Mission from '#models/mission'
import Skill from '#models/skill'

test.group('MissionsController — skill/domain sync', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function createUser() {
    return User.create({ email: `ms${Date.now()}@test.com`, password: 'password123' })
  }

  test('POST /missions derives domains from skills and syncs them to global skills', async ({ client, assert }) => {
    const user = await createUser()
    const res = await client
      .post('/missions')
      .loginAs(user)
      .json({
        title: `Proj ${Date.now()}`,
        skills: [
          { name: 'Docker', level: 5, domain: 'DevOps' },
          { name: 'Vue.js', level: 4, domain: 'Développement Web' },
        ],
      })
    res.assertStatus(201)
    const slug = (res.body() as any).slug

    const mission = await Mission.query().where('userId', user.id).where('slug', slug).first()
    assert.exists(mission)
    assert.sameMembers(
      mission!.domains.map((d) => d.name),
      ['DevOps', 'Développement Web']
    )

    const docker = await Skill.query().where('userId', user.id).where('slug', 'docker').preload('domain').first()
    assert.exists(docker)
    assert.equal(docker!.domain?.title, 'DevOps')
    assert.equal(docker!.level, 5)
  })

  test('PUT /missions/:slug re-derives domains and fills a null skill domain', async ({ client, assert }) => {
    const user = await createUser()
    // pre-existing global skill with no domain
    await Skill.create({ slug: 'kafka', userId: user.id, title: 'Kafka', domainId: null, level: 2 })
    const created = await client.post('/missions').loginAs(user).json({ title: `M ${Date.now()}`, skills: [] })
    const slug = (created.body() as any).slug

    const res = await client
      .put(`/missions/${slug}`)
      .loginAs(user)
      .json({ title: 'Updated', skills: [{ name: 'Kafka', level: 4, domain: 'DevOps' }] })
    res.assertStatus(200)

    const kafka = await Skill.query().where('userId', user.id).where('slug', 'kafka').preload('domain').first()
    assert.equal(kafka!.domain?.title, 'DevOps')
    assert.equal(kafka!.level, 4) // kept the max (2 -> 4)
  })
})
