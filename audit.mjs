import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const SITE = '/sessions/kind-exciting-bardeen/mnt/MOTO-ZÜRICH Design System';
const OUT = '/sessions/kind-exciting-bardeen/mnt/outputs';

const ROUTES = {
  '/':                            'MOTO-ZÜRICH 2027.html',
  '/faq':                         'FAQ.html',
  '/programm':                    'Programm.html',
  '/party':                       'Party.html',
  '/aussteller-motozuerich-2026': 'Aussteller.html',
  '/mz2026':                      'Rueckblick-2026.html',
  '/team':                        'Team.html',
  '/warum_motozurich':            'Warum.html',
  '/sound':                       'Sound.html',
  '/medien':                      'Medien.html',
  '/impressum':                   'Impressum.html',
  '/agb':                         'AGB.html',
  '/datenschutz':                 'Datenschutz.html',
  '/volunteers':                  'Volunteers.html',
  '/creators':                    'Creators.html',
};

const SOCIAL = {
  whatsapp:  'whatsapp.com/channel',
  facebook:  'facebook.com/motozuerich',
  youtube:   'youtube.com/@motozuerich',
  instagram: 'instagram.com/motozuerich',
  linkedin:  'linkedin.com/company/motozuerich',
  tiktok:    'tiktok',
};

const results = [];
function rec(page, fn, name, status, detail = '') { results.push({ page, fn, name, status, detail }); }
const PASS = 'PASS', FAIL = 'FAIL', WARN = 'WARN';
const docs = {};

function inlineLocalScripts(html) {
  return html.replace(/<script\s+src="([^"]+)"\s*>\s*<\/script>/g, (m, src) => {
    if (/^(https?:)?\/\//.test(src)) return m;
    const f = path.join(SITE, src.split('?')[0]);
    if (!fs.existsSync(f)) return m;
    return `<script>\n${fs.readFileSync(f, 'utf8')}\n</script>`;
  });
}

const SHIMS = `<script>
  window.IntersectionObserver = window.IntersectionObserver || function(){return {observe(){},unobserve(){},disconnect(){},takeRecords(){return[]}}};
  window.matchMedia = window.matchMedia || function(){return {matches:false,media:'',addListener(){},removeListener(){},addEventListener(){},removeEventListener(){},dispatchEvent(){return false}}};
  window.scrollTo = window.scrollTo || function(){};
  window.requestAnimationFrame = window.requestAnimationFrame || function(cb){return setTimeout(cb,0)};
</script>`;

for (const [route, file] of Object.entries(ROUTES)) {
  const fp = path.join(SITE, file);
  if (!fs.existsSync(fp)) { rec(route, 'FN-smoke', `${route} file exists`, FAIL, `missing ${file}`); continue; }
  const html = fs.readFileSync(fp, 'utf8');
  let runnable = inlineLocalScripts(html).replace('</head>', SHIMS + '</head>');
  let dom;
  try { dom = new JSDOM(runnable, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'file://' + fp }); }
  catch (e) { rec(route, 'FN-smoke', `${route} parses/runs`, FAIL, e.message); continue; }
  docs[route] = { dom, html, file, fp };
  const d = dom.window.document;
  const title = (d.querySelector('title')?.textContent || '').trim();
  rec(route, 'FN-001', `${route} has <title>`, title.length ? PASS : FAIL, title);
  rec(route, 'FN-001', `${route} title contains MOTO-ZÜRICH`, /MOTO-ZÜRICH/i.test(title) ? PASS : FAIL, title);
  rec(route, 'FN-001', `${route} has <body>`, d.body && d.body.childElementCount > 0 ? PASS : FAIL);
}

for (const [route, { dom }] of Object.entries(docs)) {
  const d = dom.window.document;
  rec(route, 'FN-100', `${route} has header`, d.querySelector('header, [role="banner"]') ? PASS : FAIL);
  rec(route, 'FN-120', `${route} has footer`, d.querySelector('footer, [role="contentinfo"]') ? PASS : FAIL);
}

