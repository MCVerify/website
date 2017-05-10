'use strict'

const Validator = use('Validator')
const User = use('App/Model/User')
const Mail = use('Mail')
const shortid = use('shortid')

const messages = {
  required: '{{ field }} is required',
  unique: '{{ field }} must be unique',
  same: '{{ field }}s do not match'
}

class AuthController {

  * login (req, res) {
    const data = req.all()
    const rules = {
      email: 'required|email',
      password: 'required'
    }

    const validation = yield Validator.validate(data, rules, messages)
    if (validation.fails()) {
      const errors = validation.messages()
      yield req.withOut('password').andWith({ errors }).flash()
      res.redirect('back')

      return
    }

    try {
      const { email, password } = data
      yield req.auth.attempt(email, password)
      res.redirect('/')
    } catch (e) {
      yield req.withOut('password').andWith({ errors: [{
        message: 'Incorrect username or password'
      }] }).flash()
      res.redirect('back')
    }
  }

  * register (req, res) {
    const data = req.all()
    const rules = {
      email: 'required|email',
      username: 'required|alpha_numeric|max:80',
      password: 'required|same:confirm_password'
    }

    const validation = yield Validator.validate(data, rules, messages)
    if (validation.fails()) {
      const errors = validation.messages()
      yield req.withOut('password', 'confirm_password').andWith({ errors }).flash()
      res.redirect('back')

      return
    }

    const exists = yield User.where({or: [
      { email: data.email },
      { username: data.username }
    ]}).first()
    if (exists) {
      yield req.withOut('password', 'confirm_password').andWith({
        errors: [{
          message: 'Email or username already in use'
        }]
      }).flash()
      res.redirect('back')

      return
    }

    const userData = Object.assign(
      { confirm_token: shortid.generate(), confirmed: false },
      req.only('username', 'password', 'email'))

    try {
      const user = yield User.create(userData)
      yield Mail.raw(`Your confirmation token is ${userData.confirm_token}`, message => {
        message.from('noreply@mcverify.org', 'MCVerify')
        message.subject(`${user.username}, please confirm your email`)
        message.to(userData.email)
      })
      yield req.withOnly({
        success: 'Thanks for registering! We\'ve sent a confirmation email to your email address'
      }).flash()
      res.redirect('confirm')
    } catch (e) {
      yield req.withOut('password', 'confirm_password').andWith({
        errors: [{
          message: 'An error occurred while creating your account. Please contact an administrator.'
        }]
      }).flash()
      res.redirect('back')
    }
  }

  * confirm (req, res) {
    const { confirm_hash } = req.only('confirm_hash')

    if (!shortid.isValid(confirm_hash)) {
      yield req.with({
        errors: [{
          message: 'Confirmation hash is not valid'
        }]
      }).flash()
      res.redirect('back')

      return
    }

    try {
      const user = yield User.findByOrFail('confirm_token', confirm_hash)
      if (user.confirmed) {
        yield req.with({
          errors: [{
            message: 'Your email is already confirmed'
          }]
        }).flash()
        res.redirect('back')

        return
      }

      user.confirmed = true
      yield user.save()

      yield req.with({
        success: 'Great! Your email address has been confirmed'
      }).flash()
      res.redirect('back')
    } catch (e) {
      yield req.with({
        errors: [{
          message: 'No user found matching confirmation hash'
        }]
      }).flash()
      res.redirect('back')
    }
  }

  * resendConfirmation (request, response) {
    const user = yield User.find(request.currentUser._id)
    if (user.confirmed) {
      yield request.with({
        errors: [{
          message: 'Your email is already confirmed'
        }]
      }).flash()
      response.redirect('back')

      return
    }

    yield Mail.raw(`Your confirmation token is ${user.confirm_token}`, message => {
      message.from('noreply@mcverify.org', 'MCVerify')
      message.subject(`${user.username}, please confirm your email`)
      message.to(user.email)
    })

    yield request.with({
      success: 'Confirmation token resent'
    }).flash()
    response.redirect('back')
  }

}

module.exports = AuthController
