// game/areas/party_ov12.js — PARTY ov12 (seg 5C00): the active-effect handlers and InstallEffectHandlers (lane por-build-party).
// Source: decode/pseudo/party_parts/ov12a.pas.md (5C00:0000..1A18) + ov12b.pas.md (1A19..38A9), merged in PARTY.pas.md;
// evidence decode/listings/ov12.lst. Conventions: party_core.js.
//
// Handler ABI (ov24 CallEffectHandler 9800:0000, combat_ov24.js): `g.EffectHandler[type]` = async (c, e, mode);
//   c = owner, e = the TEffect record { b: Uint8Array(9), next } (or null), mode 0 = hook event / apply, 1 = removed.
//   Item-power types 80h..8Bh get the readied TItem { b: Uint8Array(0x3F), next } as the second argument.
//   Type 58h has no entry (the original leaves DS:6988 = 0000:0000; ov24 throws if it is ever dispatched).
// Hook communication globals (raw bytes, as combat_ov24.js stores them): g.SaveRoll (6816), g.EffectToApply (6817),
//   g.DamageAmount (6818), g.DamageType (6819), g.StatValue (681A), g.sp_Current (681B), g.LastDiceCount (681C),
//   g.StatKind (681D), g.AttackBlocked (681E), g.cure_InProgress (681F), g.SpellArea (6820), g.ItemsChanged (6821),
//   g.AttackRollValue (6822), g.SlotHits[1..2] (6822+k), g.MoraleValue (6825), g.HookOpponent (6826), g.SaveType (682A).
// Combat record cr(c) = c.combat = { b: Uint8Array(0x16), target }: +1 mayCast, +2 mayUseItems, +3 initiative,
//   +6 moveLeft, +0Eh (L), +10h turned; +0Ah target is the JS reference `target`.
// Stinking-cloud record (sc_List g_6DBB, magic_spells.js shape): { caster, next, b: Uint8Array(0x13) }.
// BodyList[k] = { char, x, y, ground } (k = 1..BodyCount); cm_Map = { b: Uint8Array } (cell at b[7 + y*50 + x]).

import { g, X, ds, dsPstr, S8, byte, word, shortint, integer, newItem, pstr, charName, chain } from './party_core.js';
import { newChar } from '../engine/ecl.js';

// TChar fields (SAVES.md §3)
const STR = 0x10, CON = 0x14, CHA = 0x15, STR_EXC = 0x16, RACE = 0x2E, AGE = 0x30, HP_MAX = 0x32, FIGHTER_LVL_EFF = 0x6B,
  SIZE = 0x6C, BASE_MOVE = 0x72, LEVEL_MAIN = 0x73, LEVELS_DRAINED = 0x74, HP_DRAINED = 0x75, AI_MODE = 0x76,
  NPC_MORALE = 0x84, LEVEL = 0x96, CREATURE_TYPE = 0x9F, ALIGNMENT = 0xA0, XP = 0xAC, HP_ROLLED = 0xB1, ITEM_COUNT = 0xC7,
  STATUS = 0x10C, ACTIVE = 0x10D, SIDE = 0x10E, CONTROLLED = 0x10F, AC = 0x111, AC_REAR = 0x112, HP = 0x11B;
// TEffect: type +0, duration +1 (word), p3 +3, callOnRemove +4
const E_TYPE = 0, E_DUR = 1, E_P3 = 3, E_CALL = 4;
// TItem: type +2Eh, word[1..3] +2Fh..+31h, plus +32h, readied +34h, power[1..3] +3Ch..+3Eh
const I_TYPE = 0x2E, I_WORD = 0x2E, I_PLUS = 0x32, I_READIED = 0x34, I_POWER = 0x3B;
// combat record
const CR_MAYCAST = 1, CR_MAYUSE = 2, CR_INIT = 3, CR_MOVELEFT = 6, CR_0E = 0x0E, CR_TURNED = 0x10;

// cr(c)^.target: outside combat TChar +108h (combatant) is nil (written as 0 in the saves), and the original reads
// through it without faulting (ECL DAMAGE -> AttackRollVsAC -> event 10h handlers, RUN-3 ECL2_09; fix request #r3-1).
// Modelled as all-zero stand-ins (combat record and TChar): name compares fail, field tests read 0, writes go nowhere.
const cr = (c) => c.combat || { b: new Uint8Array(0x16), target: null };   // nil combatant: zero stand-in (#r3-1)
const tgt = (c) => (c.combat && c.combat.target) || newChar();
const rdy0 = (c) => (c.readied ? c.readied[0] ?? null : null);       // TChar +CCh readied[0] (weapon)
const effDur = (e) => e.b[E_DUR] | (e.b[E_DUR + 1] << 8);
const setEffDur = (e, v) => { e.b[E_DUR] = v & 0xFF; e.b[E_DUR + 1] = (v >> 8) & 0xFF; };
const ref = (v = null) => ({ v });
const itemsW = (t, j) => ds(0x5582 + byte(t) * 16 + j);               // ITEMS[t] field j (DS:5582, 16 B)
const addB = (k, n) => { g[k] = byte(g[k] + n); };
const name15 = (off) => dsPstr(off);                                  // string[15] tables (16 B per entry)
const dirDX = (d) => shortint(ds(0x2736 + d)), dirDY = (d) => shortint(ds(0x273F + d));
const has = async (c, type) => !!(await X.HasEffect(c, type, ref()));

// ---- helpers ----------------------------------------------------------------------------------------------------

// 5C00:0000 CancelDamageAndEffect
export function CancelDamageAndEffect(type) {
  if (type === 0 || g.EffectToApply === type) {                       // 5c00:0003
    g.DamageAmount = 0;                                               // 5c00:0011
    g.EffectToApply = 0;                                              // 5c00:0016
  }
}

// 5C00:001F AddEffectUnlessCuring
export async function AddEffectUnlessCuring(c, type, p3, duration) {
  if (g.cure_InProgress !== 0) return false;                          // 5c00:0025
  await X.AddEffect(c, type, duration, p3, 1);                        // 5c00:004a
  return true;                                                        // 5c00:0032
}

// 5C00:0058 ApplyFatalStatus
export async function ApplyFatalStatus(c, status, msg) {
  const s = msg.slice(0, 40);                                         // 5c00:006c
  await X.ShowCharacterMessage(c, s, 10, false);                      // 5c00:0082
  if ([7, 6, 8].includes(c.b[STATUS])) return;                        // 5c00:0087  quirk: message stays (no delay/clear)
  c.b[STATUS] = status;                                               // 5c00:00a3
  c.b[ACTIVE] = 0;                                                    // 5c00:00ab
  c.b[HP] = 0;                                                        // 5c00:00b4
  await X.RemoveCombatEffects(c);                                     // 5c00:00c0
  await X.CallEffectHooks(0x0D, c);                                   // 5c00:00ce
  if (c.b[ACTIVE] === 0) await X.RemoveCombatant(c);                  // 5c00:00d6
  await X.MessageDelay();                                             // 5c00:00e9
  await X.ClearCharacterMessage();                                    // 5c00:00ee
  if (g.game_Mode !== 5) await X.DrawPartyRoster(g.SelectedChar);     // 5c00:00f3
}

// ---- effect handlers 01h..12h -----------------------------------------------------------------------------------

// 5C00:010D EffBless — type 01h
export async function EffBless(c, e, mode) {
  addB('MoraleValue', 5);                                             // 5c00:0110
  addB('AttackRollValue', 1);                                         // 5c00:0115
}

// 5C00:011D EffCurse — type 02h
export async function EffCurse(c, e, mode) {
  if (g.MoraleValue < 5) g.MoraleValue = 0;                           // 5c00:0120
  else addB('MoraleValue', -5);                                       // 5c00:012e
  addB('AttackRollValue', -1);                                        // 5c00:0133
}

// 5C00:013B EffBonusVsUndead — type 03h
export async function EffBonusVsUndead(c, e, mode) {
  g.HookOpponent = tgt(c);                                            // 5c00:013e
  if (g.HookOpponent.b[CREATURE_TYPE] === 4) {                        // 5c00:0155
    addB('AttackRollValue', 2);                                       // 5c00:0161
    addB('DamageAmount', 2);                                          // 5c00:0166
  }
}

// 5C00:017F EffStartsToTrain — type 04h (removed)
export async function EffStartsToTrain(c, e, mode) {
  await X.ShowCharacterMessage(c, 'starts to train', 10, true);       // 5c00:01a0
  await X.AddEffect(c, 7, 0xA8C0, 0xFF, 1);                           // 5c00:01b8
}

// 5C00:01C3 EffFlameTongue — type 06h
export async function EffFlameTongue(c, e, mode) {
  g.HookOpponent = tgt(c);                                            // 5c00:01c9
  let b;
  switch (g.HookOpponent.b[CREATURE_TYPE]) {                          // 5c00:01e4
    case 0x0A: b = 1; break;                                          // 5c00:01ed
    case 9: case 0x0C: b = 2; break;                                  // 5c00:01fb
    case 4: b = 3; break;                                             // 5c00:0205
    default: b = 0;                                                   // 5c00:020b
  }
  addB('AttackRollValue', b);                                         // 5c00:020f
  addB('DamageAmount', b);                                            // 5c00:0216
  g.DamageType = 9;                                                   // 5c00:021d  fire + magic
}

// 5C00:0233 EffHardier — type 07h (removed)
export async function EffHardier(c, e, mode) {
  await X.ShowCharacterMessage(c, 'is hardier', 10, true);            // 5c00:0254
  c.b[CON] = byte(c.b[CON] + 1);                                      // 5c00:025c
  if (c.b[CON] >= 20) {                                               // 5c00:0263
    await X.AddEffect(c, 0x3E, 0x3C, 0xFF, 1);                        // 5c00:027d
    return;
  }
  let old = byte(c.b[HP_MAX] - c.b[HP_ROLLED]);                       // 5c00:0285  current CON bonus total
  let perLvl = 0;                                                     // 5c00:029f
  if (c.b[CON] < 15) return;                                          // 5c00:02a3
  for (let i = 0; i <= 7; i++) {                                      // 5c00:02b0
    const lv = S8(c.b, LEVEL + i);
    if (lv > 0) {                                                     // 5c00:02c2  signed
      if (i === 2) perLvl = byte(perLvl + c.b[LEVEL + i] * (c.b[CON] - 15));   // 5c00:02ca  fighter
      else if (c.b[CON] > 15) perLvl = byte(perLvl + c.b[LEVEL + i] * 2);       // 5c00:02f4
      else perLvl = byte(perLvl + c.b[LEVEL + i]);                    // 5c00:0314
    }
  }
  if (perLvl === 0) perLvl = 1;                                       // 5c00:032b
  old = byte(Math.trunc(old / perLvl));                               // 5c00:0335  IDIV of zero-extended bytes (xor ah) = unsigned, byte result
  // quirk: computed from the old bonus total (hp_max - hp_rolled), not from a CON table
  if (c.b[CON] >= 17 && S8(c.b, LEVEL + 2) <= 0) return;              // 5c00:0347  #verify-1 signed
  c.b[HP_MAX] = byte(c.b[HP_MAX] + old);                              // 5c00:035c
  c.b[HP] = byte(c.b[HP] + old);                                      // 5c00:0366
}

