// game/areas/magic.js — MAGIC area entry (lane por-build-magic). Translated from decode/pseudo/MAGIC.pas.md:
//   ov04 3400 temple services                                   -> magic_ov04.js
//   ov08 4800 combat round loop, player's turn menu, game speed  -> magic_ov08.js
//   ov15 6B00 camp: rest, memorize, scribe, effects, party options -> magic_ov15.js
//   ov22 8E00 spell lists, casting                               -> magic_ov22.js
//   ov22 8E00 spell handlers (SpellHandlers[id])                 -> magic_spells.js
// Conventions and environment: magic_core.js. Other areas call the exports by their published names.

import { bindMagic as bindCore, env } from './magic_core.js';
export { env };
export * from './magic_ov04.js';
export * from './magic_ov08.js';
export * from './magic_ov15.js';
export * from './magic_ov22.js';
export * from './magic_spells.js';

import * as ov04 from './magic_ov04.js';
import * as ov08 from './magic_ov08.js';
import * as ov15 from './magic_ov15.js';
import * as ov22 from './magic_ov22.js';
import * as spells from './magic_spells.js';
import { G } from '../engine/state.js';
import * as menus from '../engine/menus.js';
import { Temple } from './magic_ov04.js';
import { CombatMain } from './magic_ov08.js';
import { Camp } from './magic_ov15.js';

// Host methods of the ECL VM (game/engine/ecl.js HOST_METHODS) implemented by MAGIC. Call shapes as in ecl.js.
// Each binds the area on first use (ensureMagicBound), as the COMBAT build does.
const bindThen = (f) => async (...a) => { await ensureMagicBound(); return f(...a); };
export const magicHost = {
  temple: bindThen(() => Temple()),          // 3400:0D09 (stub ov04 e1): ECL COMBAT with Mem[6DE2] = 1
  combatMain: bindThen(() => CombatMain()),  // 4800:007A (stub ov08 e1): ECL COMBAT with monsters
  camp: bindThen(() => Camp()),              // 6B00:1E6F (stub ov15 e1): ecl_CampCheck; resolves to the var `done` result
};

// Self-binding: g = the VM's eclG (shared DS globals incl. g_XXXX aliases), else state.js G; ext = the engine menus +
// every routine the other area modules export, by published name (first module wins), MAGIC's own exports on top.
const AREA_MODULES = ['./res_00ba.js', './startup.js', './view.js', './ecl_host.js', './combat.js', './party.js', './engine.js'];
let bound = null;
export function ensureMagicBound() {
  if (!bound) bound = (async () => {
    const ext = { ...menus };
    let g = G;
    for (const m of AREA_MODULES) {
      try {
        const mod = await import(m);
        if (m === './ecl_host.js' && mod.eclG) g = mod.eclG;
        for (const [k, v] of Object.entries(mod)) if (typeof v === 'function' && !(k in ext)) ext[k] = v;
      } catch { /* area not built yet */ }
    }
    bindMagic({ g, ext });
    // MAGIC calls straight into COMBAT (ov13/ov24/ov19) and ENGINE 00BA routines: make sure those areas have their
    // environments bound too (their exported routines read their own `env.g`), otherwise e.g. CombatMain -> COMBAT
    // throws "Cannot read properties of null" (P1, the owner's combat crash).
    for (const [m, f] of [['./combat.js', 'ensureCombatBound'], ['./res_00ba.js', 'ensureRes00baBound']]) {
      try { const mod = await import(m); if (typeof mod[f] === 'function') await mod[f](); } catch { /* area not built */ }
    }
  })();
  return bound;
}

// Bind the area: `g` = the shared globals object, `ext` = routines of other areas / engine by published name.
// MAGIC's own exports are registered too, so the parts' cross-part `X.Name(...)` calls (used to keep each part
// loadable on its own) resolve to the sibling part; MAGIC's own names win over same-named externals.
export function bindMagic({ g, ext = {} } = {}) {
  const own = {};
  for (const m of [ov04, ov08, ov15, ov22, spells])
    for (const [k, v] of Object.entries(m)) if (typeof v === 'function') own[k] = v;
  bindCore({ g, ext: { ...ext, ...own } });
}

// Bind at module load (does not block); host methods still await it.
// Until engine request #qa-7 (main.js calls flow.BindAllAreas) lands, MAGIC — loaded at start-up by every area — starts the
// all-area binding itself (idempotent).
if (typeof window !== 'undefined') setTimeout(() => { ensureMagicBound(); import('./flow.js').then((f) => f.BindAllAreas()).catch(() => {}); }, 0);
