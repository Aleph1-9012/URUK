import { expect, test } from 'bun:test';
import { validateResultIdentities } from '../src/content/identity';
import { readStatusKind, statusKind, statusLabel } from '../src/content/review-status';
import { result } from '../src/content/schema';
import { visualCatalog } from '../src/content/visuals';

test('result identities agree with filenames and cannot generate the same route twice', () => {
  expect(() => validateResultIdentities([
    { id: '003-quasi-riemann', data: { family: '003' } },
    { id: '147-birkhoff.md', data: { family: '147' } },
  ])).not.toThrow();
  expect(() => validateResultIdentities([
    { id: '003-quasi-riemann', data: { family: '147' } },
  ])).toThrow('filename must start');
  expect(() => validateResultIdentities([
    { id: '003-quasi-riemann', data: { family: '003' } },
    { id: '003-another-paper', data: { family: '003' } },
  ])).toThrow('both 003-quasi-riemann and 003-another-paper');
});

test('stored review labels and public filter keys retain their existing spelling', () => {
  expect(statusKind('under review')).toBe('under-review');
  expect(statusKind('approved')).toBe('approved');
  expect(statusLabel('under-review')).toBe('under review');
  expect(statusLabel('')).toBe('');
  expect(readStatusKind('under-review')).toBe('under-review');
  expect(readStatusKind('under review')).toBe('');
  expect(readStatusKind('made-up')).toBe('');
});

test('front matter accepts stored review labels and requires evidence for a verdict', () => {
  const data = {
    family: '003',
    topic: 'Zeros',
    title: 'How close?',
    paperTitle: 'A zero-free region',
    claim: 'The zeros stay away.',
    status: 'under review',
    checked: '2026-10-01',
    papers: ['preprints/paper.pdf'],
  };

  expect(result.safeParse(data).success).toBe(true);
  expect(result.safeParse({ ...data, status: 'unreviewed' }).success).toBe(true);
  expect(result.safeParse({ ...data, status: 'under-review' }).success).toBe(false);
  expect(result.safeParse({ ...data, status: 'approved' }).success).toBe(false);
  expect(result.safeParse({ ...data, status: 'disputed' }).success).toBe(false);
  expect(result.safeParse({ ...data, status: 'approved', link: 'https://example.com/review' }).success).toBe(true);
});

test('every registered visual has one key and an Astro entry point on disk', async () => {
  expect(new Set(visualCatalog.map(({ key }) => key)).size).toBe(visualCatalog.length);

  for (const { component } of visualCatalog) {
    const entry = new URL(`../src/components/visuals/${component}`, import.meta.url);

    expect(await Bun.file(entry).exists()).toBe(true);
  }
});
