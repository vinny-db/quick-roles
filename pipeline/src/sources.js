// Every source we pull from, with its rules. Order does not matter.
// cadence: 'hourly' | '3h' | '6h' | 'daily'. allowed_in_schema: may we emit JobPosting JSON-LD.
import * as remote from './adapters/remote-apis.js';
import { makeRssAdapter } from './adapters/rss.js';
import { greenhouse, workable, bamboohr, teamtailor, ashby, smartrecruiters } from './adapters/ats.js';
import { telegram } from './adapters/telegram.js';

const S = [];
const add = (s) => S.push({ enabled: true, allowed_in_schema: false, full_description_allowed: false, keep_all_countries: false, ...s });

// ---- Remote boards (keyless APIs). Remotive and Himalayas forbid resyndication into Google Jobs: schema off.
add({ id: 'remotive', name: 'Remotive', kind: 'api', cadence: '6h', base_url: 'https://remotive.com', attribution: 'Via Remotive', full_description_allowed: true, keep_all_countries: true, run: remote.remotive });
add({ id: 'himalayas', name: 'Himalayas', kind: 'api', cadence: 'hourly', base_url: 'https://himalayas.app', attribution: 'Via Himalayas', full_description_allowed: true, keep_all_countries: true, run: remote.himalayas });
add({ id: 'jobicy', name: 'Jobicy', kind: 'api', cadence: 'hourly', base_url: 'https://jobicy.com', attribution: 'Via Jobicy', full_description_allowed: false, keep_all_countries: true, run: remote.jobicy });
add({ id: 'remoteok', name: 'Remote OK', kind: 'api', cadence: 'hourly', base_url: 'https://remoteok.com', attribution: 'Via Remote OK', full_description_allowed: false, keep_all_countries: true, run: remote.remoteok });
add({ id: 'wwr', name: 'We Work Remotely', kind: 'rss', cadence: 'hourly', base_url: 'https://weworkremotely.com', attribution: 'Via We Work Remotely', full_description_allowed: false, keep_all_countries: true, allowed_in_schema: true, run: remote.weworkremotely });

// ---- Nigerian and African feeds (verified RSS). Facts plus summary plus link back.
add({ id: 'jobgurus', name: 'Jobgurus', kind: 'rss', cadence: 'hourly', base_url: 'https://www.jobgurus.com.ng', attribution: 'Via Jobgurus', run: makeRssAdapter({ id: 'jobgurus', urls: ['https://www.jobgurus.com.ng/jobs/feed'], country: 'NG', defaultLocation: 'Nigeria' }) });
add({ id: 'myjobmag', name: 'MyJobMag', kind: 'rss', cadence: 'hourly', base_url: 'https://www.myjobmag.com', attribution: 'Via MyJobMag', enabled: false, run: makeRssAdapter({ id: 'myjobmag', urls: [/* paste the 5 feed URLs from myjobmag.com/feeds here */], country: 'NG', defaultLocation: 'Nigeria' }) });
add({ id: 'jobwebghana', name: 'Jobweb Ghana', kind: 'rss', cadence: 'hourly', base_url: 'https://www.jobwebghana.com', attribution: 'Via Jobweb Ghana', run: makeRssAdapter({ id: 'jobwebghana', urls: ['https://www.jobwebghana.com/feed/'], country: 'GH', defaultLocation: 'Ghana' }) });
add({ id: 'ngojobsinafrica', name: 'NGO Jobs in Africa', kind: 'rss', cadence: 'hourly', base_url: 'https://ngojobsinafrica.com', attribution: 'Via NGO Jobs in Africa', keep_all_countries: true, run: makeRssAdapter({ id: 'ngojobsinafrica', urls: ['https://ngojobsinafrica.com/feed/'] }) });
add({ id: 'novojob', name: 'Novojob', kind: 'rss', cadence: '3h', base_url: 'https://www.novojob.com', attribution: 'Via Novojob', keep_all_countries: true, run: makeRssAdapter({ id: 'novojob', urls: ['https://www.novojob.com/rss?format=feed&type=rss'] }) });
add({ id: 'uncareers', name: 'UN Careers', kind: 'rss', cadence: '6h', base_url: 'https://careers.un.org', attribution: 'Via UN Careers', keep_all_countries: true, allowed_in_schema: true, run: makeRssAdapter({ id: 'uncareers', urls: ['https://careers.un.org/jobfeed'] }) });
add({ id: 'ofa', name: 'Opportunities for Africans', kind: 'rss', cadence: '6h', base_url: 'https://www.opportunitiesforafricans.com', attribution: 'Via Opportunities for Africans', keep_all_countries: true, run: makeRssAdapter({ id: 'ofa', urls: ['https://www.opportunitiesforafricans.com/feed/'] }) });

