import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Experience from '#models/experience'

export default class Mission extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare slug: string

  @column()
  declare title: string

  @column()
  declare type: 'pro' | 'perso'

  @column()
  declare experienceId: number | null

  @column()
  declare client: string | null

  @column({
    prepare: (value: string[]) => JSON.stringify(value ?? []),
    consume: (value: any) => (Array.isArray(value) ? value : JSON.parse(value ?? '[]')),
  })
  declare domains: string[]

  @column({
    prepare: (value: string[]) => JSON.stringify(value ?? []),
    consume: (value: any) => (Array.isArray(value) ? value : JSON.parse(value ?? '[]')),
  })
  declare skills: string[]

  @column()
  declare startDate: string | null

  @column()
  declare endDate: string | null

  @column()
  declare aiSummary: string | null

  @column()
  declare body: string | null

  @belongsTo(() => Experience)
  declare experience: BelongsTo<typeof Experience>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
