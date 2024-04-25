import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('reference').notNullable().unique()
      table.integer('amount').notNullable()
      table.enum('type', ['DEBIT', 'CREDIT']).notNullable().defaultTo('DEBIT')
      table.timestamp('created_at')
      table.timestamp('updated_at',{ useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}