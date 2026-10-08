// Tiny RSS/Atom reader. Handles the feeds we use without a dependency.
// Not a general XML parser: it extracts <item> or <entry> blocks and simple child fields.

export function decodeEntities(s = '') {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&');
}

export function stripTags(html = '') {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|h\d|tr)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

// Returns the text of the first <tag> (optionally namespaced, e.g. 'tt:location') inside block.
export function field(block, tag) {
  const esc = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<${esc}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${esc}>`, 'i');
  const m = block.match(re);
  if (m) return decodeEntities(m[1]).trim();
  // self-closing or attribute-only tags (Atom <link href=""/>)
  const re2 = new RegExp(`<${esc}\\s[^>]*?href="([^"]+)"[^>]*\\/?>`, 'i');
  const m2 = block.match(re2);
  return m2 ? decodeEntities(m2[1]).trim() : '';
}

export function items(xml) {
  const out = [];
  const re = /<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(xml))) out.push(m[2]);
  return out;
}

export function parseDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString();
}
