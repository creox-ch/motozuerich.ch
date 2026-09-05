#!/usr/bin/env node
/**
 * Локальный гейт перед push — единственная проверка, которая есть у этого сайта.
 *
 *   node scripts/precheck.mjs
 *
 * Зачем (2026-09-05): в репозитории нет ни одного workflow, а push в main
 * deploy-ключом проходит напрямую. Между опечаткой и живым сайтом не стоит
 * ничего. Все GitHub-аккаунты заблокированы, PR открыть некому.
 *
 *   1. секреты        — репозиторий публичный, ключ отсюда раздаётся с прода
 *   2. синтаксис JS   — включая api/price-access.js: его поломка теряет лиды
 *                       прайс-гейта молча, ошибку видно только в логах Vercel
 *   3. JSON           — битый файл данных ломает страницу без единого слова
 *   4. ссылки         — с учётом cleanUrls и rewrites из vercel.json
 *   5. вес графики    — предупреждение, не провал
 *
 * Слепые зоны: адреса, которые скрипты собирают конкатенацией во время
 * работы, и всё, что живёт за пределами репозитория (переменные Vercel,
 * таблицы Supabase).
 */
import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const NL = String.fromCharCode(10);
const t0 = Date.now();
const c = {
  ok: (s) => `\x1b[32m${s}\x1b[0m`,
  bad: (s) => `\x1b[31m${s}\x1b[0m`,
  warn: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[90m${s}\x1b[0m`,
};

function summary(code) {
  const secs = ((Date.now() - t0) / 1000).toFixed(0);
  console.log('');
  if (code === 0) {
    console.log(c.ok(`✔ Всё зелёное за ${secs} с — можно пушить.`));
    console.log(c.dim('  Других проверок у этого репозитория нет: workflow здесь ни одного.'));
  } else {
    console.log(c.bad(`✘ Гейт не пройден (${secs} с). Push не делаем, пока не почините.`));
  }
  process.exit(code);
}

function step(name, fn) {
  process.stdout.write(`${c.dim('▸')} ${name}… `);
  const started = Date.now();
  try {
    const note = fn();
    const secs = ((Date.now() - started) / 1000).toFixed(0);
    console.log(`${c.ok('ок')} ${c.dim(`(${secs} с)`)}${note ? ` ${c.dim(note)}` : ''}`);
  } catch (e) {
    console.log(c.bad('ПРОВАЛ'));
    console.log(`${NL}${c.bad('┌─ ' + name)}`);
    console.log(String(e.message || e).split(NL).map((l) => `${c.bad('│')} ${l}`).join(NL));
    console.log(c.bad('└─'));
    summary(1);
  }
}

const tracked = execSync('git ls-files', { encoding: 'utf8' }).split(NL).filter(Boolean);

// ─── 1. секреты ──────────────────────────────────────────────────────────────
// api/price-access.js ходит в Supabase service_role ключом. Ключ живёт в env
// Vercel и в коде его быть не должно — но проверять надо, а не надеяться.
const SECRET_PATTERNS = [
  [/\beyJhbGciOi[A-Za-z0-9_.\-]{20,}/, 'JWT — похоже на ключ Supabase'],
  [/\bre_[A-Za-z0-9_]{16,}/, 'ключ Resend (re_…)'],
  [/-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/, 'приватный ключ'],
  [/\bsk_(?:live|test)_[A-Za-z0-9]{16,}/, 'секретный ключ платёжной системы'],
  [/\bghp_[A-Za-z0-9]{30,}/, 'токен GitHub (ghp_…)'],
  [/\bgithub_pat_[A-Za-z0-9_]{30,}/, 'токен GitHub (github_pat_…)'],
  [/\bsbp_[A-Za-z0-9]{30,}/, 'токен Supabase (sbp_…)'],
];
const BINARY = /\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|mp[34]|pdf|zip)$/i;

step('секреты в файлах', () => {
  const hits = [];
  let scanned = 0;
  for (const f of tracked) {
    if (BINARY.test(f)) continue;
    let text;
    try { text = fs.readFileSync(f, 'utf8'); } catch { continue; }
    if (text.includes('\0')) continue;
    scanned++;
    text.split(NL).forEach((line, i) => {
      for (const [re, what] of SECRET_PATTERNS) {
        if (re.test(line)) hits.push(`${f}:${i + 1} — ${what}`);
      }
    });
  }
  if (hits.length) throw new Error(`Похоже на секреты (значения намеренно не показаны):${NL}${hits.join(NL)}`);
  return `${scanned} файлов`;
});

// ─── 2. синтаксис JS ─────────────────────────────────────────────────────────
step('синтаксис JS', () => {
  const js = tracked.filter((f) => f.endsWith('.js'));
  const broken = [];
  for (const f of js) {
    const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
    if (r.status === 0) continue;
    // Файл может быть в синтаксисе ES-модулей: node --check судит его как
    // CommonJS и ругается на import/export. Перепроверяем копией с .mjs.
    const tmp = path.join(os.tmpdir(), 'mz-precheck-' + Date.now() + '.mjs');
    let okAsModule = false;
    try {
      fs.writeFileSync(tmp, fs.readFileSync(f));
      okAsModule = spawnSync(process.execPath, ['--check', tmp], { encoding: 'utf8' }).status === 0;
    } catch {} finally {
      try { fs.unlinkSync(tmp); } catch {}
    }
    if (!okAsModule) {
      broken.push(f + NL + (r.stderr || '').split(NL).slice(0, 4).join(NL));
    }
  }
  if (broken.length) throw new Error(broken.join(NL + NL));
  return js.length + ' файлов';
});

// ─── 3. JSON ─────────────────────────────────────────────────────────────────
step('JSON-файлы', () => {
  const jsons = tracked.filter((f) => f.endsWith('.json'));
  const broken = [];
  for (const f of jsons) {
    try { JSON.parse(fs.readFileSync(f, 'utf8')); }
    catch (e) { broken.push(`${f} — ${e.message}`); }
  }
  if (broken.length) throw new Error(broken.join(NL));
  return `${jsons.length} файлов`;
});

// ─── 4. ссылки ───────────────────────────────────────────────────────────────
// На проде включён cleanUrls, плюс список rewrites: /faq → /FAQ. Адрес валиден,
// если это файл, файл+.html, или source из rewrites, чей destination — файл.
step('внутренние ссылки', () => {
  const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  const rewrites = new Map((vercel.rewrites || []).map((r) => [r.source, r.destination]));

  const exists = (p) => {
    const clean = p.replace(/^\//, '');
    if (!clean) return true; // корень
    return fs.existsSync(clean) || fs.existsSync(clean + '.html');
  };

  const badRewrites = [];
  for (const [source, dest] of rewrites) {
    if (!exists(dest)) badRewrites.push(`vercel.json: rewrite ${source} → ${dest} никуда не ведёт`);
  }

  const htmls = tracked.filter((f) => f.endsWith('.html'));
  const bad = [];
  let checked = 0;
  for (const f of htmls) {
    const text = fs.readFileSync(f, 'utf8');
    const re = /(?:href|src)="([^"]+)"/g;
    let m;
    while ((m = re.exec(text))) {
      const raw = m[1];
      if (/^(https?:)?\/\/|^mailto:|^tel:|^#|^data:|^javascript:/i.test(raw)) continue;
      // Адрес, который скрипт склеивает во время работы, статически не
      // проверить — слепая зона гейта. Пропускаем, чтобы не краснеть на
      // живом коде: в Gesamtplan.html так собирается href из данных.
      if (/['"]\s*\+|\+\s*['"]|\$\{|<%/.test(raw)) continue;
      const target = raw.split('?')[0].split('#')[0];
      if (!target) continue;
      checked++;
      if (exists(target)) continue;
      if (rewrites.has('/' + target.replace(/^\//, ''))) continue;
      const line = text.slice(0, m.index).split(NL).length;
      bad.push(`${f}:${line} — ${raw}`);
    }
  }
  const all = badRewrites.concat(bad.length ? [`Адреса, которые никуда не ведут (${bad.length}):`].concat(bad) : []);
  if (all.length) throw new Error(all.join(NL));
  return `${checked} шт. в ${htmls.length} страницах`;
});

// ─── 5. вес графики ──────────────────────────────────────────────────────────
step('вес графики', () => {
  const LIMIT_MB = 40;
  let total = 0;
  for (const f of tracked) {
    if (!/\.(png|jpe?g|gif|webp|avif)$/i.test(f)) continue;
    try { total += fs.statSync(f).size; } catch { /* файла нет — не наша забота */ }
  }
  const mb = total / 1024 / 1024;
  if (mb > LIMIT_MB) {
    console.log('');
    console.log(c.warn(`  ⚠ Картинки весят ${mb.toFixed(1)} МБ (порог ${LIMIT_MB}). Стоит пережать.`));
    process.stdout.write('  ');
  }
  return `${mb.toFixed(1)} МБ`;
});

summary(0);
