
// functions/api/zones.js
import { cfGetAll } from './_utils';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // 支持 query 透传，例如 name / account.id / status 等
  const searchParams = Object.fromEntries(url.searchParams.entries());
  return cfGetAll(env, '/zones', searchParams);
}
