import { z } from 'astro/zod';

export const result = z.strictObject({
  family: z.string().regex(/^\d{3}$/),
  topic: z.string().min(1),
  title: z.string().min(1),
  claim: z.string().min(1),
  status: z.enum(['approved', 'disputed', 'under review', 'unreviewed']),
  checked: z.coerce.date().max(new Date()),
  link: z.url({ protocol: /^https$/ }).optional(),
  papers: z.array(z.string().regex(/^preprints\/.+\.pdf$/)).min(1),
  visual: z.string().optional(),
  draft: z.boolean().default(true),
}).refine((page) => page.link !== undefined || page.status === 'under review' || page.status === 'unreviewed', {
  path: ['link'],
  error: 'Approved and disputed results need an expert or journal link.',
});
