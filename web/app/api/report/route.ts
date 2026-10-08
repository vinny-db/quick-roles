import { NextResponse } from 'next/server';
import { insert } from '@/lib/db';

export async function POST(req: Request) {
  const f = await req.formData();
  const job = String(f.get('job') || '').trim().slice(0, 300);
  const reason = String(f.get('reason') || 'other').slice(0, 20);
  const details = String(f.get('details') || '').trim().slice(0, 2000);
  const email = String(f.get('email') || '').trim().slice(0, 120) || null;
  try { await insert('reports', { reason: `${reason}: ${job}${details ? ' | ' + details : ''}`, email }); } catch {}
  return NextResponse.redirect(new URL('/report?sent=1', req.url), 303);
}
