// game/areas/combat_ov24.js — COMBAT ov24 (seg 9800): effects (conditions), effect hooks, saving throw, to-hit roll,
// por-only: Pool combat fields, monster/icon loading, terrain and AD&D rules (whole module) (profile: engine.areaModules / recordSizes / daxGroups; game/profiles/PORONLY.md)
// damage, healing, Roll. Lane por-build-combat. Source: decode/pseudo/COMBAT.pas.md "## ov24 (seg 9800)" (FINAL,
// verified), combat_parts/ov24_notes.md, COMBAT_SCREENS.md (COMBAT-61..72); evidence decode/listings/ov24.lst.
// Conventions: combat_core.js header. Every routine keeps its `// 9800:OOOO`, statements their `{ 9800:xxxx }`.
//
// Local conventions of this part (needed by the bindings in combat.js / other areas):
// - Pascal `var` parameters are passed as ref objects `{ v }` (HasEffect(c, type, ref), ProbeMove(c, dir, refOcc,
//   refTile), DecodeStrength(e, refStr, refExc), SetStrength(..., refOldCode)).
// - Effect handler table EffectHandler{g_682C} (published name, GLOBALS.md DS:682C; entry t at DS:6828+4t) =
//   `g.EffectHandler`, a JS array indexed by effect type of `async (c, e, mode)` functions, filled by ov12
//   InstallEffectHandlers (ov12_31A2). Hooks talk through the globals g.AttackRollValue, g.SaveRoll, g.SaveType,
//   g.DamageAmount, g.DamageType, g.EffectToApply, g.LastDiceCount (stored as raw bytes, read with byte/shortint).
// - ecl_Mem6B00^ (DS:49D6, the VM's region 1) = `g.ecl_Mem6B00`, the VM's Uint16Array `mem6B00`
//   (word at byte offset x = element x >> 1). TODO(decode): engine binding must set g.ecl_Mem6B00 = vm.mem6B00.
// - Target list tg_List (DS:6718 + 3n) = `g.tg_List[n] = { who, dist, dir }`, n = 1..g.tg_Count (VIEW lane);
//   cb_Size (DS:5F2A + 4n) = `g.cb_Size[n]`.

import { g, ds, X, S8, cr, rdW, wrW, newEffect, Random, byte, shortint } from './combat_core.js';

// TChar fields (SAVES.md §3)
const STR = 0x10, STR_EXC = 0x16, HP_MAX = 0x32, SAVE = 0x6D, AC_ITEM_BONUS = 0x101, STATUS = 0x10C, ACTIVE = 0x10D,
  SIDE = 0x10E, THAC0 = 0x110, AC = 0x111, HP = 0x11B;
// TEffect fields (SAVES.md §5): type +0, duration +1 (word), p3 +3, callOnRemove +4, next +5 (JS ref)
const E_TYPE = 0, E_DUR = 1, E_P3 = 3, E_CALL = 4;

const eclB = (off) => (g.ecl_Mem6B00[off >> 1] >> ((off & 1) * 8)) & 0xFF;   // ecl_Mem6B00^[off] (byte)

// 9800:0000 CallEffectHandler
export async function CallEffectHandler(type, c, e, mode) {
  const h = g.EffectHandler?.[type];                                       // { 9800:0003  CALLF [type*4 + 6828h] }
  // TODO(decode): type 58h (and 0) have no entry: the original calls 0000:0000 (never reached by the hook lists).
  if (!h) throw new Error(`CallEffectHandler: no handler for effect type ${type.toString(16)}h`);
  await h(c, e, mode);
}

// 9800:0026 RemoveEffect
export async function RemoveEffect(c, type, e) {
  let p = e;                                                               // { 9800:002c }
  if (p === null || p === undefined) {                                     // { 9800:0038 }
    p = c.effects;                                                         // { 9800:0040 }
    while (p && p.b[E_TYPE] !== type) p = p.next;                          // { 9800:0052 }
  }
  if (!p) return;                                                          // { 9800:0078 }
  // quirk: with e given, the handler of the parameter `type` is called even if e^.type differs.
  if (p.b[E_CALL] !== 0) await CallEffectHandler(type, c, p, 1);           // { 9800:0083 / 008d }
  if (c.effects === p) c.effects = p.next;                                 // { 9800:00a4 / 00ba }
  else {
    let q = c.effects;                                                     // { 9800:00d3 }
    while (q && q.next !== p) q = q.next;                                  // { 9800:00e5 }
    q.next = p.next;                                                       // { 9800:0115 }
  }
  // FreeMem(p, 9)                                                         { 9800:012b }
}

