import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFile, cp, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const feature = 'src/components/cone-wall';
const pack = 'print-3';

async function inspect(dist: string) {
  const html = await readFile(join(dist, 'about/index.html'), 'utf8');
  const boot = /(<script\b[^>]*\bid="cone-config"[^>]*>)([\s\S]*?)<\/script>\s*<link rel="stylesheet"/i.exec(html);
  assert.ok(boot?.[1] && boot[2], 'The built About page contains the inline cone boot');
  assert.doesNotMatch(boot[2], /<\/script/i, 'The inline boot cannot terminate its script tag');
  new Function(boot[2]);

  const attribute = /\bdata-cone-assets="([^"]+)"/.exec(boot[1])?.[1];
  assert.ok(attribute, 'The boot has a manifest');
  const { head, ...versions }: Record<string, string> = JSON.parse(attribute.replace(/&quot;|&#34;|&#x22;/gi, '"'));
  assert.ok(head && /^\/_astro\/head\.[\w-]+\.js$/.test(head), 'The manifest refers to the hashed opener');
  await readFile(join(dist, head));

  const files = await readdir(join(dist, 'cone-data'), { recursive: true });
  const emitted = files.filter(file => file.endsWith('.js')).sort();
  const expected = Object.entries(versions).map(([name, version]) => `${version}/${name}.js`).sort();
  assert.ok(versions.entry && versions.rebuild && versions[pack]);
  assert.deepEqual(emitted, expected);
  assert.ok(html.includes(`src="/cone-data/${versions.entry}/entry.js"`));

  for (const file of emitted) {
    const [version] = file.split('/');
    const bytes = await readFile(join(dist, 'cone-data', file));
    assert.equal(version, createHash('sha256').update(bytes).digest('hex').slice(0, 20), file);
  }

  return { versions, bootBytes: Buffer.byteLength(boot[2]), manifestBytes: Buffer.byteLength(attribute) };
}

const baseline = await inspect(join(root, 'dist'));
console.log(`Built cone boot compiles (${baseline.bootBytes} bytes; manifest attribute ${baseline.manifestBytes} bytes)`);

const scratch = await mkdtemp(join(tmpdir(), 'uruk-cone-verify-'));
try {
  // Use the real production build for each edit without touching the checkout or its dist.
  for (const name of ['astro.config.ts', 'package.json', 'public', 'src', 'tsconfig.json']) {
    await cp(join(root, name), join(scratch, name), { recursive: true });
  }
  await symlink(join(root, 'node_modules'), join(scratch, 'node_modules'), 'junction');

  async function expectOnlyChanged(name: string) {
    const build = spawnSync(process.execPath, ['run', 'build'], { cwd: scratch, encoding: 'utf8' });
    if (build.error) throw build.error;
    assert.equal(build.status, 0, build.stdout + build.stderr);
    const { versions } = await inspect(join(scratch, 'dist'));
    assert.deepEqual(Object.keys(versions).sort(), Object.keys(baseline.versions).sort());
    assert.deepEqual(Object.keys(versions).filter(asset => versions[asset] !== baseline.versions[asset]), [name]);
    console.log(`Editing ${name} changes only its own emitted cone-data URL`);
  }

  const entry = join(scratch, feature, 'entry.ts');
  await appendFile(entry, '\ndocument.documentElement.setAttribute("data-cone-check", "entry changed");\n');
  await expectOnlyChanged('entry');
  await cp(join(root, feature, 'entry.ts'), entry);

  const path = join(scratch, feature, 'data/packs', `${pack}.lz4`);
  const bytes = await readFile(path);
  // The altered pack is only built and hashed, never decoded by a browser.
  bytes[bytes.length - 1] = bytes[bytes.length - 1]! ^ 1;
  await writeFile(path, bytes);
  await expectOnlyChanged(pack);
} finally {
  await rm(scratch, { recursive: true, force: true });
}
