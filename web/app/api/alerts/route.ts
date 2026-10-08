import { NextResponse } from 'next/server';
import { insert } from '@/lib/db';

export async function POST(req: Request) {
  const f = await req.formData();
  const email = String(f.get('email') || '').trim().toLowerCase().slice(0, 120);
  const phone = String(f.get('phone') || '').replace(/[^\d+]/g, '').slice(0, 20);
  const keyword = String(f.get('keyword') || '').trim().slice(0, 80);
  const location = String(f.get('location') || '').trim().slice(0, 60);
  const consent = f.get('consent') === 'yes';
  const back = new URL('/alerts', req.url);
  back.searchParams.set('keyword', keyword);
  back.searchParams.set('location', location);
  if (!consent) { back.searchParams.set('err', 'the consent tick'); return NextResponse.redirect(back, 303); }
  if (!email && !phone) { back.searchParams.set('err', 'an email or phone number'); return NextResponse.redirect(back, 303); }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { back.searchParams.set('err', 'a valid email'); return NextResponse.redirect(back, 303); }
  try {
    await insert('alerts', { email: email || null, phone: phone || null, keyword: keyword || null, location: location || null, filters: {}, consent_at: new Date().toISOString() });
  } catch (e) {
    back.searchParams.set('err', 'a hiccup on our side');
    return NextResponse.redirect(back, 303);
  }
  back.searchParams.delete('err');
  back.searchParams.set('ok', '1');
  return NextResponse.redirect(back, 303);
}