// 5C00:0377 EffProtFromEvil — types 08h, 2Dh
export async function EffProtFromEvil(c, e, mode) {
  if ([2, 5, 8].includes(g.SelectedChar.b[ALIGNMENT])) {              // 5c00:037a
    addB('SaveRoll', 2);                                              // 5c00:039e
    addB('AttackRollValue', -2);                                      // 5c00:03a3
  }
}

// 5C00:03AC EffProtFromGood — types 09h, 2Eh
export async function EffProtFromGood(c, e, mode) {
  if ([0, 3, 6].includes(g.SelectedChar.b[ALIGNMENT])) {              // 5c00:03af
    addB('SaveRoll', 2);                                              // 5c00:03d3
    addB('AttackRollValue', -2);                                      // 5c00:03d8
  }
}

// 5C00:03E1 EffResistCold — type 0Ah
export async function EffResistCold(c, e, mode) {
  if (g.DamageType & 2) {                                             // 5c00:03e4
    g.DamageAmount = byte(g.DamageAmount) >> 1;                       // 5c00:03ed
    addB('SaveRoll', 3);                                              // 5c00:03f7
  }
}

// 5C00:0400 EffCharm — type 0Bh
export async function EffCharm(c, e, mode) {
  if (mode !== 0) {                                                   // 5c00:0403  removed: restore
    c.b[SIDE] = (e.b[E_P3] & 0x40) >> 6;                              // 5c00:0409
    if (c.b[NPC_MORALE] === 0xB3) c.b[NPC_MORALE] = 0;                // 5c00:0420
    return;                                                           // 5c00:0434
  }
  if ((e.b[E_P3] & 0x20) === 0) {                                     // 5c00:0437  first time
    e.b[E_P3] = byte(e.b[E_P3] + 0x20 + (c.b[SIDE] << 6));            // 5c00:0444
    c.b[SIDE] = e.b[E_P3] >> 7;                                       // 5c00:0468
    c.b[CONTROLLED] = 1;                                              // 5c00:047d
    if (c.b[NPC_MORALE] <= 0x7F) c.b[NPC_MORALE] = 0xB3;              // 5c00:0486
    cr(c).target = null;                                              // 5c00:049a
    await X.CountActiveSides();                                       // 5c00:04ac
  }
  g.MoraleValue = 100;                                                // 5c00:04b1
}

// 5C00:04BA EffStrengthEnd — types 0Ch, 26h (removed)
export async function EffStrengthEnd(c, e, mode) {
  if (e.b[E_P3] > 0x7F) return;                                       // 5c00:04c0  not the holder
  const s = ref(0), x = ref(0);
  await X.DecodeStrength(e, s, x);                                    // 5c00:04dd
  c.b[STR] = s.v; c.b[STR_EXC] = x.v;                                 // 5c00:04e2
  let best = null, bestS = 0, bestX = 0;                              // 5c00:04f6
  for (let p = c.effects; p; p = p.next) {                            // 5c00:0506 / 0518 / 0585
    if ((p.b[E_TYPE] === 0x0C || p.b[E_TYPE] === 0x26) && p !== e) {  // 5c00:0520
      await X.DecodeStrength(p, s, x);                                // 5c00:0552
      if (s.v > bestS || (bestS === 18 && x.v > bestX)) {             // 5c00:0557
        bestS = s.v; bestX = x.v; best = p;                           // 5c00:056d
      }
    }
  }
  if (best) {                                                         // 5c00:0598
    best.b[E_P3] = await X.StrengthCode(c.b[STR], c.b[STR_EXC]);      // 5c00:05b0
    c.b[STR] = bestS; c.b[STR_EXC] = bestX;                           // 5c00:05bc
  }
  // quirk: no RecalcCharacter here
}

// 5C00:05D6 EffSetCharisma — type 0Eh (removed)
export async function EffSetCharisma(c, e, mode) {
  c.b[CHA] = e.b[E_P3];                                               // 5c00:05d9
}

// 5C00:05EB EffHpLossTick — type 0Fh (removed, re-adds itself every 10)
export async function EffHpLossTick(c, e, mode) {
  if (await AddEffectUnlessCuring(c, 0x0F, e.b[E_P3], 10))            // 5c00:0604
    if (c.b[HP] > 1) {                                                // 5c00:060b
      g.DamageType = 0;                                               // 5c00:0616
      await X.DamageCharacter(c, 1, 0, false);                        // 5c00:062a
      if (g.game_Mode !== 5) await X.DrawPartyRoster(g.SelectedChar);   // 5c00:062f
    }
}

// 5C00:0647 EffNop10 — type 10h
export async function EffNop10(c, e, mode) {}                         // 5c00:0647

// 5C00:064E EffShield — type 11h
export async function EffShield(c, e, mode) {
  if (c.b[AC] < 0x39) c.b[AC] = 0x39;                                 // 5c00:0651
  addB('SaveRoll', 1);                                                // 5c00:0665
  if (g.sp_Current === 0x0F) g.DamageAmount = 0;                      // 5c00:0669
}

async function foeNameBonus(c, table, n, delta) {
  g.HookOpponent = tgt(c);                                            // 5c00:067f / 094d
  const o = g.HookOpponent;
  if (o.b[CREATURE_TYPE] === 1 && o.b[SIZE] === 1)                    // 5c00:0696 / 0964
    for (let i = 1; i <= n; i++)                                      // 5c00:06ad / 097b
      if (charName(o) === name15(table + i * 16)) addB('AttackRollValue', delta);   // 5c00:06cd / 099b
}

// 5C00:0679 EffGnomeAttackBonus — type 12h (GnomeFoeNames DS:0332, entries at 0332 + 16i)
export async function EffGnomeAttackBonus(c, e, mode) { await foeNameBonus(c, 0x0332, 4, 1); }

// ---- effect handlers 14h..2Ch -----------------------------------------------------------------------------------

// 5C00:06E4 EffResistFire — type 14h
export async function EffResistFire(c, e, mode) {
  if (g.DamageType & 1) {                                             // 5c00:06e7
    g.DamageAmount = byte(g.DamageAmount) >> 1;                       // 5c00:06f0
    addB('SaveRoll', 3);                                              // 5c00:06fa
  }
}

// 5C00:070F EffSilence — type 15h
export async function EffSilence(c, e, mode) {
  if (cr(c).b[CR_MAYUSE] !== 0)                                       // 5c00:0715
    await X.ShowCharacterMessage(c, 'is silenced', 10, true);         // 5c00:073f
  cr(c).b[CR_MAYUSE] = 0;                                             // 5c00:0744
  cr(c).b[CR_MAYCAST] = 0;                                            // 5c00:0751
}

// 5C00:0775 EffSlowPoisonEnd — type 16h (removed)
export async function EffSlowPoisonEnd(c, e, mode) {
  if (await has(c, 0x37))                                             // 5c00:0789
    await ApplyFatalStatus(c, 6, 'dies from poison');                 // 5c00:07ab
  g.cure_InProgress = 1;                                              // 5c00:07ae
  await X.RemoveEffect(c, 0x0F, null);                                // 5c00:07c2
  g.cure_InProgress = 0;                                              // 5c00:07c7
}

// 5C00:07E0 EffSpiritualHammer — type 17h
export async function EffSpiritualHammer(c, e, mode) {
  let p = c.items, found = false;                                     // 5c00:07e6
  while (p && !found) {                                               // 5c00:07fd
    if (p.b[I_TYPE] === 0x14 && p.b[I_WORD + 3] === 0xF3) found = true;   // 5c00:080b
    else p = p.next;                                                  // 5c00:0825
  }
  if (mode !== 0 && p) await X.LoseItem(c, p);                        // 5c00:0838
  if (mode === 0 && !found && c.b[ITEM_COUNT] < 16) {                 // 5c00:0857
    p = newItem();                                                    // 5c00:087b / 0892  GetMem + FillChar
    p.b[I_TYPE] = 0x14;                                               // 5c00:0897
    p.b[I_WORD + 2] = 0x14;                                           // 5c00:089f  "Hammer"
    p.b[I_WORD + 3] = 0xF3;                                           // 5c00:08a7  "Spiritual"
    p.b[I_PLUS] = 1;                                                  // 5c00:08af
    p.b[I_POWER + 2] = 0x17;                                          // 5c00:08b7
    p.b[I_POWER + 3] = 0x89;                                          // 5c00:08bf
    await X.AppendItemCopy(c, p);                                     // 5c00:08d3  (FreeMem 08e2)
    await X.ShowCharacterMessage(c, 'Gains an item', 10, true);       // 5c00:0902
  }
  await X.RecalcCharacter(c);                                         // 5c00:090d
}

// 5C00:0918 EffInvisible — type 19h
export async function EffInvisible(c, e, mode) {
  if (!(await has(g.SelectedChar, 0x18))) g.AttackBlocked = 1;        // 5c00:092e
  addB('AttackRollValue', -4);                                        // 5c00:093c
}

// 5C00:0947 EffDwarfAttackBonus — type 1Ah (DwarfFoeNames DS:0372)
export async function EffDwarfAttackBonus(c, e, mode) { await foeNameBonus(c, 0x0372, 8, 1); }

