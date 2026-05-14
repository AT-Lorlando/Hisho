import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Domain from '#models/domain'
import User from '#models/user'

export default class Skill extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ serializeAs: null })
  declare userId: number

  @column()
  declare slug: string

  @column()
  declare title: string

  @column()
  declare domainId: number | null

  @belongsTo(() => Domain)
  declare domain: BelongsTo<typeof Domain>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column()
  declare level: number | null

  @column()
  declare yearsOfExperience: number | null

  @column()
  declare aiSummary: string | null

  @column()
  declare body: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
