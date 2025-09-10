
// functions/api/_utils.js
const CF_BASE = 'https://api.cloudflare.com/client/v4';

// 统一转发 Cloudflare API，附带 Auth 头
export async function cfFetch(env, path, init = {}) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN || ''}`,
    ...(init.headers || {}),
  };
  const resp = await fetch(`${CF_BASE}${path}`, { ...init, headers });
  return resp;
}

// 聚合分页（GET 全量），可根据需要加上 query 过滤
export async function cfGetAll(env, path, searchParams = {}) {
  const per_page = Number(searchParams.per_page) || 100;
  let page = Number(searchParams.page) || 1;
  const MAX_PAGES = 50;
  const out = [];

  while (page <= MAX_PAGES) {
    const url = new URL(`${CF_BASE}${path}`);
    Object.entries({ ...searchParams, page, per_page }).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });

    const resp = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN || ''}`,
      },
    });

    const data = await resp.json();
    if (!data?.success) {
      return new Response(JSON.stringify({ success: false, ...data }, null, 2), {
        status: resp.status || 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    out.push(...(data.result || []));
    const total_pages = data?.result_info?.total_pages || 1;
    if (page >= total_pages) break;
    page += 1;
  }

  return new Response(JSON.stringify({ success: true, result: out }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// 可选：最简 CORS（同源部署时不需要）
export function withCORS(resp) {
  const r = new Response(resp.body, resp);
  r.headers.set('Access-Control-Allow-Origin', '*');
  r.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  r.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  return r;
}
