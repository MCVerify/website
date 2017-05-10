'use strict'

const User = use('App/Model/User')
const Validator = use('Validator')
const shortid = use('shortid')
const Mail = use('Mail')
const Hash = use('Hash')

const messages = {
  required: '{{ field }} is required',
  unique: '{{ field }} must be unique',
  same: '{{ field }}s do not match'
}

class SettingsController {

  * changeEmail (request, response) {
    const data = request.only('email')
    const rules = {
      email: 'required|email'
    }

    const validation = yield Validator.validate(data, rules, messages)
    if (validation.fails()) {
      const errors = validation.messages()
      yield request.withAll().andWith({ errors }).flash()
      response.redirect('back')

      return
    }

    const user = yield User.find(request.currentUser._id)
    if (!user) {
      yield req.with({errors: [{
        message: 'An error occurred while trying to find your account'
      }]})
      response.redirect('back')

      return
    }

    const confirmToken = shortid.generate()
    user.confirm_token = confirmToken
    user.confirmed = false
    user.email = data.email
    yield user.save()

    yield Mail.raw(`Your confirmation token is ${confirmToken}`, message => {
      message.from('noreply@mcverify.org', 'MCVerify')
      message.subject(`${user.username}, please confirm your email`)
      message.to(data.email)
    })

    response.redirect('back')
  }

  * changePassword (request, response) {
    const data = request.only('current_password', 'new_password', 'new_password_confirm')
    const rules = {
      current_password: 'required',
      new_password: 'required|same:new_password_confirm',
      new_password_confirm: 'required'
    }

    const validation = yield Validator.validate(data, rules, messages)
    if (validation.fails()) {
      const errors = validation.messages()
      yield request.with({ errors }).flash()
      response.redirect('back')

      return
    }

    const user = yield User.find(request.currentUser._id)
    const isSame = yield Hash.verify(data.current_password, user.password)

    if (isSame) {
      user.password = yield Hash.make(data.new_password)
      yield user.save()
      yield request.with({
        success: 'Password updated successfully'
      }).flash()
      yield Mail.raw(`
      Hello ${user.username},

      Your password was recently changed.

      IP: ${request.ip()}
      `, message => {
        message.from('noreply@mcverify.org', 'MCVerify')
        message.subject(`${user.username}, a recent password change was made to your account`)
        message.to(user.email)
      })

      response.redirect('back')
    } else {
      yield request.with({errors: [{
        message: 'Incorrect password'
      }]}).flash()
      response.redirect('back')
    }
  }

}

module.exports = SettingsController
