'use strict'

const Lucid = use('LucidMongo')

class Service extends Lucid {

  static get createTimestamp () { return 'createdAt' }
  static get updateTimestamp () { return 'updatedAt' }
  static get deleteTimestamp () { return 'deletedAt' }

  user () {
    return this.hasOne('App/Model/User', '_id', 'user_id')
  }

}

module.exports = Service
