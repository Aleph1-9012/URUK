import type { APIRoute, GetStaticPaths } from 'astro';
import { getConeData } from '../../../components/cone-wall/asset-build';

export const getStaticPaths: GetStaticPaths = async () => {
  const { assets } = await getConeData();

  return Array.from(assets, ([asset, { version }]) => ({ params: { version, asset } }));
};

export const GET: APIRoute = async ({ params }) => {
  const { assets } = await getConeData();
  const asset = assets.get(params.asset ?? '');

  if (!asset || params.version !== asset.version) return new Response(null, { status: 404 });

  return new Response(asset.body, { headers: { 'Content-Type': 'text/javascript; charset=utf-8' } });
};
