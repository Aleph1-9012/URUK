import { getCollection, type CollectionEntry } from 'astro:content';

export type ResultEntry = CollectionEntry<'results'>;

export const paperBase = 'https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/';

export async function visibleResults(): Promise<ResultEntry[]> {
  const includeDrafts = import.meta.env.DEV || process.env.URUK_DRAFTS === '1';
  const entries = await getCollection('results', ({ data }) => includeDrafts || !data.draft);

  return entries.sort((a, b) => a.data.family.localeCompare(b.data.family));
}

export function statusKind(status: ResultEntry['data']['status']) {
  return status === 'under review' ? 'under-review' : status;
}

export function checkedDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}
