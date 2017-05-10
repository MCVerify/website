'use strict'

class Auth {

  * handle (request, response, next) {

    const loggedIn = yield request.auth.check()

    if (loggedIn) {
      if (!request.currentUser.confirmed && !request.url().includes('confirm')) {
        return response.redirect('/confirm')
      }

      yield next
    } else {
      response.redirect('/login')
    }
  }

}

module.exports = Auth