// 5C00:09C0 EffMirrorImage — type 1Ch
export async function EffMirrorImage(c, e, mode) {
  // quirk: `sp_Current <> 0` — only non-area spells are absorbed, weapon hits are not
  if (await X.Roll(1, e.b[E_P3] + 1) > 1 && g.sp_Current !== 0 && g.SpellArea === 0) {   // 5c00:09d4
    CancelDamageAndEffect(0);                                         // 5c00:09ef
    await X.ShowCharacterMessage(c, 'lost an image', 10, true);       // 5c00:0a0d
    e.b[E_P3] = byte(e.b[E_P3] - 1);                                  // 5c00:0a12
    if (e.b[E_P3] === 0) await X.RemoveEffect(c, 0x1C, null);         // 5c00:0a19
  }
}

// 5C00:0A3D EffEnfeebled — type 1Dh
export async function EffEnfeebled(c, e, mode) {
  g.DamageAmount = byte(g.DamageAmount - (byte(g.DamageAmount) >> 2));   // 5c00:0a40
}

// 5C00:0A65 EffCoughing — type 1Eh
export async function EffCoughing(c, e, mode) {
  if (cr(c).b[CR_MAYUSE] !== 0)                                       // 5c00:0a6b
    await X.ShowCharacterMessage(c, 'is coughing', 10, true);         // 5c00:0a95
  cr(c).b[CR_MAYUSE] = 0;                                             // 5c00:0a9a
  cr(c).b[CR_MAYCAST] = 0;                                            // 5c00:0aa7
  await X.RecalcCharacter(c);                                         // 5c00:0aba
  if (c.b[AC_REAR] > 0x34) c.b[AC_REAR] = c.b[AC_REAR] - 2;           // 5c00:0abf
  else c.b[AC_REAR] = 0x32;                                           // 5c00:0ad5  AC 10
  c.b[AC] = c.b[AC_REAR];                                             // 5c00:0ade
  if (c === g.SelectedChar) await X.DrawCharacterSummary(c);          // 5c00:0aee
}

// 5C00:0B1B EffAnimatedEnd — type 20h (removed)
export async function EffAnimatedEnd(c, e, mode) {
  e.b[E_CALL] = 0;                                                    // 5c00:0b21
  if (g.cure_InProgress === 0)                                        // 5c00:0b29
    await ApplyFatalStatus(c, 6, 'collapses');                        // 5c00:0b49
  c.b[SIDE] = e.b[E_P3] >> 4;                                         // 5c00:0b4c
  c.b[CONTROLLED] = 1;                                                // 5c00:0b61
  c.b[AI_MODE] = 0;                                                   // 5c00:0b6a
  c.b[FIGHTER_LVL_EFF] = c.b[LEVEL + 2];                              // 5c00:0b72
  c.b[BASE_MOVE] = 12;                                                // 5c00:0b81
  if (c.b[NPC_MORALE] === 0xB3) c.b[NPC_MORALE] = 0;                  // 5c00:0b89
  c.b[CREATURE_TYPE] = 0;                                             // 5c00:0b9d
}

// 5C00:0BAC EffPenaltyAll4 — type 21h
export async function EffPenaltyAll4(c, e, mode) {
  addB('AttackRollValue', -4);                                        // 5c00:0baf
  c.b[AC] = byte(c.b[AC] - 4);                                        // 5c00:0bb4
  c.b[AC_REAR] = byte(c.b[AC_REAR] - 4);                              // 5c00:0bbd
  addB('SaveRoll', -4);                                               // 5c00:0bc6
}

// 5C00:0BCF EffWeaknessAndDrain — type 22h (removed)
export async function EffWeaknessAndDrain(c, e, mode) {
  // quirk: both handlers re-add their own type, so a 22h effect becomes two effects on its first expiry
  await X.CallEffectHandler(0x2B, c, e, mode);                        // 5c00:0be5
  await X.CallEffectHandler(0x2C, c, e, mode);                        // 5c00:0bfd
}

// 5C00:0C06 EffPlusOne — type 23h (and EffPrayer)
export async function EffPlusOne(c, e, mode) {
  addB('SaveRoll', 1);                                                // 5c00:0c09
  addB('AttackRollValue', 1);                                         // 5c00:0c0d
}

// 5C00:0C15 EffPenalty4 — type 24h
export async function EffPenalty4(c, e, mode) {
  addB('AttackRollValue', -4);                                        // 5c00:0c18
  addB('SaveRoll', -4);                                               // 5c00:0c1d
}

// 5C00:0C26 EffUntouchableBeforeTurn — type 25h
export async function EffUntouchableBeforeTurn(c, e, mode) {
  if (S8(cr(c).b, CR_INIT) > 0) {                                     // 5c00:0c29  signed
    g.AttackBlocked = 1;                                              // 5c00:0c38
    g.AttackRollValue = 0xFF;                                         // 5c00:0c3d  -1
  }
}

// 5C00:0C4B EffHaste — type 27h
export async function EffHaste(c, e, mode) {
  if ((e.b[E_P3] & 0x10) === 0) {                                     // 5c00:0c51
    e.b[E_P3] = byte(e.b[E_P3] + 0x10);                               // 5c00:0c5e
    await X.ShowCharacterMessage(c, 'ages', 10, true);                // 5c00:0c8c
    const a = word((c.b[AGE] | (c.b[AGE + 1] << 8)) + 1);             // 5c00:0c91  word
    c.b[AGE] = a & 0xFF; c.b[AGE + 1] = a >> 8;
  }
  g.StatValue = byte(g.StatValue << 1);                               // 5c00:0c98
}

// 5C00:0CC3 EffCloudRemoved — type 28h (removed)
export async function EffCloudRemoved(c, e, mode) {
  const id = e.b[E_P3] >> 4;                                          // 5c00:0cc9
  let found = false, a = g.sc_List;                                   // 5c00:0cdd
  while (a && !found) {                                               // 5c00:0cea
    if (a.caster === c && a.b[0x12] === id) found = true;             // 5c00:0cf8
    else a = a.next;                                                  // 5c00:0d1e
  }
  if (!found) return;                                                 // 5c00:0d31
  await X.ShowTimedBottomMessage('The air clears a little...');       // 5c00:0d49
  const sq = (k) => ds(0x290D + k);                                   // CloudSquareDir[k] (DS:290E..2911)
  for (let k = 1; k <= 4; k++) {                                      // 5c00:0d4e
    if (a.b[0x0B + k] !== 0) {                                        // 5c00:0d57
      const x = byte(a.b[0x10] + dirDX(sq(k)));                       // 5c00:0d6b
      const y = byte(a.b[0x11] + dirDY(sq(k)));                       // 5c00:0d8e
      let body = false;                                               // 5c00:0db1
      for (let i = 1; i <= g.BodyCount; i++) {                        // 5c00:0db5
        const bd = g.BodyList[i];
        if (bd && bd.char && bd.x === x && bd.y === y) body = true;   // 5c00:0dca
      }
      g.cm_Map.b[7 + y * 50 + x] = body ? 0x1F : a.b[7 + k];          // 5c00:0e24 / 0e4a
    }
  }
  // unlink a                                                          5c00:0e7e .. 0ed7
  if (g.sc_List === a) g.sc_List = a.next;
  else { let p = g.sc_List; while (p.next !== a) p = p.next; p.next = a.next; }
  // FreeMem(a, $13)                                                   5c00:0ef7
  for (let p = g.sc_List; p; p = p.next)                              // 5c00:0efc / 0f09 / 0f88
    for (let k = 1; k <= 4; k++)                                      // 5c00:0f14
      if (p.b[0x0B + k] !== 0)                                        // 5c00:0f1d
        g.cm_Map.b[7 + byte(p.b[0x11] + dirDY(sq(k))) * 50 + byte(p.b[0x10] + dirDX(sq(k)))] = 0x1E;   // 5c00:0f2e
}

// 5C00:0FAC AvoidRangedAttack
export async function AvoidRangedAttack(c, chance) {
  if (rdy0(g.SelectedChar))                                           // 5c00:0fb2
    if (await X.TargetDistance(g.SelectedChar, c) > 1)                // 5c00:0fd0
      if (await X.Roll(1, 100) <= chance) {                           // 5c00:0fdf
        await X.ShowCharacterMessage(c, 'Avoids it', 10, true);       // 5c00:1004
        g.DamageAmount = 0;                                           // 5c00:1009
        g.AttackRollValue = 0xFF;                                     // 5c00:100e
        g.SlotHits[1] = byte(g.SlotHits[1] - 1);                      // 5c00:1013  g_6823
      }
}

// 5C00:101D CurrentAttackItem
export async function CurrentAttackItem(c) {
  const p = ref(null);                                                // 5c00:1023
  if (rdy0(c)) {                                                      // 5c00:102b
    const ok = await X.GetMissileAmmo(c, p);                          // 5c00:1045
    if (!ok || !p.v) p.v = rdy0(c);                                   // 5c00:104d
  }
  return p.v;                                                         // 5c00:106e
}

// 5C00:1086 EffMagicWeaponOnly — type 29h
export async function EffMagicWeaponOnly(c, e, mode) {
  if (await CurrentAttackItem(g.SelectedChar))                        // 5c00:1092
    if ((await CurrentAttackItem(g.SelectedChar)).b[I_PLUS] === 0)    // 5c00:10a2
      await AvoidRangedAttack(c, 100);                                // 5c00:10ba
}

// 5C00:10C1 EffSlow — type 2Ah
export async function EffSlow(c, e, mode) {
  g.StatValue = byte(g.StatValue) >> 1;                               // 5c00:10c4
}

// 5C00:10DE EffWeakness — type 2Bh (re-added every 60)
export async function EffWeakness(c, e, mode) {
  if (await AddEffectUnlessCuring(c, 0x2B, e.b[E_P3], 0x3C)) {        // 5c00:10fa
    if (c.b[STR] > 3) {                                               // 5c00:1101
      await X.ShowCharacterMessage(c, 'is weakened', 10, true);       // 5c00:1126
      c.b[STR] = c.b[STR] - 1;                                        // 5c00:112b
    } else if (!(await has(c, 0x1F)))                                 // 5c00:1142
      await X.AddEffect(c, 0x1F, 0, 0xFF, 0);                         // 5c00:115d
  }
}

