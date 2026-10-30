import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { result } from './content/schema';

export const collections = {
  results: defineCollection({
    loader: glob({ pattern: '*.md', base: './src/content/results' }),
    schema: result,
  }),
};
