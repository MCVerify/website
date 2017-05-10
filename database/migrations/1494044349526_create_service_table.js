'use strict'

const Schema = use('Schema')

class ServicesTableSchema extends Schema {

  up () {
    this.create('services', (table) => {
      // table.increments()
      // user_id
      // ivn_url
      // api_key
      // name
      // table.timestamps()
    })
  }

  down () {
    this.drop('services')
  }

}

module.exports = ServicesTableSchema
