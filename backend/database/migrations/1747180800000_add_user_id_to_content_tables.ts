import { BaseSchema } from '@adonisjs/lucid/schema'

const TABLES = ['experiences', 'missions', 'skills', 'domains', 'certifications'] as const

export default class extends BaseSchema {
  async up() {
    for (const table of TABLES) {
      this.schema.table(table, (t) => {
        t.integer('user_id').unsigned().nullable().references('id').inTable('users').onDelete('CASCADE')
        t.dropUnique(['slug'])
        t.unique(['user_id', 'slug'])
      })
    }
  }

  async down() {
    for (const table of TABLES) {
      this.schema.table(table, (t) => {
        t.dropUnique(['user_id', 'slug'])
        t.dropForeign(['user_id'])
        t.dropColumn('user_id')
        t.unique(['slug'])
      })
    }
  }
}