// 9800:0160 RunEffectIfActive
export async function RunEffectIfActive(c, type) {
  let found = false;                                                       // { 9800:0167 }
  let m = g.PartyHead;                                                     // { 9800:016c }
  const e = { v: null };
  if (await X.HasEffect(c, type, e)) found = true;                         // { 9800:017b / 0194 }
  else if ([0x15, 0x2D, 0x2E, 0x31].includes(type)) {                      // { 9800:019c  set CS:0140 }
    // Move(g_671B, saved, $D8): 72 entries of 3 bytes; quirk: tg_Count (g_671A) is not saved/restored.
    const saved = [];                                                      // { 9800:01af }
    for (let i = 1; i <= 72; i++) saved[i] = g.tg_List?.[i] ? { ...g.tg_List[i] } : undefined;
    while (m && !found) {                                                  // { 9800:01c3 }
      if (await X.HasEffect(m, type, e)) {                                 // { 9800:01da }
        if (g.game_Mode === 5) {                                           // { 9800:01f8 }
          const range = type === 0x31 ? 6 : 1;                             // { 9800:0202 }
          await X.BuildTargetList(await X.CombatantCol(m), await X.CombatantRow(m), range, 0xFF,
            await X.CombatantSize(m), g.cm_Map);                           // { 9800:0214 }
          const me = await X.CombatantIndex(c);
          for (let i = 1; i <= g.tg_Count; i++)                            // { 9800:0255 }
            if (g.tg_List[i].who === me) found = true;                     // { 9800:026e }
        } else found = true;                                               // { 9800:02a2 }
      }
      m = m.next;                                                          // { 9800:02a7 }
    }
    for (let i = 1; i <= 72; i++) if (saved[i]) g.tg_List[i] = saved[i];   // { 9800:02c0 }
  }
  if (found) await CallEffectHandler(type, c, e.v, 0);                     // { 9800:02d4  e = the member's effect }
}

// 9800:02FA CallEffectHooks — event -> effect types (case chain 9800:0300..0AB5)
const HOOK_LISTS = {
  0x00: [0x7E],                                                                         // { 9800:0307 }
  0x01: [0x3F, 0x25, 0x19, 0x47],                                                       // { 9800:031b }
  0x02: [0x55, 0x56, 0x57, 0x44, 0x4F, 0x50, 0x4C, 0x49, 0x4D],                         // { 9800:0356 }
  0x03: [0x40, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x4F, 0x55, 0x56, 0x57],             // { 9800:03d5 }
  0x04: [0x1D, 0x03, 0x06],                                                             // { 9800:046b }
  0x05: [0x1C, 0x29, 0x68, 0x78, 0x65, 0x73, 0x74, 0x77, 0x7B, 0x60, 0x5E, 0x3C, 0x7A, 0x75],   // { 9800:049c }
  0x06: [0x71, 0x3D, 0x7A, 0x3C, 0x5B, 0x0A, 0x14, 0x69, 0x6A, 0x70, 0x72, 0x76, 0x11, 0x5D, 0x65, 0x1C],   // { 9800:055c }
  0x07: [0x33, 0x34, 0x35, 0x1F],                                                       // { 9800:0633 }
  0x08: [0x63, 0x51, 0x52, 0x59, 0x48, 0x38],                                           // { 9800:066a }
  0x09: [0x69, 0x6A, 0x6B, 0x6C, 0x6D, 0x6E, 0x6F, 0x70, 0x7C, 0x7D],                   // { 9800:06bf }
  0x0A: [0x01, 0x02, 0x21, 0x24, 0x31, 0x03, 0x06, 0x12, 0x1A],                         // { 9800:074b }
  0x0B: [0x21, 0x11, 0x08, 0x09, 0x2D, 0x2E, 0x1E],                                     // { 9800:07c7 }
  0x0C: [0x08, 0x09, 0x0A, 0x11, 0x14, 0x21, 0x24, 0x2D, 0x2E, 0x31, 0x3D, 0x6F, 0x7D, 0x5A, 0x61],   // { 9800:0829 }
  0x0D: [0x63, 0x64, 0x67, 0x4B, 0x4A],                                                 // { 9800:08f6 }
  0x0E: [0x53, 0x54, 0x58, 0x79],                                                       // { 9800:093e }
  0x0F: [0x15, 0x1E, 0x4A, 0x4B, 0x0B],                                                 // { 9800:0979 }
  0x10: [0x19, 0x47, 0x25, 0x2F, 0x30, 0x59],                                           // { 9800:09c1 }
  0x11: [0x01, 0x02, 0x0B],                                                             // { 9800:0a16 }
  0x12: [0x27, 0x2A, 0x3A],                                                             // { 9800:0a43 }
  0x13: [0x62, 0x17, 0x48, 0x38, 0x0B],                                                 // { 9800:0a70 }
};
export const EFFECT_HOOK_LISTS = HOOK_LISTS;

