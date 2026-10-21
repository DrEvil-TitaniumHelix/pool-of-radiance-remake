// game/areas/view_ov23.js — VIEW ov23 (9300): level-dependent character statistics (class logic placed in VIEW by the
// por-only: Pool GEO/wall/picture layouts, asset names and travel rendering (whole module) (profile: engine.areaModules / daxGroups / areas; game/profiles/PORONLY.md)
// area map). Owner: por-build-ecl. Source: decode/pseudo/VIEW.pas.md ov23 (verified), every routine re-read from
// decode/listings/ov23.lst (9300:0000..045d). Tables are DS image data (view.g.ds).
// Findings from the bytes (VIEW.pas.md names the fields loosely):
//  - "level_main" is TChar +73h (signed compare, 9300:0069); fighter attacks are +A1h (9300:0086 / 0094).
//  - level, thief level (+9Ch) and race (+2Eh) are sign-extended (CBW) before indexing; the THAC0 / saves / slot
//    comparisons are unsigned (JBE).
//  - UpdateThiefSkills: when the racial adjustment is negative and larger than the base, the skill is 0 and the DEX
//    adjustment is skipped (9300:03a6 jumps to the loop end); otherwise skill := base + raceAdj (+ DEX adj for k < 6).
// TChar offsets (SAVES.md §3): wis +12h, dex +13h, base_thac0 +2Dh, race +2Eh, known_spell +32h+id, save[0..4] +6Dh..+71h,
// +73h, thief skills +77h..+7Eh (+76h+k), level[0..7] +96h..+9Dh, attacks +A1h, spell slots +B2h..+B7h (+B1h+k / +B4h+k).

import { view } from './view.js';

const sx8 = (v) => ((v & 0xFF) ^ 0x80) - 0x80;
const ds = (o) => view.g.ds[o & 0xFFFF];

// 9300:0000 UpdateLevelStats(c)
export function UpdateLevelStats(c) {
  const b = c.b;
  b[0x2D] = 0;                                                             // 9300:0009
  for (let cls = 0; cls <= 7; cls++) {
    const lvl = sx8(b[0x96 + cls]);                                        // 9300:001b
    const t = ds(0x3C7C + cls * 11 + lvl);                                 // g_3C7C (60 - THAC0)
    if (t > b[0x2D]) b[0x2D] = t;                                          // 9300:003b / 005b unsigned
    if (sx8(b[0x73]) < lvl) b[0x73] = lvl & 0xFF;                          // 9300:0069 / 0078 signed
    if (cls === 2) b[0xA1] = lvl > 6 ? 3 : 2;                              // 9300:0086 / 0094 fighter attacks
    else if (cls === 0) {
      if (lvl > 1) {                                                       // 9300:00a7 cleric
        for (let k = 1; k <= 3; k++) b[0xB1 + k] = ds(0x40BC + lvl * 3 + k);   // 9300:00cd
        WisdomBonusSpells(c);                                              // 9300:00ec
        for (let id = 1; id <= 0x38; id++) {                               // 9300:00f5
          const p = 0x31FA + id * 16;                                      // spell table entry
          if (ds(p) === 0 && b[0xB1 + sx8(ds(p + 1))] > 0) b[0x32 + id] = 1;   // 9300:0103..0133
        }
      }
    } else if (cls === 5 && lvl > 1)                                       // 9300:0142 magic-user
      for (let k = 1; k <= 3; k++) b[0xB4 + k] = ds(0x41D4 + lvl * 3 + k); // 9300:0169
  }
  UpdateSaves(c);                                                          // 9300:0191
  if (sx8(b[0x9C]) > 0) UpdateThiefSkills(c);                              // 9300:0197 / 01a6
}

// 9300:01AF WisdomBonusSpells(c): AD&D bonus cleric spells, only for slots already non-zero
export function WisdomBonusSpells(c) {
  const b = c.b, wis = b[0x12];
  if (wis > 12 && b[0xB2] > 0) b[0xB2] = (b[0xB2] + 1) & 0xFF;             // 9300:01c1
  if (wis > 13 && b[0xB2] > 0) b[0xB2] = (b[0xB2] + 1) & 0xFF;             // 9300:01de
  if (wis > 14 && b[0xB3] > 0) b[0xB3] = (b[0xB3] + 1) & 0xFF;             // 9300:01fb
  if (wis > 15 && b[0xB3] > 0) b[0xB3] = (b[0xB3] + 1) & 0xFF;             // 9300:0218
  if (wis > 16 && b[0xB4] > 0) b[0xB4] = (b[0xB4] + 1) & 0xFF;             // 9300:0235
}

// 9300:0255 UpdateSaves(c): save[k] := min over classes with level > 0 of g_426E[cls*45 + lvl*5 + k], from 20
export function UpdateSaves(c) {
  const b = c.b;
  for (let k = 0; k <= 4; k++) {
    b[0x6D + k] = 0x14;                                                    // 9300:026f
    for (let cls = 0; cls <= 7; cls++) {
      const lvl = sx8(b[0x96 + cls]);
      if (lvl <= 0) continue;                                              // 9300:0287 signed
      const v = ds(0x426E + cls * 45 + lvl * 5 + k);                       // 9300:02bd
      if (b[0x6D + k] > v) b[0x6D + k] = v;                                // 9300:02c9 unsigned
    }
  }
}

// 9300:0329 UpdateThiefSkills(c)
export function UpdateThiefSkills(c) {
  const b = c.b;
  const race = sx8(b[0x2E]), tl = sx8(b[0x9C]);
  for (let k = 1; k <= 8; k++) {
    const raceAdj = sx8(ds(0x3D3B + race * 8 + k));                        // g_3D3B 9300:0358
    const base = ds(0x3CF3 + tl * 8 + k);                                  // g_3CF3 9300:0377
    if (raceAdj < 0 && Math.abs(raceAdj) > base) { b[0x76 + k] = 0; continue; }   // 9300:039a / 03ac quirk: no DEX adj
    b[0x76 + k] = (base + raceAdj) & 0xFF;                                 // 9300:03f0
    if (k < 6) b[0x76 + k] = (b[0x76 + k] + sx8(ds(0x3D4E + b[0x13] * 5 + k))) & 0xFF;   // 9300:03f4..044b DEX
  }
}