// 5C00:1168 EffHpDrainTick — type 2Ch (re-added every 10)
export async function EffHpDrainTick(c, e, mode) {
  if (await AddEffectUnlessCuring(c, 0x2C, e.b[E_P3], 10)) {          // 5c00:1184
    if (c.b[HP] > 1) {                                                // 5c00:118b
      g.DamageType = 0;                                               // 5c00:1196
      await X.DamageCharacter(c, 1, 0, false);                        // 5c00:11aa
      if (g.game_Mode !== 5) await X.DrawPartyRoster(g.SelectedChar);   // 5c00:11af
    } else if (!(await has(c, 0x1F)))                                 // 5c00:11d3
      await X.AddEffect(c, 0x1F, 0, 0xFF, 0);                         // 5c00:11ee
  }
}

// ---- effect handlers 2Fh..4Eh -----------------------------------------------------------------------------------

// 5C00:11F9 EffDwarfGiantDefence — type 2Fh (GiantFoeNames DS:03F2)
export async function EffDwarfGiantDefence(c, e, mode) {
  g.HookOpponent = tgt(c);                                            // 5c00:11ff
  const a = g.SelectedChar;
  if (a.b[CREATURE_TYPE] === 1 && (a.b[SIZE] & 0x7F) === 2)           // 5c00:1216
    for (let i = 1; i <= 8; i++)                                      // 5c00:1230
      // quirk: compares c's own target's name, not the attacker's; entries 6..8 are not names
      if (charName(g.HookOpponent) === name15(0x03F2 + i * 16)) addB('AttackRollValue', -4);   // 5c00:1250 / 1257
}

// 5C00:1276 EffGnomeGiantDefence — type 30h
export async function EffGnomeGiantDefence(c, e, mode) {
  if (g.SelectedChar.b[CREATURE_TYPE] === 1) {                        // 5c00:1279
    const n = charName(g.SelectedChar);
    if (n === 'BUGBEAR' || n === 'GNOLL') addB('AttackRollValue', -4);   // 5c00:1290 / 12a9
  }
}

// 5C00:12B2 EffPrayer — type 31h
export async function EffPrayer(c, e, mode) {
  const side = (e.b[E_P3] & 0x10) >> 4;                               // 5c00:12b8
  if (c.b[SIDE] === side) await EffPlusOne(c, e, mode);               // 5c00:12e8
  else {
    addB('AttackRollValue', -1);                                      // 5c00:12ed
    addB('SaveRoll', -1);                                             // 5c00:12f1
  }
}

// 5C00:12FB EffSlowHeal — type 32h (re-added every 14400)
export async function EffSlowHeal(c, e, mode) {
  if (await AddEffectUnlessCuring(c, 0x32, e.b[E_P3], 0x3840))        // 5c00:1314
    if (await X.HealCharacter(c, 1, true)) await X.ShowHealingResult(c);   // 5c00:1327
}

// 5C00:133F EffHelpless — types 1Fh, 33h, 34h, 35h
export async function EffHelpless(c, e, mode) {
  await X.ClearCombatantActionFlags(c);                               // 5c00:1348  result ignored
}

// 5C00:1355 EffNop36 — type 36h
export async function EffNop36(c, e, mode) {}                         // 5c00:1355
// 5C00:135C EffNop37 — type 37h (Poisoned)
export async function EffNop37(c, e, mode) {}                         // 5c00:135c

// 5C00:1363 EffGrantInvisible — type 38h
export async function EffGrantInvisible(c, e, mode) {
  await X.AddEffect(c, 0x19, 1, 0x0C, 0);                             // 5c00:1379
}

// 5C00:1399 EffMummyRot — type 39h (re-added every 43200)
export async function EffMummyRot(c, e, mode) {
  if (g.cure_InProgress !== 0) return;                                // 5c00:139f
  await X.ShowCharacterMessage(c, 'Rots...', 10, true);               // 5c00:13c4
  if (c.b[CHA] > 2) c.b[CHA] = c.b[CHA] - 2; else c.b[CHA] = 0;       // 5c00:13c9
  if (c.b[CHA] < 3) c.b[CHA] = 3;                                     // 5c00:13e5
  if ((e.b[E_P3] >> 4) > 1) {                                         // 5c00:13f7
    e.b[E_P3] = byte(e.b[E_P3] - 0x10);                               // 5c00:1409
    await AddEffectUnlessCuring(c, 0x39, e.b[E_P3], 0xA8C0);          // 5c00:1427
  } else await ApplyFatalStatus(c, 8, 'Dies rots away');              // 5c00:1449
}

// 5C00:1452 EffHeld — type 3Ah
export async function EffHeld(c, e, mode) {
  cr(c).b[CR_MOVELEFT] = 0;                                           // 5c00:1455
  if (g.StatKind !== 0) g.StatValue = 0;                              // 5c00:1462
}

// 5C00:1472 EffBecome62 — type 3Bh (removed)
export async function EffBecome62(c, e, mode) {
  await X.AddEffect(c, 0x62, 0, 0xFF, 0);                             // 5c00:1487
}

// 5C00:1490 EffFireResistance — type 3Dh
export async function EffFireResistance(c, e, mode) {
  if (g.DamageType & 1) {                                             // 5c00:1496
    for (let i = 1; i <= g.LastDiceCount; i++) {                      // 5c00:14a5
      addB('DamageAmount', -2);                                       // 5c00:14b4
      if (byte(g.DamageAmount) < g.LastDiceCount) g.DamageAmount = g.LastDiceCount;   // 5c00:14b9 unsigned
    }
    addB('SaveRoll', 4);                                              // 5c00:14d0
    if ((g.DamageType & 8) === 0) CancelDamageAndEffect(0);           // 5c00:14d5
  }
}

// 5C00:14EB EffRegenerate — type 3Eh (re-added every 60)
export async function EffRegenerate(c, e, mode) {
  if (await AddEffectUnlessCuring(c, 0x3E, e.b[E_P3], 0x3C))          // 5c00:1504
    if (await X.HealCharacter(c, 1, true)) await X.ShowHealingResult(c);   // 5c00:1517
}

// 5C00:1545 PoisonOpponent
export async function PoisonOpponent(c, bonus) {
  g.HookOpponent = tgt(c);                                            // 5c00:154b
  if (!(await X.SavingThrow(g.HookOpponent, 0, bonus))) {             // 5c00:1571
    await X.ShowCharacterMessage(g.HookOpponent, 'is Poisoned', 10, false);   // 5c00:1597
    await X.MessageDelay();                                           // 5c00:159c
    await X.AddEffect(g.HookOpponent, 0x37, 0, 0xFF, 0);              // 5c00:15b5
    await ApplyFatalStatus(g.HookOpponent, 6, 'is killed');           // 5c00:15d5
  }
}

// 5C00:15EB ParalyzeOpponent
export async function ParalyzeOpponent(c, duration, bonus) {
  g.HookOpponent = tgt(c);                                            // 5c00:15f1
  if (!(await X.SavingThrow(g.HookOpponent, 0, 0))) {                 // 5c00:1616  quirk: bonus not used
    await X.ShowCombatMessageAnimation(g.HookOpponent, true, 'is Paralyzed');   // 5c00:1639
    await X.AddEffect(g.HookOpponent, 0x34, duration, 0x0C, 0);       // 5c00:1652
  }
}

// 5C00:165D EffPoisonHit — type 40h
export async function EffPoisonHit(c, e, mode) { await PoisonOpponent(c, 0); }              // 5c00:166a
// 5C00:1671 EffPoisonHitP4 — type 41h
export async function EffPoisonHitP4(c, e, mode) { await PoisonOpponent(c, 4); }            // 5c00:167e
// 5C00:1685 EffPoisonHitP2 — type 42h
export async function EffPoisonHitP2(c, e, mode) { await PoisonOpponent(c, 2); }            // 5c00:1692
// 5C00:1699 EffParalyzeHit2d8 — type 43h
export async function EffParalyzeHit2d8(c, e, mode) {
  const d = await X.Roll(2, 8);                                       // 5c00:16a8
  await ParalyzeOpponent(c, d, 0);                                    // 5c00:16b4
}
// 5C00:16BB EffGhoulParalysis — type 44h
export async function EffGhoulParalysis(c, e, mode) {
  if (tgt(c).b[RACE] !== 2) await ParalyzeOpponent(c, 0x3F, 0);       // 5c00:16be / 16df
}
// 5C00:16E6 EffParalyzeHitLong — type 45h
export async function EffParalyzeHitLong(c, e, mode) {
  const d = (await X.Roll(1, 9)) + 10;                                // 5c00:16f5
  await ParalyzeOpponent(c, d, -2);                                   // 5c00:1704  (bonus unused)
}
// 5C00:170B EffPoisonHitM2 — type 46h
export async function EffPoisonHitM2(c, e, mode) { await PoisonOpponent(c, -2); }           // 5c00:1718

// 5C00:171F EffUnattackable — type 47h
export async function EffUnattackable(c, e, mode) {
  g.AttackBlocked = 1;                                                // 5c00:1722
  addB('AttackRollValue', -4);                                        // 5c00:1727
}

// 5C00:1730 EffGrantInvisible95 — type 48h
export async function EffGrantInvisible95(c, e, mode) {
  if (await X.Roll(1, 100) <= 0x5F) await X.AddEffect(c, 0x19, 1, 0x0C, 0);   // 5c00:1739 / 1755
}

// 5C00:176F EffBloodDrain — type 4Bh
export async function EffBloodDrain(c, e, mode) {
  g.HookOpponent = g.cb_Char[e.b[E_P3]];                              // 5c00:1775
  const v = g.HookOpponent;
  if (mode !== 0 || c.b[ACTIVE] === 0 || v.b[ACTIVE] === 0) {         // 5c00:1793
    await X.RemoveEffect(v, 0x3A, null);                              // 5c00:17c1
    if (mode === 0) {                                                 // 5c00:17c6
      e.b[E_CALL] = 0;                                                // 5c00:17cc
      await X.RemoveEffect(c, 0x4B, e);                               // 5c00:17e3
    }
    if (c.b[ACTIVE] !== 0 && v.b[ACTIVE] !== 0)                       // 5c00:17e8
      cr(c).b[CR_TURNED] = 1;                                         // 5c00:17ff
  } else {
    await X.ShowCharacterMessage(c, 'Sucks some Blood', 10, true);    // 5c00:182a
    const dmg = byte(await X.RollDice(1, 4));                         // 5c00:1835
    g.DamageType = 0;                                                 // 5c00:183d
    await X.DamageCharacter(v, dmg, 0, false);                        // 5c00:1854
    await X.ClearCombatantActionFlags(c);                             // 5c00:185f  result unused
    if (v.b[ACTIVE] !== 0 && (effDur(e) >> 4) > dmg)                  // 5c00:1867
      setEffDur(e, word(effDur(e) - (dmg << 4)));                     // 5c00:1889
    else
      // quirk: callOnRemove not cleared -> RemoveEffect calls this handler again in mode 1
      await X.RemoveEffect(c, 0x4B, e);                               // 5c00:18aa
  }
}

