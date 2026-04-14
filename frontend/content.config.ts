import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    domains: defineCollection({
      type: 'page',
      source: 'domains/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        order: z.number().optional(),
        aiSummary: z.string().optional(),
      }),
    }),
    experiences: defineCollection({
      type: 'page',
      source: 'experiences/*.md',
      schema: z.object({
        title: z.string(),
        client: z.string(),
        role: z.string(),
        startDate: z.string(),
        endDate: z.string().optional(),
        location: z.string().optional(),
        stack: z.array(z.string()).default([]),
        highlights: z.array(z.string()).default([]),
        aiSummary: z.string().optional(),
      }),
    }),
    skills: defineCollection({
      type: 'page',
      source: 'skills/*.md',
      schema: z.object({
        title: z.string(),
        domain: z.string(),
        yearsOfExperience: z.number().optional(),
        aiSummary: z.string().optional(),
      }),
    }),
    projects: defineCollection({
      type: 'page',
      source: 'projects/*.md',
      schema: z.object({
        title: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        stack: z.array(z.string()).default([]),
        url: z.string().optional(),
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
