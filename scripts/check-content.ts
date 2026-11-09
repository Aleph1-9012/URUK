import { readdir, readFile } from 'node:fs/promises';
import { parseFrontmatter } from 'astro/markdown';
import { result } from '../src/content/schema';
import { renderResult } from '../src/content/render';
import { validateResultIdentities, type ResultIdentity } from '../src/content/identity';

const directory = new URL('../src/content/results/', import.meta.url);
const files = await readdir(directory);
const identities: ResultIdentity[] = [];

for (const file of files.sort()) {
  if (!file.endsWith('.md')) {
    continue;
  }

  try {
    const parsed = parseFrontmatter(await readFile(new URL(file, directory), 'utf8'));
    const data = result.parse(parsed.frontmatter);

    identities.push({ id: file, data });
    const rendered = renderResult(parsed.content, data.link);
    console.log(`${data.family}: ${rendered.sections.length} sections, ${rendered.sources.length} sources`);
  } catch (error) {
    throw new Error(`${file}: content check failed`, { cause: error });
  }
}

validateResultIdentities(identities);
console.log(`Checked ${identities.length} result documents.`);
