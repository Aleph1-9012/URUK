// Reports, for the films of the named families, which subtitles are not sentences of the article and which are too long for their time.
// Usage: bun scripts/check-subtitles.ts [family ...]   (no arguments: a one-line summary per film)
// This is a report for editing work. Films built before 12 November 2026 predate both rules, so it is not part of `verify`.
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'astro/zod';
import { visualCatalog } from '../src/content/visuals';

const RESULTS = join(process.cwd(), 'src/content/results');
const VISUALS = join(process.cwd(), 'src/components/visuals');
const READING_PACE = 17;

const storyData = z.object({
  CUES: z.array(z.object({ at: z.number().finite(), text: z.string() })),
  TIMELINE: z.object({ duration: z.number().finite() }),
});

/** A subtitle may be a whole sentence, or a clause closed with a stop, or start with a capital the article lacks. */
function inArticle(article: string, subtitle: string): boolean {
  const clause = subtitle.endsWith('.') ? subtitle.slice(0, -1) : subtitle;

  return article.includes(clause) || article.includes(clause.charAt(0).toLowerCase() + clause.slice(1));
}

const requested = process.argv.slice(2);
let films = 0;
let clean = 0;

for (const file of (await readdir(RESULTS)).sort()) {
  const family = file.slice(0, 3);

  if (requested.length > 0 && !requested.includes(family)) continue;

  const text = await readFile(join(RESULTS, file), 'utf8');
  const key = /^visual:\s*(\S+)/m.exec(text)?.[1];
  const component = visualCatalog.find((entry) => entry.key === key)?.component;

  if (!component) continue;

  const storyPath = join(VISUALS, component, '..', 'story.ts');

  if (!existsSync(storyPath)) continue;

  const story = storyData.parse(await import(storyPath));
  const article = text.split('---').slice(2).join('---');
  const problems: string[] = [];

  for (const [index, cue] of story.CUES.entries()) {
    const seconds = ((story.CUES[index + 1]?.at ?? story.TIMELINE.duration) - cue.at) / 1000;
    const length = cue.text.replace(/\$[^$]*\$/g, 'xxxxx').length;

    if (!inArticle(article, cue.text)) problems.push(`  cue ${index + 1} is not in the article: ${cue.text}`);
    if (length / READING_PACE > seconds) problems.push(`  cue ${index + 1} has ${length} characters for ${seconds.toFixed(1)} s: ${cue.text}`);
  }

  films += 1;

  if (problems.length === 0) clean += 1;

  console.log(`${family} ${key}: ${story.CUES.length} cues, ${problems.length} problem(s)`);

  if (requested.length > 0) console.log(problems.join('\n'));
}

console.log(`${clean} of ${films} film(s) meet both rules.`);
