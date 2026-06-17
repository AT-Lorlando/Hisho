import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'missions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('slug').notNullable().unique()
      table.string('title').notNullable()
      table.string('type', 10).notNullable()
      table
        .integer('experience_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('experiences')
        .onDelete('SET NULL')
      table.string('client').nullable()
      table.jsonb('domains').defaultTo('[]')
      table.jsonb('skills').defaultTo('[]')
      table.string('start_date', 10).nullable()
      table.string('end_date', 10).nullable()
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
