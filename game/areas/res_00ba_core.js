// game/areas/res_00ba_core.js — shared environment for the resident unit 00BA (lane por-build-res00ba).
// por-only: Pool translated resident helpers/control flow, DS offsets and record fields (whole module) (profile: engine.areaModules / engine.state / recordSizes; game/profiles/PORONLY.md)
// Source of truth: decode/pseudo/ENGINE.pas.md sections "res_00BA part U" (00BA:0000..148B) and "part V" (1509..309E);
// decode/data/SAVES.md (TChar 285 B, item 63 B, effect 9 B, ITEMS DS:5582); decode/GLOBALS.md; decode/CROSSREF.md.
//
// Conventions (same as game/areas/combat_core.js so all areas read alike)
// - Every routine keeps `// 00BA:OOOO` of its pseudo routine; statements keep `{ 00ba:oooo }` where it matters.
// - Records = the ecl.js representation: TChar c = { b: Uint8Array(0x11D), next, items, effects, combat, readied };
//   items { b: Uint8Array(0x3F), next }, effects { b: Uint8Array(9), next }; fields by offset with the SAVES.md name
//   in a comment: `c.b[0x10C] /* status */`. `c.readied[0..12]` = readied item references (+E0h..+10Fh far pointers;
//   readied[11]/[12] = arrows/quarrels at +F8h/+FCh), kept by RecalcCharacter.
// - Globals: `g.<name>` = merged names of decode/names/*.json (GLOBALS.md); unnamed `g.g_XXXX`. g defaults to state.js
//   G (synchronous use from any area); bindRes00ba({ g }) may switch it to ecl_host's eclG (same storage + aliases).
// - Constant DS tables (string tables 0D38/0F03/0F53/0FEC/1047/10A7, ITEMS DS:5582, ability tables): ds()/dsW()/
//   dsPstr() on g.ds = DS 0C7C image (0x8760 bytes). ensureDsImage() fills g.ds if the engine has not (engine request #1).
// - Calls to other areas / engine routines: `X.PublishedName(args in Pascal order)` (engine modules first, then routines
//   registered by bindRes00ba({ ext })); a missing one throws "missing routine".
// - TP semantics via tp.js (Random, byte/word/shortint/integer wraps, UpCase, Str); quirks kept and marked `quirk:`;
//   unknowns `TODO(decode)`. Async only where the routine waits (keys, delays) or calls an async routine.

import * as tp from '../engine/tp.js';
import * as text from '../engine/text.js';
import * as input from '../engine/input.js';
import * as timer from '../engine/timer.js';
import * as pictures from '../engine/pictures.js';
import * as menus from '../engine/menus.js';
import * as dax from '../engine/dax.js';
import { G } from '../engine/state.js';
import { rdW, wrW, pstr, setPstr, newItem, newEffect, newChar } from '../engine/ecl.js';

export { rdW, wrW, pstr, setPstr, newItem, newEffect, newChar, G };
export const { Random, byte, word, shortint, integer, UpCase } = tp;

export const env = { g: G, ext: {} };

// ---- array-valued DS globals (combat fix request #p1-2) ------------------------------------------------------------
// The shared state may still hold the plain DS word for globals the code indexes (g.X[i]); every array global used by
// combat_*.js and res_00ba*.js is created here once, at module load, with the original's size (1-based where the code
// is) and the original's initial value: all of them are BSS in the image (GLOBALS.md init = bss) -> 0 / nil.
// An array another area already made is never replaced. Checked by game/test/combat/arrays.test.mjs (scans the sources).
const MAX_COMBATANTS = 72;     // 4-byte combatant records from DS:5F27; cb_ScrCol DS:604A..cb_ScrRow DS:6092 = 48h bytes
const blank = (n, v) => Array.from({ length: n }, () => (typeof v === 'function' ? v() : v));
const SHARED_ARRAYS = {
  cb_Char:  () => blank(MAX_COMBATANTS + 1, null),   // DS:65B9 + 4n, combatant n -> TChar (1-based)
  cb_Col:   () => blank(MAX_COMBATANTS + 1, 0),      // DS:5F27 + 4n map x
  cb_Row:   () => blank(MAX_COMBATANTS + 1, 0),      // DS:5F28 + 4n map y
  cb_Index: () => blank(MAX_COMBATANTS + 1, 0),      // DS:5F29 + 4n
  cb_Size:  () => blank(MAX_COMBATANTS + 1, 0),      // DS:5F2A + 4n icon size (0 = removed)
  cb_ScrCol: () => blank(MAX_COMBATANTS + 1, 0),     // DS:604A + n screen column
  cb_ScrRow: () => blank(MAX_COMBATANTS + 1, 0),     // DS:6092 + n screen row
  foe_List: () => blank(MAX_COMBATANTS + 1, 0),      // DS:6DE4 + n combatant indices (1-based)
  tg_List:  () => blank(MAX_COMBATANTS + 1, () => ({ who: 0, dist: 0, dir: 0 })),   // DS:6718 + 3n (VIEW ov30 shape)
  BodyList: () => blank(9, () => ({ char: null, x: 0, y: 0, ground: 0 })),            // DS:66DD + 7k, k = 1..8 (VIEW ov31 shape)
  SlotHits: () => blank(3, 0),                       // DS:6823/6824 = [1], [2]
  SlotSwings: () => blank(3, 0),                     // DS:6E2D/6E2E = [1], [2]
  side_ActiveCount: () => blank(2, 0),               // DS:6814/6815 = [side 0], [side 1]
  EffectHandler: () => blank(0x60, null),            // DS:682C + 4t far procs (filled by PARTY ov12 InstallEffectHandlers)
  TreasureMoney: () => blank(7, 0),                  // DS:67F4 7 coin kinds (same size as magic_core)
  SpellTargets: () => blank(0x29, null),             // DS:6C95 far pointers, 1-based (same size as magic_core)
};
// ECL memory regions are the VM's own arrays (EclVM mem4900/mem6B00/mem9700): getters onto the live VM, never copies.
// Before the VM exists (node tests) they read a private buffer of the same size.
let eclHostNs = null;
export function setEclHostModule(ns) { eclHostNs = ns; }
const VM_REGIONS = { ecl_Mem4900: ['mem4900', 0x400], ecl_Mem6B00: ['mem6B00', 0x400], ecl_Mem9700: ['mem9700', 0x200] };

