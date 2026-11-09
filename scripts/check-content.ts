import { readdir, readFile } from 'node:fs/promises';
import { parseFrontmatter } from 'astro/markdown';
import { result } from '../src/content/schema';
import { renderResult } from '../src/content/render';

const directory = new URL('../src/content/results/', import.meta.url);
const files = await readdir(directory);
let total = 0;

for (const file of files.sort()) {
  if (!file.endsWith('.md')) {
    continue;
  }

  try {
    const parsed = parseFrontmatter(await readFile(new URL(file, directory), 'utf8'));
    const data = result.parse(parsed.frontmatter);

    if (!file.startsWith(`${data.family}-`)) {
      throw new Error('Filename must start with its family number.');
    }

    const rendered = renderResult(parsed.content, data.link);
    console.log(`${data.family}: ${rendered.sections.length} sections, ${rendered.sources.length} sources`);
    total += 1;
  } catch (error) {
    throw new Error(`${file}: content check failed`, { cause: error });
  }
}

console.log(`Checked ${total} result documents.`);
