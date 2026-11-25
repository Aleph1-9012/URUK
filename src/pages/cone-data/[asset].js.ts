import type { APIRoute, GetStaticPaths } from 'astro';
import { build } from 'rolldown';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const feature = join(process.cwd(), 'src/components/cone-wall');
const packs = join(feature, 'data/packs');

export const getStaticPaths: GetStaticPaths = async () => {
  const files = await readdir(packs);
  const assets = ['entry', 'rebuild', ...files.filter(file => file.endsWith('.lz4')).map(file => file.slice(0, -4))];
  return assets.map(asset => ({ params: { asset } }));
};
export const GET: APIRoute = async ({ params }) => {
  const asset = params.asset ?? '';
  let body: string;
  if (asset === 'rebuild' || asset === 'entry') {
    const bundle = await build({
      input: join(feature, asset + '.ts'),
      platform: 'browser',
      write: false,
      output: { format: 'iife', minify: true },
    });
    body = bundle.output[0].code;
  } else {
    if (!/^(?:heads|(?:print|type)-\d+)$/.test(asset)) return new Response(null, { status: 404 });
    const pack = await readFile(join(packs, asset + '.lz4'));
    body = 'window.urukConeParts.push("' + pack.toString('base64') + '");';
  }
  return new Response(body, { headers: { 'Content-Type': 'text/javascript; charset=utf-8' } });
};