if (docs['/']) {
  const d = docs['/'].dom.window.document;
  const anchors = [...d.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
  const has = (sub) => anchors.some(h => h && h.includes(sub));
  const wantNav = ['/', '/programm', '/aussteller-motozuerich-2026', '/medien', '/faq', '/party', '/team', '/warum_motozurich', '/sound'];
  for (const w of wantNav) {
    const file = ROUTES[w];
    const present = w === '/' ? (has('index') || anchors.includes('/') || anchors.includes('#') || has('MOTO-ZÜRICH 2027.html')) : (file && has(file));
    rec('/', 'FN-110', `nav links to ${w}`, present ? PASS : (w === '/' ? WARN : FAIL), file || '');
  }
  rec('/', 'FN-102', `Tickets CTA -> Bookinea`, has('bookinea') ? PASS : FAIL);
  const burger = d.querySelector('button[aria-label*="menu" i],button[aria-label*="men" i],button[aria-expanded],[class*="burger"],[class*="hamburger"],button.menu-toggle,button.nav-mobile-toggle');
  rec('/', 'FN-103', `mobile menu toggle present`, burger ? PASS : FAIL);
}

for (const [route, { dom }] of Object.entries(docs)) {
  const d = dom.window.document;
  const allhrefs = [...d.querySelectorAll('a[href]')].map(a => a.getAttribute('href') || '');
  const footer = d.querySelector('footer, [role="contentinfo"]') || d;
  for (const [name, sub] of Object.entries(SOCIAL)) {
    rec(route, 'FN-121', `${route} social link: ${name}`, allhrefs.some(h => h.includes(sub)) ? PASS : FAIL, sub);
  }
  for (const lg of ['Impressum.html', 'AGB.html', 'Datenschutz.html']) {
    rec(route, 'FN-122', `${route} legal link: ${lg}`, allhrefs.some(h => h.includes(lg)) ? PASS : FAIL);
  }
  const ftext = footer.textContent || '';
  rec(route, 'FN-120b', `${route} footer copyright MOTO-ZÜRICH + year`, /MOTO-ZÜRICH/i.test(ftext) && /(2026|2027)/.test(ftext) ? PASS : FAIL);
}

for (const [route, { dom }] of Object.entries(docs)) {
  const d = dom.window.document;
  const meta = (sel) => d.querySelector(sel)?.getAttribute('content') || null;
  const desc = meta('meta[name="description"]');
  rec(route, 'FN-140', `${route} meta description`, desc && desc.length > 20 ? PASS : FAIL, desc ? `${desc.length} chars` : 'missing');
  rec(route, 'FN-141', `${route} viewport meta`, meta('meta[name="viewport"]') ? PASS : FAIL);
  const ogt = meta('meta[property="og:title"]'), ogd = meta('meta[property="og:description"]'), ogi = meta('meta[property="og:image"]');
  rec(route, 'FN-142', `${route} OG tags (title/desc/image)`, (ogt && ogd && ogi) ? PASS : WARN, `title:${!!ogt} desc:${!!ogd} image:${!!ogi}`);
  const canonical = d.querySelector('link[rel="canonical"]')?.getAttribute('href') || null;
  rec(route, 'FN-143', `${route} canonical`, canonical ? PASS : WARN, canonical || 'missing');
  const lang = d.documentElement.getAttribute('lang');
  rec(route, 'FN-144', `${route} html lang=de`, /^de/.test(lang || '') ? PASS : FAIL, lang || 'none');
}

for (const [route, { html }] of Object.entries(docs)) {
  const ga4 = /gtag\(|G-[A-Z0-9]{6,}|googletagmanager\.com\/(gtag|gtm)|google-analytics\.com/.test(html);
  const px = /fbq\(|connect\.facebook\.net\/.*fbevents|facebook\.net\/.*fbevents/.test(html);
  rec(route, 'FN-1801', `${route} GA4 / GTM present`, ga4 ? PASS : FAIL);
  rec(route, 'FN-1802', `${route} Meta Pixel present`, px ? PASS : WARN);
}

for (const [route, { dom }] of Object.entries(docs)) {
  const body = dom.window.document.body?.textContent || '';
  const count = (body.match(/ß/g) || []).length;
  rec(route, 'FN-1201', `${route} no eszett (uses ss)`, count === 0 ? PASS : FAIL, count ? `${count} occurrences` : '');
}

for (const [route, { dom }] of Object.entries(docs)) {
  const d = dom.window.document;
  const hs = [...d.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => parseInt(h.tagName[1], 10));
  const h1count = hs.filter(n => n === 1).length;
  rec(route, 'FN-2101', `${route} exactly one H1`, h1count === 1 ? PASS : (h1count === 0 ? FAIL : WARN), `h1=${h1count}`);
  let skip = false;
  for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i-1] > 1) skip = true;
  rec(route, 'FN-2102', `${route} no skipped heading levels`, skip ? WARN : PASS);
}

for (const [route, { dom }] of Object.entries(docs)) {
  const imgs = [...dom.window.document.querySelectorAll('img')];
  const noAlt = imgs.filter(i => i.getAttribute('alt') === null);
  rec(route, 'FN-145', `${route} all <img> have alt`, noAlt.length === 0 ? PASS : WARN, `${imgs.length} imgs, ${noAlt.length} missing alt`);
}

for (const [route, { dom }] of Object.entries(docs)) {
  const d = dom.window.document;
  const refs = [
    ...[...d.querySelectorAll('img[src]')].map(e => e.getAttribute('src')),
    ...[...d.querySelectorAll('link[href]')].map(e => e.getAttribute('href')),
    ...[...d.querySelectorAll('script[src]')].map(e => e.getAttribute('src')),
    ...[...d.querySelectorAll('source[src]')].map(e => e.getAttribute('src')),
    ...[...d.querySelectorAll('video[src]')].map(e => e.getAttribute('src')),
  ].filter(Boolean);
  const broken = [];
  for (let r of refs) {
    if (/^(https?:|data:|mailto:|tel:|#|\/\/)/.test(r)) continue;
    const clean = r.split('#')[0].split('?')[0];
    if (!clean) continue;
    if (!fs.existsSync(path.join(SITE, decodeURIComponent(clean)))) broken.push(clean);
  }
  rec(route, 'FN-2204', `${route} no broken internal asset refs`, broken.length === 0 ? PASS : FAIL, broken.length ? broken.slice(0,6).join(', ') : '');
  const pageLinks = [...d.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).filter(h => h && !/^(https?:|mailto:|tel:|#|\/\/)/.test(h));
  const deadLinks = [];
  for (const h of pageLinks) {
    const base = h.split('#')[0].split('?')[0];
    if (!base || base === '/') continue;
    if (!fs.existsSync(path.join(SITE, decodeURIComponent(base))) && !ROUTES[base]) deadLinks.push(base);
  }
  rec(route, 'FN-2205', `${route} internal page links resolve`, deadLinks.length === 0 ? PASS : FAIL, deadLinks.length ? [...new Set(deadLinks)].slice(0,6).join(', ') : '');
}

const allHtml = Object.values(docs).map(x => x.html).join('\n');
const integ = { 'Bookinea ticketing': 'bookinea', 'Pyrus forms': 'pyrus.com/form', 'smartvenue 3D tour': 'smartvenue.ch', 'Swiss Volunteers': 'swissvolunteers' };
for (const [name, sub] of Object.entries(integ)) {
  rec('(site)', 'FN-1901', `external integration present: ${name}`, allHtml.includes(sub) ? PASS : WARN, sub);
}

for (const route of ['/', '/faq', '/programm', '/team']) {
  if (!docs[route]) continue;
  const d = docs[route].dom.window.document;
  rec(route, 'FN-130', `${route} partners block present`, d.querySelector('.partners-strip, [class*="partner"]') ? PASS : WARN);
}

if (docs['/']) {
  const t = docs['/'].dom.window.document.body.textContent.replace(/\s+/g, ' ');
  const facts = { 'date 2027 (19.-21. Februar 2027)': /19\.\s*[–-]\s*21\.\s*Februar\s*2027/, 'location Oerlikon': /Oerlikon/i };
  for (const [name, re] of Object.entries(facts)) rec('/', 'FN-201', `home content: ${name}`, re.test(t) ? PASS : WARN);
}

for (const [name, fn] of [['robots.txt','FN-1701'],['sitemap.xml','FN-1702'],['favicon.ico','FN-1703']]) {
  rec('(site)', fn, `${name} exists`, fs.existsSync(path.join(SITE, name)) ? PASS : FAIL);
}

const summary = { PASS: 0, FAIL: 0, WARN: 0 };
for (const r of results) summary[r.status]++;
fs.writeFileSync(path.join(OUT, 'audit-results.json'), JSON.stringify({ summary, results }, null, 2));
console.log(`\n=== MOTO-ZÜRICH static parity audit ===`);
console.log(`PASS ${summary.PASS}   WARN ${summary.WARN}   FAIL ${summary.FAIL}   (total ${results.length})\n`);
console.log('--- FAILURES ---');
for (const r of results.filter(r => r.status === FAIL)) console.log(`FAIL [${r.fn}] ${r.page} ${r.name}${r.detail ? '  ('+r.detail+')' : ''}`);
console.log('\n--- WARNINGS ---');
for (const r of results.filter(r => r.status === WARN)) console.log(`WARN [${r.fn}] ${r.page} ${r.name}${r.detail ? '  ('+r.detail+')' : ''}`);
