// Serves employer favicons through our own domain, so a visitor's browser never calls Google directly.
// Cached at the edge for a week; the pipeline refreshes real logos separately.
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

// 1x1 transparent PNG, so a failed lookup shows an empty tile rather than a broken image.
const BLANK = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='), (c) => c.charCodeAt(0));
const blank = () => new Response(BLANK, { status: 200, headers: { 'content-type': 'image/png', 'cache-control': 'public, s-maxage=3600' } });

export async function GET(req: NextRequest) {
  const d = (req.nextUrl.searchParams.get('d') || '').toLowerCase().trim();
  if (!/^[a-z0-9.-]{3,80}$/.test(d)) return blank();
  try {
    const up = await fetch(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=128`, { headers: { 'user-agent': 'QuickRoles/1.0' } });
    if (!up.ok) return blank();
    const type = up.headers.get('content-type') || 'image/png';
    return new Response(up.body, { status: 200, headers: { 'content-type': type, 'cache-control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000' } });
  } catch {
    return blank();
  }
}
