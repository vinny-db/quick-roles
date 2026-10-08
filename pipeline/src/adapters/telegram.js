// Public Telegram channel previews at t.me/s/<channel>. Plain HTML, no login, no API cost.
// We keep only messages that read like a job post, and store a short summary plus the post link.
import { getText } from '../lib/http.js';
import { stripTags, decodeEntities } from '../lib/xml.js';

const JOB_HINT = /\b(hiring|vacanc|job|role|position|recruit|apply|opening|internship|nysc|trainee|wanted|needed)\b/i;
const NOISE = /\b(giveaway|airdrop|bet|betting|loan|forex|crypto|invest now|sponsored)\b/i;

export function telegram({ channel, company }) {
  return async () => {
    const html = await getText(`https://t.me/s/${channel}`, { minGapMs: 3000 });
    const out = [];
    const re = /<div class="tgme_widget_message_wrap[\s\S]*?data-post="([^"]+)"[\s\S]*?<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>[\s\S]*?(?:<time[^>]*datetime="([^"]+)")?/g;
    let m;
    while ((m = re.exec(html))) {
      const post = m[1]; // channel/1234
      const textHtml = m[2];
      const when = m[3] || null;
      const text = stripTags(textHtml);
      if (text.length < 40 || !JOB_HINT.test(text) || NOISE.test(text)) continue;
      const links = [...textHtml.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((x) => decodeEntities(x[1])).filter((u) => !/t\.me\//.test(u));
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      const title = pickTitle(lines);
      const comp = pickCompany(lines, text);
      const location = pickLocation(text);
      out.push({
        external_id: post,
        title,
        company: comp || company || '',
        location_text: location,
        work_mode: /\bremote\b/i.test(text) ? 'remote' : undefined,
        remote_scope_text: /\bremote\b/i.test(text) ? (location || 'Nigeria') : undefined,
        deadline: pickDeadline(text),
        posted_at: when ? new Date(when).toISOString() : null,
        apply_url: links[0] || `https://t.me/${post}`,
        source_url: `https://t.me/${post}`,
        description_text: text,
        summary: text.replace(/\s+/g, ' ').slice(0, 200),
        tags: ['telegram'],
      });
    }
    return out;
  };
}

function pickTitle(lines) {
  // First line that looks like a role, else first line.
  const roleLine = lines.find((l) => /\b(officer|manager|assistant|analyst|engineer|developer|designer|intern|trainee|representative|specialist|executive|associate|driver|teacher|nurse|accountant|lead|head|coordinator|agent)\b/i.test(l) && l.length < 120);
  let t = roleLine || lines[0] || 'Job opening';
  t = t.replace(/^(job (title|role|opening)|position|role|vacancy)\s*[:\-]\s*/i, '').replace(/^[\W_]+/, '').replace(/[!.]+$/, '');
  return t.slice(0, 120);
}

function pickCompany(lines, text) {
  const m = text.match(/\b(?:company|organisation|organization|employer)\s*[:\-]\s*([^\n]{2,60})/i);
  if (m) return m[1].trim();
  const m2 = lines[0] && lines[0].match(/^(.{2,50}?)\s+(?:is hiring|are hiring|is recruiting|recruitment)/i);
  return m2 ? m2[1].trim() : '';
}

function pickLocation(text) {
  const m = text.match(/\b(?:location|job location)\s*[:\-]\s*([^\n]{2,60})/i);
  if (m) return m[1].trim();
  const m2 = text.match(/\b(Lagos|Abuja|Port Harcourt|Ibadan|Kano|Kaduna|Enugu|Benin|Calabar|Uyo|Jos|Owerri|Abeokuta|Ilorin|Warri|Asaba|Akure|Remote)\b/i);
  return m2 ? m2[1] : '';
}

function pickDeadline(text) {
  const m = text.match(/\b(?:deadline|closes?|closing date|apply before)\s*[:\-]?\s*([0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+,?\s+[0-9]{4}|[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i);
  if (!m) return null;
  const d = new Date(m[1].replace(/(\d+)(st|nd|rd|th)/, '$1'));
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}
