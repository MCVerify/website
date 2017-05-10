'use strict'

const Schema = use('Schema')

class UsersTableSchema extends Schema {

  up () {
    this.create('users', (table) => {
      // table.increments()
      // console.log(collection)
      // table.index('email', { email: 1 }, { unique: true })
      // table.index('username', {}, {})
      // table.string('username', { unique: true })
      // table.string('email', { email: true }, { unique: true })
      // table.string('password')
      // table.boolean('confirmed')
      // table.string('confirm_token')
      // table.timestamps()
      // table.softDeletes()
    })
  }

  down () {
    this.drop('users')
  }

}

module.exports = UsersTableSchema
