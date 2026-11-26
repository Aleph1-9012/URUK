import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { build } from 'rolldown';
import { expandPack } from './pack-lz4';

const feature = join(process.cwd(), 'src/components/cone-wall');
const packDirectory = join(feature, 'data/packs');

async function bundle(name: string) {
  const result = await build({
    input: join(feature, `${name}.ts`),
    platform: 'browser',
    write: false,
    output: { format: 'iife', minify: true },
  });

  return [name, result.output[0].code] as const;
}

async function wrapPack(file: string) {
  const raw = expandPack(await readFile(join(packDirectory, file)));
  const bytes = Buffer.from(raw.buffer, raw.byteOffset, raw.byteLength);

  return [file.slice(0, -4), `window.urukConeParts.push("${bytes.toString('base64')}");`] as const;
}

function versionAsset([name, body]: readonly [string, string]) {
  const version = createHash('sha256').update(body).digest('hex').slice(0, 20);
  return [name, { version, body }] as const;
}

async function buildConeData() {
  const files = (await readdir(packDirectory)).sort();
  const [entry, rebuild, ...packs] = await Promise.all([
    bundle('entry'),
    bundle('rebuild'),
    ...files.filter((file) => file.endsWith('.lz4')).map(wrapPack),
  ]);
  const entryAsset = versionAsset(entry);
  const assets = new Map([entryAsset, versionAsset(rebuild), ...packs.map(versionAsset)]);
  const manifest = Object.fromEntries(Array.from(assets, ([name, { version }]) => [name, version]));
  const entryUrl = `/cone-data/${entryAsset[1].version}/entry.js`;

  return { entryUrl, manifest, assets };
}

let coneData: ReturnType<typeof buildConeData> | undefined;

export function getConeData() {
  return coneData ??= buildConeData();
}
