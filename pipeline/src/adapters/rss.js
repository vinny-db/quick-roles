// Generic RSS adapter for Nigerian and African job feeds. Each feed config says how to read it.
import { getText } from '../lib/http.js';
import { items, field, parseDate, stripTags } from '../lib/xml.js';

// Jobgurus carries custom fields. Others are plain WordPress-style feeds.
export function makeRssAdapter(cfg) {
  return async function rssAdapter() {
    const out = [];
    for (const url of cfg.urls) {
      let xml;
      try {
        xml = await getText(url);
      } catch (e) {
        console.warn(`[rss:${cfg.id}] ${url} failed: ${e.message}`);
        continue;
      }
      for (const b of items(xml)) {
        const link = field(b, 'link') || field(b, 'guid');
        const title = field(b, 'title');
        if (!link || !title) continue;
        const desc = field(b, 'content:encoded') || field(b, 'description') || field(b, 'summary') || field(b, 'content');
        const company = field(b, 'company') || field(b, 'job_listing:company') || cfg.companyFromTitle?.(title) || guessCompany(title, desc) || '';
        const location = field(b, 'location') || field(b, 'job_listing:location') || cfg.defaultLocation || guessLocation(title, desc) || '';
        const deadline = toDate(field(b, 'deadlineDate') || field(b, 'deadline') || field(b, 'expires'));
        out.push({
          external_id: field(b, 'guid') || link,
          title: cleanTitle(title),
          company,
          location_text: location,
          country: cfg.country,
          salary_text: field(b, 'salaryRange') || field(b, 'salary') || '',
          deadline,
          posted_at: parseDate(field(b, 'pubDate') || field(b, 'published') || field(b, 'updated') || field(b, 'dc:date')),
          apply_url: link,
          source_url: link,
          description_html: desc,
          tags: [field(b, 'jobType'), field(b, 'workLevel'), field(b, 'specialization'), field(b, 'sector'), field(b, 'category')].filter(Boolean),
        });
      }
    }
    return out;
  };
}

function cleanTitle(t) {
  return t.replace(/\s+/g, ' ').replace(/\s*[-|–]\s*(apply now|job vacancy|vacancy).*$/i, '').trim();
}

function toDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

// "Finance Analyst at Paystack" or "Paystack recruitment for ..." patterns
function guessCompany(title, desc) {
  const m = title.match(/\bat\s+([A-Z][\w&.'\- ]{2,40})$/);
  if (m) return m[1].trim();
  const m2 = stripTags(desc || '').match(/\b(?:company|organisation|organization|employer)\s*:\s*([^\n]{2,60})/i);
  return m2 ? m2[1].trim() : '';
}

function guessLocation(title, desc) {
  const text = `${title}\n${stripTags(desc || '').slice(0, 600)}`;
  const m = text.match(/\b(?:location|job location)\s*:\s*([^\n]{2,60})/i);
  if (m) return m[1].trim();
  const m2 = title.match(/\bin\s+(Lagos|Abuja|Port Harcourt|Ibadan|Kano|Kaduna|Enugu|Accra|Nairobi)\b/i);
  return m2 ? m2[1] : '';
}
