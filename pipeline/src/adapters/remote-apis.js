// Remote job boards with keyless JSON APIs. Each returns raw jobs for normalize().
import { getJson } from '../lib/http.js';
import { items, field, parseDate, stripTags } from '../lib/xml.js';
import { getText } from '../lib/http.js';

const pick = (o, ...keys) => { for (const k of keys) if (o && o[k] != null && o[k] !== '') return o[k]; return undefined; };

// Remotive: max 4 calls/day. Terms: link back + name Remotive as source. Never resyndicate.
export async function remotive() {
  const data = await getJson('https://remotive.com/api/remote-jobs?limit=500');
  return (data.jobs || []).map((j) => ({
    external_id: String(j.id),
    title: j.title,
    company: j.company_name,
    company_logo: j.company_logo,
    location_text: j.candidate_required_location || 'Worldwide',
    work_mode: 'remote',
    remote_scope_text: j.candidate_required_location || 'worldwide',
    salary_text: j.salary || '',
    posted_at: parseDate(j.publication_date),
    apply_url: j.url,
    source_url: j.url,
    description_html: j.description,
    tags: [j.category, j.job_type].filter(Boolean),
  }));
}

// Himalayas: browse endpoint, paginated. Field names vary; read defensively.
export async function himalayas() {
  const out = [];
  let url = 'https://himalayas.app/jobs/api?limit=100';
  for (let page = 0; page < 8 && url; page++) {
    const data = await getJson(url, { minGapMs: 1500 });
    const list = data.jobs || data.data || [];
    for (const j of list) {
      const restrictions = pick(j, 'locationRestrictions', 'location_restrictions') || [];
      const scopeText = Array.isArray(restrictions) && restrictions.length ? restrictions.join(', ') : 'worldwide';
      out.push({
        external_id: String(pick(j, 'id', 'guid', 'slug') || pick(j, 'applicationLink', 'url')),
        title: pick(j, 'title', 'jobTitle'),
        company: pick(j, 'companyName', 'company_name') || (j.company && j.company.name),
        company_logo: pick(j, 'companyLogo', 'company_logo') || (j.company && j.company.logo),
        location_text: scopeText,
        work_mode: 'remote',
        remote_scope_text: scopeText,
        salary_text: j.minSalary && j.maxSalary ? `${j.currency || '$'}${j.minSalary} to ${j.maxSalary}` : '',
        posted_at: parseDate(pick(j, 'pubDate', 'publishedAt', 'createdAt')),
        apply_url: pick(j, 'applicationLink', 'applyUrl', 'url', 'link'),
        source_url: pick(j, 'url', 'link', 'applicationLink'),
        description_html: pick(j, 'description', 'descriptionHtml', 'excerpt'),
        tags: [...(j.categories || []), ...(j.employmentType ? [j.employmentType] : [])],
      });
    }
    const next = pick(data, 'nextCursor', 'next_cursor', 'cursor');
    url = next && list.length ? `https://himalayas.app/jobs/api?limit=100&cursor=${encodeURIComponent(next)}` : null;
  }
  return out;
}

// Jobicy: terms: keep Jobicy as source, apply goes to Jobicy URL.
export async function jobicy() {
  const data = await getJson('https://jobicy.com/api/v2/remote-jobs?count=200');
  return (data.jobs || []).map((j) => ({
    external_id: String(j.id),
    title: j.jobTitle,
    company: j.companyName,
    company_logo: j.companyLogo,
    location_text: j.jobGeo || 'Anywhere',
    work_mode: 'remote',
    remote_scope_text: j.jobGeo || 'anywhere',
    salary_text: j.annualSalaryMin ? `${j.salaryCurrency || 'USD'} ${j.annualSalaryMin} to ${j.annualSalaryMax || ''}` : '',
    posted_at: parseDate(j.pubDate),
    apply_url: j.url,
    source_url: j.url,
    description_html: j.jobDescription || j.jobExcerpt,
    tags: [...(Array.isArray(j.jobIndustry) ? j.jobIndustry : [j.jobIndustry]), ...(Array.isArray(j.jobType) ? j.jobType : [j.jobType]), j.jobLevel].filter(Boolean),
  }));
}

// RemoteOK: first element is a legal notice. Terms: dofollow link back, name "Remote OK".
export async function remoteok() {
  const data = await getJson('https://remoteok.com/api');
  return (Array.isArray(data) ? data : []).filter((j) => j && j.id && j.position).map((j) => ({
    external_id: String(j.id),
    title: j.position,
    company: j.company,
    company_logo: j.company_logo || j.logo,
    location_text: j.location || 'Worldwide',
    work_mode: 'remote',
    remote_scope_text: j.location || 'worldwide',
    salary_text: j.salary_min ? `$${j.salary_min} to $${j.salary_max}` : '',
    posted_at: parseDate(j.date),
    apply_url: j.url,
    source_url: j.url,
    description_html: j.description,
    tags: j.tags || [],
  }));
}

// We Work Remotely RSS. Titles arrive as "Company: Title". Region in <region>.
export async function weworkremotely() {
  const xml = await getText('https://weworkremotely.com/remote-jobs.rss');
  return items(xml).map((b) => {
    const rawTitle = field(b, 'title');
    const [company, ...rest] = rawTitle.split(':');
    const title = rest.length ? rest.join(':').trim() : rawTitle;
    const region = field(b, 'region') || 'Anywhere in the World';
    const link = field(b, 'link');
    return {
      external_id: field(b, 'guid') || link,
      title,
      company: rest.length ? company.trim() : '',
      location_text: region,
      work_mode: 'remote',
      remote_scope_text: region,
      posted_at: parseDate(field(b, 'pubDate')),
      apply_url: link,
      source_url: link,
      description_html: field(b, 'description'),
      tags: [field(b, 'category'), field(b, 'type')].filter(Boolean),
    };
  });
}
