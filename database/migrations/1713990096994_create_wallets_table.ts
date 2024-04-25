import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'wallets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.decimal('balance', 14, 4).defaultTo(0.0000).notNullable()
      table.enu('status',['ACTIVE','INACTIVE']).defaultTo('ACTIVE').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at',{ useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}