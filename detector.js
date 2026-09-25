const BRANDS = ['paypal','amazon','google','apple','microsoft','netflix','instagram','facebook','bank','chase','wellsfargo','hdfc','icici','sbi','irs','whatsapp'];
const BAD_TLDS = ['zip','mov','xyz','top','click','work','country','gq','tk','loan','win'];

function analyze(raw) {
  let reasons = [];
  let score = 100;
  let input = raw.trim();
  if (!input) return null;
  if (!/^https?:\/\//i.test(input)) input = 'http://' + input;

  let url;
  try { url = new URL(input); } catch (e) {
    return { score: 20, reasons: [{ t: "Couldn't parse this as a valid link.", flag: true }] };
  }
  const host = url.hostname.toLowerCase();
  const full = raw.toLowerCase();

  if (url.protocol !== 'https:') {
    score -= 15; reasons.push({ t: 'No encryption (http, not https).', flag: true });
  } else {
    reasons.push({ t: 'Uses HTTPS encryption.' });
  }

  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
    score -= 35; reasons.push({ t: 'Domain is a raw IP address.', flag: true });
  }

  if (full.includes('@')) {
    score -= 30; reasons.push({ t: 'Contains "@" — can hide the real destination.', flag: true });
  }

  if (host.includes('xn--')) {
    score -= 30; reasons.push({ t: 'Encoded (punycode) domain.', flag: true });
  }

  const subCount = host.split('.').length - 2;
  if (subCount >= 3) {
    score -= 15; reasons.push({ t: `Unusually many subdomains (${subCount}).`, flag: true });
  }

  const tld = host.split('.').pop();
  if (BAD_TLDS.includes(tld)) {
    score -= 15; reasons.push({ t: `.${tld} domains are often used for scam sites.`, flag: true });
  }

  const domainRoot = host.replace(/^www\./, '').split('.')[0];
  for (const brand of BRANDS) {
    if (full.includes(brand) && !domainRoot.includes(brand)) {
      score -= 35;
      reasons.push({ t: `Mentions "${brand}" but domain is "${host}".`, flag: true });
      break;
    }
  }

  const hyphens = (host.match(/-/g) || []).length;
  if (hyphens >= 3) {
    score -= 10; reasons.push({ t: 'Domain has several hyphens — common in generated scam domains.', flag: true });
  }

  if (reasons.filter(r => r.flag).length === 0) {
    reasons.push({ t: 'No red flags found.' });
  }

  score = Math.max(0, Math.min(100, score));
  return { score, reasons };
}