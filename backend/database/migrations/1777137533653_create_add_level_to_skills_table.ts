import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'skills'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('level').nullable().defaultTo(null)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('level')
    })
  }
}
