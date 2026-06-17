import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'experiences'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('slug').notNullable().unique()
      table.string('title').notNullable()
      table.string('role').nullable()
      table.string('client').nullable()
      table.string('type', 20).nullable()
      table.string('start_date', 10).nullable()
      table.string('end_date', 10).nullable()
      table.string('location').nullable()
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
