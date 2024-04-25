import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uid').notNullable().unique()
      table.string('email')
      table.string('first_name').notNullable()
      table.string('last_name').notNullable()
      table.string('phone_number').notNullable()
      table.string('password').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at',{ useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
