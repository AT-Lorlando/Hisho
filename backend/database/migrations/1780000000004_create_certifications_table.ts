import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'certifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('slug').notNullable().unique()
      table.string('title').notNullable()
      table.string('organism').notNullable()
      table.string('date', 10).notNullable()
      table.string('expiry', 10).nullable()
      table.string('credential_id').nullable()
      table.string('url').nullable()
      table.jsonb('tags').defaultTo('[]')
      table.text('ai_summary').nullable()
      table.text('body').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
