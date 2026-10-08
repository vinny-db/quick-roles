import { NextResponse } from 'next/server';
import { insert } from '@/lib/db';

export async function POST(req: Request) {
  const f = await req.formData();
  const g = (k: string, max: number) => String(f.get(k) || '').trim().slice(0, max);
  const row = { company: g('company', 80), contact_email: g('contact_email', 120).toLowerCase(), title: g('title', 120), location: g('location', 80), salary_text: g('salary_text', 60) || null, description: g('description', 6000), status: 'pending' as const, apply_url: null as string | null, apply_email: null as string | null };
  const apply = g('apply_url', 300);
  if (/^https?:\/\//i.test(apply)) row.apply_url = apply; else if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(apply)) row.apply_email = apply; else if (apply) row.apply_url = `https://${apply}`;
  const back = new URL('/post', req.url);
  if (!row.company || !row.contact_email || !row.title || !row.description || !(row.apply_url || row.apply_email) || f.get('agree') !== 'yes') { back.searchParams.set('err', 'Please fill every field and tick the box.'); return NextResponse.redirect(back, 303); }
  try { await insert('employer_posts', row); } catch { back.searchParams.set('err', 'A hiccup on our side. Try again in a minute.'); return NextResponse.redirect(back, 303); }
  back.searchParams.set('ok', '1');
  return NextResponse.redirect(back, 303);
}
