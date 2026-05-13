import { BaseSchema } from '@adonisjs/lucid/schema'

const TABLES = ['experiences', 'missions', 'skills', 'domains', 'certifications'] as const

export default class extends BaseSchema {
  async up() {
    // Defer runs after schema DDL — put everything here since we need data before NOT NULL
    this.defer(async (db) => {
      const firstUser = await db.from('users').orderBy('id', 'asc').first()
      if (firstUser) {
        for (const table of TABLES) {
          await db.from(table).whereNull('user_id').update({ user_id: firstUser.id })
          await db.rawQuery(`ALTER TABLE ${table} ALTER COLUMN user_id SET NOT NULL`)
        }
      } else {
        // No users: still enforce NOT NULL for safety
        for (const table of TABLES) {
          await db.rawQuery(`ALTER TABLE ${table} ALTER COLUMN user_id SET NOT NULL`)
        }
      }
    })
  }

  async down() {
    this.defer(async (db) => {
      for (const table of TABLES) {
        await db.rawQuery(`ALTER TABLE ${table} ALTER COLUMN user_id DROP NOT NULL`)
      }
    })
  }
}
