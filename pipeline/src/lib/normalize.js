// Turns a raw adapter job into a row for the jobs table.
import { createHash } from 'node:crypto';
import { stripTags } from './xml.js';

export const slugify = (s = '') =>
  s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

const NG_CITIES = ['lagos', 'abuja', 'port harcourt', 'ibadan', 'kano', 'kaduna', 'enugu', 'benin', 'calabar', 'uyo', 'jos', 'owerri', 'abeokuta', 'ilorin', 'onitsha', 'warri', 'asaba', 'akure', 'maiduguri', 'yola', 'bauchi', 'sokoto', 'minna', 'lokoja', 'makurdi', 'ikeja', 'lekki', 'victoria island', 'yaba'];
const AFRICA_HINTS = ['nigeria', 'africa', 'ghana', 'kenya', 'south africa', 'egypt', 'rwanda', 'uganda', 'tanzania', 'senegal', "cote d'ivoire", 'ivory coast', 'cameroon', 'ethiopia'];
const WORLDWIDE_HINTS = ['worldwide', 'anywhere', 'global', 'international', 'remote - any', 'any location', 'fully remote', 'work from anywhere'];
const EMEA_HINTS = ['emea', 'europe, middle east', 'europe/africa', 'africa/europe', 'utc', 'gmt'];
const NON_AFRICA = ['united states', 'usa', 'u.s.', 'new york', 'san francisco', 'california', 'texas', 'chicago', 'boston', 'seattle', 'los angeles', 'miami', 'denver', 'atlanta', 'canada', 'toronto', 'vancouver', 'montreal', 'united kingdom', 'london', 'england', 'scotland', 'manchester', 'germany', 'berlin', 'munich', 'france', 'paris', 'netherlands', 'amsterdam', 'spain', 'madrid', 'barcelona', 'portugal', 'lisbon', 'italy', 'milan', 'poland', 'warsaw', 'ireland', 'dublin', 'india', 'bangalore', 'bengaluru', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'pakistan', 'karachi', 'lahore', 'bangladesh', 'sri lanka', 'nepal', 'philippines', 'manila', 'singapore', 'australia', 'sydney', 'melbourne', 'brazil', 'mexico', 'argentina', 'colombia', 'chile', 'peru', 'costa rica', 'dubai', 'abu dhabi', 'uae', 'saudi', 'riyadh', 'qatar', 'doha', 'israel', 'tel aviv', 'turkey', 'japan', 'tokyo', 'korea', 'seoul', 'china', 'shanghai', 'beijing', 'taiwan', 'hong kong', 'sweden', 'norway', 'denmark', 'finland', 'iceland', 'switzerland', 'austria', 'belgium', 'luxembourg', 'czech', 'hungary', 'romania', 'bulgaria', 'greece', 'serbia', 'croatia', 'slovakia', 'slovenia', 'lithuania', 'latvia', 'estonia', 'ukraine', 'kazakhstan', 'uzbekistan', 'armenia', 'azerbaijan', 'cyprus', 'malta', 'vietnam', 'hanoi', 'indonesia', 'jakarta', 'malaysia', 'kuala lumpur', 'thailand', 'bangkok', 'new zealand', 'auckland', 'dach', 'nordics', 'benelux', 'balkans', 'baltics', 'middle east'];
const NON_AFRICA_RE = /\b(uk|u\.k\.|usa|u\.s\.a?\.?|us|eu|cee|apac|latam|emea only|north america|south america|oceania|canada|australia|gulf)\b/i;
const EXCLUDE_REMOTE = [/\bus only\b/, /\busa only\b/, /united states only/, /\bus[- ]based\b/, /\bcanada only\b/, /\beu only\b/, /\buk only\b/, /\bus\/canada\b/, /\bnorth america\b/, /\blatam\b/, /\bapac\b/, /\baustralia\b/];

export function detectCity(text = '') {
  const t = text.toLowerCase();
  for (const c of NG_CITIES) if (t.includes(c)) return titleCase(c === 'ikeja' || c === 'lekki' || c === 'victoria island' || c === 'yaba' ? 'lagos' : c);
  return null;
}

