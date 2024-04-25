import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, beforeCreate, beforeSave, column, hasOne } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { nanoid } from 'nanoid'
import Wallet from './wallet.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'
const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['phone_number', 'email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uid: string

  @column()
  declare email: string

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare phoneNumber: string

  @column()
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)

  // relationships

  @hasOne(() => Wallet)
  declare wallet: HasOne<typeof Wallet>

  // hooks
  @beforeCreate()
  static generateUid(user: User) {
    user.uid = nanoid()
  }
  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await hash.make(user.password)
    }
  }
}
