// game/areas/combat_core.js — shared environment + record helpers for the COMBAT area (lane por-build-combat).
// Source of truth: decode/pseudo/COMBAT.pas.md (+ combat_parts/<unit>_notes.md), decode/data/SAVES.md,
// decode/GLOBALS.md, decode/CROSSREF.md. Every routine in the combat_ovNN.js parts keeps `// SEG:OFF` of its
// pseudo routine; statements keep `{ seg:off }`-style address comments where it matters.
//
// Conventions for all combat_*.js parts
// - Records are the ecl.js representation: TChar c = { b: Uint8Array(0x11D), next, items, effects, combat }
//   (+104h next, +C8h items, +7Fh effects and +108h combat-record far pointers are JS references; the bytes at
//   those offsets are not used). Items { b: Uint8Array(0x3F), next }, effects { b: Uint8Array(9), next },
//   combat record cr(c) = c.combat = { b: Uint8Array(0x16) } (22 bytes, COMBAT.pas.md ov09 table / ov13).
//   Fields are accessed by offset with the SAVES.md name in a comment: `c.b[0x10C] /* status */`.
// - Globals: `g.<name>` with the merged names of decode/names/*.json (GLOBALS.md "name" column); a global
//   without a real name is `g.g_XXXX`. Far-pointer globals hold JS references (null = nil). DS tables that are
//   initialised data in the image (constants, e.g. DS:0447 turn-undead table, DS:5582 ITEMS) are read with
//   ds()/dsW() from the DS image (state.js provides g.ds = Uint8Array(0x8760) of DS 0C7C, engine request #1).
// - Calls into other areas / the engine: `X.<PublishedName>(args in Pascal order)`. X resolves a bound
//   function (bindCombat({ ext })) first, then an engine module export of that name; a missing one throws.
// - Turbo Pascal semantics: Random(n) from tp.js (exact LCG); byte/word/shortint/integer wraps from tp.js
//   wherever the original stores into a byte or word (keep the original's quirks, mark them `quirk:`).
// - Every routine is async when it (transitively) waits for input, delays or draws with delays; pure
//   computations stay synchronous.
// - Unknowns: `TODO(decode): ...`; values the original leaves uninitialised are fixed and marked
//   `TODO(decode): garbage`.

import * as tp from '../engine/tp.js';
import * as text from '../engine/text.js';
import * as input from '../engine/input.js';
import * as timer from '../engine/timer.js';
import * as pictures from '../engine/pictures.js';
import * as menus from '../engine/menus.js';
import { G } from '../engine/state.js';
import * as res00ba from './res_00ba.js';
import { rdW, wrW, pstr, setPstr, newItem, newEffect } from '../engine/ecl.js';

export { rdW, wrW, pstr, setPstr, newItem, newEffect };
export const { Random, byte, word, shortint, integer, UpCase } = tp;

// ---- environment --------------------------------------------------------------------------------------
// g defaults to state.js G (synchronous use from any entry point, e.g. VIEW calling ViewMenu); ensureCombatBound()
// switches to ecl_host's eclG (same storage + the g_XXXX aliases the VM uses) and registers the other areas' routines.
export const env = { g: G, ext: {} };
const ENGINE_MODULES = [menus, text, input, timer, pictures, tp, res00ba];

export function bindCombat({ g, ext = {} }) {
  if (g) { env.g = g; res00ba.ensureSharedArrays(g); }
  Object.assign(env.ext, ext);
}

// Self-binding: every function exported by the other area modules, by published name (first module wins), and
// g = eclG when the ECL host exists. Started when this module loads (does not block), awaited by the host methods.
const AREA_MODULES = ['./view.js', './ecl_host.js', './magic.js', './party.js', './startup.js', './engine.js'];
let bound = null;
export function ensureCombatBound() {
  if (!bound) bound = (async () => {
    const ext = {};
    let eg = null;
    for (const m of AREA_MODULES) {
      try {
        const mod = await import(m);
        if (m === './ecl_host.js') { res00ba.setEclHostModule(mod); if (mod.eclG) eg = mod.eclG; }
        for (const [k, v] of Object.entries(mod)) if (typeof v === 'function' && !(k in ext)) ext[k] = v;
      } catch { /* area not built yet */ }
    }
    for (const [k, v] of Object.entries(ext)) if (!(k in env.ext)) env.ext[k] = v;
    if (eg && env.g === G) env.g = eg;
  })();
  return bound;
}
if (typeof window !== 'undefined') setTimeout(() => { ensureCombatBound(); }, 0);

// X.Name(...): other-area routine or engine export, by published name.
export const X = new Proxy({}, {
  get(_, name) {
    const f = env.ext[name] ?? ENGINE_MODULES.map((m) => m[name]).find((v) => typeof v === 'function');
    if (!f) return (...a) => { throw new Error(`combat: missing routine ${String(name)} (engine/area request)`); };
    return f;
  },
});

// globals proxy: g.name reads/writes env.g
export const g = new Proxy({}, {
  get(_, k) { return env.g[k]; },
  set(_, k, v) { env.g[k] = v; return true; },
});

// DS image (initialised data + BSS) for constant tables; offset = DS offset.
export const ds = (off) => env.g.ds[off];
export const dsW = (off) => env.g.ds[off] | (env.g.ds[off + 1] << 8);
export const dsS8 = (off) => tp.shortint(env.g.ds[off]);
export const dsPstr = (off) => { let s = ''; for (let i = 1; i <= env.g.ds[off]; i++) s += String.fromCharCode(env.g.ds[off + i]); return s; };

// ---- record helpers -----------------------------------------------------------------------------------
export const S8 = (b, o) => tp.shortint(b[o]);
export const S16 = (b, o) => tp.integer(rdW(b, o));
export const cr = (c) => c.combat;                       // TChar +108h far pointer to the combat record
export const charName = (c) => pstr(c.b, 0);             // TChar +00h string[15]

// Linked lists (TP far-pointer chains): iterate / count.
export function* chain(p) { for (; p; p = p.next) yield p; }
export const count = (p) => { let n = 0; for (; p; p = p.next) n++; return n; };