export async function CallEffectHooks(event, c) {
  const types = HOOK_LISTS[event] ?? [];                                   // { 9800:0300 }  other events: nothing
  for (const t of types) await RunEffectIfActive(c, t);
}

// 9800:0AE7 StinkingCloudCheck
export async function StinkingCloudCheck(c) {
  if (c.b[ACTIVE] === 0) return;                                           // { 9800:0aed }
  const occupant = { v: 0 }, ground = { v: 0 }, e = { v: null };
  await X.ProbeMove(c, 8, occupant, ground);                               // { 9800:0afb  dir 8 = no offset }
  if (ground.v !== 0x1E) return;                                           // { 9800:0b13 }
  if (await X.HasEffect(c, 0x1E, e)) return;                               // { 9800:0b1c }
  if (await X.HasEffect(c, 0x1F, e)) return;                               // { 9800:0b36 }
  if (await X.HasEffect(c, 0x20, e)) return;                               // { 9800:0b50 }
  if (await X.HasEffect(c, 0x6F, e)) return;                               // { 9800:0b6a }
  if (await X.HasEffect(c, 0x7D, e)) return;                               // { 9800:0b84 }
  const saved = await SavingThrow(c, 0, 0);                                // { 9800:0b9e }
  // quirk: the handler gets e as left by HasEffect(c, $7D, e) (not found -> nil), not the new record.
  if (saved) {
    await ApplyEffect(c, 0x1E, 1, 0xFF, 0, 0, saved, 'starts to cough');   // { 9800:0bb7 }
    await CallEffectHandler(0x1E, c, e.v, 0);                              // { 9800:0be4 }
  } else {
    await ApplyEffect(c, 0x1F, Roll(1, 4) + 1, 0xFF, 0, 0, saved, 'chokes and gags from nausea');   // { 9800:0bfc }
    await CallEffectHandler(0x1F, c, e.v, 0);                              // { 9800:0c33 }
  }
}

// 9800:0C4F AttackRollVsAC — host.attackRollVsAC(target, toHit) (ecl_op2E_Damage)
export async function AttackRollVsAC(target, toHit) {
  let result = false;                                                      // { 9800:0c55 }
  g.AttackRollValue = Roll(1, 20);                                         // { 9800:0c59 }
  if (shortint(g.AttackRollValue) <= 1) return result;                     // { 9800:0c66  signed; natural 1 misses }
  if (shortint(g.AttackRollValue) === 20) g.AttackRollValue = 100;         // { 9800:0c6d }
  await CallEffectHooks(0x10, target);                                     // { 9800:0c79 }
  const v = shortint(g.AttackRollValue);
  if (v >= 0 && v + (toHit & 0xFF) > target.b[AC]) result = true;         // { 9800:0c86 / 0caa  16-bit compare }
  return result;
}

