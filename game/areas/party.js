// game/areas/party.js — PARTY area entry (lane por-build-party). Translated from decode/pseudo/PARTY.pas.md:
//   ov16 7000 part A: FreeCharacter, PartyCreationMenu (PM-01), CreateCharacter (PM-03..05)      -> party_ov16a.js
//   ov16 7000 part B: Drop, Modify, Train, Add/Remove, portraits, icon editor (PM-06..12)       -> party_ov16b.js
//   ov17 7500 charlist, character / monster files, load / save game (PM-13, SV-01)               -> party_ov17.js
//   ov20 8400 clock, rest                                                                         -> party_ov20.js
//   ov21 8900 encumbrance, coins, pool / share / take, treasure items, appraisal (CH-09/10)       -> party_ov21.js
//   ov06 3E00 shop                                                                                -> party_ov06.js
//   ov12 5C00 active-effect handlers + InstallEffectHandlers                                     -> party_ov12.js
//   ov00/ov01/ov02/ov11 (heap error, title, credits, code wheel, InitGameState)                   -> startup.js (M1, build-engine)
// Conventions and the environment: party_core.js. Other areas call the exports by their published names.

export { bindParty, env } from './party_core.js';
export * from './party_ov16a.js';
export * from './party_ov16b.js';
export * from './party_ov17.js';
export * from './party_ov20.js';
export * from './party_ov21.js';
export * from './party_ov06.js';
export * from './party_ov12.js';

import { bindParty, env, ListItem } from './party_core.js';
import { G, newChar, newItem } from '../engine/state.js';
import * as menus from '../engine/menus.js';
import * as A from './party_ov16a.js';
import * as B from './party_ov16b.js';
import * as F from './party_ov17.js';
import * as R from './party_ov20.js';
import * as M from './party_ov21.js';
import * as S from './party_ov06.js';
import * as E from './party_ov12.js';

// Self-binding (as combat.js): g = the VM's eclG (shared DS globals incl. the g_XXXX aliases and the text-cursor
// redirects), falling back to state.js G; ext = the PARTY parts first (so PARTY's own routines win), then every routine
// exported by the engine menus and the other area modules that exist, by published name. Run once, on first use.
const OWN = [A, B, F, R, M, S, E];
const AREA_MODULES = ['./res_00ba.js', './startup.js', './view.js', './ecl_host.js', './combat.js', './magic.js', '../engine/ecl.js',
  '../engine/text.js', '../engine/input.js', '../engine/timer.js', '../engine/tp.js', '../engine/pictures.js', '../engine/dax.js',
  '../engine/files.js'];
let bound = null;
let isBound = false;
export function ensurePartyBound() {
  if (isBound) return Promise.resolve();
  if (!bound) bound = (async () => {
    const ext = {};
    for (const m of OWN) for (const [k, v] of Object.entries(m)) if (typeof v === 'function' && !(k in ext)) ext[k] = v;
    ext.ListItem = ListItem;                                      // byte order (n, list), see party_core.js / #e4
    for (const [k, v] of Object.entries(menus)) if (typeof v === 'function' && !(k in ext)) ext[k] = v;
    let g = G;
    for (const p of AREA_MODULES) {
      try {
        const mod = await import(p);
        if (p === './ecl_host.js' && mod.eclG) g = mod.eclG;
        if (p === './res_00ba.js' && typeof mod.ensureRes00baBound === 'function') await mod.ensureRes00baBound();
        for (const [k, v] of Object.entries(mod)) if (typeof v === 'function' && !(k in ext)) ext[k] = v;
      } catch { /* area not built yet */ }
    }
    bindParty({ g, ext });
    isBound = true;
  })();
  return bound;
}

const bindThen = (f) => async (...a) => { await ensurePartyBound(); return f(...a); };

// Entry points other modules call directly (main.js, build-qa): bind first, then run the translated routine.
export const PartyCreationMenu = bindThen(() => A.PartyCreationMenu());          // 7000:0161 (main 0000:0127, ECL PROGRAM 0)
export const TrainCharacter = bindThen(() => B.TrainCharacter());                // 7000:29AE (party request #qa-3)
export const InstallEffectHandlers = bindThen((g) => E.InstallEffectHandlers(g ?? env.g));   // 5C00:31A2 (InitGameState 5700:060c)

// Host methods of the ECL VM (game/engine/ecl.js HOST_METHODS) implemented by PARTY. Call shapes as in ecl.js.
export const partyHost = {
  partyCreationMenu: bindThen(() => A.PartyCreationMenu()),                      // 7000:0161 (ECL PROGRAM 0)
  removeFromParty: bindThen((a, b) => B.RemoveFromParty(a, b)),                  // 7000:3291 (2F00:038E)
  loadMonster: bindThen(async (id) => { const c = newChar(); await F.LoadMonster(id & 0xFF, c); return c; }),   // 7500:0EC4
  addNpcToParty: bindThen((id) => F.AddNpcToParty(id & 0xFF)),                   // 7500:1262
  checkEclDisk: bindThen((name) => F.CheckEclDisk(name)),                        // 7500:22D5
  advanceClock: bindThen((count, unit) => R.AdvanceClock(count, unit)),          // 8400:03D5
  makeTreasureItem: bindThen((typ) => M.MakeTreasureItem(typ, newItem())),       // 8900:1010 (2F00:1CCD)
  shop: bindThen(() => S.Shop()),                                                // 3E00:053E (ECL COMBAT with Mem[6E6C] = 1)
};
