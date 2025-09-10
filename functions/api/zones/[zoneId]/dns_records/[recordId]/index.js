
// functions/api/zones/[zoneId]/dns_records/[recordId].js
import { cfFetch } from '../../../_utils';

export async function onRequestPut(context) {
  const { request, env, params } = context;
  const body = await request.json();

  const resp = await cfFetch(
    env,
    `/zones/${params.zoneId}/dns_records/${params.recordId}`,
    { method: 'PUT', body: JSON.stringify(body) }
  );
  const data = await resp.json();
  return new Response(JSON.stringify(data, null, 2), {
    status: resp.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestDelete(context) {
  const { env, params } = context;
  const resp = await cfFetch(
    env,
    `/zones/${params.zoneId}/dns_records/${params.recordId}`,
    { method: 'DELETE' }
  );
  const data = await resp.json();
  return new Response(JSON.stringify(data, null, 2), {
    status: resp.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
