// game/areas/res_00ba.js — resident unit 00BA (lane por-build-res00ba), translated from decode/pseudo/ENGINE.pas.md:
// por-only: Pool translated resident helpers/control flow, DS offsets and record fields (whole module) (profile: engine.areaModules / engine.state / recordSizes; game/profiles/PORONLY.md)
//   part U 00BA:0000..148B -> res_00ba_u.js (derived stats, item names, roster / summary, number strings, ability tables)
//   part V 00BA:1509..30A2 -> res_00ba_v.js (items, messages, combat animation, damage, status line, mode redraw, picker)
// Environment and conventions: res_00ba_core.js. Every other area calls these routines by their published names
// (decode/names/engine_names.json), e.g. X.RedrawCurrentMode(), X.DrawCharacterName(c, col, row, flag).

export { bindRes00ba, env as res00baEnv, ensureDsImage, unexepack, ensureSharedArrays, setEclHostModule, syncDsTables } from './res_00ba_core.js';
export * from './res_00ba_u.js';
export * from './res_00ba_v.js';

import { ensureDsImage, bindRes00ba, setEclHostModule } from './res_00ba_core.js';
import { UnitInit_00BA } from './res_00ba_v.js';

// Self-binding of the routines 00BA calls in other areas (VIEW ov25..ov34, COMBAT, MAGIC, PARTY, ECL host): every
// function the area modules export, by published name; g = ecl_host's eclG when it exists (same storage as state.js G).
const AREA_MODULES = ['./view.js', './combat.js', './magic.js', './party.js', './ecl_host.js', './startup.js', './engine.js'];
let bound = null;
export function ensureRes00baBound() {
  if (!bound) bound = (async () => {
    const ext = {};
    let g = null;
    for (const m of AREA_MODULES) {
      try {
        const mod = await import(m);
        if (m === './ecl_host.js') { setEclHostModule(mod); if (mod.eclG) g = mod.eclG; }
        for (const [k, v] of Object.entries(mod)) if (typeof v === 'function' && !(k in ext)) ext[k] = v;
      } catch { /* area not built yet */ }
    }
    bindRes00ba(g ? { g, ext } : { ext });
  })();
  return bound;
}

// For main.js (engine request #4): bind, make sure the DS image g.ds exists (engine request #1 stand-in) and run the
// unit initialiser 00BA:309E (the original's init chain calls it at 0000:0074).
export async function initRes00ba() {
  await ensureRes00baBound();
  await ensureDsImage();
  await UnitInit_00BA();
}

// Start the binding as soon as the module loads (non-blocking): 00BA routines are also reached directly from other
// areas (e.g. VIEW -> combat ViewMenu -> RedrawCurrentMode -> X.RefreshView) before anything calls initRes00ba().
if (typeof window !== 'undefined') setTimeout(() => { ensureRes00baBound(); }, 0);