// 5C00:18B5 EffStirgeAttach — type 4Ch
export async function EffStirgeAttach(c, e, mode) {
  g.HookOpponent = tgt(c);                                            // 5c00:18b8
  const idx = await X.CombatantIndex(g.HookOpponent);
  await X.AddEffect(c, 0x4B, 0xCF, idx, 1);                           // 5c00:18ed
  await X.AddEffect(g.HookOpponent, 0x3A, 0, 0xFF, 0);                // 5c00:1906
  await X.CallEffectHandler(0x3A, g.HookOpponent, null, 0);           // 5c00:191f
}

// 5C00:1935 EffGrab — type 4Dh
export async function EffGrab(c, e, mode) {
  g.HookOpponent = tgt(c);                                            // 5c00:193b
  if (g.HookOpponent.b[STR] < 19) {                                   // 5c00:1952
    const idx = await X.CombatantIndex(g.HookOpponent);
    await X.AddEffect(c, 0x4A, 0, idx, 1);                            // 5c00:197a
    await X.AddEffect(g.HookOpponent, 0x3A, 0, 0xFF, 0);              // 5c00:1993
    await X.CallEffectHandler(0x3A, g.HookOpponent, null, 0);         // 5c00:19ac
    await X.ShowCharacterMessage(g.HookOpponent, 'is held fast', 10, true);   // 5c00:19ce
  }
}

// 5C00:19D9 EffReviveCheck — type 4Eh
export async function EffReviveCheck(c, e, mode) {
  if (!(await X.ReviveCombatant(c, c.b[HP])))                         // 5c00:19ee
    await AddEffectUnlessCuring(c, 0x4E, e ? e.b[E_P3] : 0, 1);       // 5c00:1a0d  result unused
  // TODO(decode): ov24 HealCharacter calls type 4Eh with e = nil; the original then reads p3 from 0000:0003 (garbage) — 0 used
}

// ---- part B: 4Fh..8Bh -------------------------------------------------------------------------------------------

// 5C00:1A19 EffFireDamage — type 4Fh
export async function EffFireDamage(c, e, mode) {
  g.DamageType = 9;                                                   // 5c00:1a1c
  const d = await X.RollDice(2, 10);
  await X.DamageCharacter(tgt(c), d, 0, false);                       // 5c00:1a21 .. 1a43
}

// 5C00:1A4C EffAcidDamage — type 50h
export async function EffAcidDamage(c, e, mode) {
  g.DamageType = 0x10;                                                // 5c00:1a4f
  const d = await X.RollDice(1, 4);
  await X.DamageCharacter(tgt(c), d, 0, false);                       // 5c00:1a54 .. 1a76
}

// 5C00:1AAA EffFearAura — type 51h
export async function EffFearAura(c, e, mode) {
  for (let m = g.PartyHead; m; m = m.next) {                          // 5c00:1ab0 / 1abd / 1b75
    if (m.b[ACTIVE] !== 0 && ((await X.IsSideZero(c)) ? 1 : 0) === m.b[SIDE]) {   // 5c00:1ac8 / 1ad6
      const saved = await X.SavingThrow(m, 4, 0);                     // 5c00:1aee
      const lv = S8(m.b, LEVEL_MAIN);                                 // 5c00:1b02  signed
      if (lv >= 0 && lv <= 3) await X.ApplyEffect(m, 0x34, 0, 0x0C, 0, 1, saved, 'is paralyzed with fear');   // 5c00:1b11
      else if (lv === 4 || lv === 5) await X.ApplyEffect(m, 0x02, 0, 0x0C, 0, 1, saved, 'is weakened by fear');   // 5c00:1b48
    }
  }
}

// 5C00:1BA8 EffFearOnce — type 52h
export async function EffFearOnce(c, e, mode) {
  for (let m = g.PartyHead; m; m = m.next) {                          // 5c00:1bae / 1bbb / 1c71
    await X.RemoveEffect(m, 0x52, null);                              // 5c00:1bc6
    if (m.b[ACTIVE] !== 0 && ((await X.IsSideZero(c)) ? 1 : 0) === m.b[SIDE]) {   // 5c00:1bda / 1be8
      let bonus = 0;                                                  // 5c00:1bfd
      if (g.side_ActiveCount[m.b[SIDE]] >= 6) bonus++;                // 5c00:1c01
      if (m.b[RACE] === 7) bonus += 2;                                // 5c00:1c16  Human
      const saved = await X.SavingThrow(m, 0, bonus);                 // 5c00:1c24
      const d = await X.Roll(1, 4);
      await X.ApplyEffect(m, 0x34, d, 0x0C, 0, 1, saved, 'is paralyzed with fear');   // 5c00:1c39 .. 1c6c
    }
  }
}

async function gazeAnim(from, to, frames) {
  await X.AnimateAlongPath(await X.CombatantCol(from), await X.CombatantRow(from),
    await X.CombatantCol(to), await X.CombatantRow(to), 4, frames);
}

// 5C00:1CAD EffStoneGaze — type 53h
export async function EffStoneGaze(c, e, mode) {
  g.HookOpponent = tgt(c);                                            // 5c00:1cb3
  await X.ShowCharacterMessage(c, 'gazes...', 10, false);             // 5c00:1cca
  await X.BuildFourAnimationFrames(0x12);                             // 5c00:1cea
  await gazeAnim(c, g.HookOpponent, 0x2D);                            // 5c00:1cf2 .. 1d2c
  if (await has(c, 0x7F)) {                                           // 5c00:1d31
    let reflected = false;                                            // 5c00:1d4b
    for (let it = g.HookOpponent.items; it && !reflected; it = it.next) {   // 5c00:1d4f / 1d63 / 1e14
      if (it.b[I_READIED] !== 0 &&
          (it.b[I_WORD + 1] === 0x76 || it.b[I_WORD + 2] === 0x76 || it.b[I_WORD + 3] === 0x76)) {   // 5c00:1d77 .. 1da0 Mirror
        await X.ShowCharacterMessage(g.HookOpponent, 'reflects it!', 12, false);   // 5c00:1da2
        await gazeAnim(g.HookOpponent, c, 0x2D);                      // 5c00:1dc4 .. 1dfe
        reflected = true;                                             // 5c00:1e03
        g.HookOpponent = c;                                           // 5c00:1e07
      }
    }
  }
  if (!(await X.SavingThrow(g.HookOpponent, 1, 0)))                   // 5c00:1e28
    await ApplyFatalStatus(g.HookOpponent, 7, 'is Stoned');           // 5c00:1e3f
}

// 5C00:1E77 EffCharmGaze — type 54h
export async function EffCharmGaze(c, e, mode) {
  g.HookOpponent = tgt(c);                                            // 5c00:1e7d
  const tx = await X.CombatantCol(g.HookOpponent);                    // 5c00:1e94
  const ty = await X.CombatantRow(g.HookOpponent);                    // 5c00:1ea4
  if (!(await X.CanAttack(c, g.HookOpponent))) return;                // 5c00:1eb4
  // quirk: range [BP-2] is never initialised; TODO(decode): garbage — 0FFh (no limit) used
  const range = ref(0xFF);
  if (!(await X.TraceLine(await X.CombatantCol(c), await X.CombatantRow(c), tx, ty, range, g.cm_Map))) return;   // 5c00:1ece .. 1efd
  await X.ShowCharacterMessage(c, 'Gazes...', 10, false);             // 5c00:1f09
  await X.BuildFourAnimationFrames(0x12);                             // 5c00:1f29
  await gazeAnim(c, g.HookOpponent, 0x2D);                            // 5c00:1f31 .. 1f6b
  g.sp_Current = 0x0A;                                                // 5c00:1f70  Charm Person
  const saved = await X.SavingThrow(tgt(c), 4, -2);
  await X.ApplyEffect(g.HookOpponent, 0x0B, 0, byte(c.b[SIDE] * 0x80 + 0x0C), 1, 1, saved, 'is charmed');   // 5c00:1f75 .. 1fc5
  const p = ref();
  if (await X.HasEffect(g.HookOpponent, 0x0B, p))                     // 5c00:1fca
    await X.CallEffectHandler(0x0B, g.HookOpponent, p.v, 0);          // 5c00:1fe3
}

// 5C00:2002 DrainClass — nested in DrainLevels; returns { cls, xpBest }
function xpForLevel(cls, lvl) {                                        // DS:409B + cls*38h + lvl*4 (LongInt)
  const o = 0x409B + cls * 0x38 + lvl * 4;
  return (ds(o) | (ds(o + 1) << 8) | (ds(o + 2) << 16) | (ds(o + 3) << 24)) | 0;
}
export function DrainClass(c) {
  let xpBest = 0, bestLvl = 0, result = 0;                            // 5c00:2008 / 2015
  for (let i = 0; i <= 7; i++) {                                      // 5c00:2019
    const lvl = S8(c.b, LEVEL + i);                                   // 5c00:2022
    const xpTmp = lvl > 1 ? xpForLevel(i, lvl) : 0;                   // 5c00:2037 / 2069
    if (lvl >= bestLvl)                                               // 5c00:2076 signed
      if (xpTmp >= xpBest || xpTmp === -1) {                          // 5c00:207e .. 20a9 signed LongInt
        xpBest = xpTmp; result = i; bestLvl = lvl;                    // 5c00:20ab / 20c1 / 20c7
      }
  }
  return { cls: result, xpBest };                                     // 5c00:20d6
}

