import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  // Champs profil
  @column()
  declare title: string | null

  @column()
  declare bio: string | null

  @column()
  declare location: string | null

  @column()
  declare linkedinUrl: string | null

  @column()
  declare githubUrl: string | null

  @column()
  declare websiteUrl: string | null

  @column()
  declare phone: string | null

  @column()
  declare availability: string | null

  @column()
  declare dailyRate: string | null

  @column.dateTime()
  declare lastCompiledAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