export function ensureSharedArrays(gObj) {
  for (const [k, make] of Object.entries(SHARED_ARRAYS))
    if (!Array.isArray(gObj[k])) gObj[k] = make();
  for (const [k, [prop, n]] of Object.entries(VM_REGIONS)) {
    const own = Object.getOwnPropertyDescriptor(gObj, k);
    if (own && own.get) continue;
    if (gObj[k] instanceof Uint16Array) continue;
    const fallback = new Uint16Array(n);
    Object.defineProperty(gObj, k, {
      configurable: true, enumerable: true,
      get() { return eclHostNs?.vm?.[prop] ?? fallback; },
      set(v) { if (v instanceof Uint16Array && eclHostNs?.vm) eclHostNs.vm[prop] = v; },
    });
  }
}
ensureSharedArrays(G);
const ENGINE_MODULES = [menus, text, input, timer, pictures, dax, tp];

export function bindRes00ba({ g, ext = {} } = {}) {
  if (g) { env.g = g; ensureSharedArrays(g); }
  Object.assign(env.ext, ext);
}

export const X = new Proxy({}, {
  get(_, name) {
    const f = ENGINE_MODULES.map((m) => m[name]).find((v) => typeof v === 'function') ?? env.ext[name];
    if (!f) return (..._a) => { throw new Error(`res_00ba: missing routine ${String(name)} (engine/area request)`); };
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
export const inSet = (v, items) => items.some((it) => Array.isArray(it) ? v >= it[0] && v <= it[1] : v === it);

// ---- DS image (engine request #1 stand-in): EXEPACK unpack of /data/START.EXE (= decode/tools/unexepack.py, 0 diff) ----
export function unexepack(raw) {
  const u16 = (b, o) => b[o] | (b[o + 1] << 8);
  const hdr = u16(raw, 8) * 16;
  const cblp = u16(raw, 2), cp = u16(raw, 4);
  const size = cblp ? (cp - 1) * 512 + cblp : cp * 512;
  const lm = raw.subarray(hdr, size);
  const cs = u16(raw, 0x16), eh = cs * 16;
  const destLen = u16(lm, eh + 12), skipLen = lm[eh + 16] === 0x52 ? u16(lm, eh + 14) : 1;
  const srcEnd = cs * 16 - (skipLen - 1) * 16;
  const buf = new Uint8Array(Math.max(destLen * 16, srcEnd));
  buf.set(lm.subarray(0, srcEnd));
  let s = srcEnd - 1, pad = 0;
  while (buf[s] === 0xFF && pad < 16) { s--; pad++; }
  let d = destLen * 16 - 1;
  for (;;) {
    const cmd = buf[s--];
    const len = (buf[s] << 8) | buf[s - 1]; s -= 2;
    if ((cmd & 0xFE) === 0xB0) { const f = buf[s--]; for (let i = 0; i < len; i++) buf[d--] = f; }
    else if ((cmd & 0xFE) === 0xB2) { for (let i = 0; i < len; i++) buf[d--] = buf[s--]; }
    else throw new Error('EXEPACK: bad command ' + cmd.toString(16));
    if (cmd & 1) break;
  }
  return buf.subarray(0, destLen * 16);
}

// ITEMS type table: the original BlockReads the ITEMS file (from offset 2, 810h bytes) to DS:5582 at startup
// (ov11 InitGameState 5700:05DB, SAVES.md §6); the engine keeps it in G.ItemTypeTable -> mirror it into the image.
export function syncDsTables() {
  const d = env.g.ds, it = env.g.ItemTypeTable;
  if (d && it) d.set(it.subarray(0, 0x810), 0x5582);
}

export async function ensureDsImage() {
  if (env.g.ds) { syncDsTables(); return env.g.ds; }
  const exe = await dax.fetchFile('START.EXE');
  if (!exe) throw new Error('START.EXE not served under /data/');
  const img = unexepack(exe);
  const d = new Uint8Array(0x8760);
  d.set(img.subarray(0xC7C0, Math.min(img.length, 0xC7C0 + 0x8760)));
  env.g.ds = d;
  syncDsTables();
  return d;
}
