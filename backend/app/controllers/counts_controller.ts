import type { HttpContext } from '@adonisjs/core/http'
import Experience from '#models/experience'
import Mission from '#models/mission'
import Skill from '#models/skill'
import Domain from '#models/domain'
import Certification from '#models/certification'

export default class CountsController {
  async index({ response }: HttpContext) {
    const [experiences, missions, skills, domains, certifications] = await Promise.all([
      Experience.query().count('id as total'),
      Mission.query().count('id as total'),
      Skill.query().count('id as total'),
      Domain.query().count('id as total'),
      Certification.query().count('id as total'),
    ])
    return response.ok({
      experiences: Number(experiences[0].$extras.total),
      missions: Number(missions[0].$extras.total),
      skills: Number(skills[0].$extras.total),
      domains: Number(domains[0].$extras.total),
      certifications: Number(certifications[0].$extras.total),
    })
  }
}
