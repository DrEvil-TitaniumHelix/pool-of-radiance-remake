// game/areas/combat.js — COMBAT area entry (lane por-build-combat). Translated from decode/pseudo/COMBAT.pas.md:
// por-only: Pool combat fields, monster/icon loading, terrain and AD&D rules (whole module) (profile: engine.areaModules / recordSizes / daxGroups; game/profiles/PORONLY.md)
//   ov05 3900 combat outcome, XP, treasure      -> combat_ov05.js
//   ov09 4D00 computer-controlled combat turn    -> combat_ov09.js
//   ov13 6100 actions: initiative, attacks, turn undead, flee, targeting -> combat_ov13.js
//   ov18 7A00 dragon finale                      -> combat_ov18.js
//   ov19 7F00 character sheet / items / coins / spell list (party UI living in this unit) -> combat_ov19.js
//   ov24 9800 effects, saving throw, attack roll, damage, healing, Roll -> combat_ov24.js
// ov07 (4300) is canonical in ECL (game/engine/ecl.js), see decode/CROSSREF.md §1.
// Conventions and the environment: combat_core.js. Other areas call the exports by their published names.

export { bindCombat, env } from './combat_core.js';
export * from './combat_ov05.js';
export * from './combat_ov09.js';
export * from './combat_ov13.js';
export * from './combat_ov18.js';
export * from './combat_ov19.js';
export * from './combat_ov24.js';

import { ensureCombatBound } from './combat_core.js';
export { ensureCombatBound };
import { Roll, SavingThrow, AttackRollVsAC } from './combat_ov24.js';
import { AfterCombat } from './combat_ov05.js';
import { DragonFinale, RecolourOverlandTiles } from './combat_ov18.js';

// Host methods of the ECL VM (game/engine/ecl.js HOST_METHODS) implemented by COMBAT. Call shapes as in ecl.js.
const bindThen = (f) => async (...a) => { await ensureCombatBound(); return f(...a); };
export const combatHost = {
  roll: bindThen((count, sides) => Roll(count, sides)),                          // 9800:0DE3 (stub ov24 e8)
  savingThrow: bindThen((c, saveType, bonus) => SavingThrow(c, saveType, bonus)), // 9800:0D63 (stub ov24 e7)
  attackRollVsAC: bindThen((c, ac) => AttackRollVsAC(c, ac)),                    // ov24 AttackRollVsAC (ecl_op2E_Damage)
  afterCombat: bindThen(() => AfterCombat()),                                    // 3900:1527 (stub ov05 e1)
  dragonFinale: bindThen(() => DragonFinale()),                                  // 7A00:02A4 (stub ov18 e1, ECL PROGRAM 8)
  recolourOverlandTiles: bindThen((animate) => RecolourOverlandTiles(animate)),  // 7A00:06B3
};
