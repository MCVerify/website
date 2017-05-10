'use strict'

const Lucid = use('LucidMongo')

class User extends Lucid {

  static get createTimestamp () { return 'createdAt' }
  static get updateTimestamp () { return 'updatedAt' }
  static get deleteTimestamp () { return 'deletedAt' }

  static boot () {
    super.boot()
    this.addHook('beforeCreate', 'User.encryptPassword')
  }

  services () {
    return this.hasMany('App/Model/Service', '_id', 'user_id')
  }

}

module.exports = User