// 5C00:2122 DrainLevels
export async function DrainLevels(c, n) {
  const s = n > 1 ? (await X.ByteToStr(n)) + ' levels' : 'a level';  // 5c00:2129 / 2158
  await X.ShowCharacterMessage(c, 'is drained ' + s, 10, true);       // 5c00:216b
  if (c.b[STATUS] === 1) {                                            // 5c00:2196
    await ApplyFatalStatus(c, 8, 'is dead forever');                  // 5c00:21a1
    c.b[HP_MAX] = 0;                                                  // 5c00:21bd
    return;
  }
  let xpBest = 0;
  const dc = () => { const r = DrainClass(c); xpBest = r.xpBest; return r.cls; };
  for (let k = 1; k <= n; k++) {                                      // 5c00:21c8
    if (c.b[STATUS] === 8) continue;                                  // 5c00:21e0
    c.b[LEVELS_DRAINED] = byte(c.b[LEVELS_DRAINED] + 1);              // 5c00:21ee
    let sum = 0;
    for (let i = 0; i <= 7; i++) sum = byte(sum + c.b[LEVEL + i]);    // 5c00:21f5
    // quirk: sum = 0 -> runtime error 200 (division by zero) in the original
    if (sum === 0) throw new Error('Runtime error 200 (DrainLevels 5c00:2219)');
    const hpLoss = byte(Math.trunc(c.b[HP_MAX] / sum));               // 5c00:2219  IDIV of zero-extended bytes (xor ah) = unsigned
    await X.DebugPrint('max,cur,lost', c.b[HP_MAX], c.b[HP], c.b[HP_DRAINED]);   // 5c00:222f
    for (let j = 1; j <= hpLoss; j++) {                               // 5c00:225c
      if (c.b[HP_MAX] > 0) c.b[HP_MAX]--;                             // 5c00:2271
      if (c.b[HP_ROLLED] > 0) c.b[HP_ROLLED]--;                       // 5c00:2282
      if (c.b[HP] > 0) c.b[HP]--;                                     // 5c00:2295
      c.b[HP_DRAINED] = byte(c.b[HP_DRAINED] + 1);                    // 5c00:22a8
    }
    if (S8(c.b, LEVEL_MAIN) < 2) {                                    // 5c00:22b7
      await ApplyFatalStatus(c, 8, 'is dead forever');                // 5c00:22c1
      c.b[HP_MAX] = 0;                                                // 5c00:22dd
      if (S8(c.b, LEVEL + dc()) > 0 && n === 2)                       // 5c00:22e5 / 22f8
        c.b[LEVEL + dc()] = 0;                                        // 5c00:22fe
    } else {
      const cl = dc();
      c.b[LEVEL + cl] = byte(c.b[LEVEL + cl] - 1);                    // 5c00:2311
      if (c.b[HP] === 0 && c.b[STATUS] !== 6)                         // 5c00:2321
        await ApplyFatalStatus(c, 6, 'is killed');                    // 5c00:2337
      await X.UpdateLevelStats(c);                                    // 5c00:2353
    }
    c.b[LEVEL_MAIN] = c.b[LEVEL + dc()];                              // 5c00:235e
    const xp = xpBest >>> 0;                                          // 5c00:2375  threshold left by the last DrainClass
    c.b[XP] = xp & 0xFF; c.b[XP + 1] = (xp >>> 8) & 0xFF; c.b[XP + 2] = (xp >>> 16) & 0xFF; c.b[XP + 3] = (xp >>> 24) & 0xFF;
    await X.RecalcCharacter(c);                                       // 5c00:2388
  }
}

// 5C00:23A4 EffDrainOne — type 55h
export async function EffDrainOne(c, e, mode) { await DrainLevels(tgt(c), 1); }             // 5c00:23a7
// 5C00:23C2 EffDrainTwo — type 56h
export async function EffDrainTwo(c, e, mode) { await DrainLevels(tgt(c), 2); }             // 5c00:23c5

// 5C00:23EC EffMummyTouch — type 57h
export async function EffMummyTouch(c, e, mode) {
  g.HookOpponent = tgt(c);                                            // 5c00:23f2
  if (!(await has(g.HookOpponent, 0x32))) {                           // 5c00:2409
    await X.AddEffect(g.HookOpponent, 0x32, 0x3840, 0xFF, 1);         // 5c00:2422
    const r = await X.Roll(1, 6);
    await X.AddEffect(g.HookOpponent, 0x39, 0xA8C0, byte(r * 16 + 0x0F), 1);   // 5c00:243c
    await X.ShowCharacterMessage(g.HookOpponent, 'is Diseased', 10, true);     // 5c00:2468
  }
}

// 5C00:2490 EffDisplacement — type 59h
export async function EffDisplacement(c, e, mode) {
  if (g.CombatRound === 0 && g.AttackRollValue === 0)                 // 5c00:2493
    e.b[E_P3] = e.b[E_P3] & 0x0F;                                     // 5c00:24a1
  else if ((e.b[E_P3] & 0x10) === 0) {                                // 5c00:24b3
    g.AttackRollValue = 0xFF;                                         // 5c00:24c0
    e.b[E_P3] = e.b[E_P3] | 0x10;                                     // 5c00:24c5
  }
}

// CON save-bonus table of 24D9 / 268A; quirk: CON < 4 or > 20 leaves [BP-1] uninitialised (TODO(decode): garbage — 0 used)
function conSaveBonus(con) {
  if (con >= 4 && con <= 6) return 1;
  if (con >= 7 && con <= 10) return 2;
  if (con >= 11 && con <= 13) return 3;
  if (con >= 14 && con <= 17) return 4;
  if (con >= 18 && con <= 20) return 5;
  return 0;
}

// 5C00:24D9 EffConSaveBonusPoison — type 5Ah
export async function EffConSaveBonusPoison(c, e, mode) {
  if (g.SaveType === 0) addB('SaveRoll', conSaveBonus(c.b[CON]));     // 5c00:24df / 24e6 / 2531
}

// 5C00:2556 EffShield — type 5Bh (export EffShield5B: the published name duplicates 5C00:064E EffShield)
export async function EffShield5B(c, e, mode) {
  if (g.sp_Current === 0x0F) {                                        // 5c00:255c
    CancelDamageAndEffect(0);                                         // 5c00:2563
    await X.ShowCharacterMessage(c, 'is unaffected', 10, true);       // 5c00:256a
  } else if (g.DamageType & 4) CancelDamageAndEffect(0);              // 5c00:258c / 2595
}

// 5C00:25A2 EffHalveFire — type 5Dh
export async function EffHalveFire(c, e, mode) {
  if (g.DamageType & 1) g.DamageAmount = byte(g.DamageAmount) >> 1;   // 5c00:25a5
}

// 5C00:25BC EffHalveWeapon — type 5Eh
export async function EffHalveWeapon(c, e, mode) {
  const it = await CurrentAttackItem(g.SelectedChar);                 // 5c00:25c2
  if (it && (itemsW(it.b[I_TYPE], 7) & 0x81) !== 0)                   // 5c00:25d4  wflags
    g.DamageAmount = byte(g.DamageAmount) >> 1;                       // 5c00:25f5
}

// 5C00:2610 EffFallsDead — type 5Fh
export async function EffFallsDead(c, e, mode) {
  e.b[E_CALL] = 0;                                                    // 5c00:2616
  if (c.b[ACTIVE] !== 0) await ApplyFatalStatus(c, 6, 'Falls dead');  // 5c00:261e / 2629
}

// 5C00:264B EffNeedSilverOrMagic — type 60h
export async function EffNeedSilverOrMagic(c, e, mode) {
  const it = await CurrentAttackItem(g.SelectedChar);                 // 5c00:2651
  if (!it || (it.b[I_PLUS] === 0 && it.b[I_WORD + 3] !== 0xB1))       // 5c00:2663 .. 267d
    g.DamageAmount = 0;                                               // 5c00:267f
}

// 5C00:268A EffConSaveBonusMagic — type 61h
export async function EffConSaveBonusMagic(c, e, mode) {
  if (g.SaveType === 4 || g.SaveType === 2) addB('SaveRoll', conSaveBonus(c.b[CON]));   // 5c00:2690 / 269e / 26e9
}

// 5C00:2700 EffRegenerate3 — type 62h
export async function EffRegenerate3(c, e, mode) {
  c.b[HP] = byte(c.b[HP] + 3);                                        // 5c00:2703
  if (c.b[HP] > c.b[HP_MAX]) c.b[HP] = c.b[HP_MAX];                   // 5c00:270c
}

// 5C00:2730 EffReviveOnce — type 63h
export async function EffReviveOnce(c, e, mode) {
  let hp = 0;                                                         // 5c00:2736
  if (c.b[STATUS] === 5 && cr(c).b[CR_0E] < 6) hp = 6 - cr(c).b[CR_0E];   // 5c00:273a / 2754
  if (c.b[STATUS] === 4) hp = 6;                                      // 5c00:276c
  if (hp > 0)                                                         // 5c00:277b
    if (await X.ReviveCombatant(c, hp)) {                             // 5c00:2781
      const d = (await X.Roll(1, 4)) + 1;
      await X.AddEffect(c, 0x5F, d, 0xFF, 1);                         // 5c00:2794
      e.b[E_CALL] = 0;                                                // 5c00:27b7
      await X.RemoveEffect(c, 0x63, e);                               // 5c00:27bf
    }
}

// 5C00:27D9 EffTrollDown — type 64h
export async function EffTrollDown(c, e, mode) {
  if ((g.DamageType & 1) === 0 && (g.DamageType & 0x10) === 0) {      // 5c00:27dc
    const d = await X.Roll(3, 6);
    await X.AddEffect(c, 0x66, d, 0xFF, 1);                           // 5c00:27ee
  }
}

// 5C00:2814 EffStartRegenerating — type 65h
export async function EffStartRegenerating(c, e, mode) {
  if (!(await has(c, 0x62))                                           // 5c00:281a
      && !(await has(c, 0x3B)))                                       // 5c00:2831
    await X.AddEffect(c, 0x3B, 3, 0xFF, 1);                           // 5c00:2848
}

// 5C00:2866 EffTrollRise — type 66h
export async function EffTrollRise(c, e, mode) {
  if (!(await X.ReviveCombatant(c, c.b[HP_MAX])))                     // 5c00:286c
    await AddEffectUnlessCuring(c, 0x66, e.b[E_P3], 1);               // 5c00:2883
}

// 5C00:28BF EffGaseousEscape — type 67h
export async function EffGaseousEscape(c, e, mode) {
  e.b[E_CALL] = 0;                                                    // 5c00:28c5
  await X.FocusCombatant(c, 3, false);                                // 5c00:28cd
  await X.RemoveFromCombat(c, 3, 'Turns gaseous and escapes');        // 5c00:28de
}

