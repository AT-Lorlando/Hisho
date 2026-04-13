import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    experiences: defineCollection({
      type: 'page',
      source: 'experiences/*.md',
      schema: z.object({
        title: z.string(),
        client: z.string(),
        role: z.string(),
        type: z.enum(['mission', 'emploi', 'freelance']),
        startDate: z.string(),
        endDate: z.string().optional(),
        location: z.string().optional(),
        stack: z.array(z.string()).default([]),
        tags: z.array(z.string()).default([]),
        highlights: z.array(z.string()).default([]),
        aiSummary: z.string().optional(),
      }),
    }),
    skills: defineCollection({
      type: 'page',
      source: 'skills/*.md',
      schema: z.object({
        title: z.string(),
        category: z.string(),
        level: z.enum(['débutant', 'intermédiaire', 'avancé', 'expert']),
        tags: z.array(z.string()).default([]),
        yearsOfExperience: z.number().optional(),
        lastUsed: z.string().optional(),
        contexts: z.string().optional(),
        aiSummary: z.string().optional(),
      }),
    }),
    projects: defineCollection({
      type: 'page',
      source: 'projects/*.md',
      schema: z.object({
        title: z.string(),
        type: z.enum(['personnel', 'professionnel', 'open-source']),
        status: z.enum(['en-cours', 'terminé', 'abandonné']),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        stack: z.array(z.string()).default([]),
        tags: z.array(z.string()).default([]),
        url: z.string().optional(),
        demo: z.string().optional(),
        aiSummary: z.string().optional(),
      }),
    }),
    certifications: defineCollection({
      type: 'page',
      source: 'certifications/*.md',
      schema: z.object({
        title: z.string(),
        organism: z.string(),
        date: z.string(),
        expiry: z.string().optional(),
        credentialId: z.string().optional(),
        url: z.string().optional(),
        tags: z.array(z.string()).default([]),
        aiSummary: z.string().optional(),
      }),
    }),
  },
})