// 9800:0CB7 AttackRoll
export async function AttackRoll(attacker, target, targetAC) {
  let result = false;                                                      // { 9800:0cbd }
  await ov24_0FD2(attacker);                                               // { 9800:0cc1  attacking ends effect 19h }
  g.AttackRollValue = Roll(1, 20);                                         // { 9800:0ccb }
  if (shortint(g.AttackRollValue) <= 1) return result;                     // { 9800:0cd8 }
  if (shortint(g.AttackRollValue) === 20) g.AttackRollValue = 100;         // { 9800:0cdf }
  await CallEffectHooks(0x0A, attacker);                                   // { 9800:0ceb }
  await CallEffectHooks(0x10, target);                                     // { 9800:0cf8 }
  let sideBonus;
  if (attacker.b[SIDE] === 0) sideBonus = shortint(eclB(0x6E2));           // { 9800:0d10  party side }
  else sideBonus = shortint(eclB(0x6E0));                                  // { 9800:0d1e  monster side }
  const v = shortint(g.AttackRollValue);
  if (v >= 0 && v + attacker.b[THAC0] + sideBonus >= (targetAC & 0xFF))   // { 9800:0d2a / 0d31 }
    result = true;                                                         // { 9800:0d56 }
  return result;
}

// 9800:0D63 SavingThrow — host.savingThrow(c, saveType, bonus)
export async function SavingThrow(c, saveType, bonus) {
  saveType = shortint(saveType); bonus = shortint(bonus);
  g.SaveRoll = Roll(1, 20);                                                // { 9800:0d69 }
  if (g.SaveRoll === 1) return false;                                      // { 9800:0d79 }
  if (g.SaveRoll === 20) return true;                                      // { 9800:0d83 }
  g.SaveRoll = byte(g.SaveRoll + S8(c.b, AC_ITEM_BONUS) + bonus);          // { 9800:0d8d }
  g.SaveType = byte(saveType);                                             // { 9800:0daa }
  await CallEffectHooks(0x0C, c);                                          // { 9800:0db0 }
  return c.b[SAVE + saveType] <= byte(g.SaveRoll);                         // { 9800:0dbd  unsigned; index sign-extended }
}

// 9800:0DE3 Roll — host.roll(count, sides)
export function Roll(count, sides) {
  count &= 0xFF; sides &= 0xFF;
  let sum = 0;                                                             // { 9800:0de9 }
  if (count > 0)                                                           // { 9800:0ded }
    for (let i = 1; i <= count; i++)                                       // { 9800:0df3 }
      sum = byte(sum + Random(sides) + 1);                                 // { 9800:0e08 }  quirk: byte sum wraps
  return sum;                                                              // { 9800:0e1f }
}

// 9800:0E2E RollDice
export function RollDice(count, sides) {
  g.LastDiceCount = count & 0xFF;                                          // { 9800:0e34 }
  return Roll(count, sides);                                               // { 9800:0e3a }
}

// 9800:0E52 AddEffect
export function AddEffect(c, type, duration, p3, callOnRemove) {
  const e = newEffect();                                                   // { 9800:0e58  GetMem(e, 9) }
  if (!c.effects) c.effects = e;                                           // { 9800:0e67 }
  else {
    let q = c.effects;                                                     // { 9800:0e89 }
    while (q.next) q = q.next;                                             // { 9800:0e9b }
    q.next = e;                                                            // { 9800:0ebb  appended at the end }
  }
  e.next = null;                                                           // { 9800:0ecc }
  e.b[E_TYPE] = type;                                                      // { 9800:0ed9 }
  wrW(e.b, E_DUR, duration);                                               // { 9800:0ee2 }
  e.b[E_CALL] = callOnRemove;                                              // { 9800:0eec }
  e.b[E_P3] = p3;                                                          // { 9800:0ef6 }
}

