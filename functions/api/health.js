
// functions/api/health.js
export async function onRequestGet(context) {
  const { env } = context;
  return new Response(JSON.stringify({
    ok: true,
    hasToken: Boolean(env.CLOUDFLARE_API_TOKEN),
    runtime: 'pages-functions'
  }), { headers: { 'Content-Type': 'application/json' } });
}
