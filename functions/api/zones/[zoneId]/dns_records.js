
// functions/api/zones/[zoneId]/dns_records.js
import { cfGetAll, cfFetch } from '../../_utils';

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());

  return cfGetAll(env, `/zones/${params.zoneId}/dns_records`, searchParams);
}

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const body = await request.json();

  const resp = await cfFetch(env, `/zones/${params.zoneId}/dns_records`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const data = await resp.json();
  return new Response(JSON.stringify(data, null, 2), {
    status: resp.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
