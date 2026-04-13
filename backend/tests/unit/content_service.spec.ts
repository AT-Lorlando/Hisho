import { test } from '@japa/runner'
import { mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import ContentService from '#services/content_service'

const TMP_DIR = join(process.cwd(), 'tests', '_content_tmp')

test.group('ContentService', (group) => {
  let service: ContentService

  group.setup(() => {
    mkdirSync(TMP_DIR, { recursive: true })
    process.env.CONTENT_DIR = TMP_DIR
    service = new ContentService()
  })

  group.teardown(() => {
    rmSync(TMP_DIR, { recursive: true, force: true })
    delete process.env.CONTENT_DIR
  })

  test('generateSlug removes accents and special chars', ({ assert }) => {
    assert.equal(service.generateSlug('Développeur Full-Stack'), 'developpeur-full-stack')
    assert.equal(service.generateSlug('CTO @ Startup!'), 'cto-startup')
  })

  test('write creates file, exists returns true, read parses it back', ({ assert }) => {
    const frontmatter = { title: 'Test', client: 'ACME', stack: ['TypeScript'] }
    service.write('experiences', 'test-exp', frontmatter, 'Body content')

    assert.isTrue(service.exists('experiences', 'test-exp'))

    const { frontmatter: fm, body } = service.read('experiences', 'test-exp')
    assert.equal(fm.title, 'Test')
    assert.equal(fm.client, 'ACME')
    assert.deepEqual(fm.stack, ['TypeScript'])
    assert.equal(body, 'Body content')
  })

  test('delete removes file', ({ assert }) => {
    service.write('experiences', 'to-delete', { title: 'Del' }, '')
    assert.isTrue(service.exists('experiences', 'to-delete'))
    service.delete('experiences', 'to-delete')
    assert.isFalse(service.exists('experiences', 'to-delete'))
  })

  test('exists returns false for unknown file', ({ assert }) => {
    assert.isFalse(service.exists('experiences', 'nonexistent'))
  })
})
