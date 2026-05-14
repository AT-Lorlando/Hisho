import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Experience from '#models/experience'
import User from '#models/user'

export interface SkillEntry {
  name: string
  level: 1 | 2 | 3 | 4 | 5
}

export default class Mission extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ serializeAs: null })
  declare userId: number

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
    prepare: (value: SkillEntry[]) => JSON.stringify(value ?? []),
    consume: (value: any) => (Array.isArray(value) ? value : JSON.parse(value ?? '[]')),
  })
  declare domains: SkillEntry[]

  @column({
    prepare: (value: SkillEntry[]) => JSON.stringify(value ?? []),
    consume: (value: any) => (Array.isArray(value) ? value : JSON.parse(value ?? '[]')),
  })
  declare skills: SkillEntry[]

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

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
