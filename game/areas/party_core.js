// game/areas/party_core.js — shared environment + record helpers for the PARTY area (lane por-build-party).
// Source of truth: decode/pseudo/PARTY.pas.md (verified: PARTY_VERIFY.md, fix #verify-1, #fable-3, #fable-6 applied),
// the per-part working files decode/pseudo/party_parts/<part>.pas.md / _notes.md, PARTY_SCREENS.md, SCREENS_INDEX.md,
// decode/data/SAVES.md, decode/GLOBALS.md, decode/CROSSREF.md; the asm listings decode/listings/ovNN.lst where a
// statement is in doubt (FABLE_CONFIRM §5).
//
// Conventions (same as combat_core.js / magic_core.js, so the areas read alike)
// - Every routine keeps `// SEG:OFF Name` of its pseudo routine; statements keep `// seg:off` where it matters.
// - Records are the state.js / ecl.js shape: TChar c = { b: Uint8Array(0x11D), next, items, effects, combat };
//   items { b: Uint8Array(0x3F), next }, effects { b: Uint8Array(9), next }. Fields by offset with the SAVES.md name:
//   `c.b[0x11B] /* hp */`. The far-pointer bytes inside `b` are not used.
// - Globals: `g.<name>` with the merged names of decode/names/*.json (state.js G resolves `g_XXXX` too). Far pointers
//   are JS references (null = nil). Constant DS tables via ds()/dsW()/dsPstr() from the DS image (G.ds).
// - Calls into other areas / the engine: `X.<PublishedName>(args in Pascal order)` — resolved from the bound functions
//   (bindParty({ ext })), then the engine module exports; a missing one throws `party: missing routine` (engine/area
//   request in STATUS.md).
// - Var parameters across areas are `{ v }` objects; menus return the menus.js shape `{ key, ext }`.
// - Turbo Pascal semantics from tp.js (Random LCG, byte/word/shortint/integer wraps); original quirks kept, marked
//   `quirk:`. Values the original leaves uninitialised: `TODO(decode): garbage` with a fixed choice.
// - Routines that wait for input / delay / draw with delays are async.

import * as tp from '../engine/tp.js';
import * as text from '../engine/text.js';
import * as input from '../engine/input.js';
import * as timer from '../engine/timer.js';
import * as pictures from '../engine/pictures.js';
import * as menus from '../engine/menus.js';
import { G, rdW, wrW, pstr, setPstr, newItem, newEffect, newChar } from '../engine/state.js';

export { rdW, wrW, pstr, setPstr, newItem, newEffect, newChar };
export const { Random, byte, word, shortint, integer, UpCase } = tp;

export const env = { g: G, ext: {} };
const ENGINE_MODULES = [menus, text, input, timer, pictures, tp];

export function bindParty({ g, ext = {} } = {}) {
  if (g) env.g = g;
  Object.assign(env.ext, ext);
}

// X.Name(...): other-area routine or engine export, by published name.
export const X = new Proxy({}, {
  get(_, name) {
    if (name === 'then' || typeof name === 'symbol') return undefined;   // not a thenable (awaiting X must not hang)
    const f = env.ext[name] ?? ENGINE_MODULES.map((m) => m[name]).find((v) => typeof v === 'function');
    if (!f) return (..._a) => { throw new Error(`party: missing routine ${String(name)} (engine/area request)`); };
    return f;
  },
});

// g.name reads/writes the shared globals object.
export const g = new Proxy({}, {
  get(_, k) { return env.g[k]; },
  set(_, k, v) { env.g[k] = v; return true; },
});

// DS image (initialised data + BSS) for constant tables; offset = DS offset.
export const ds = (off) => env.g.ds[off];
export const dsW = (off) => env.g.ds[off] | (env.g.ds[off + 1] << 8);
export const dsS8 = (off) => tp.shortint(env.g.ds[off]);
export const dsPstr = (off) => { let s = ''; for (let i = 1; i <= env.g.ds[off]; i++) s += String.fromCharCode(env.g.ds[off + i]); return s; };

// record helpers
export const S8 = (b, o) => tp.shortint(b[o]);
export const S16 = (b, o) => tp.integer(rdW(b, o));
export const charName = (c) => pstr(c.b, 0);                 // TChar +00h string[15]
export function* chain(p) { for (; p; p = p.next) yield p; }
export const count = (p) => { let n = 0; for (; p; p = p.next) n++; return n; };
// Pascal set test helper: inSet(v, [a, [lo, hi], ...])
export const inSet = (v, items) => items.some((it) => Array.isArray(it) ? v >= it[0] && v <= it[1] : v === it);
// Pascal string helpers: Copy(s, index1, count), Pos(sub, s) (1-based, 0 = not found)
export const Copy = (s, i, n) => s.substr(Math.max(0, i - 1), Math.max(0, n));
export const Pos = (sub, s) => s.indexOf(sub) + 1;

// 9D00:0000 ListItem(n [BP+0Ah], list [BP+6]) in the byte order (VIEW #verify-19): the n-th node (0-based) or nil.
// PARTY's own copy so the call sites stay in Pascal order while engine/menus.js still exports ListItem(list, n)
// (engine request #e4); bound into env.ext by party.js ahead of the menus export.
export function ListItem(n, list) {
  let p = list, k = 0;
  for (; p && k !== n; k++) p = p.next;
  return k === n ? p : null;
}
