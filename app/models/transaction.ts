import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import {nanoid} from 'nanoid'
export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare otherUserId: number

  @column()
  declare reference: string

  @column()
  declare amount: number

  @column()
  declare type: 'DEBIT' | 'CREDIT'
  
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // relationships
  @belongsTo(()=>User)
  declare user: BelongsTo<typeof User>

  // hooks
  @beforeCreate()
  static generateReference(transaction: Transaction) {
    transaction.reference = nanoid(12)
  }
}