export function detectCountry(text = '') {
  const t = text.toLowerCase();
  if (t.includes('nigeria') || detectCity(t)) return 'NG';
  if (t.includes('ghana')) return 'GH';
  if (t.includes('kenya')) return 'KE';
  if (t.includes('south africa')) return 'ZA';
  if (AFRICA_HINTS.some((h) => t.includes(h))) return 'AF';
  if (NON_AFRICA.some((h) => t.includes(h)) || NON_AFRICA_RE.test(t)) return 'XX';
  return null;
}

export function detectWorkMode(text = '', hint) {
  if (hint && hint !== 'unknown') return hint;
  const t = text.toLowerCase();
  if (/\bhybrid\b/.test(t)) return 'hybrid';
  if (/\bremote\b|work from home|\bwfh\b/.test(t)) return 'remote';
  if (/\bon[- ]?site\b|\bonsite\b/.test(t)) return 'onsite';
  return 'unknown';
}

// Returns null when a remote job clearly excludes Nigeria.
export function detectRemoteScope(locationText = '') {
  const t = locationText.toLowerCase();
  if (!t) return 'unknown';
  if (EXCLUDE_REMOTE.some((re) => re.test(t))) return null;
  if (t.includes('nigeria')) return 'nigeria';
  if (AFRICA_HINTS.some((h) => t.includes(h))) return 'africa';
  if (WORLDWIDE_HINTS.some((h) => t.includes(h))) return 'worldwide';
  if (EMEA_HINTS.some((h) => t.includes(h))) return 'emea';
  if (NON_AFRICA.some((h) => t.includes(h)) || NON_AFRICA_RE.test(t)) return null; // region-locked elsewhere
  return 'unknown';
}

