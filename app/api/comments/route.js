// Shared store for the CommentLayer review overlay, backed by Vercel KV /
// Upstash Redis via its REST API (no SDK dependency). All comments live under
// one key as a JSON array. Degrades gracefully to "no store" (the client then
// falls back to localStorage) when the env vars aren't set yet.
export const dynamic = "force-dynamic";

const REST_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const KEY = "comment-layer-v1";

async function command(args) {
  const res = await fetch(REST_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${REST_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`upstash ${res.status}`);
  return res.json();
}

export async function GET() {
  if (!REST_URL || !REST_TOKEN) return Response.json({ ok: false, comments: [] });
  try {
    const { result } = await command(["GET", KEY]);
    const comments = result ? JSON.parse(result) : [];
    return Response.json({ ok: true, comments: Array.isArray(comments) ? comments : [] });
  } catch {
    return Response.json({ ok: false, comments: [] });
  }
}

export async function PUT(req) {
  if (!REST_URL || !REST_TOKEN) return Response.json({ ok: false });
  try {
    const comments = await req.json();
    await command(["SET", KEY, JSON.stringify(Array.isArray(comments) ? comments : [])]);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false });
  }
}
