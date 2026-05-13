import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const ProfileController = () => import('#controllers/profile_controller')
const CompetencyController = () => import('#controllers/competency_controller')
const ExperiencesController = () => import('#controllers/experiences_controller')
const MissionsController = () => import('#controllers/missions_controller')
const SkillsController = () => import('#controllers/skills_controller')
const DomainsController = () => import('#controllers/domains_controller')
const CertificationsController = () => import('#controllers/certifications_controller')
const CountsController = () => import('#controllers/counts_controller')
const AiController = () => import('#controllers/ai_controller')

router.get('/', async () => ({ hello: 'world' }))

router
  .group(() => {
    router.post('/register', [AuthController, 'register']).use(middleware.guest())
    router.post('/login', [AuthController, 'login']).use(middleware.guest())
    router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
    router.get('/me', [AuthController, 'me']).use(middleware.auth())
    router.delete('/account', [AuthController, 'deleteAccount']).use(middleware.auth())
  })
  .prefix('/auth')

router
  .group(() => {
    router.get('/profile', [ProfileController, 'show'])
    router.put('/profile', [ProfileController, 'update'])
    router.post('/profile/compile', [ProfileController, 'compile'])
  })
  .use(middleware.auth())

router
  .group(() => {
    router.get('/competencies', [CompetencyController, 'index'])
    router.put('/competencies/:type/:slug', [CompetencyController, 'upsert'])
    router.delete('/competencies/:type/:slug', [CompetencyController, 'destroy'])
  })
  .use(middleware.auth())

router
  .group(() => {
    router.get('/counts', [CountsController, 'index'])

    router.get('/experiences', [ExperiencesController, 'index'])
    router.post('/experiences', [ExperiencesController, 'store'])
    router.get('/experiences/:slug', [ExperiencesController, 'show'])
    router.put('/experiences/:slug', [ExperiencesController, 'update'])
    router.delete('/experiences/:slug', [ExperiencesController, 'destroy'])

    router.get('/missions', [MissionsController, 'index'])
    router.post('/missions', [MissionsController, 'store'])
    router.get('/missions/:slug', [MissionsController, 'show'])
    router.put('/missions/:slug', [MissionsController, 'update'])
    router.delete('/missions/:slug', [MissionsController, 'destroy'])

    router.get('/skills', [SkillsController, 'index'])
    router.post('/skills', [SkillsController, 'store'])
    router.get('/skills/:slug', [SkillsController, 'show'])
    router.put('/skills/:slug', [SkillsController, 'update'])
    router.delete('/skills/:slug', [SkillsController, 'destroy'])

    router.get('/domains', [DomainsController, 'index'])
    router.post('/domains', [DomainsController, 'store'])
    router.get('/domains/:slug', [DomainsController, 'show'])
    router.put('/domains/:slug', [DomainsController, 'update'])
    router.delete('/domains/:slug', [DomainsController, 'destroy'])

    router.get('/certifications', [CertificationsController, 'index'])
    router.post('/certifications', [CertificationsController, 'store'])
    router.get('/certifications/:slug', [CertificationsController, 'show'])
    router.put('/certifications/:slug', [CertificationsController, 'update'])
    router.delete('/certifications/:slug', [CertificationsController, 'destroy'])

    router.post('/ai/extract', [AiController, 'extract'])
    router.post('/ai/import', [AiController, 'importProfile'])
  })
  .use(middleware.auth())
