import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Mission from '#models/mission'

export default class Experience extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare slug: string

  @column()
  declare title: string

  @column()
  declare role: string | null

  @column()
  declare client: string | null

  @column()
  declare type: 'cdi' | 'cdd' | 'freelance' | 'alternance' | 'stage' | null

  @column()
  declare startDate: string | null

  @column()
  declare endDate: string | null

  @column()
  declare location: string | null

  @column()
  declare aiSummary: string | null

  @column()
  declare body: string | null

  @hasMany(() => Mission)
  declare missions: HasMany<typeof Mission>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