// ---- Employer career pages (public ATS endpoints). Employer direct: full description and schema allowed.
const emp = (id, name, kind, run, extra = {}) => add({ id, name, kind: 'ats', cadence: '3h', attribution: 'Employer direct', full_description_allowed: true, allowed_in_schema: true, run, ...extra });
emp('greenhouse:moniepoint', 'Moniepoint careers', 'ats', greenhouse({ token: 'moniepoint', company: 'Moniepoint', domain: 'moniepoint.com' }));
emp('greenhouse:jumia', 'Jumia careers', 'ats', greenhouse({ token: 'jumia', company: 'Jumia', domain: 'jumia.com' }));
emp('workable:kuda', 'Kuda careers', 'ats', workable({ slug: 'kuda', company: 'Kuda', domain: 'kuda.com' }));
emp('workable:fairmoney', 'FairMoney careers', 'ats', workable({ slug: 'fairmoney', company: 'FairMoney', domain: 'fairmoney.io' }));
emp('workable:reliance', 'Reliance Health careers', 'ats', workable({ slug: 'get-reliance-health', company: 'Reliance Health', domain: 'getreliancehealth.com' }));
emp('workable:helium', 'Helium Health careers', 'ats', workable({ slug: 'helium-health', company: 'Helium Health', domain: 'heliumhealth.com' }));
emp('bamboohr:flutterwave', 'Flutterwave careers', 'ats', bamboohr({ sub: 'flutterwavego', company: 'Flutterwave', domain: 'flutterwave.com' }));
emp('bamboohr:chowdeck', 'Chowdeck careers', 'ats', bamboohr({ sub: 'chowdeck', company: 'Chowdeck', domain: 'chowdeck.com' }));
emp('bamboohr:paga', 'Paga careers', 'ats', bamboohr({ sub: 'paga', company: 'Paga', domain: 'mypaga.com' }));
emp('teamtailor:paystack', 'Paystack careers', 'ats', teamtailor({ site: 'careers.paystack.com', company: 'Paystack', domain: 'paystack.com' }));
emp('ashby:mkopa', 'M-KOPA careers', 'ats', ashby({ name: 'M-KOPA', company: 'M-KOPA', domain: 'm-kopa.com' }), { keep_all_countries: true });
emp('smartrecruiters:stanbic', 'Stanbic IBTC careers', 'ats', smartrecruiters({ companyId: 'StandardBankGroup', company: 'Stanbic IBTC', domain: 'stanbicibtc.com', countryFilter: /nigeria|lagos|abuja/i }));
emp('smartrecruiters:deloitte', 'Deloitte Nigeria careers', 'ats', smartrecruiters({ companyId: 'Deloitte6', company: 'Deloitte', domain: 'deloitte.com', countryFilter: /nigeria|lagos|abuja/i }));

// ---- Telegram public channels (web preview). Summary plus link to the post.
const tg = (id, name, channel) => add({ id: `telegram:${id}`, name, kind: 'telegram', cadence: 'hourly', base_url: `https://t.me/s/${channel}`, attribution: `Via ${name} on Telegram`, run: telegram({ channel }) });
tg('tohire', 'ToHire.NG', 'tohire_ng');
tg('worka', 'Worka Nigeria', 'WorkaNigeria');
tg('jobnow', 'Jobnow Nigeria', 'jobnownigeria');
tg('legitremote', 'Legit Remote Jobs', 'legitremotejobs');
tg('jobsng', 'Jobs in Nigeria Today', 'jobsinnigeriatoday');

export const SOURCES = S;
export const CADENCE_MINUTES = { hourly: 60, '3h': 180, '6h': 360, daily: 1440 };
