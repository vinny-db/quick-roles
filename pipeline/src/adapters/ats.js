// Employer career pages via public ATS endpoints. Full descriptions allowed (employer's own public feed).
import { getJson, getText } from '../lib/http.js';
import { items, field, parseDate } from '../lib/xml.js';

const loc = (...parts) => parts.filter(Boolean).join(', ');

export function greenhouse({ token, company, domain }) {
  return async () => {
    const data = await getJson(`https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=true`);
    return (data.jobs || []).map((j) => ({
      external_id: String(j.id),
      title: j.title,
      company,
      company_domain: domain,
      location_text: j.location?.name || '',
      posted_at: parseDate(j.updated_at || j.first_published),
      apply_url: j.absolute_url,
      source_url: j.absolute_url,
      description_html: j.content ? decodeGreenhouse(j.content) : '',
      tags: (j.departments || []).map((d) => d.name).filter(Boolean),
    }));
  };
}
// Greenhouse returns HTML-escaped content.
function decodeGreenhouse(s) {
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
}

export function workable({ slug, company, domain }) {
  return async () => {
    const data = await getJson(`https://apply.workable.com/api/v1/widget/accounts/${slug}`);
    const name = company || data.name;
    return (data.jobs || []).map((j) => ({
      external_id: String(j.shortcode || j.id),
      title: j.title,
      company: name,
      company_domain: domain,
      location_text: loc(j.city || j.location?.city, j.country || j.location?.country) || (j.location?.region ?? ''),
      work_mode: j.workplace === 'remote' ? 'remote' : j.workplace === 'hybrid' ? 'hybrid' : j.workplace === 'on_site' ? 'onsite' : undefined,
      remote_scope_text: j.workplace === 'remote' ? (j.country || j.location?.country || 'Nigeria') : undefined,
      posted_at: parseDate(j.published_on || j.published),
      apply_url: j.url || j.application_url,
      source_url: j.url,
      description_html: j.description || '',
      tags: [j.department, j.employment_type].filter(Boolean),
    }));
  };
}

export function bamboohr({ sub, company, domain }) {
  return async () => {
    const data = await getJson(`https://${sub}.bamboohr.com/careers/list`);
    return (data.result || []).map((j) => ({
      external_id: String(j.id),
      title: j.jobOpeningName,
      company,
      company_domain: domain,
      location_text: j.isRemote ? 'Remote' : loc(j.location?.city, j.location?.state, j.location?.country),
      work_mode: j.isRemote ? 'remote' : undefined,
      remote_scope_text: j.isRemote ? 'Nigeria' : undefined,
      posted_at: parseDate(j.datePosted),
      apply_url: `https://${sub}.bamboohr.com/careers/${j.id}`,
      source_url: `https://${sub}.bamboohr.com/careers/${j.id}`,
      description_html: '',
      tags: [j.departmentLabel, j.employmentStatusLabel].filter(Boolean),
    }));
  };
}

export function teamtailor({ site, company, domain }) {
  return async () => {
    const xml = await getText(`https://${site}/jobs.rss`);
    return items(xml).map((b) => {
      const link = field(b, 'link');
      return {
        external_id: field(b, 'guid') || link,
        title: field(b, 'title'),
        company,
        company_domain: domain,
        location_text: field(b, 'tt:location') || field(b, 'location') || '',
        work_mode: /remote/i.test(field(b, 'tt:remotestatus') || '') ? 'remote' : undefined,
        posted_at: parseDate(field(b, 'pubDate')),
        apply_url: link,
        source_url: link,
        description_html: field(b, 'description'),
        tags: [field(b, 'tt:department')].filter(Boolean),
      };
    });
  };
}

export function ashby({ name, company, domain }) {
  return async () => {
    const data = await getJson(`https://api.ashbyhq.com/posting-api/job-board/${name}?includeCompensation=true`);
    return (data.jobs || []).map((j) => ({
      external_id: String(j.id),
      title: j.title,
      company,
      company_domain: domain,
      location_text: j.location || '',
      work_mode: j.isRemote ? 'remote' : undefined,
      remote_scope_text: j.isRemote ? (j.location || 'Nigeria') : undefined,
      salary_text: j.compensation?.compensationTierSummary || '',
      posted_at: parseDate(j.publishedAt),
      apply_url: j.applyUrl || j.jobUrl,
      source_url: j.jobUrl,
      description_html: j.descriptionHtml || '',
      tags: [j.department, j.team, j.employmentType].filter(Boolean),
    }));
  };
}

export function smartrecruiters({ companyId, company, domain, countryFilter }) {
  return async () => {
    const out = [];
    for (let offset = 0; offset < 500; offset += 100) {
      const data = await getJson(`https://api.smartrecruiters.com/v1/companies/${companyId}/postings?limit=100&offset=${offset}`);
      const list = data.content || [];
      for (const j of list) {
        const country = j.location?.country || '';
        if (countryFilter && !countryFilter.test(`${country} ${j.location?.city || ''}`)) continue;
        out.push({
          external_id: String(j.id),
          title: j.name,
          company,
          company_domain: domain,
          location_text: loc(j.location?.city, j.location?.region, country),
          work_mode: j.location?.remote ? 'remote' : undefined,
          posted_at: parseDate(j.releasedDate),
          apply_url: `https://jobs.smartrecruiters.com/${companyId}/${j.id}`,
          source_url: `https://jobs.smartrecruiters.com/${companyId}/${j.id}`,
          description_html: '',
          tags: [j.department?.label, j.typeOfEmployment?.label].filter(Boolean),
        });
      }
      if (list.length < 100) break;
    }
    return out;
  };
}
