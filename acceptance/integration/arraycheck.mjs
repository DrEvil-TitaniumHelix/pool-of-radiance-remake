// acceptance/integration/arraycheck.mjs (por-build-qa) — shape check of the shared DS globals.
// Every global that area/engine code indexes (`g.X[` / `G.X[`) or uses as a record (`g.X.field`) must hold an array / typed
// array / object in the shared state; a plain number there means the first indexed write / field access throws
// ("Cannot create property '1' on number '0'", "Cannot read properties of ... 'px'") — the P1 crash class.
// Static scan of game/areas/*.js + game/engine/*.js, then the values after flow.BindAllAreas() in node. Some globals are
// only created at run time (InitGameState, StartCombat, main.js) — confirm with the browser probe of P1-f.json.
// Usage: node acceptance/integration/arraycheck.mjs [--names]   (--names: JSON list of the flagged names, for the probe)
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIRS = [join(ROOT, 'game', 'areas'), join(ROOT, 'game', 'engine')];
const METHODS = new Set(['fill', 'length', 'push', 'pop', 'shift', 'unshift', 'slice', 'subarray', 'set', 'map', 'forEach', 'indexOf',
  'includes', 'join', 'splice', 'some', 'every', 'filter', 'find', 'findIndex', 'reduce', 'toString', 'concat', 'copyWithin', 'keys',
  'values', 'entries', 'sort', 'reverse', 'at', 'charCodeAt', 'startsWith', 'endsWith', 'trim', 'replace', 'split', 'repeat', 'padStart',
  'padEnd', 'toUpperCase', 'toLowerCase', 'apply', 'call', 'bind', 'then', 'toFixed', 'get', 'has', 'delete', 'add', 'clear']);
const SKIP = new Set(['ds', 'view', 'menu', 'text', 'audio', 'state', 'pic', 'dev', 'keyState', 'script', 'tp']);
const uses = new Map();
const put = (k, kind, w) => { if (!uses.has(k)) uses.set(k, { kinds: new Set(), where: [] }); const u = uses.get(k); u.kinds.add(kind); u.where.push(w); };
for (const dir of DIRS) for (const f of readdirSync(dir).filter((x) => x.endsWith('.js'))) {
  readFileSync(join(dir, f), 'utf8').split('\n').forEach((line, i) => {
    if (/^\s*\/\//.test(line)) return;
    for (const m of line.matchAll(/\b[gG]\.([A-Za-z_$][\w$]*)\[/g)) put(m[1], 'index', `${f}:${i + 1}`);
    for (const m of line.matchAll(/\b[gG]\.([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)/g)) if (!METHODS.has(m[2])) put(m[1], 'field', `${f}:${i + 1}`);
  });
}

const flow = await import('../../game/areas/flow.js');
await flow.BindAllAreas();
const { G } = await import('../../game/engine/state.js');
let eg = G;
try { eg = (await import('../../game/areas/ecl_host.js')).eclG || G; } catch { /* */ }
const bad = [];
for (const [k, u] of [...uses].sort()) {
  if (SKIP.has(k)) continue;
  const v = eg[k];
  if (Array.isArray(v) || ArrayBuffer.isView(v) || (v && typeof v === 'object') || typeof v === 'function') continue;
  bad.push({ k, v, kinds: [...u.kinds].join('+'), where: u.where });
}
if (process.argv.includes('--names')) { console.log(JSON.stringify(bad.map((b) => b.k))); process.exit(0); }
console.log(`globals used as array/record: ${uses.size}; not an array/object after binding (node): ${bad.length}`);
for (const b of bad) console.log(`  ${b.k} = ${JSON.stringify(b.v)} [${b.kinds}]  <- ${b.where.slice(0, 3).join(', ')}${b.where.length > 3 ? ` … (${b.where.length})` : ''}`);