// 5C00:2901 EffAvoidMissiles60 — type 68h
export async function EffAvoidMissiles60(c, e, mode) { await AvoidRangedAttack(c, 60); }   // 5c00:2904

// 5C00:2915 MagicResistance
export async function MagicResistance(pct) {
  const lvl = byte(await X.SpellCasterLevel(g.sp_Current));           // 5c00:291b
  const chance = byte(pct - (11 - lvl) * 5);                          // 5c00:2927  quirk: byte wrap, unsigned compare
  if (g.EffectToApply !== 0 || (g.DamageType & 8) !== 0)              // 5c00:2947
    if (await X.Roll(1, 100) <= chance) CancelDamageAndEffect(0);     // 5c00:2959
}

// 5C00:2976 EffMagicRes50 — type 69h
export async function EffMagicRes50(c, e, mode) { await MagicResistance(50); }             // 5c00:2979
// 5C00:2984 EffMagicRes15 — type 6Ah
export async function EffMagicRes15(c, e, mode) { await MagicResistance(15); }             // 5c00:2987

// 5C00:2992 EffResistSleepCharm90 — type 6Bh
export async function EffResistSleepCharm90(c, e, mode) {
  if (await X.Roll(1, 100) <= 90) {                                   // 5c00:2995
    CancelDamageAndEffect(0x35);                                      // 5c00:29a4
    CancelDamageAndEffect(0x0B);                                      // 5c00:29ab
  }
}
// 5C00:29B6 EffImmuneSleepCharm — type 6Ch
export async function EffImmuneSleepCharm(c, e, mode) {
  CancelDamageAndEffect(0x0B);                                        // 5c00:29b9
  CancelDamageAndEffect(0x35);                                        // 5c00:29c0
}
// 5C00:29CB EffImmuneHold — type 6Dh
export async function EffImmuneHold(c, e, mode) { CancelDamageAndEffect(0x34); }           // 5c00:29ce
// 5C00:29D9 EffImmuneCold — type 6Eh
export async function EffImmuneCold(c, e, mode) { if (g.DamageType & 2) CancelDamageAndEffect(0); }   // 5c00:29dc
// 5C00:29F0 EffImmunePoisonParalysis — type 6Fh
export async function EffImmunePoisonParalysis(c, e, mode) {
  CancelDamageAndEffect(0x37);                                        // 5c00:29f3
  CancelDamageAndEffect(0x34);                                        // 5c00:29fa
  if (g.SaveType === 0) g.SaveRoll = 100;                             // 5c00:2a01
}
// 5C00:2A11 EffImmuneFire — type 70h
export async function EffImmuneFire(c, e, mode) { if (g.DamageType & 1) CancelDamageAndEffect(0); }   // 5c00:2a14

// 5C00:2A28 EffFireMinusOnePerDie — type 71h
export async function EffFireMinusOnePerDie(c, e, mode) {
  if (g.DamageType & 1)                                               // 5c00:2a2e
    for (let i = 1; i <= g.LastDiceCount; i++) {                      // 5c00:2a37
      addB('DamageAmount', -1);                                       // 5c00:2a4c
      if (byte(g.DamageAmount) < g.LastDiceCount) g.DamageAmount = g.LastDiceCount;   // 5c00:2a50
    }
}

// 5C00:2A6D EffHalveElectricity — type 72h
export async function EffHalveElectricity(c, e, mode) { if (g.DamageType & 4) g.DamageAmount = byte(g.DamageAmount) >> 1; }   // 5c00:2a70

// 5C00:2A87 EffHalveEdged — type 73h
export async function EffHalveEdged(c, e, mode) {
  const it = await CurrentAttackItem(g.SelectedChar);                 // 5c00:2a8d
  if (it) {                                                           // 5c00:2a9f
    const wf = itemsW(it.b[I_TYPE], 7);
    if (wf === 0 || (wf & 1) !== 0) g.DamageAmount = byte(g.DamageAmount) >> 1;   // 5c00:2aa7 / 2abd / 2ad6
  }
}

// 5C00:2AE6 EffHalveMagicWeapon — type 74h
export async function EffHalveMagicWeapon(c, e, mode) {
  const it = await CurrentAttackItem(g.SelectedChar);                 // 5c00:2aec
  if (it && S8(it.b, I_PLUS) > 0) g.DamageAmount = byte(g.DamageAmount) >> 1;   // 5c00:2afe / 2b10
}

// 5C00:2B20 EffHolyWater — type 75h
export async function EffHolyWater(c, e, mode) {
  const w = rdy0(g.SelectedChar);                                     // 5c00:2b26
  if (w && w.b[I_TYPE] === 0x55) g.DamageAmount = byte((await X.RollDice(1, 6)) + 1);   // 5c00:2b3a / 2b4c
}

// 5C00:2B63 EffHalveCold — type 76h
export async function EffHalveCold(c, e, mode) { if (g.DamageType & 2) g.DamageAmount = byte(g.DamageAmount) >> 1; }   // 5c00:2b66

// 5C00:2B7D EffNeedMagicWeapon — type 77h
export async function EffNeedMagicWeapon(c, e, mode) {
  const it = await CurrentAttackItem(g.SelectedChar);                 // 5c00:2b83
  if (!it || it.b[I_PLUS] === 0)                                      // 5c00:2b95
    if (S8(g.SelectedChar.b, RACE) > 0 || S8(g.SelectedChar.b, LEVEL_MAIN) < 4)   // 5c00:2ba7 / 2bb2
      g.DamageAmount = 0;                                             // 5c00:2bbd
}

// 5C00:2BC8 EffAvoidBoulders — type 78h
export async function EffAvoidBoulders(c, e, mode) {
  const w = rdy0(g.SelectedChar);                                     // 5c00:2bce
  if (w && (w.b[I_TYPE] === 0x57 || w.b[I_TYPE] === 0x58)) await AvoidRangedAttack(c, 50);   // 5c00:2be2 / 2bfe
}

// 5C00:2C1C EffSpitAcid — type 79h
export async function EffSpitAcid(c, e, mode) {
  g.HookOpponent = tgt(c);                                            // 5c00:2c22
  if (await X.Roll(1, 100) > 25) return;                              // 5c00:2c39
  if (await X.TargetDistance(c, g.HookOpponent) >= 4) return;         // 5c00:2c4b
  await X.ClearCombatantActionFlags(c);                               // 5c00:2c65  result unused
  await X.ShowCharacterMessage(c, 'Spits Acid', 10, true);            // 5c00:2c73
  await X.BuildFourAnimationFrames(0x17);                             // 5c00:2c93
  await X.AnimateAlongPath(await X.CombatantCol(c), await X.CombatantRow(c),
    await X.CombatantCol(g.HookOpponent), await X.CombatantRow(g.HookOpponent), 1, 0x1E);   // 5c00:2c9b .. 2cd5
  // quirk: DamageType not set — the previous damage's kind is used
  const d = await X.RollDice(8, 4);
  const saved = await X.SavingThrow(g.HookOpponent, 3, 0);
  await X.DamageCharacter(g.HookOpponent, d, 2, saved);               // 5c00:2cda .. 2d05
  await X.RemoveEffect(c, 0x79, e);                                   // 5c00:2d0a
  await X.RemoveEffect(c, 0x50, null);                                // 5c00:2d1e
}

// 5C00:2D38 EffOilFlask — type 7Ah
export async function EffOilFlask(c, e, mode) {
  const w = rdy0(g.SelectedChar);                                     // 5c00:2d3e
  if (w && w.b[I_TYPE] === 0x56) g.DamageAmount = byte(await X.RollDice(3, 8));   // 5c00:2d52 / 2d64
  if (g.DamageType & 9) addB('DamageAmount', g.LastDiceCount);        // 5c00:2d72 / 2d7b
}

// 5C00:2D88 EffNeedMagicSilverHalf — type 7Bh
export async function EffNeedMagicSilverHalf(c, e, mode) {
  const it = await CurrentAttackItem(g.SelectedChar);                 // 5c00:2d8e
  if (it) {                                                           // 5c00:2da0
    if (it.b[I_PLUS] === 0 && it.b[I_WORD + 3] === 0xB1) g.DamageAmount = byte(g.DamageAmount) >> 1;   // 5c00:2da8 / 2dbc
    else if (it.b[I_PLUS] === 0) g.DamageAmount = 0;                  // 5c00:2dc8
  } else g.DamageAmount = 0;                                          // 5c00:2dd9
}

// 5C00:2DE4 EffResistSleepCharm30 — type 7Ch
export async function EffResistSleepCharm30(c, e, mode) {
  if (await X.Roll(1, 100) <= 30) {                                   // 5c00:2de7
    CancelDamageAndEffect(0x0B);                                      // 5c00:2df6
    CancelDamageAndEffect(0x35);                                      // 5c00:2dfd
  }
}

// 5C00:2E08 EffUndeadImmunities — type 7Dh
export async function EffUndeadImmunities(c, e, mode) {
  CancelDamageAndEffect(0x0B);                                        // 5c00:2e0b
  CancelDamageAndEffect(0x35);                                        // 5c00:2e12
  CancelDamageAndEffect(0x34);                                        // 5c00:2e19
  CancelDamageAndEffect(0x37);                                        // 5c00:2e20
  if (g.SaveType === 0) g.SaveRoll = 100;                             // 5c00:2e27
}

// 5C00:2E37 EffWardedByItem — type 7Eh
export async function EffWardedByItem(c, e, mode) {
  g.HookOpponent = tgt(c);                                            // 5c00:2e3d
  for (let it = g.HookOpponent.items; it && g.AttackBlocked === 0; it = it.next) {   // 5c00:2e54 / 2e68 / 2ec1
    if (it.b[I_READIED] !== 0)                                        // 5c00:2e77
      for (let k = 1; k <= 3; k++)                                    // 5c00:2e81
        if ((it.b[I_WORD + k] === 0x98 && it.b[I_WORD + 3] === 0xFC) || it.b[I_WORD + k] === 0x76)   // 5c00:2e8a .. 2eb4
          g.AttackBlocked = 1;                                        // 5c00:2eb6
  }
}