// Title rules: the title is the strongest signal we have.
const LEVEL_RULES = [
  ['nysc', 0.95, /\bnysc\b|corps member|corper|\bsiwes\b|\bit student\b|industrial training/],
  ['nysc', 0.9, /\bintern(ship)?\b|graduate trainee|management trainee|\btrainee\b|fresh graduate|entry[- ]level graduate/],
  ['senior', 0.9, /\bsenior\b|\bsr\.?\b|\blead\b|\bhead of\b|\bhead,\b|\bprincipal\b|\bdirector\b|\bchief\b|\bvp\b|vice president|\bstaff\b|\barchitect\b/],
  ['entry', 0.8, /\bjunior\b|\bjr\.?\b|\bentry[- ]level\b|\bassociate\b|\bassistant\b|\bofficer\b|\bgraduate\b|\bapprentice/],
  ['mid', 0.6, /\bmid[- ]level\b|\bmanager\b|\bspecialist\b|\banalyst\b|\bexecutive\b|\bcoordinator\b|\bconsultant\b|\bsupervisor\b|\bii\b|\biii\b/],
];
// Body rules: only the markers that are rarely boilerplate. Years of experience is the main one.
const BODY_NYSC = /\bnysc\b|corps member|corper|\bsiwes\b/;
const YEARS_RE = /(?:minimum|at least|min\.?|over)?\s*(\d{1,2})\s*(?:\+|-\s*\d{1,2}|to\s*\d{1,2}|or more)?\s*\+?\s*(?:years?|yrs?)(?:'|’)?\s*(?:of\s+)?(?:\w+\s+){0,3}experience/;

const LANE_RULES = [
  ['tech', /\bsoftware\b|\bdeveloper\b|\bengineer(ing)?\b|\bdevops\b|\bdata (scientist|analyst|engineer)\b|\bqa\b|\btester\b|\bfrontend\b|\bbackend\b|\bfull[- ]?stack\b|\bmobile\b|\bandroid\b|\bios\b|\bproduct manager\b|\bit support\b|\bcyber|\bcloud\b|\bml\b|machine learning|\bsre\b|\bdatabase\b|\bnetwork (engineer|admin)/],
  ['design', /\bdesigner\b|\bux\b|\bui\b|\bproduct design\b|\bgraphic\b|\bbrand design|\bmotion\b|\billustrat/],
  ['finance', /\baccount(ant|ing)\b|\bfinanc|\btreasury\b|\baudit\b|\btax\b|\bbookkeep|\bcredit\b|\brisk\b|\bactuar|\bpayroll\b|\binvestment\b|\bfp&a\b/],
  ['sales', /\bsales\b|\bbusiness development\b|\bbdm\b|\baccount manager\b|\baccount executive\b|\brelationship manager\b|\btelesales\b|\bmerchandis/],
  ['support', /\bcustomer (support|success|service|care|experience)\b|\bsupport (specialist|agent|associate|representative)\b|\bcall cent(er|re)\b|\bhelp ?desk\b|\bvirtual assistant\b|\bclient service\b/],
  ['marketing', /\bmarketing\b|\bcontent\b|\bsocial media\b|\bcommunity manager\b|\bseo\b|\bgrowth\b|\bbrand manager\b|\bpr\b|\bcommunications\b|\bcopywriter\b/],
  ['health', /\bnurse\b|\bnursing\b|\bdoctor\b|\bmedical\b|\bclinic|\bpharmac|\bhealth\b|\bphysician\b|\blaborator|\bmidwife\b|\bdental\b/],
  ['teaching', /\bteacher\b|\bteaching\b|\btutor\b|\blecturer\b|\bprofessor\b|\bfaculty\b|\binstructor\b|\bschool\b|\bacademic\b|\beducation\b/],
  ['ngo', /\bngo\b|\bhumanitarian\b|\bprogramme? (officer|manager|assistant)\b|\bmonitoring and evaluation\b|\bm&e\b|\bwash\b|\blivelihood|\bprotection officer\b|\bfield officer\b|\bdevelopment (officer|associate)\b|\bgrants?\b|\bunicef\b|\bundp\b/],
  ['ops', /\boperations?\b|\blogistics\b|\bsupply chain\b|\bprocurement\b|\badmin(istrat(or|ive|ion))?\b|\bhr\b|\bhuman resources?\b|\brecruit|\boffice (manager|assistant)\b|\bproject manager\b|\bdriver\b|\bwarehouse\b|\bfacilit|\bsecurity\b|\breceptionist\b|\bdata entry\b|\bclerk\b/],
];

export function classifyLevel(title = '', body = '') {
  const t = title.toLowerCase();
  for (const [level, conf, re] of LEVEL_RULES) if (re.test(t)) return { level, confidence: conf };
  const b = body.toLowerCase().slice(0, 6000);
  if (BODY_NYSC.test(b)) return { level: 'nysc', confidence: 0.5 };
  const m = b.match(YEARS_RE);
  if (m) {
    const y = Number(m[1]);
    if (y <= 1) return { level: 'entry', confidence: 0.5 };
    if (y <= 4) return { level: 'mid', confidence: 0.5 };
    return { level: 'senior', confidence: 0.5 };
  }
  if (/\bfresh graduates?\b|\bno experience\b|\bgraduate trainee\b/.test(b)) return { level: 'entry', confidence: 0.4 };
  return { level: 'unknown', confidence: 0 };
}

export function classifyLane(title = '', body = '') {
  const t = title.toLowerCase();
  for (const [lane, re] of LANE_RULES) if (re.test(t)) return { lane, confidence: 0.85 };
  // Body: count hits per lane and take a clear winner. One stray word is not enough.
  const b = body.toLowerCase().slice(0, 4000);
  let best = null;
  for (const [lane, re] of LANE_RULES) {
    const hits = (b.match(new RegExp(re.source, 'g')) || []).length;
    if (hits >= 2 && (!best || hits > best.hits)) best = { lane, hits };
  }
  if (best) return { lane: best.lane, confidence: 0.45 };
  return { lane: 'other', confidence: 0 };
}

export function parseSalary(text = '') {
  if (!text) return {};
  const t = text.replace(/,/g, '');
  const cur = /₦|ngn|naira/i.test(t) ? 'NGN' : /\$|usd/i.test(t) ? 'USD' : /£|gbp/i.test(t) ? 'GBP' : /€|eur/i.test(t) ? 'EUR' : null;
  const nums = [...t.matchAll(/(\d+(?:\.\d+)?)\s*(k)?/gi)].map((m) => Number(m[1]) * (m[2] ? 1000 : 1)).filter((n) => n >= 100);
  if (!nums.length) return { currency: cur };
  return { currency: cur, salary_min: Math.min(...nums), salary_max: Math.max(...nums) };
}

export function summarize(text = '', max = 200) {
  const clean = stripTags(text).replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const i = cut.lastIndexOf(' ');
  return (i > max * 0.6 ? cut.slice(0, i) : cut).trim() + '…';
}

function titleCase(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

// "Finance Analyst Job at Paystack" -> { title: 'Finance Analyst', company: 'Paystack' }
export function splitTitleCompany(title = '', company = '') {
  const m = title.match(/^(.+?)\s+at\s+([A-Z0-9][^|]{1,60}?)\s*(?:\(|$)/);
  if (!m) return { title: title.trim(), company: company || '' };
  const tail = m[2].trim().replace(/[\s,.-]+$/, '');
  if (company && company.toLowerCase() !== tail.toLowerCase() && !tail.toLowerCase().startsWith(company.toLowerCase().slice(0, 6))) return { title: title.trim(), company };
  const head = m[1].replace(/\s+(job|vacancy|recruitment|position|role)$/i, '').trim();
  return { title: head, company: company || tail };
}

export function hashJob(title, company, city) {
  const key = [title, company, city].map((x) => (x || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()).join('|');
  return createHash('sha1').update(key).digest('hex').slice(0, 20);
}

/**
 * @param {object} raw  adapter output
 * @param {object} source  {id, full_description_allowed}
 * @returns {object|null} row for jobs table, or null if the job should be dropped
 */
export function normalize(raw, source) {
  const split = splitTitleCompany((raw.title || '').replace(/\s+/g, ' ').trim(), (raw.company || '').replace(/\s+/g, ' ').trim());
  const title = split.title;
  if (!title || !raw.apply_url) return null;
  const company = split.company || null;
  const locationText = (raw.location_text || '').replace(/\s+/g, ' ').trim();
  const body = raw.description_html || raw.description_text || '';
  const bodyText = stripTags(body);

  let work_mode = detectWorkMode(`${title} ${locationText} ${raw.work_mode_hint || ''}`, raw.work_mode);
  let remote_scope = 'unknown';
  if (work_mode === 'remote') {
    remote_scope = detectRemoteScope(raw.remote_scope_text || locationText || 'unknown');
    if (remote_scope === null) return null; // clearly excludes Nigeria
    // "Account Executive (Kazakhstan)", "Sales Manager - DACH": the title names a region that is not ours.
    const titleScope = detectRemoteScope(title);
    if (titleScope === null) return null;
    if (titleScope !== 'unknown' && remote_scope === 'unknown') remote_scope = titleScope;
    if (raw.remote_scope) remote_scope = raw.remote_scope;
  }
  const city = detectCity(locationText) || (work_mode === 'remote' ? null : detectCity(bodyText.slice(0, 500)));
  let country = raw.country || detectCountry(locationText);
  if (country === 'AF') country = null; // somewhere in Africa, country unknown
  if (work_mode === 'unknown' && city) work_mode = 'onsite';

  // Non-remote jobs in a clearly non-African country are dropped unless the source keeps all countries.
  if (work_mode !== 'remote' && country === 'XX') return null;
  if (country === 'XX') country = null;

  const { level, confidence: level_confidence } = classifyLevel(title, bodyText);
  const { lane, confidence: lane_confidence } = classifyLane(title, bodyText);
  const salary = parseSalary(raw.salary_text || '');
  const summary = raw.summary || summarize(bodyText || `${title} at ${company || 'an employer'}${locationText ? ', ' + locationText : ''}.`);
  const external_id = String(raw.external_id || raw.apply_url);
  const slug = `${slugify(title)}-${slugify(company || 'job')}-${createHash('sha1').update(source.id + external_id).digest('hex').slice(0, 6)}`;

  const tags = new Set((raw.tags || []).map((t) => String(t).toLowerCase().trim()).filter(Boolean));
  if (work_mode === 'remote') tags.add('remote');
  if (level === 'nysc') tags.add('nysc');

  return {
    source_id: source.id,
    external_id,
    slug,
    hash: hashJob(title, company, city || (work_mode === 'remote' ? 'remote' : '')),
    title,
    company,
    location_text: locationText || null,
    city,
    country,
    work_mode,
    remote_scope,
    level,
    lane,
    level_confidence,
    lane_confidence,
    salary_text: raw.salary_text || null,
    salary_min: salary.salary_min ?? null,
    salary_max: salary.salary_max ?? null,
    currency: salary.currency ?? null,
    deadline: raw.deadline || null,
    posted_at: raw.posted_at || null,
    apply_url: raw.apply_url,
    source_url: raw.source_url || raw.apply_url,
    description_html: source.full_description_allowed && raw.description_html ? raw.description_html.slice(0, 60000) : null,
    summary,
    tags: [...tags].slice(0, 12),
    _company_domain: raw.company_domain || null,
    _company_logo: raw.company_logo || null,
  };
}
