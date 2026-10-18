// game/areas/magic_core.js — shared environment + record helpers for the MAGIC area (lane por-build-magic).
// Source of truth: decode/pseudo/MAGIC.pas.md (verified: MAGIC_VERIFY.md, fixes #verify-1..3 applied),
// MAGIC_SCREENS.md, decode/data/SAVES.md, decode/GLOBALS.md, decode/CROSSREF.md; the asm listings
// decode/listings/ov04|ov08|ov15|ov22.lst where the pseudo summarises.
//
// Conventions (same as the COMBAT build, game/areas/combat_core.js, so both areas read alike)
// - Every routine keeps `// SEG:OFF Name` of its pseudo routine; statements keep `// seg:off` where it matters.
// - Records are the ecl.js representation: TChar c = { b: Uint8Array(0x11D), next, items, effects, combat };
//   items { b: Uint8Array(0x3F), next }, effects { b: Uint8Array(9), next }. Fields by offset with the SAVES.md
//   name in a comment: `c.b[0x11B] /* hp */`.
// - Globals: `g.<name>` with the merged names of decode/names/*.json; unnamed ones `g.g_XXXX`. Far pointers
//   are JS references (null = nil). Constant DS tables (spell table DS:31FA, spell names DS:28E9, ...) via ds()/dsW().
// - Calls into other areas / the engine: `X.<PublishedName>(args in Pascal order)` — resolved from the bound
//   functions (bindMagic({ ext })), then the engine module exports; a missing one throws (engine/area request).
// - Turbo Pascal semantics from tp.js (Random LCG, byte/word/shortint wraps); original quirks kept, marked `quirk:`.
// - Routines that wait for input / delay / draw with delays are async.
// - Unknowns: `TODO(decode): ...`.

import * as tp from '../engine/tp.js';
import * as text from '../engine/text.js';
import * as input from '../engine/input.js';
import * as timer from '../engine/timer.js';
import * as pictures from '../engine/pictures.js';
import * as menus from '../engine/menus.js';
import * as audio from '../engine/audio.js';
import { rdW, wrW, pstr, setPstr, newItem, newEffect, newChar } from '../engine/ecl.js';
import { G } from '../engine/state.js';

export { rdW, wrW, pstr, setPstr, newItem, newEffect, newChar };
export const { Random, byte, word, shortint, integer, UpCase } = tp;

// env.g defaults to the engine's shared globals (state.js G) so MAGIC routines called directly by other areas (VIEW
// ExploreCommand -> CastMenu, COMBAT -> BuildSpellList/CastSpell, ...) work before/without the async self-binding in
// magic.js, which later switches g to the VM's eclG when that differs (P1 fix: "Cannot set properties of null").
export const env = { g: G, ext: {} };
const ENGINE_MODULES = [menus, text, input, timer, pictures, tp, audio];

export function bindMagic({ g, ext = {} } = {}) {
  if (g) env.g = g;
  Object.assign(env.ext, ext);
  ensureMagicArrays(env.g);
}

// Array-valued DS globals MAGIC indexes (the shared state may still hold the plain DS word): created once with the
// original's sizes; an array another area already made is never replaced.
export function ensureMagicArrays(gObj) {
  const arrays = {
    RestClock: 7,          // DS:6DC2 7 words (shared with PARTY ov20)
    SpellTargets: 0x29,    // spell target list (far pointers, 1-based; COMBAT/MAGIC)
    sl_Ids: 0x15,          // spell list ids 0..14h (BuildSpellList)
    sl_Items: 0x15,        // spell list item pointers
    SpellHandlers: 68,     // SpellHandlers[0..67] (InitSpellTable)
    TreasureMoney: 7,      // DS:67F4 7 denominations (TREASURE / temple pool)
  };
  for (const [k, n] of Object.entries(arrays))
    if (!Array.isArray(gObj[k])) gObj[k] = new Array(n).fill(k === 'SpellTargets' || k === 'sl_Items' || k === 'SpellHandlers' ? null : 0);
}
ensureMagicArrays(G);

export const X = new Proxy({}, {
  get(_, name) {
    if (name === 'then') return undefined;      // never look like a thenable (an awaited X would hang)
    const f = env.ext[name] ?? ENGINE_MODULES.map((m) => m[name]).find((v) => typeof v === 'function');
    if (!f) return (..._a) => { throw new Error(`magic: missing routine ${String(name)} (engine/area request)`); };
    return f;
  },
});

export const g = new Proxy({}, {
  get(_, k) { return env.g[k]; },
  set(_, k, v) { env.g[k] = v; return true; },
});

export const ds = (off) => env.g.ds[off];
export const dsW = (off) => env.g.ds[off] | (env.g.ds[off + 1] << 8);
export const dsS8 = (off) => tp.shortint(env.g.ds[off]);
export const dsPstr = (off) => { let s = ''; for (let i = 1; i <= env.g.ds[off]; i++) s += String.fromCharCode(env.g.ds[off + i]); return s; };

export const S8 = (b, o) => tp.shortint(b[o]);
export const S16 = (b, o) => tp.integer(rdW(b, o));
export const charName = (c) => pstr(c.b, 0);
export function* chain(p) { for (; p; p = p.next) yield p; }
export const count = (p) => { let n = 0; for (; p; p = p.next) n++; return n; };
// Pascal set test helper: inSet(v, [a, [lo, hi], ...])
export const inSet = (v, items) => items.some((it) => Array.isArray(it) ? v >= it[0] && v <= it[1] : v === it);