// 5C00:2EDA ItemGrantsEffect — item-power types 80h, 81h, 82h, 85h, 86h, 88h, 8Ah, 8Bh
export async function ItemGrantsEffect(c, item, mode) {
  const it = item;                                                    // 5c00:2ee0
  if (mode !== 0) await X.RemoveEffect(c, it.b[I_POWER + 2], null);   // 5c00:2eec / 2ef2
  else {
    await X.AddEffect(c, it.b[I_POWER + 2], 0, 0x0C, 0);              // 5c00:2f0d
    await X.CallEffectHandler(it.b[I_POWER + 2], c, null, 0);         // 5c00:2f29
  }
}

// 5C00:2F57 ItemGiantStrength — item-power type 83h
export async function ItemGiantStrength(c, item, mode) {
  if (mode !== 0) {                                                   // 5c00:2f5d
    let found = false;                                                // 5c00:2f66
    const is1800 = c.b[STR] === 18 && c.b[STR_EXC] === 100;           // 5c00:2f7c
    for (let p = c.effects; p && !found; p = p.next) {                // 5c00:2f6a / 2f9a / 2fff
      if (p.b[E_TYPE] === 0x26) {                                     // 5c00:2fa8
        const os = ref(0), ox = ref(0);
        await X.DecodeStrength(p, os, ox);                            // 5c00:2fb1
        // quirk: p^.type < 80h is always true for a 26h record
        if ((is1800 && p.b[E_TYPE] < 0x80) || (os.v === 18 && ox.v === 100 && !is1800)) {   // 5c00:2fc6 .. 2fe5
          await X.RemoveEffect(c, 0x26, p);                           // 5c00:2fe7
          found = true;                                               // 5c00:2ffb
        }
      }
    }
  } else {
    const oldCode = ref(0);
    if (await X.SetStrength(c, 18, 100, oldCode)) {                   // 5c00:3015
      if (g.game_Mode === 5) {                                        // 5c00:302f
        g.game_Mode = 2;                                              // 5c00:3036
        await X.ShowCharacterMessage(c, 'is stronger', 10, true);     // 5c00:303b
        g.game_Mode = 5;                                              // 5c00:305b
      } else await X.ShowCharacterMessage(c, 'is stronger', 10, true);   // 5c00:3062
    }
    g.ItemsChanged = 1;                                               // 5c00:3082
    await X.AddEffect(c, 0x26, 0, oldCode.v, 1);                      // 5c00:3087  also when SetStrength failed
  }
}

// 5C00:30A5 ItemAlignmentShock — item-power type 84h
export async function ItemAlignmentShock(c, item, mode) {
  const it = item;                                                    // 5c00:30ab
  if (mode !== 0) return;                                             // 5c00:30b7
  if ((it.b[I_POWER + 2] & 0x0F) !== c.b[ALIGNMENT]) {                // 5c00:30bf
    it.b[I_READIED] = 0;                                              // 5c00:30d2
    const dmg = it.b[I_POWER + 2] >> 4;                               // 5c00:30da
    g.DamageType = 8;                                                 // 5c00:30ea
    if (g.game_Mode === 5) await X.DrawCombatLayout();                // 5c00:30ef
    await X.DamageCharacter(c, dmg, 0, false);                        // 5c00:30fb
    g.ItemsChanged = 1;                                               // 5c00:3110
  }
}

// 5C00:3134 ItemNeedsGiantStrength — item-power type 87h
export async function ItemNeedsGiantStrength(c, item, mode) {
  if (mode !== 0) return;                                             // 5c00:3146
  if (c.b[STR] < 19) {                                                // 5c00:314e
    item.b[I_READIED] = 0;                                            // 5c00:3158
    await X.ShowTimedBottomMessage('Must have Giant Strength');       // 5c00:3160
  }
}

// 5C00:317A ItemRemove17 — item-power type 89h
export async function ItemRemove17(c, item, mode) {
  if (mode !== 0) await X.RemoveEffect(c, 0x17, null);                // 5c00:317d
}

// 5C00:319B EffNop — types 05h, 0Dh, 13h, 18h, 1Bh, 3Ch, 3Fh, 5Ch, 7Fh
export async function EffNop(c, e, mode) {}                           // 5c00:319b

// 5C00:31A2 InstallEffectHandlers — fills EffectHandler[01h..8Bh] except 58h (DS:6828 + 4t)
// 49h / 4Ah live in ov13 (stub seg 0068): EffRake 6100:39D2 / EffHold 6100:3A86 (combat_ov13.js).
export function handlerTable() {
  const ext = (name) => async (c, e, mode) => X[name](c, e, mode);
  return {
    0x01: EffBless, 0x02: EffCurse, 0x03: EffBonusVsUndead, 0x04: EffStartsToTrain, 0x05: EffNop, 0x06: EffFlameTongue,
    0x07: EffHardier, 0x08: EffProtFromEvil, 0x09: EffProtFromGood, 0x0A: EffResistCold, 0x0B: EffCharm, 0x0C: EffStrengthEnd,
    0x0D: EffNop, 0x0E: EffSetCharisma, 0x0F: EffHpLossTick, 0x10: EffNop10, 0x11: EffShield, 0x12: EffGnomeAttackBonus,
    0x13: EffNop, 0x14: EffResistFire, 0x15: EffSilence, 0x16: EffSlowPoisonEnd, 0x17: EffSpiritualHammer, 0x18: EffNop,
    0x19: EffInvisible, 0x1A: EffDwarfAttackBonus, 0x1B: EffNop, 0x1C: EffMirrorImage, 0x1D: EffEnfeebled, 0x1E: EffCoughing,
    0x1F: EffHelpless, 0x20: EffAnimatedEnd, 0x21: EffPenaltyAll4, 0x22: EffWeaknessAndDrain, 0x23: EffPlusOne, 0x24: EffPenalty4,
    0x25: EffUntouchableBeforeTurn, 0x26: EffStrengthEnd, 0x27: EffHaste, 0x28: EffCloudRemoved, 0x29: EffMagicWeaponOnly,
    0x2A: EffSlow, 0x2B: EffWeakness, 0x2C: EffHpDrainTick, 0x2D: EffProtFromEvil, 0x2E: EffProtFromGood,
    0x2F: EffDwarfGiantDefence, 0x30: EffGnomeGiantDefence, 0x31: EffPrayer, 0x32: EffSlowHeal, 0x33: EffHelpless,
    0x34: EffHelpless, 0x35: EffHelpless, 0x36: EffNop36, 0x37: EffNop37, 0x38: EffGrantInvisible, 0x39: EffMummyRot,
    0x3A: EffHeld, 0x3B: EffBecome62, 0x3C: EffNop, 0x3D: EffFireResistance, 0x3E: EffRegenerate, 0x3F: EffNop,
    0x40: EffPoisonHit, 0x41: EffPoisonHitP4, 0x42: EffPoisonHitP2, 0x43: EffParalyzeHit2d8, 0x44: EffGhoulParalysis,
    0x45: EffParalyzeHitLong, 0x46: EffPoisonHitM2, 0x47: EffUnattackable, 0x48: EffGrantInvisible95,
    0x49: ext('EffRake'), 0x4A: ext('EffHold'), 0x4B: EffBloodDrain, 0x4C: EffStirgeAttach, 0x4D: EffGrab, 0x4E: EffReviveCheck,
    0x4F: EffFireDamage, 0x50: EffAcidDamage, 0x51: EffFearAura, 0x52: EffFearOnce, 0x53: EffStoneGaze, 0x54: EffCharmGaze,
    0x55: EffDrainOne, 0x56: EffDrainTwo, 0x57: EffMummyTouch,
    0x59: EffDisplacement, 0x5A: EffConSaveBonusPoison, 0x5B: EffShield5B, 0x5C: EffNop, 0x5D: EffHalveFire,
    0x5E: EffHalveWeapon, 0x5F: EffFallsDead, 0x60: EffNeedSilverOrMagic, 0x61: EffConSaveBonusMagic, 0x62: EffRegenerate3,
    0x63: EffReviveOnce, 0x64: EffTrollDown, 0x65: EffStartRegenerating, 0x66: EffTrollRise, 0x67: EffGaseousEscape,
    0x68: EffAvoidMissiles60, 0x69: EffMagicRes50, 0x6A: EffMagicRes15, 0x6B: EffResistSleepCharm90, 0x6C: EffImmuneSleepCharm,
    0x6D: EffImmuneHold, 0x6E: EffImmuneCold, 0x6F: EffImmunePoisonParalysis, 0x70: EffImmuneFire, 0x71: EffFireMinusOnePerDie,
    0x72: EffHalveElectricity, 0x73: EffHalveEdged, 0x74: EffHalveMagicWeapon, 0x75: EffHolyWater, 0x76: EffHalveCold,
    0x77: EffNeedMagicWeapon, 0x78: EffAvoidBoulders, 0x79: EffSpitAcid, 0x7A: EffOilFlask, 0x7B: EffNeedMagicSilverHalf,
    0x7C: EffResistSleepCharm30, 0x7D: EffUndeadImmunities, 0x7E: EffWardedByItem, 0x7F: EffNop,
    0x80: ItemGrantsEffect, 0x81: ItemGrantsEffect, 0x82: ItemGrantsEffect, 0x83: ItemGiantStrength, 0x84: ItemAlignmentShock,
    0x85: ItemGrantsEffect, 0x86: ItemGrantsEffect, 0x87: ItemNeedsGiantStrength, 0x88: ItemGrantsEffect, 0x89: ItemRemove17,
    0x8A: ItemGrantsEffect, 0x8B: ItemGrantsEffect,
  };
}

export function InstallEffectHandlers(gl = null) {
  const G2 = gl ?? g;
  const t = handlerTable();
  if (!Array.isArray(G2.EffectHandler)) G2.EffectHandler = new Array(0x8C).fill(null);
  for (let k = 0x01; k <= 0x57; k++) G2.EffectHandler[k] = t[k];      // 5c00:31a5 .. 3566
  // EffectHandler[$58] is not written: stays nil (0000:0000)
  for (let k = 0x59; k <= 0x8B; k++) G2.EffectHandler[k] = t[k];      // 5c00:3567 .. 38a3
  return G2.EffectHandler;
}

// 5C00:38A9 ov12_init — empty unit initialiser
export function ov12_init() {}                                        // 5c00:38a9
