import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Certification extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ serializeAs: null })
  declare userId: number

  @column()
  declare slug: string

  @column()
  declare title: string

  @column()
  declare organism: string

  @column()
  declare date: string

  @column()
  declare expiry: string | null

  @column()
  declare credentialId: string | null

  @column()
  declare url: string | null

  @column({
    prepare: (value: string[]) => JSON.stringify(value ?? []),
    consume: (value: any) => (Array.isArray(value) ? value : JSON.parse(value ?? '[]')),
  })
  declare tags: string[]

  @column()
  declare aiSummary: string | null

  @column()
  declare body: string | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
