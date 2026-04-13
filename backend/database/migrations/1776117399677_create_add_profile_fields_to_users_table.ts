import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('title').nullable()
      table.text('bio').nullable()
      table.string('location').nullable()
      table.string('linkedin_url').nullable()
      table.string('github_url').nullable()
      table.string('website_url').nullable()
      table.string('phone').nullable()
      table.string('availability').nullable()
      table.string('daily_rate').nullable()
      table.timestamp('last_compiled_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('title')
      table.dropColumn('bio')
      table.dropColumn('location')
      table.dropColumn('linkedin_url')
      table.dropColumn('github_url')
      table.dropColumn('website_url')
      table.dropColumn('phone')
      table.dropColumn('availability')
      table.dropColumn('daily_rate')
      table.dropColumn('last_compiled_at')
    })
  }
}
