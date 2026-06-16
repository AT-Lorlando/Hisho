import { test } from '@japa/runner'
import {
  buildProfileContext,
  isProfileEmpty,
  buildChatSystemPrompt,
  type ProfileContextInput,
} from '#services/profile_context'

function emptyInput(): ProfileContextInput {
  return {
    user: { fullName: 'Jane Doe', title: null, bio: null, location: null, linkedinUrl: null, githubUrl: null, websiteUrl: null },
    experiences: [],
    persoMissions: [],
    skills: [],
    certifications: [],
  }
}

test.group('profile_context', () => {
  test('isProfileEmpty is true with no content', ({ assert }) => {
    assert.isTrue(isProfileEmpty(emptyInput()))
  })

  test('isProfileEmpty is false when there is at least one skill', ({ assert }) => {
    const input = emptyInput()
    input.skills.push({ title: 'TypeScript', level: 4, domain: 'Langages de programmation' })
    assert.isFalse(isProfileEmpty(input))
  })

  test('buildProfileContext includes present sections and skips empty ones', ({ assert }) => {
    const input = emptyInput()
    input.user.title = 'Développeur'
    input.experiences.push({
      title: 'Dev Full-Stack', role: 'Senior', client: 'Acme', type: 'cdi',
      startDate: '2022-01', endDate: null, body: 'Refonte UI',
      missions: [{ title: 'API', client: null, startDate: null, endDate: null, domains: ['DevOps'], skills: ['AdonisJS'], body: null }],
    })
    input.skills.push({ title: 'TypeScript', level: 5, domain: 'Langages de programmation' })

    const ctx = buildProfileContext(input)
    assert.include(ctx, 'Jane Doe')
    assert.include(ctx, 'Développeur')
    assert.include(ctx, 'Dev Full-Stack')
    assert.include(ctx, 'API')
    assert.include(ctx, 'TypeScript')
    assert.include(ctx, '5/5')
    assert.notInclude(ctx, 'Certifications') // none provided -> section omitted
  })

  test('buildChatSystemPrompt embeds the name and the context', ({ assert }) => {
    const prompt = buildChatSystemPrompt('Jane Doe', 'CONTEXTE_ICI')
    assert.include(prompt, 'Jane Doe')
    assert.include(prompt, 'CONTEXTE_ICI')
    assert.include(prompt, 'neutre')
  })
})
