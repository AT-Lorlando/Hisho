import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Domain from '#models/domain'

const DOMAINS = [
  { slug: 'os', title: 'OS', order: 1 },
  { slug: 'langages-de-programmation', title: 'Langages de programmation', order: 2 },
  { slug: 'cybersecurite', title: 'Cybersécurité', order: 3 },
  { slug: 'developpement-web', title: 'Développement Web', order: 4 },
  { slug: 'frameworks', title: 'Frameworks', order: 5 },
  { slug: 'bases-de-donnees', title: 'Bases de données', order: 6 },
  { slug: 'devops', title: 'DevOps', order: 7 },
  { slug: 'methodes', title: 'Méthodes', order: 8 },
  { slug: 'reseaux', title: 'Réseaux', order: 9 },
  { slug: 'ia-llm', title: 'IA & LLM', order: 10 },
  { slug: 'ide', title: 'IDE', order: 11 },
  { slug: 'graphisme', title: 'Graphisme', order: 12 },
  { slug: 'langues', title: 'Langues', order: 13 },
]

export default class extends BaseSeeder {
  async run() {
    for (const domain of DOMAINS) {
      await Domain.updateOrCreate({ slug: domain.slug }, domain)
    }
  }
}
