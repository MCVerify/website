'use strict'

const Service = use('App/Model/Service')
const User = use('App/Model/User')
const Validator = use('Validator')
const uuid = use('uuid')

const messages = {
  required: '{{ field }} is required',
  unique: '{{ field }} must be unique',
  same: '{{ field }}s do not match'
}

class ServiceController {

  * index(request, response) {
    const user = yield User.find(request.currentUser._id)
    const services = yield user.services().fetch()

    yield response.sendView('dashboard/services/index', { services: services.toJSON() })
  }

  * create(request, response) {
    yield response.sendView('dashboard/services/create')
  }

  * store(request, response) {
    const data = request.all()
    const rules = {
      service_name: 'required|alpha_numeric|string|max:80',
      service_ivn_url: 'required|url'
    }

    const validation = yield Validator.validate(data, rules, messages)
    if (validation.fails()) {
      const errors = validation.messages()
      yield request.withAll().andWith({ errors }).flash()
      response.redirect('back')

      return
    }

    const exists = yield Service.query().where('ivn_url', data.service_ivn_url).whereNull('deletedAt').first()
    if (exists) {
      yield request.withAll().andWith({errors: [{
        message: 'A service already exists with this URL'
      }]}).flash()
      response.redirect('back')

      return
    }

    const service = new Service()
    service.user_id = request.currentUser._id
    service.ivn_url = data.service_ivn_url
    service.api_key = uuid()
    service.name = data.service_name
    yield service.save(service)

    yield request.with({
      success: `Service ${service.name} successfully created`
    }).flash()
    response.redirect('/dashboard/services')
  }

  * show(request, response) {
    //
  }

  * edit(request, response) {
    const id = request.param('id')

    const user = yield User.find(request.currentUser._id)
    const service = yield user.services().where('_id', id).fetch()

    if (!service.toJSON().length) {
      response.status(404).send('404 Not Found')
      return
    }

    yield response.sendView('dashboard/services/manage', { service: service.toJSON()[0] })
  }

  * update(request, response) {
    const id = request.param('id')
    const data = request.all()

    const user = yield User.find(request.currentUser._id)
    const service = yield user.services().where('_id', id).fetch()

    if (!service.toJSON().length) {
      yield request.withAll().andWith({errors: [{
        message: 'An error occurred while attempting to update your service, please contact us.'
      }]})
      response.redirect('back')

      return
    }

    const rules = {
      service_name: 'required|alpha_numeric|string|max:80',
      service_ivn_url: 'required|url'
    }

    const validation = yield Validator.validate(data, rules, messages)
    if (validation.fails()) {
      const errors = validation.messages()
      yield request.withAll().andWith({ errors }).flash()
      response.redirect('back')

      return
    }

    const newService = yield Service.find(service.toJSON()[0]._id)

    newService.name = data.service_name
    newService.ivn_url = data.service_ivn_url

    yield newService.save(service)
    yield request.with({
      success: `Service ${newService.name} successfully updated`
    }).flash()
    response.redirect('/dashboard/services')
  }

  * destroy(request, response) {
    const id = request.param('id')

    const user = yield User.find(request.currentUser._id)
    const service = yield user.services().where('_id', id).fetch()

    if (!service.toJSON().length) {
      yield request.with({errors: [{
        message: 'Unable to find service'
      }]}).flash()
      response.redirect('back')

      return
    }

    const serviceToDelete = yield Service.find(service.toJSON()[0]._id)
    yield serviceToDelete.delete()

    yield request.with({
      success: `Service ${serviceToDelete.name} successfully deleted`
    }).flash()
    response.redirect('/dashboard/services')
  }

}

module.exports = ServiceController
