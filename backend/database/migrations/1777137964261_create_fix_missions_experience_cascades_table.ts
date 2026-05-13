import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'missions'

  async up() {
    // Fix orphaned missions: those with no experience parent but still typed 'pro'
    await this.db.rawQuery(`
      UPDATE missions SET type = 'perso' WHERE experience_id IS NULL AND type = 'pro'
    `)

    // Change FK from SET NULL to CASCADE so deleting an experience also deletes its missions
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['experience_id'])
      table
        .integer('experience_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('experiences')
        .onDelete('CASCADE')
        .alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['experience_id'])
      table
        .integer('experience_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('experiences')
        .onDelete('SET NULL')
        .alter()
    })
  }
}