// 9800:0F06 RemoveFromCombat
export async function RemoveFromCombat(c, newStatus, msg) {
  const s = msg.slice(0, 40);                                              // { 9800:0f0c  string[40] }
  if (c.b[ACTIVE] === 0) return;                                           // { 9800:0f1f }
  const i = await X.CombatantIndex(c);                                     // { 9800:0f2d }
  await X.FocusCombatant(c, 3, 0);                                         // { 9800:0f3b }
  await X.ShowCharacterMessage(c, s, 10, 1);                               // { 9800:0f4c }
  c.b[ACTIVE] = 0;                                                         // { 9800:0f62 }
  c.b[STATUS] = newStatus;                                                 // { 9800:0f6b }
  if (c.b[STATUS] !== 3) c.b[HP] = 0;                                      // { 9800:0f76  only Running keeps its hp }
  await X.RestoreTerrain(0, 0, i);                                         // { 9800:0f8a }
  await X.FlushViewDirtyLines();                                           // { 9800:0f99 }
  g.cb_Size[i] = 0;                                                        // { 9800:0f9e  icon removed }
  await X.RebuildOccupancy();                                              // { 9800:0fae }
  if (await X.ClearCombatantActionFlags(c)) await RemoveCombatEffects(c);  // { 9800:0fb3 }
}

// 9800:0FD2 ov24_0FD2 (L: BreakInvisibility) — remove every effect 19h
export async function ov24_0FD2(c) {
  const e = { v: null };
  while (await X.HasEffect(c, 0x19, e))                                    // { 9800:0fd8 }
    await RemoveEffect(c, 0x19, e.v);                                      // { 9800:0fef }
}

// 9800:100A RemoveCombatEffects
export async function RemoveCombatEffects(c) {
  for (let k = 1; k <= 16; k++)                                            // { 9800:1010 }
    await RemoveEffect(c, ds(0x0C13 + k), null);                           // { 9800:1019  CombatEffectTypes{g_0C13}[k] }
}

// 9800:1041 ov24_1041 — remove effects 4Ah, 4Bh
export async function ov24_1041(c) {
  for (let k = 1; k <= 2; k++)                                             // { 9800:1047 }
    await RemoveEffect(c, ds(0x0C23 + k), null);                           // { 9800:1050  g_0C23[1..2] = 4A 4B }
}

// 9800:1081 CureEffect
export async function CureEffect(c, type) {
  let result = false;                                                      // { 9800:1087 }
  const e = { v: null };
  if (await X.HasEffect(c, type, e)) {                                     // { 9800:108b }
    await X.ShowCharacterMessage(c, 'is Cured', 10, 1);                    // { 9800:10a3 }
    await RemoveEffect(c, type, e.v);                                      // { 9800:10c3 }
    result = true;                                                         // { 9800:10d7 }
  }
  return result;
}

// 9800:10E4 StrengthCode
export function StrengthCode(str, strExc) {
  let code = byte(str + 100);                                              // { 9800:10ea }
  if (str === 18) code = byte(strExc + 1);                                 // { 9800:10f5 }
  return code;                                                             // { 9800:1104 }
}

// 9800:110D DecodeStrength(e, var str, var strExc)
export function DecodeStrength(e, str, strExc) {
  strExc.v = 0;                                                            // { 9800:1110 }
  str.v = e.b[E_P3] & 0x7F;                                                // { 9800:1117 }
  if (str.v <= 0x65) {                                                     // { 9800:1126 }
    strExc.v = byte(str.v - 1);                                            // { 9800:112f }
    str.v = 18;                                                            // { 9800:113e }
  } else str.v = byte(str.v - 100);                                        // { 9800:1147 }
}

