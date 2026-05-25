import { z } from 'zod'

export const TemplateIdSchema = z.enum(['DailyPlan', 'LinearTaskBoard', 'AgentStatus', 'CompozyTasks', 'Wiki'])

export const CreatePageSchema = z.object({
  template: TemplateIdSchema,
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  ttlHours: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
  data: z.unknown()
})

export const ListPagesQuerySchema = z.object({
  template: TemplateIdSchema.optional(),
  tag: z.string().optional(),
  limit: z.string().transform(val => {
    const parsed = parseInt(val, 10)
    return isNaN(parsed) ? undefined : parsed
  }).optional()
})
