// acceptance/integration/linkcheck.mjs (por-build-qa) — static link check of the cross-area calls.
// Every `X.Name(` in game/areas/*.js is a call by published name into another area or the engine. This lists the names
// that no module exports (engine/*.js, areas/*.js, incl. `export { a, b }` re-exports): each is a call that throws (or is
// skipped with a warning) at run time. Node only, no browser.   Usage: node acceptance/integration/linkcheck.mjs [--md]
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dirs = [join(ROOT, 'game', 'engine'), join(ROOT, 'game', 'areas')];
const files = dirs.flatMap((d) => readdirSync(d).filter((f) => f.endsWith('.js')).map((f) => join(d, f)));
const exported = new Set();
const exportedBy = new Map();   // name -> Set(module basename)
const calls = new Map();   // name -> [file:line]
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const base = f.split(/[\\/]/).slice(-2).join('/');
  const add = (n) => { exported.add(n); if (!exportedBy.has(n)) exportedBy.set(n, new Set()); exportedBy.get(n).add(base); };
  for (const m of src.matchAll(/export\s+(?:async\s+)?(?:function\*?|const|let|class)\s+([A-Za-z_$][\w$]*)/g)) add(m[1]);
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g))
    for (const part of m[1].split(',')) { const n = part.trim().split(/\s+as\s+/).pop().trim(); if (n) add(n); }
  for (const m of src.matchAll(/export const \{([^}]*)\}/g))
    for (const part of m[1].split(',')) { const n = part.trim(); if (n) add(n); }
  if (!f.includes(join('game', 'areas'))) continue;
  src.split('\n').forEach((line, i) => {
    if (/^\s*\/\//.test(line)) return;
    for (const m of line.matchAll(/\bX\.([A-Za-z_$][\w$]*)\s*\(/g)) {
      const k = m[1];
      if (!calls.has(k)) calls.set(k, []);
      calls.get(k).push(`${f.split(/[\\/]/).pop()}:${i + 1}`);
    }
  });
}
const missing = [...calls.keys()].filter((k) => !exported.has(k)).sort();
const md = process.argv.includes('--md');
console.log(md ? `| routine | called from |\n|---|---|` : `cross-area names called: ${calls.size}; not exported anywhere: ${missing.length}`);
for (const k of missing) {
  const where = calls.get(k);
  console.log(md ? `| ${k} | ${where.slice(0, 6).join(', ')}${where.length > 6 ? ` … (${where.length})` : ''} |`
    : `  ${k}  <- ${where.slice(0, 4).join(', ')}${where.length > 4 ? ` … (${where.length})` : ''}`);
}

// Reachability: an area's X looks in (a) every area module (self-binding) and (b) its own ENGINE_MODULES list, plus the
// engine modules flow.js BindAllAreas hands out (audio, files). A name exported only by other engine modules is not found.
const SEARCHED_BY_ALL = new Set(['engine/audio.js', 'engine/files.js', 'engine/ecl.js']);   // = flow.js EXTRA_ENGINE
const coreLookups = {};
for (const f of files.filter((x) => /_core\.js$/.test(x))) {
  const src = readFileSync(f, 'utf8');
  const imports = Object.fromEntries([...src.matchAll(/import \* as (\w+) from '\.\.\/engine\/(\w+)\.js'/g)].map((m) => [m[1], `engine/${m[2]}.js`]));
  const list = (src.match(/ENGINE_MODULES = \[([^\]]*)\]/) || [, ''])[1].split(',').map((x) => imports[x.trim()]).filter(Boolean);
  coreLookups[f.split(/[\\/]/).pop().replace('_core.js', '')] = new Set(list);
}
const unreachable = [];
for (const [k, where] of calls) {
  const by = exportedBy.get(k); if (!by) continue;
  if ([...by].some((b) => b.startsWith('areas/') || SEARCHED_BY_ALL.has(b))) continue;
  for (const w of where) {
    const area = Object.keys(coreLookups).find((a) => w.startsWith(a));
    if (area && ![...by].some((b) => coreLookups[area].has(b))) unreachable.push(`${k} (only in ${[...by].join(', ')}) <- ${w}`);
  }
}
console.log(`not reachable from the calling area's lookup: ${unreachable.length}`);
for (const u of unreachable.slice(0, 40)) console.log('  ' + u);
