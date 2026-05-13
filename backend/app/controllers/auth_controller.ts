import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Experience from '#models/experience'
import Mission from '#models/mission'
import Skill from '#models/skill'
import Domain from '#models/domain'
import Certification from '#models/certification'
import { loginValidator, registerValidator } from '#validators/auth'

export default class AuthController {
  /**
   * Register a new user
   */
  async register({ request, auth, response }: HttpContext) {
    const data = await request.validateUsing(registerValidator)

    const user = await User.create(data)

    await auth.use('web').login(user)

    return response.created({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    })
  }

  /**
   * Login a user
   */
  async login({ request, auth, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password)

    await auth.use('web').login(user)

    return response.ok({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    })
  }

  /**
   * Logout the authenticated user
   */
  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()

    return response.ok({
      message: 'Logout successful',
    })
  }

  /**
   * Get the authenticated user
   */
  async me({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    return response.ok({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    })
  }

  /**
   * Delete the authenticated user account and all associated data
   */
  async deleteAccount({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    // Delete all user data (single-user app — no user_id FK on content tables)
    await Mission.query().delete()
    await Experience.query().delete()
    await Skill.query().delete()
    await Domain.query().delete()
    await Certification.query().delete()
    // competency_ratings cascade on user delete

    await auth.use('web').logout()
    await User.query().where('id', user.id).delete()

    return response.noContent()
  }
}
