'use strict'

/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
|
| AdonisJs Router helps you in defining urls and their actions. It supports
| all major HTTP conventions to keep your routes file descriptive and
| clean.
|
| @example
| Route.get('/user', 'UserController.index')
| Route.post('/user', 'UserController.store')
| Route.resource('user', 'UserController')
*/

const Route = use('Route')

Route.on('/').render('index')
Route.on('/login').render('login')
Route.on('/register').render('register')
Route.on('/confirm').render('confirm').middleware('auth')
Route.on('/getting-started').render('getting-started')

Route.get('/confirm/resend', 'AuthController.resendConfirmation').middleware('auth')

Route.post('/login', 'AuthController.login')
Route.post('/register', 'AuthController.register')
Route.post('/confirm', 'AuthController.confirm')

Route.group('dashboard', () => {
  Route.on('/').render('dashboard/index')

  Route.get('/services', 'ServiceController.index')
  Route.get('/services/create', 'ServiceController.create')
  Route.post('/services/create', 'ServiceController.store')
  Route.get('/services/:id/manage', 'ServiceController.edit').as('services:manage')
  Route.post('/services/:id/manage', 'ServiceController.update').as('services:manage:update')
  Route.get('/services/:id/delete', 'ServiceController.destroy').as('services:delete')
}).prefix('dashboard').middleware('auth')

Route.group('settings', () => {
  Route.on('/').render('settings')

  Route.post('/update/email', 'SettingsController.changeEmail')
  Route.post('/update/password', 'SettingsController.changePassword')
}).prefix('settings').middleware('auth')
