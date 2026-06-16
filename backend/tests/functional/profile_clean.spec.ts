import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Experience from '#models/experience'
import Skill from '#models/skill'

test.group('ProfileController.cleanContent', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('deletes the user content, keeps identity, and is scoped to the user', async ({ client, assert }) => {
    const user = await User.create({
      email: `clean${Date.now()}@test.com`,
      password: 'password123',
      fullName: 'Me',
      title: 'Dev',
      bio: 'My bio',
    })
    const other = await User.create({ email: `other${Date.now()}@test.com`, password: 'password123' })

    await Experience.create({ slug: `e-${Date.now()}`, title: 'E1', userId: user.id })
    await Skill.create({ slug: `s-${Date.now()}`, title: 'S1', userId: user.id })
    await Experience.create({ slug: `oe-${Date.now()}`, title: 'OE1', userId: other.id })

    const res = await client.delete('/profile/content').loginAs(user)
    res.assertStatus(200)
    res.assertBodyContains({ deleted: { experiences: 1, skills: 1 } })

    assert.lengthOf(await Experience.query().where('userId', user.id), 0)
    assert.lengthOf(await Skill.query().where('userId', user.id), 0)

    const reloaded = await User.find(user.id)
    assert.equal(reloaded!.bio, 'My bio')
    assert.equal(reloaded!.title, 'Dev')

    assert.lengthOf(await Experience.query().where('userId', other.id), 1)
  })
})