// 9800:115C SetStrength(c, newStr, newExc, var oldCode): Boolean
export function SetStrength(c, newStr, newExc, oldCode) {
  let curStr = c.b[STR];                                                   // { 9800:1162 }
  let curExc = c.b[STR_EXC];                                               // { 9800:116c }
  if (newStr < curStr || (newStr === 18 && newExc < curExc)) {             // { 9800:1176 }
    oldCode.v = byte(StrengthCode(newStr, newExc) + 0x80);                 // { 9800:1190 }
    return false;                                                          // { 9800:118c }
  }
  let old = null;                                                          // { 9800:11aa }
  let p = c.effects;                                                       // { 9800:11b2 }
  while (p && !old) {                                                      // { 9800:11c4 }
    if ((p.b[E_TYPE] === 0x0C || p.b[E_TYPE] === 0x26) && p.b[E_P3] < 0x80) old = p;   // { 9800:11d4 }
    p = p.next;                                                            // { 9800:11fc }
  }
  if (old) {                                                               // { 9800:120f }
    const code = StrengthCode(curStr, curExc);                             // { 9800:1217 }
    const rs = { v: curStr }, rx = { v: curExc };
    DecodeStrength(old, rs, rx);                                           // { 9800:1226 }
    curStr = rs.v; curExc = rx.v;
    old.b[E_P3] = byte(code + 0x80);                                       // { 9800:123a }
  }
  c.b[STR] = newStr;                                                       // { 9800:1249 }
  c.b[STR_EXC] = newExc;                                                   // { 9800:1253 }
  X.RecalcCharacter(c);                                                    // { 9800:125d }
  oldCode.v = StrengthCode(curStr, curExc);                                // { 9800:1268 }
  return true;                                                             // { 9800:127a }
}

// 9800:1344 DamageCharacter
export async function DamageCharacter(c, dmg, saveEffect, saved) {
  g.DamageAmount = dmg & 0xFF;                                             // { 9800:134b }
  await CallEffectHooks(0x06, c);                                          // { 9800:1351 }
  if (saved) {                                                             // { 9800:135e }
    if (saveEffect === 1) g.DamageAmount = 0;                              // { 9800:136b }
    else if (saveEffect === 2) g.DamageAmount = byte(g.DamageAmount) >> 1; // { 9800:1376  rounds down }
  }
  const amt = byte(g.DamageAmount);
  if (amt === 0) return;                                                   // { 9800:1380  no message at all }
  let s;
  if (amt !== 1) s = 'takes ' + await X.ByteToStr(amt) + ' points of damage ';   // { 9800:1391 }
  else s = 'takes 1 point of damage ';                                     // { 9800:13d0 }
  const dt = byte(g.DamageType);
  switch (dt & 0xF7) {                                                     // { 9800:13e4 }
    case 0x01: s += 'from Fire'; break;                                    // { 9800:13ed }
    case 0x02: s += 'from Cold'; break;                                    // { 9800:141e }
    case 0x04: s += 'from Electricity'; break;                             // { 9800:144e }
    case 0x10: s += 'from Acid'; break;                                    // { 9800:147e }
  }
  if ((dt & 8) === dt) s += 'from Magic';                                  // { 9800:14a8 }  quirk: also for DamageType 0
  await X.ShowCombatMessageAnimation(c, 0, s);                             // { 9800:14dd }
  await X.ApplyDamage(c, byte(g.DamageAmount));                            // { 9800:14f1 }
  if (g.game_Mode === 5) {                                                 // { 9800:1500  in combat }
    cr(c).b[1] = 0;                                                        // { 9800:1507 }
    if (cr(c).b[0] > 0) {                                                  // { 9800:1514  a spell was being cast }
      await X.ShowCharacterMessage(c, 'lost a spell', 12, 1);              // { 9800:1522 }
      // quirk: ForgetMemorizedSpell works on SelectedChar, not on c (00BA:148B reads DS:5D92).
      await X.ForgetMemorizedSpell(cr(c).b[0]);                            // { 9800:1543 }
      cr(c).b[0] = 0;                                                      // { 9800:1554 }
    }
  }
  if (c.b[ACTIVE] === 0) {                                                 // { 9800:1560 }
    let m = 'Goes Down';                                                   // { 9800:156e }
    if (c.b[STATUS] === 5) m += ', and is Dying';                          // { 9800:1582 }
    if ([6, 7, 8].includes(c.b[STATUS])) m = 'is killed';                  // { 9800:15b7  set CS:131A }
    await X.ShowCharacterMessage(c, m, byte(g.text_Row + 1), 0);           // { 9800:15e0 }
    if (g.game_Mode !== 5) await X.MessageDelay();                         // { 9800:1602 }
    else {
      await RemoveCombatEffects(c);                                        // { 9800:1609 }
      await CallEffectHooks(0x0D, c);                                      // { 9800:1613 }
      if (c.b[ACTIVE] === 0) await X.RemoveCombatant(c);                   // { 9800:1620 }
      else await X.MessageDelay();                                         // { 9800:1638  a hook brought it back }
    }
  }
  await X.ClearCharacterMessage();                                         // { 9800:163d }
}

