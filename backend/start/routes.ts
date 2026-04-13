/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const ProfileController = () => import('#controllers/profile_controller')
const ContentController = () => import('#controllers/content_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

/**
 * Auth routes
 */
router
  .group(() => {
    router.post('/register', [AuthController, 'register']).use(middleware.guest())
    router.post('/login', [AuthController, 'login']).use(middleware.guest())
    router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
    router.get('/me', [AuthController, 'me']).use(middleware.auth())
  })
  .prefix('/auth')

/**
 * Profile routes — require auth
 */
router
  .group(() => {
    router.get('/profile', [ProfileController, 'show'])
    router.put('/profile', [ProfileController, 'update'])
    router.post('/profile/compile', [ProfileController, 'compile'])
  })
  .use(middleware.auth())

/**
 * Content (Markdown files) routes — require auth
 */
router
  .group(() => {
    router.post('/content/:type', [ContentController, 'store'])
    router.put('/content/:type/:slug', [ContentController, 'update'])
    router.delete('/content/:type/:slug', [ContentController, 'destroy'])
  })
  .use(middleware.auth())
