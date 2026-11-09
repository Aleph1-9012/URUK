import { z } from 'astro/zod';
import { visualKeys } from './visuals';
import { reviewStatuses } from './review-status';

export const result = z.strictObject({
  family: z.string().regex(/^\d{3}$/),
  topic: z.string().min(1),
  title: z.string().min(1),
  paperTitle: z.string().min(1),
  claim: z.string().min(1),
  status: z.enum(reviewStatuses.map(({ label }) => label)),
  checked: z.coerce.date().max(new Date()),
  link: z.url({ protocol: /^https$/ }).optional(),
  papers: z.array(z.string().regex(/^preprints\/.+\.pdf$/)).min(1),
  visual: z.enum(visualKeys).optional(),
  draft: z.boolean().default(true),
}).refine((page) => page.link !== undefined || reviewStatuses.some(({ label, requiresLink }) => label === page.status && !requiresLink), {
  path: ['link'],
  error: 'Approved and disputed results need an expert or journal link.',
});