// 9800:1656 ApplyEffect
export async function ApplyEffect(c, type, duration, p3, callOnRemove, negateOnSave, saved, msg) {
  const s = msg.slice(0, 40);                                              // { 9800:165c  string[40] }
  g.EffectToApply = type;                                                  // { 9800:166f }
  await CallEffectHooks(0x09, c);                                          // { 9800:1675 }
  if (byte(g.EffectToApply) === 0 || (saved && negateOnSave === 1)) {      // { 9800:1682 }
    await X.ShowCharacterMessage(c, 'is Unaffected', 10, 1);               // { 9800:1695 }
    return;
  }
  const e = { v: null };
  if (await X.HasEffect(c, type, e)) {                                     // { 9800:16b8 }
    const ed = rdW(e.v.b, E_DUR);
    if ((ed > 0 && (duration & 0xFFFF) > ed) || (duration & 0xFFFF) === 0) // { 9800:16d0 }
      await RemoveEffect(c, type, e.v);                                    // { 9800:16ec }
  }
  AddEffect(c, type, duration, p3, callOnRemove);                          // { 9800:1700 }
  if (s !== '') {                                                          // { 9800:1719 }
    await X.ShowCombatMessageAnimation(c, 1, s);                           // { 9800:171f }
    await X.ClearCharacterMessage();                                       // { 9800:1732 }
  }
}

// 9800:175D HealCharacter
export async function HealCharacter(c, amount, onlyIfHurt) {
  if (![0, 1, 4, 5].includes(c.b[STATUS])) return false;                   // { 9800:1767  set CS:173D }
  if (!(c.b[HP] < c.b[HP_MAX] && onlyIfHurt)) {                            // { 9800:177f }
    if (await X.HasEffect(c, 0x32, { v: null })) return false;             // { 9800:1796 }
    if (onlyIfHurt) return false;                                          // { 9800:17b0 }
  }
  c.b[HP] = byte(c.b[HP] + amount);                                        // { 9800:17b9 }  quirk: byte add can wrap
  if (c.b[HP] > c.b[HP_MAX]) c.b[HP] = c.b[HP_MAX];                        // { 9800:17d4 }
  if (c.b[ACTIVE] === 0) {                                                 // { 9800:17f4 }
    if (c.b[STATUS] === 5) c.b[STATUS] = 4;                                // { 9800:17ff  Dying -> Unconscious }
    if (c.b[STATUS] === 4 && g.game_Mode !== 5)                            // { 9800:1813 }
      await CallEffectHandler(0x4E, c, null, 1);                           // { 9800:1825 }
  }
  return true;                                                             // { 9800:183b }
}

// 9800:1869 ReviveCombatant
export async function ReviveCombatant(c, hp) {
  if (!await X.PlaceCombatant(c, await X.CombatantCol(c), await X.CombatantRow(c), 1)) return false;   // { 9800:186f }
  c.b[STATUS] = 0;                                                         // { 9800:189c }
  c.b[ACTIVE] = 1;                                                         // { 9800:18a5 }
  c.b[HP] = hp;                                                            // { 9800:18ae }
  if (g.game_Mode === 5) await X.FocusCombatant(c, 3, 0);                  // { 9800:18b9 }
  const s = c.b[SIDE] === 1 ? 'stands up and grins' : 'gets back up';      // { 9800:18d1 / 18f1 }
  await X.ShowCharacterMessage(c, s, 10, 1);                               // { 9800:1904 }
  await X.CountActiveSides();                                              // { 9800:191a }
  return true;                                                             // { 9800:191f }
}

// 9800:1932 ov24_init — empty unit initialiser
export function ov24_init() {}
