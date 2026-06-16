// backend/tests/functional/skills.spec.ts
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Skill from '#models/skill'

test.group('SkillsController — level', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function createUser() {
    return User.create({ email: `sk${Date.now()}@test.com`, password: 'password123' })
  }

  test('PUT /skills/:slug persists the level', async ({ client, assert }) => {
    const user = await createUser()
    await client.post('/skills').loginAs(user).json({ title: 'GoLang' })

    const res = await client.put('/skills/golang').loginAs(user).json({ title: 'GoLang', level: 4 })
    res.assertStatus(200)

    const skill = await Skill.query().where('userId', user.id).where('slug', 'golang').first()
    assert.exists(skill)
    assert.equal(skill!.level, 4)
  })

  test('POST /skills accepts a level', async ({ client, assert }) => {
    const user = await createUser()
    const res = await client.post('/skills').loginAs(user).json({ title: 'Rust', level: 5 })
    res.assertStatus(201)
    const skill = await Skill.query().where('userId', user.id).where('slug', 'rust').first()
    assert.equal(skill!.level, 5)
  })
})
