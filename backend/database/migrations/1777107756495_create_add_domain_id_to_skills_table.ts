import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'skills'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('domain_id').unsigned().nullable().references('id').inTable('domains').onDelete('SET NULL')
      table.dropColumn('domain')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('domain_id')
      table.string('domain').notNullable().defaultTo('')
    })
  }
}
