// game/areas/combat_ov13.js — COMBAT ov13 (seg 6100): round start, melee/missile attacks, attack messages,
// por-only: Pool combat fields, monster/icon loading, terrain and AD&D rules (whole module) (profile: engine.areaModules / recordSizes / daxGroups; game/profiles/PORONLY.md)
// backstab, free attacks, step/flee, turn undead, target selection (player + AI), spell targets, two effect handlers,
// the STING cheat. Lane por-build-combat.
// Source: decode/pseudo/COMBAT.pas.md "## ov13 (6100)" (FINAL) + combat_parts/ov13_notes.md; evidence decode/listings/ov13.lst.
// Conventions: combat_core.js header. Every routine keeps its `// 6100:OFF`; statements keep `{ 6100:xxxx }` addresses.
//
// Local representation choices (beyond combat_core.js; flagged for the other combat parts):
// - `var` parameters (scalar) are boxes `{ v }`; a global used as a var argument is passed as gbox('name').
//   TTargetRec (7 bytes: +0 char, +4 x, +5 y, +6) is a mutable object { char, x, y, b6 } (newTargetRec()).
// - TChar readied[slot] far pointers (+CCh + 4*slot) are the JS array c.readied[slot] (null = nil).
// - Combat tables (engine request #1, JS arrays indexed by combatant index i = 1..n):
//   cb_Char[i] (DS:65B9), cb_Col[i] / cb_Row[i] / cb_Size[i] (DS:5F27/5F28/5F2A + 4i; cb_Size[0] = count),
//   foe_List[i] (DS:6DE4 + i), tg_List[i] (DS:6718 + 3i, 3-byte entry, [0] = combatant index), tg_Count (DS:671A),
//   BodyList[k] = { char, x, y, ground } (DS:66D6 + 7k), BodyCount (DS:6715), SlotHits[1..2] (DS:6822 + k),
//   SlotSwings[1..2] (DS:6E2C + k), SpellTargets[1..n] (DS:6C91 + 4i).
// - cm_Map (g_6716) = { b: Uint8Array } combat map record: +2 viewX, +3 viewY, +4 cursor, +5, +6 scan flag.
// - ecl_Mem6B00 = the VM's Uint16Array of ECL words 6B00h.. (index = ECL address − 6B00h; pseudo `w[$596]` = byte
//   offset 596h = ECL word 6DCBh = index 2CBh).
// - HorizontalMenu: menus.js shape { key, ext } (the Pascal var ext is written to the caller's variable).

import {
  X, g, ds, dsW, dsS8, S8, cr, byte, word, shortint, newItem,
} from './combat_core.js';
import { text } from '../engine/text.js';
import {
  Roll, RollDice, AttackRoll, CallEffectHooks, RemoveEffect, ov24_0FD2, RemoveCombatEffects, RemoveFromCombat,
} from './combat_ov24.js';
import { SpellList } from './combat_ov19.js';
import { hooks } from '../plus/hooks.js';   // GBP W1/W3 (docs/PLUS_HOOKS.md)

// ---- local helpers ----------------------------------------------------------------------------------------
const box = (v) => ({ v });
const gbox = (name) => ({ get v() { return g[name]; }, set v(x) { g[name] = x; } });
const fbox = (o, k) => ({ get v() { return o[k]; }, set v(x) { o[k] = x; } });
const b01 = (f) => (f ? 1 : 0);

export const newTargetRec = () => ({ char: null, x: 0, y: 0, b6: 0 });
const clearTgt = (t) => { t.char = null; t.x = 0; t.y = 0; t.b6 = 0; };    // FillChar(tgt, 7, 0)

// TChar fields (SAVES.md §3)
const F = {
  hp_max: 0x32, fighter_lvl_eff: 0x6B, size: 0x6C, level_main: 0x73, undead_type: 0x76, npc_morale: 0x84,
  level: 0x96, attacks: 0xA1, attacks2: 0xA2, status: 0x10C, active: 0x10D, side: 0x10E, controlled: 0x10F,
  ac: 0x111, ac_rear: 0x112, attacks_left: 0x112 /* +k */, dmg_dice: 0x114 /* +k */, dmg_sides: 0x116 /* +k */,
  dmg_bonus: 0x118 /* +k */, hp: 0x11B, move: 0x11C,
};
// combat record cr(c) (COMBAT.pas.md ov13 conventions)
const CR = {
  castSpell: 0, f1: 1, f2: 2, initiative: 3, attackSlot: 4, sweepLeft: 5, moveLeft: 6, freeAttack: 7,
  attacked: 8, facing: 9, /* +0Ah target = cr(c).target (JS ref) */ timesAttacked: 0x0F, turned: 0x10,
  hasTurned: 0x11, rotation: 0x12,
};
// item record (SAVES.md §4)
const IT = { type: 0x2E, readied: 0x34, count: 0x39, power3: 0x3E };

const rdy = (c, slot) => (c.readied ? c.readied[slot] ?? null : null);   // TChar +CCh + 4*slot
const ITEMS = (type, j) => ds(0x5582 + type * 16 + j);                     // ITEMS[type] (DS:5582, 16 bytes)
const SPELL = (sp, j) => ds(0x31FA + sp * 16 + j);                         // spell table DS:31FA + spell*16
const DX = (dir) => dsS8(0x2736 + dir);                                    // g_2736 direction dx
const DY = (dir) => dsS8(0x273F + dir);                                    // g_273F direction dy
const eclW = (addr) => g.ecl_Mem6B00[addr - 0x6B00];                       // ECL word at addr
const setEclW = (addr, v) => { g.ecl_Mem6B00[addr - 0x6B00] = word(v); };
const tgIdx = (e) => e.who;                                              // tg_List entry byte 0 (VIEW: { who, dist, dir })
const snd = (off) => dsW(off);                                             // sound id words g_2620.. (image)

// ---------------------------------------------------------------------------------------------------------
// 6100:0000 StartCombatRound
export async function StartCombatRound(c) {
  const r = cr(c).b;                                                       // { 6100:0006 }
  r[CR.castSpell] = 0;                                                     // { 6100:0014 }
  r[CR.f1] = 1;                                                            // { 6100:001b }  TODO(decode): meaning of cr+1
  r[CR.f2] = 1;                                                            // { 6100:0023 }  TODO(decode): meaning of cr+2
  r[CR.attacked] = 0;                                                      // { 6100:002b }
  r[CR.attackSlot] = 2;                                                    // { 6100:0033 }
  await CalcAttacks(c);                                                    // { 6100:003b }
  g.StatValue = c.b[F.attacks2];                                           // { 6100:0045 }  +A2h half-attacks slot 2
  g.StatKind = 0;                                                          // { 6100:0050 }
  await CallEffectHooks(0x12, c);                                          // { 6100:0055 }
  c.b[F.attacks_left + 2] = HalfRound(g.StatValue);                        // { 6100:0063 }  +114h
  r[CR.sweepLeft] = c.b[F.fighter_lvl_eff];                                // { 6100:0073 }
  if (c.b[F.active] !== 0) {                                               // { 6100:0081 }
    const adj = shortint(await X.DexMissileAdj(c));                        // { 6100:008c }  CBW
    r[CR.initiative] = byte(adj + (await Roll(1, 6)));                     // { 6100:00ac }
    if (S8(r, CR.initiative) < 1) r[CR.initiative] = 1;                    // { 6100:00b0 }  JGE signed
    if (((shortint(c.b[F.side]) + 1) & eclW(0x6DCB) & 0xFF) !== 0)         // { 6100:00c2 }  ECL 6DCBh SURPRISE, AL only
      r[CR.initiative] = byte(r[CR.initiative] - 6);                       // { 6100:00d9 }
    if (S8(r, CR.initiative) < 0 || S8(r, CR.initiative) > 20) r[CR.initiative] = 0;   // { 6100:00e1 }
  } else {
    r[CR.initiative] = 0;                                                  // { 6100:00ff }
  }
  r[CR.moveLeft] = await CalcMove(c);                                      // { 6100:0107 }
}

// 6100:0123 CalcMove
export async function CalcMove(c) {
  let m = c.b[F.move];                                                     // { 6100:0129 }
  if (c.b[F.side] === 0) m = byte(m + eclW(0x6E72));                       // { 6100:0134 }  TODO(decode): ECL word 6E72h meaning
  g.StatKind = 1;                                                          // { 6100:0150 }
  if (m < 1 || m > 0x60) m = 1;                                            // { 6100:0155 }  unsigned
  g.StatValue = byte(m * 2);                                               // { 6100:0165 }
  await CallEffectHooks(0x12, c);                                          // { 6100:016f }
  g.StatKind = 0;                                                          // { 6100:017d }
  return g.StatValue;                                                      // { 6100:0182 }
}

// 6100:0191 RollDamage
export async function RollDamage(att, tgt, k) {
  const dice = await RollDice(att.b[F.dmg_dice + k], att.b[F.dmg_sides + k]);   // { 6100:0194 }
  g.DamageAmount = byte(byte(dice) + S8(att.b, F.dmg_bonus + k));         // { 6100:01cf }  8-bit add
  // quirk: { 6100:01d2 } `if DamageAmount < 0` is an unsigned compare (JNC), never true: a negative sum stays 256+sum
  if (await CanBackstab(att, tgt))                                               // { 6100:01de }
    g.DamageAmount = byte(g.DamageAmount * ((word(S8(att.b, F.level + 6)) >>> 1 >>> 1) + 2));   // { 6100:01f2 }  CBW, SHR word
  g.DamageType = 0;                                                        // { 6100:020d }  g_6819
  await CallEffectHooks(4, att);                                           // { 6100:0212 }
  await CallEffectHooks(5, tgt);                                           // { 6100:0220 }
}

// 6100:02F9 ShowAttackResult
export async function ShowAttackResult(att, tgt, kind, dmgApplied, dmgShown, hit) {
  let s;
  switch (kind) {                                                          // { 6100:0300 }
    case 2: s = '-Backstabs-'; break;                                      // { 6100:0307 }
    case 3: s = 'slays helpless'; break;                                   // { 6100:0320 }
    default: s = 'Attacks';                                                // { 6100:0335 }
  }
  await X.ShowCharacterMessage(att, s, 0x0A, 0);                           // { 6100:0348 }
  let row = 0x0C;                                                          // { 6100:035e }
  await X.DrawCharacterName(tgt, 0x17, row, 0);                            // { 6100:0362 }
  row = row + 1;                                                           // { 6100:0377 }
  s = kind === 1 ? '(from behind) ' : '';                                  // { 6100:037a }
  if (hit !== 0) {                                                         // { 6100:0399 }
    if (kind === 3) s = 'with one cruel blow';                             // { 6100:03a2 }
    else {
      s = s + 'Hitting for ' + (await X.ByteToStr(dmgShown));              // { 6100:03be }
      if (dmgShown === 1) s = s + ' point ';                               // { 6100:03fa }
      else s = s + ' points ';                                             // { 6100:042a }
      s = s + 'of damage';                                                 // { 6100:0452 }
    }
    await X.ApplyDamage(tgt, dmgApplied);                                  // { 6100:047a }
  } else {
    s = s + 'and Misses';                                                  // { 6100:048b }
  }
  await X.DrawWrappedText(0x17, row, 0x26, row + 3, 0x0A, 1, s);           // { 6100:04b3 }
  row = byte(text.row + 1);                                                // { 6100:04d6 }  text_Row g_5E25
  if (dmgApplied > 0) {                                                    // { 6100:04df }
    cr(tgt).b[CR.f1] = 0;                                                  // { 6100:04e5 }
    if (cr(tgt).b[CR.castSpell] > 0) {                                     // { 6100:04f2 }
      await X.MessageDelay();                                              // { 6100:0500 }
      await X.ShowCharacterMessage(tgt, 'lost a spell', 0x0C, 1);          // { 6100:0505 }
      // quirk: { 6100:0525 } clears the id in SelectedChar^.mem_spell[]; SelectedChar is the ATTACKER here (Attack)
      await X.ForgetMemorizedSpell(cr(tgt).b[CR.castSpell]);
      cr(tgt).b[CR.castSpell] = 0;                                         // { 6100:0536 }
    } else await X.MessageDelay();                                         // { 6100:0544 }
  } else await X.MessageDelay();                                           // { 6100:054b }
  if (tgt.b[F.active] === 0) {                                             // { 6100:0550 }
    await X.ShowCharacterMessage(tgt, 'goes down', row, 0);                // { 6100:055e }
    row = byte(row + 2);                                                   // { 6100:057f }
    if (tgt.b[F.status] === 5) await X.DrawText(0x17, row, 0x0A, 'and is Dying');   // { 6100:0583 }
    const st = tgt.b[F.status];
    if (st === 6 || st === 7 || st === 8) await X.ShowCharacterMessage(tgt, 'is killed', row, 0);   // { 6100:05ac }
    row = byte(row + 2);                                                   // { 6100:05e2 }
    await RemoveCombatEffects(tgt);                                        // { 6100:05e6 }
    await CallEffectHooks(0x0D, tgt);                                      // { 6100:05f1 }
    if (tgt.b[F.active] === 0) await X.RemoveCombatant(tgt);               // { 6100:05ff }
    else await X.MessageDelay();                                           // { 6100:0617 }
  }
  await X.ClearCharacterMessage();                                         // { 6100:061c }
}

// 6100:0627 FreeAttacksOnMover
export async function FreeAttacksOnMover(c) {
  const n = await X.CollectOppositeSideTargets(c, 1);                      // { 6100:062d }
  const dummy = box(0);
  for (let i = 1; i <= n; i++) {                                           // { 6100:0644 }
    if (c.b[F.active] !== 0) {                                             // { 6100:0656 }
      const e = g.cb_Char[g.foe_List[i]];                                  // { 6100:0664 }
      if (cr(e).b[CR.freeAttack] !== 0 && !(await X.IsHelpless(e))) {      // { 6100:0685 }
        await X.FocusSquare(await X.CombatantCol(c), await X.CombatantRow(c), 2, 8);   // { 6100:06a3 }
        cr(e).b[CR.freeAttack] = 0;                                        // { 6100:06c6 }
        await FaceAttacker(e, c);                                                // { 6100:06d3 }
        await Attack(e, c, 0, null, dummy);                                // { 6100:06e3 }
      }
    }
  }
}

// 6100:0712 StepCombatant
export async function StepCombatant(c, dir) {
  const cost = dir & 1 ? 3 : 2;                                            // { 6100:0718 }
  const r = cr(c).b;
  if (cost > r[CR.moveLeft]) {                                             // { 6100:0729 }
    r[CR.moveLeft] = 0;                                                    // { 6100:073a }
    return;
  }
  r[CR.moveLeft] = byte(r[CR.moveLeft] - cost);                            // { 6100:074a }
  const idx = await X.CombatantIndex(c);                                         // { 6100:0759 }
  const ox = g.cb_Col[idx], oy = g.cb_Row[idx];                            // { 6100:0767 }
  const nx = byte(ox + DX(dir));                                           // { 6100:078b }
  const ny = byte(oy + DY(dir));                                           // { 6100:07a2 }
  let mode = 1;                                                            // { 6100:07b9 }
  if (c.b[F.controlled] !== 0) {                                           // { 6100:07bd }
    mode = 3;                                                              // { 6100:07c8 }
    if (!await X.InWindow(nx - g.cm_Map.b[2], ny - g.cm_Map.b[3]))               // { 6100:07cc }
      await X.FocusSquare(ox, oy, 2, 8);                                   // { 6100:07f9 }
  }
  await X.RestoreTerrain(0, 0, idx);                                       // { 6100:080c }
  g.cb_Col[idx] = nx;                                                      // { 6100:081b }
  g.cb_Row[idx] = ny;                                                      // { 6100:082d }
  await X.RebuildOccupancy();                                              // { 6100:083f }
  await X.FocusSquare(nx, ny, mode, 8);                                    // { 6100:0844 }
  r[CR.timesAttacked] = 0;                                                 // { 6100:0858 }
  r[CR.rotation] = 0;                                                      // { 6100:0865 }
  await X.PlayOrStopSound(snd(0x2628));                                    // { 6100:0872 }
  await FreeAttacksOnMover(c);                                             // { 6100:087b }
  if (c.b[F.active] === 0 || (await X.IsHelpless(c)))                      // { 6100:0885 }
    r[CR.moveLeft] = 0;                                                    // { 6100:089f }
}

// 6100:08B2 AttacksOfOpportunity
export async function AttacksOfOpportunity(c, dir) {
  const L = new Array(13).fill(0);                                         // { 6100:08b8 }  L[1..12]
  const idx = await X.CombatantIndex(c);                                         // { 6100:08c9 }
  const n = await X.CollectOppositeSideTargets(c, 1);                      // { 6100:08d7 }
  if (n === 0) return;                                                     // { 6100:08e8 }
  for (let i = 1; i <= n; i++) L[i] = g.foe_List[i];                       // { 6100:08f1 }
  g.cb_Col[idx] = byte(g.cb_Col[idx] + DX(dir));                           // { 6100:0923 }  tentative step
  g.cb_Row[idx] = byte(g.cb_Row[idx] + DY(dir));                           // { 6100:093d }
  const m = await X.CollectOppositeSideTargets(c, 1);                      // { 6100:0957 }
  g.cb_Col[idx] = byte(g.cb_Col[idx] - DX(dir));                           // { 6100:0968 }  undo
  g.cb_Row[idx] = byte(g.cb_Row[idx] - DY(dir));                           // { 6100:0982 }
  for (let i = 1; i <= n; i++) {                                           // { 6100:099c }
    let still = false;                                                     // { 6100:09b1 }
    for (let j = 1; j <= m; j++)                                           // { 6100:09b5 }
      if (g.foe_List[j] === L[i]) still = true;                            // { 6100:09ca }
    if (still) L[i] = 0;                                                   // { 6100:09ef }
  }
  for (let i = 1; i <= n; i++) {                                           // { 6100:0a08 }
    if (L[i] > 0 && c.b[F.active] !== 0) {                                 // { 6100:0a20 }
      let done = false;                                                    // { 6100:0a3e }
      const e = g.cb_Char[L[i]];                                           // { 6100:0a42 }
      if (await X.IsHelpless(e)) continue;                                 // { 6100:0a62 }
      if (!(await CanAttack(e, c))) continue;                              // { 6100:0a74 }
      if (await X.HasEffect(e, 0x4B, box(null))) continue;                 // { 6100:0a8b }
      if (await X.HasEffect(e, 0x4A, box(null))) continue;                 // { 6100:0aa5 }
      const re = cr(e).b;
      const kFrom = byte(re[CR.facing] + 6), kTo = byte(re[CR.facing] + 10);   // { 6100:0abf }  byte loop bounds
      for (let k = kFrom; k <= kTo; k++) {
        if (!done) {                                                       // { 6100:0af4 }
          if (S8(re, CR.initiative) > 0 || re[CR.timesAttacked] === 0      // { 6100:0afd }
              || await X.InFrontArc(await X.CombatantCol(e), await X.CombatantRow(e), await X.CombatantCol(c), await X.CombatantRow(c), k % 8)) {   // { 6100:0b1b }
            let slot = 1;                                                  // { 6100:0b64 }
            if (e.b[F.attacks] === 0) slot = 2;                            // { 6100:0b68 }
            for (let j = 1; j <= 2; j++)                                   // { 6100:0b77 }
              if (e.b[F.attacks_left + j] > 0) slot = j;                   // { 6100:0b80 }
            if (e.b[F.attacks_left + slot] === 0) e.b[F.attacks_left + slot] = 1;   // { 6100:0b9e }
            re[CR.attackSlot] = slot;                                      // { 6100:0bc0 }
            const saved = cr(e).target;                                    // { 6100:0bcf }
            await Attack(e, c, 1, null, gbox('g_6E31'));                   // { 6100:0be5 }
            done = true;                                                   // { 6100:0c03 }
            cr(e).target = saved;                                          // { 6100:0c07 }
            if (c.b[F.active] !== 0) await X.DrawCharacterSummary(c);      // { 6100:0c1d }
          }
        }
      }
    }
  }
}

// 6100:0C6A Flee
export async function Flee(c) {
  let escaped = false;                                                     // { 6100:0c70 }
  if ((await X.CollectOppositeSideTargets(c, 0xFF)) === 0) escaped = true; // { 6100:0c74 }
  else {
    const mine = (await CalcMove(c)) >>> 1;                                // { 6100:0c8c }
    const theirs = await MaxEnemyMove(c);                                  // { 6100:0c9d }
    if (theirs < mine) escaped = true;                                     // { 6100:0caa }
    else if (theirs === mine && (await Roll(1, 2)) === 1) escaped = true;  // { 6100:0cb8 }
  }
  if (escaped) await RemoveFromCombat(c, 3, 'Got Away');                   // { 6100:0cd3 }
  else await X.ShowTimedBottomMessage('Escape is blocked');                // { 6100:0cf8 }
  return b01(await X.ClearCombatantActionFlags(c));                        // { 6100:0d0c }
}

// 6100:0D23 CalcAttacks
export async function CalcAttacks(c) {
  let missile = false;                                                     // { 6100:0d29 }
  const old = c.b[F.attacks_left + 1];                                     // { 6100:0d2d }
  c.b[F.attacks_left + 1] = c.b[F.attacks];                                // { 6100:0d38 }
  const ammo = box(null);
  if ((await X.WeaponIsRanged(c)) && (await X.GetMissileAmmo(c, ammo))) { // { 6100:0d48 }
    missile = true;                                                        // { 6100:0d6b }
    let rof = ITEMS(rdy(c, 0).b[IT.type], 5);                              // { 6100:0d6f }  DS:5587
    if (rof < 2) rof = 2;                                                  // { 6100:0d8a }
    g.StatValue = rof;                                                     // { 6100:0d94 }
  } else {
    g.StatValue = c.b[F.attacks_left + 1];                                 // { 6100:0d9c }
  }
  g.StatKind = 0;                                                          // { 6100:0da7 }
  await CallEffectHooks(0x12, c);                                          // { 6100:0dac }
  let n = HalfRound(g.StatValue);                                          // { 6100:0dba }
  if (missile && ammo.v !== null) {                                        // { 6100:0dc5 }
    let k = 1;                                                             // { 6100:0dd3 }
    if (ammo.v !== null && ammo.v.b[IT.count] > k) k = ammo.v.b[IT.count]; // { 6100:0dd7 }
    if (k < n) n = k;                                                      // { 6100:0df5 }
  }
  if (cr(c).b[CR.attacked] === 0 || n < old)                               // { 6100:0e03 }
    c.b[F.attacks_left + 1] = n;                                           // { 6100:0e41 }
  else if (n < 2 * old && !missile)                                        // { 6100:0e29 }
    c.b[F.attacks_left + 1] = n;                                           // { 6100:0e41 }
}

// 6100:0E52 HalfRound
export function HalfRound(v) {
  let t = byte(v);                                                         // { 6100:0e58 }
  if (g.CombatRound & 1) t = byte(t + 1);                                  // { 6100:0e5e }
  return t >>> 1;                                                          // { 6100:0e68 }
}

// 6100:0E82 FighterSweep
export async function FighterSweep(att, tgt) {
  if (att.b[F.attacks_left + 1] >= cr(att).b[CR.sweepLeft]) return false;  // { 6100:0e8c }
  if (tgt.b[F.level_main] !== 0) return false;                             // { 6100:0ea5 }
  if ((await X.TargetDistance(att, tgt)) !== 1) return false;              // { 6100:0eb2 }
  const n = await X.CollectOppositeSideTargets(att, 1);                    // { 6100:0eca }
  let cnt = 0;                                                             // { 6100:0edb }
  let pos = 0;                                                             // TODO(decode): garbage — pos uninitialised if tgt is not in foe_List
  for (let i = 1; i <= n; i++) {                                           // { 6100:0ee5 }
    const e = g.cb_Char[g.foe_List[i]];                                    // { 6100:0ef4 }
    if (e === tgt) pos = i;                                                // { 6100:0f15 }
    if (e.b[F.level_main] === 0) cnt++;                                    // { 6100:0f2b }
  }
  if (cnt <= att.b[F.attacks_left + 1]) return false;                      // { 6100:0f40 }
  if (cnt > cr(att).b[CR.sweepLeft]) cnt = cr(att).b[CR.sweepLeft];        // { 6100:0f50 }
  await X.ShowCharacterMessage(att, 'sweeps', 0x0A, 1);                    // { 6100:0f70 }
  if (g.cb_Char[g.foe_List[1]] !== tgt) {                                  // { 6100:0f90 }
    g.foe_List[pos] = g.foe_List[1];                                       // { 6100:0fb9 }
    g.foe_List[1] = await X.CombatantIndex(tgt);                                 // { 6100:0fc8 }
  }
  for (let i = 1; i <= n; i++) {                                           // { 6100:0fd6 }
    if (cnt > 0 && g.cb_Char[g.foe_List[i]].b[F.level_main] === 0) {       // { 6100:0fee }
      const e = g.cb_Char[g.foe_List[i]];                                  // { 6100:1012 }
      await FaceAttacker(att, e);                                                // { 6100:1033 }
      att.b[F.attacks_left + 1] = 1;                                       // { 6100:1043 }
      await Attack(att, e, 0, null, gbox('g_6E31'));                       // { 6100:104c }
      cnt--;                                                               // { 6100:106a }
    }
  }
  return true;                                                             // { 6100:1078 }
}

// 6100:1085 CanAttack
export async function CanAttack(att, tgt) {
  if (tgt === null || tgt === undefined) return false;                     // { 6100:108f }
  if (att === tgt) return true;                                            // { 6100:109a }
  g.AttackBlocked = 0;                                                     // { 6100:10b0 }
  await CallEffectHooks(1, tgt);                                           // { 6100:10b5 }
  if (g.AttackBlocked === 0) {                                             // { 6100:10c3 }
    const saved = cr(att).target;                                          // { 6100:10ca }
    cr(att).target = tgt;                                                  // { 6100:10e0 }
    await CallEffectHooks(0, att);                                         // { 6100:10f6 }
    cr(att).target = saved;                                                // { 6100:1104 }
  }
  return g.AttackBlocked === 0;                                            // { 6100:111a }
}

// 6100:116A TurnUndead
export async function TurnUndead(c) {
  await X.ShowCharacterMessage(c, 'turns undead...', 0x0A, 0);             // { 6100:1170 }
  await X.ClearMenuLine();                                                 // { 6100:1190 }
  await X.MessageDelay();                                                  // { 6100:1195 }
  let any = false;                                                         // { 6100:119a }
  let stop = false;                                                        // { 6100:119e }
  cr(c).b[CR.hasTurned] = 1;                                               // { 6100:11a2 }
  let extra = 6;                                                           // { 6100:11af }
  let count = await Roll(1, 12);                                           // { 6100:11b3 }
  const d20 = await Roll(1, 20);                                           // { 6100:11c1 }
  const col = TurnColumn(c);                                               // { 6100:11cf }
  const u = box(null);
  while ((await FindTurnTarget(c, u)) && count > 0 && !stop) {             // { 6100:11fe }
    const v = TurnValue(u.v.b[F.undead_type], col);                        // { 6100:1226 }
    if (d20 >= Math.abs(v)) {                                              // { 6100:1244 }
      any = true;                                                          // { 6100:125b }
      await X.FocusCombatant(u.v, 3, 0);                                   // { 6100:125f }
      await X.DrawCharacterSummary(u.v);                                   // { 6100:1270 }
      if (v > 0) {                                                         // { 6100:127b }
        cr(u.v).b[CR.turned] = 1;                                          // { 6100:1281 }
        await X.ShowCombatMessageAnimation(u.v, 1, 'is turned');           // { 6100:128e }
      } else {
        await X.ShowCharacterMessage(u.v, 'Is destroyed', 0x0A, 0);        // { 6100:12ad }
        await X.RemoveCombatant(u.v);                                      // { 6100:12cd }
        u.v.b[F.status] = 8;                                               // { 6100:12d8 }  Gone
        u.v.b[F.active] = 0;                                               // { 6100:12e1 }
      }
      if (extra > 0) extra--;                                              // { 6100:12ea }
      count = byte(count - 1);                                             // { 6100:12f3 }
      if (count === 0 && extra > 0 && v < 0) count++;                      // { 6100:12f6 }
      await X.ClearCharacterMessage();                                     // { 6100:130b }
    } else {
      stop = true;                                                         // { 6100:1312 }
    }
  }
  if (!any) await X.ShowTimedBottomMessage('Nothing Happens...');          // { 6100:1319 }
  await X.CountActiveSides();                                              // { 6100:1333 }
  g.g_6E31 = b01(await X.ClearCombatantActionFlags(c));                    // { 6100:1338 }
  await X.ClearCharacterMessage();                                         // { 6100:1346 }
}

// TurnUndead parts (not separate routines in the original; exported for tests):
// { 6100:11cf } column from the cleric level +96h (signed): 1..8 -> level, 9..13 -> 9, else 10
export function TurnColumn(c) {
  const lv = S8(c.b, F.level + 0);
  if (lv >= 1 && lv <= 8) return lv;
  if (lv >= 9 && lv <= 13) return 9;
  return 10;
}
// { 6100:1226 } ShortInt(TurnUndeadTable{g_0447}[type*10 + col]); quirk: types 11/12 read bytes past the table
export function TurnValue(type, col) { return dsS8(0x0447 + word(type * 10 + col)); }

// 6100:1351 FindTurnTarget
export async function FindTurnTarget(c, u) {
  let best = 0x0D;                                                         // { 6100:1357 }
  u.v = null;                                                              // { 6100:135b }
  const n = await X.CollectOppositeSideTargets(c, 0xFF);                   // { 6100:1367 }
  let res = false;                                                         // { 6100:1378 }
  for (let i = 1; i <= n; i++) {                                           // { 6100:1382 }
    const e = g.cb_Char[g.foe_List[i]];                                    // { 6100:1391 }
    const t = S8(e.b, F.undead_type);
    if (cr(e).b[CR.turned] === 0 && t > 0 && t < best) {                   // { 6100:13b2 }
      best = e.b[F.undead_type];                                           // { 6100:13d7 }
      u.v = e;                                                             // { 6100:13e1 }
      res = true;                                                          // { 6100:13f1 }
    }
  }
  return res;
}

// 6100:1406 MeleeAttack
export async function MeleeAttack(att, tgt, behind, done) {
  let backstab = behind;                                                   // { 6100:140c }
  done.v = 0;                                                              // { 6100:1412 }
  g.SlotHits[1] = 0; g.SlotHits[2] = 0;                                    // { 6100:1419 }
  g.SlotSwings[1] = 0; g.SlotSwings[2] = 0;                                // { 6100:1423 }
  let anyHit = false;                                                      // { 6100:142d }
  let stop = false;                                                        // { 6100:1431 }
  g.DamageAmount = 0;                                                      // { 6100:1435 }
  const ra = cr(att).b;
  ra[CR.attacked] = 1;                                                     // { 6100:143a }
  if (await X.IsHelpless(tgt)) {                                           // { 6100:1447 }
    await X.PlayOrStopSound(snd(0x2622));                                  // { 6100:1459 }
    // quirk: with both slots empty the loop reads +112h (ac_rear) at slot 0
    while (att.b[F.attacks_left + ra[CR.attackSlot]] === 0)                // { 6100:1462 }
      ra[CR.attackSlot] = byte(ra[CR.attackSlot] - 1);                     // { 6100:147d }
    g.SlotSwings[ra[CR.attackSlot]] = byte((g.SlotSwings[ra[CR.attackSlot]] ?? 0) + 1);   // { 6100:148b }
    await ShowAttackResult(att, tgt, 3, byte(tgt.b[F.hp] + 5), 1, 1);      // { 6100:149f }
    await ov24_0FD2(att);                                                  // { 6100:14c6 }
    for (let k = 1; k <= 2; k++) att.b[F.attacks_left + k] = 0;            // { 6100:14d1 }
    anyHit = true;                                                         // { 6100:14f0 }
    done.v = 1;                                                            // { 6100:14f4 }
  } else {
    const w = rdy(att, 0);
    if (w !== null) {                                                      // { 6100:14fe }
      const sz = tgt.b[F.size];
      if (sz > 0x80 || (sz & 7) > 1) {                                     // { 6100:150d }  large target
        const t = w.b[IT.type];                                            // { 6100:1524 }  16-byte copy of ITEMS[type]
        att.b[F.dmg_dice + 1] = ITEMS(t, 2);                               // { 6100:154c }  dice_L
        att.b[F.dmg_sides + 1] = ITEMS(t, 3);                              // { 6100:1557 }  sides_L
        att.b[F.dmg_bonus + 1] = byte(S8(att.b, F.dmg_bonus + 1) - shortint(ITEMS(t, 11)) + shortint(ITEMS(t, 4)));   // { 6100:1562 }
      }
    }
    await X.RecalcCharacter(tgt);                                          // { 6100:1583 }
    await CallEffectHooks(0x0B, tgt);                                      // { 6100:158e }
    let acIdx = 0;                                                         // { 6100:159c }
    const ac = box(0);
    if (await CanBackstab(att, tgt)) {                                           // { 6100:15a0 }
      ac.v = byte(tgt.b[F.ac_rear] - 2);                                   // { 6100:15b4 }
    } else {
      if (cr(tgt).b[CR.timesAttacked] > 1)                                 // { 6100:15c5 }
        if (await DirectionTo(att, tgt) === cr(tgt).b[CR.facing] && cr(tgt).b[CR.rotation] > 4)   // { 6100:15d4 }
          backstab = 1;                                                    // { 6100:1601 }
      if (backstab !== 0) acIdx = 1;                                       // { 6100:1605 }
      ac.v = tgt.b[F.ac + acIdx];                                          // { 6100:160f }
    }
    await RangePenalty(att, tgt, ac);                                      // { 6100:1620 }
    let kind = 0;                                                          // { 6100:1635 }
    if (backstab !== 0) kind = 1;                                          // { 6100:1639 }
    if (await CanBackstab(att, tgt)) kind = 2;                                   // { 6100:1643 }
    for (let k = ra[CR.attackSlot]; k >= 1; k--) {                         // { 6100:165b }
      while (att.b[F.attacks_left + k] > 0 && !stop) {                     // { 6100:167c }
        att.b[F.attacks_left + k] = att.b[F.attacks_left + k] - 1;         // { 6100:169a }
        ra[CR.attackSlot] = k;                                             // { 6100:16a9 }
        g.SlotSwings[k] = byte(g.SlotSwings[k] + 1);                       // { 6100:16b8 }
        if ((await AttackRoll(att, tgt, ac.v)) || (await X.IsHelpless(tgt))) {   // { 6100:16c3 }
          g.SlotHits[k] = byte(g.SlotHits[k] + 1);                         // { 6100:16eb }
          await X.PlayOrStopSound(snd(0x2622));                            // { 6100:16f6 }
          anyHit = true;                                                   // { 6100:16ff }
          await RollDamage(att, tgt, k);                                   // { 6100:1703 }
          await ShowAttackResult(att, tgt, kind, g.DamageAmount, g.DamageAmount, 1);   // { 6100:1717 }
          if (tgt.b[F.active] !== 0) await CallEffectHooks(k + 1, att);    // { 6100:1736 }
          if (tgt.b[F.active] === 0) stop = true;                          // { 6100:1753 }
        }
      }
    }
    if (!anyHit) {                                                         // { 6100:176e }
      await X.PlayOrStopSound(snd(0x2626));                                // { 6100:1774 }
      await ShowAttackResult(att, tgt, kind, 0, 0, 0);                     // { 6100:177d }
    }
    done.v = 1;                                                            // { 6100:179a }
    for (let k = 1; k <= 2; k++)                                           // { 6100:17a1 }
      if (att.b[F.attacks_left + k] > 0) done.v = 0;                       // { 6100:17aa }
    ra[CR.sweepLeft] = 0;                                                  // { 6100:17c9 }
  }
  if (done.v !== 0) done.v = b01(await X.ClearCombatantActionFlags(att));  // { 6100:17d6 }
}

// 6100:17F6 FaceAttacker
export async function FaceAttacker(att, def) {
  const rd = cr(def).b;
  rd[CR.timesAttacked] = byte(rd[CR.timesAttacked] + 1);                   // { 6100:17fc }
  const d = await DirectionTo(def, att);                                         // { 6100:1808 }
  let diff = (d - rd[CR.facing] + 8) % 8;                                  // { 6100:181b }
  if (diff > 4) diff = 8 - diff;                                           // { 6100:183f }
  rd[CR.rotation] = (rd[CR.rotation] + diff) % 8;                          // { 6100:1854 }
}

// 6100:1884 Attack
export async function Attack(att, tgt, behind, missile, done) {
  if (cr(tgt).b[CR.timesAttacked] < 3 && behind === 0) {                   // { 6100:188a }
    const d = await DirectionTo(tgt, att);                                       // { 6100:189f }
    if (await X.IsVisible(tgt, 0)) await X.ShowCombatant(tgt, d, 0, 0);    // { 6100:18b2 }
    else cr(tgt).b[CR.facing] = d;                                         // { 6100:18db }
  }
  const d = await DirectionTo(att, tgt);                                         // { 6100:18ea }
  await X.DrawCharacterSummary(att);                                       // { 6100:18fd }
  await X.ShowCombatant(att, d, 1, 0);                                     // { 6100:1908 }  attack pose
  cr(att).target = tgt;                                                    // { 6100:191d }
  await X.Delay(100);                                                      // { 6100:1933 }
  if (missile !== null) await MissileAnim(att, tgt, missile);              // { 6100:193c }
  const w = rdy(att, 0);
  // quirk: { 6100:195a } readied[0] is dereferenced without a nil test (reads 0000:002E)
  const wType = w !== null ? w.b[IT.type] : 0;                             // TODO(decode): garbage when no weapon readied
  if (wType === 0x2F) await MissileAnim(att, tgt, w);                      // { 6100:195a }  sling
  done.v = 1;                                                              // { 6100:1986 }
  if (att.b[F.attacks_left + 1] > 0 || att.b[F.attacks_left + 2] > 0) {    // { 6100:198d }
    const savedSel = g.SelectedChar;                                       // { 6100:19a6 }
    g.SelectedChar = att;                                                  // { 6100:19b3 }
    await MeleeAttack(att, tgt, behind, done);                             // { 6100:19c0 }
    if (missile !== null) {                                                // { 6100:19d9 }
      if (missile.b[IT.count] > 0)                                         // { 6100:19e4 }
        missile.b[IT.count] = byte(missile.b[IT.count] - g.SlotSwings[1]); // { 6100:19ee }  quirk: byte wrap
      if (missile.b[IT.count] === 0) {                                     // { 6100:19f8 }
        if ((await X.FUN_00ba_2e46(att)) && missile.b[IT.power3] !== 0x89) {   // { 6100:1a05 }
          const copy = newItem();                                          // { 6100:1a1e }  GetMem($3F)
          copy.b.set(missile.b);                                           // { 6100:1a2d }  Move 3Fh
          copy.next = g.TreasureItems;                                     // { 6100:1a40 }
          g.TreasureItems = copy;                                          // { 6100:1a52 }
          copy.b[IT.readied] = 0;                                          // { 6100:1a5f }
          await X.LoseItem(att, missile);                                  // { 6100:1a67 }
          g.g_5D9A = copy;                                                 // { 6100:1a78 }
        } else {
          await X.LoseItem(att, missile);                                  // { 6100:1a87 }
        }
      }
    }
    await X.RecalcCharacter(att);                                          // { 6100:1a98 }
    g.SelectedChar = savedSel;                                             // { 6100:1aa3 }
  }
  if (done.v !== 0) done.v = b01(await X.ClearCombatantActionFlags(att));  // { 6100:1ab0 }
  if (await X.IsVisible(att, 0)) {                                         // { 6100:1aca }
    await X.ShowCombatant(att, cr(att).b[CR.facing], 1, 1);                // { 6100:1adc }
    await X.ShowCombatant(att, cr(att).b[CR.facing], 0, 0);                // { 6100:1afa }
  }
}

// 6100:1B1E RangePenalty
export async function RangePenalty(att, tgt, ac) {
  let dist = byte(await X.TargetDistance(att, tgt));                       // { 6100:1b24 }
  let band;
  if (await X.WeaponIsRanged(att))                                         // { 6100:1b38 }
    band = byte(Math.trunc((ITEMS(rdy(att, 0).b[IT.type], 12) - 1) / 3)); // { 6100:1b47 }  DS:558E
  else band = dist;                                                        // { 6100:1b6d }
  if (shortint(dist) - shortint(band) > 0) {                               // { 6100:1b73 }
    dist = byte(dist - band);                                              // { 6100:1b83 }
    ac.v = byte(ac.v + 2);                                                 // { 6100:1b92 }
  }
  if (shortint(dist) - shortint(band) > 0) {                               // { 6100:1ba2 }
    dist = byte(dist - band);                                              // { 6100:1bb2 }
    ac.v = byte(ac.v + 3);                                                 // { 6100:1bc1 }
  }
}

// 6100:1BF8 FindHealTarget
export async function FindHealTarget(c, t) {
  let best = null;                                                         // { 6100:1bfe }
  let body = 0;                                                            // { 6100:1c06 }
  let minHp = 0xFF;                                                        // { 6100:1c0a }
  for (let d = 0; d <= 8; d++) {                                           // { 6100:1c0e }
    const x = await X.CombatantCol(c) + DX(d);                                   // { 6100:1c17 }
    const y = await X.CombatantRow(c) + DY(d);                                   // { 6100:1c36 }
    const occ = box(0), ground = box(0);
    await X.CellAt(x, y, occ, ground);                                     // { 6100:1c55 }
    if (occ.v > 0) {                                                       // { 6100:1c6c }
      t.v = g.cb_Char[occ.v];                                              // { 6100:1c75 }
      if (t.v.b[F.side] === c.b[F.side] && t.v.b[F.hp] < t.v.b[F.hp_max]) // { 6100:1c92 }
        if (t.v.b[F.hp] < minHp || (t.v === c && t.v.b[F.hp] < (t.v.b[F.hp_max] >>> 1))) {   // { 6100:1cbe }
          best = t.v;                                                      // { 6100:1d03 }
          minHp = t.v.b[F.hp];                                             // { 6100:1d13 }
        }
    } else if (ground.v === 0x1F) {                                        // { 6100:1d24 }
      for (let k = 1; k <= g.BodyCount; k++) {                             // { 6100:1d2d }
        const bd = g.BodyList[k];
        if (bd.char !== null                                               // { 6100:1d42 }
            && !(bd.char.b[F.status] >= 6 && bd.char.b[F.status] <= 8)     // { 6100:1d58 }
            && bd.x === x && bd.y === y)                                   // { 6100:1d7a }
          body = k;                                                        // { 6100:1da4 }
      }
    }
  }
  if (minHp < 8 || body === 0) t.v = best;                                 // { 6100:1dbb }
  else t.v = g.BodyList[body].char;                                        // { 6100:1dd9 }
  return t.v !== null;                                                     // { 6100:1df7 }
}

// 6100:1E16 ChooseSpellTarget
export async function ChooseSpellTarget(spell, auto, allowEmpty, tgt) {
  let found = false;                                                       // { 6100:1e1c }
  const sel = g.SelectedChar;
  if (auto === 0) {                                                        // { 6100:1e20 }
    const ok = box(0);
    await SelectTarget(sel, await X.SpellRange(spell), 0, allowEmpty, ok, tgt);   // { 6100:1e26 }
    found = ok.v !== 0;
    cr(g.SelectedChar).target = tgt.char;                                  // { 6100:1e4d }
  } else if (SPELL(spell, 0x0E) === 0) {                                   // { 6100:1e6b }  DS:3208 needsTarget
    tgt.char = g.SelectedChar;                                             // { 6100:1e7d }
    if (spell !== 3 || (await FindHealTarget(g.SelectedChar, fbox(tgt, 'char')))) {   // { 6100:1e8e }
      tgt.x = await X.CombatantCol(tgt.char);                                    // { 6100:1ea9 }
      tgt.y = await X.CombatantRow(tgt.char);                                    // { 6100:1ebf }
      found = true;                                                        // { 6100:1ed5 }
    }
  } else {
    let tries = 20;                                                        // { 6100:1edc }
    while (tries > 0 && !found) {                                          // { 6100:1ee0 }
      let ok = true;                                                       // { 6100:1ef2 }
      if (await AutoTarget(g.SelectedChar, await X.SpellRange(spell), 0, 1)) {   // { 6100:1ef6 }
        const t = cr(g.SelectedChar).target;                               // { 6100:1f19 }
        if (SPELL(spell, 0x0F) > 0) {                                      // { 6100:1f30 }  DS:3209 areaSize
          await X.BuildTargetList(await X.CombatantCol(t), await X.CombatantRow(t), SPELL(spell, 0x0F), 0xFF, 1, g.cm_Map);   // { 6100:1f45 }
          for (let i = 1; i <= g.tg_Count; i++)                            // { 6100:1f82 }
            if (g.cb_Char[tgIdx(g.tg_List[i])].b[F.side] === b01(await X.IsSideZero(g.SelectedChar)))   // { 6100:1f97 }
              ok = false;                                                  // { 6100:1fcc }
        }
        if (await X.IsHelpless(t))                                         // { 6100:1fd8 }
          for (let k = 1; k <= 4; k++)
            if (SPELL(spell, 0x0A) === ds(0x286B + k)) ok = false;         // { 6100:1ff0 }  HelplessEffectIds
        if (ok) {                                                          // { 6100:2018 }
          tgt.char = cr(g.SelectedChar).target;                            // { 6100:201e }
          tgt.x = await X.CombatantCol(tgt.char);                                // { 6100:2039 }
          tgt.y = await X.CombatantRow(tgt.char);                                // { 6100:204f }
          found = true;                                                    // { 6100:2065 }
        }
      }
      tries--;                                                             // { 6100:2069 }
    }
  }
  if (found) {                                                             // { 6100:206f }
    g.SpellX = tgt.x;                                                      // { 6100:2079 }
    g.SpellY = tgt.y;                                                      // { 6100:2083 }
    return true;                                                           // { 6100:2075 }
  }
  clearTgt(tgt);                                                           // { 6100:2093 }
  return false;                                                            // { 6100:208f }
}

// 6100:20C3 CollectSpellTargets  (installed as SpellHandlers[0] g_6B84 by CombatMain)
export async function CollectSpellTargets(spell, auto, ok) {
  ok.v = 1;                                                                // { 6100:20c9 }
  g.SpellTargetCount = 0;                                                  // { 6100:20d0 }
  g.SpellArea = 0;                                                         // { 6100:20d5 }
  g.SpellX = await X.CombatantCol(g.SelectedChar);                               // { 6100:20da }
  g.SpellY = await X.CombatantRow(g.SelectedChar);                               // { 6100:20ea }
  const code = SPELL(spell, 6) & 0x0F;                                     // { 6100:20fa }  DS:3200
  const t = newTargetRec();
  if (code === 0) {                                                        // { 6100:210b }
    g.SpellTargets[1] = g.SelectedChar;                                    // { 6100:210f }
    g.SpellTargetCount = 1;                                                // { 6100:211d }
  } else if (code === 0x0F) {                                              // { 6100:2125 }
    if (await ChooseSpellTarget(spell, auto, 0, t)) {                      // { 6100:212c }
      if (cr(g.SelectedChar).target !== null) {                            // { 6100:2147 }
        g.SpellTargets[1] = cr(g.SelectedChar).target;                     // { 6100:215a }
        g.SpellTargetCount = 1;                                            // { 6100:2172 }
      } else {
        // quirk: { 6100:217a } radius = (code and 0Fh) shr 4 = always 0
        await X.BuildTargetList(g.SpellX, g.SpellY, (SPELL(spell, 6) & 0x0F) >>> 4, 0xFF, 1, g.cm_Map);
        for (let i = 1; i <= g.tg_Count; i++)                              // { 6100:21ae }
          g.SpellTargets[i] = g.cb_Char[tgIdx(g.tg_List[i])];              // { 6100:21c3 }
        g.SpellTargetCount = g.tg_Count;                                   // { 6100:21ff }
        g.SpellArea = 1;                                                   // { 6100:2205 }
      }
    } else ok.v = 0;                                                       // { 6100:220c }
  } else if (code >= 8 && code <= 0x0E) {                                  // { 6100:2216 }
    if (await ChooseSpellTarget(spell, auto, 1, t)) {                      // { 6100:2224 }
      await X.BuildTargetList(g.SpellX, g.SpellY, SPELL(spell, 6) & 7, 0xFF, 1, g.cm_Map);   // { 6100:223f }
      for (let i = 1; i <= g.tg_Count; i++)                                // { 6100:226e }
        g.SpellTargets[i] = g.cb_Char[tgIdx(g.tg_List[i])];                // { 6100:2283 }
      g.SpellTargetCount = g.tg_Count;                                     // { 6100:22bf }
      g.SpellArea = 1;                                                     // { 6100:22c5 }
    } else ok.v = 0;                                                       // { 6100:22cc }
  } else {
    let left = (SPELL(spell, 6) & 3) + 1;                                  // { 6100:22d6 }
    let n = 0;                                                             // { 6100:22ed }
    while (left > 0) {                                                     // { 6100:22f1 }
      if (await ChooseSpellTarget(spell, auto, 0, t)) {                    // { 6100:22fa }
        let dup = false;                                                   // { 6100:2315 }
        for (let j = 1; j <= n; j++)                                       // { 6100:2319 }
          if (g.SpellTargets[j] === t.char) dup = true;                    // { 6100:232e }
        if (!dup) {                                                        // { 6100:2357 }
          n++;                                                             // { 6100:235d }
          g.SpellTargets[n] = t.char;                                      // { 6100:2360 }
          left--;                                                          // { 6100:2379 }
        } else if (auto === 0) {                                           // { 6100:237e }
          await X.ShowTimedBottomMessage('Already been targeted');         // { 6100:2384 }
        } else left--;                                                     // { 6100:239a }
        await X.RedrawSquare(await X.CombatantCol(g.SpellTargets[n]), await X.CombatantRow(g.SpellTargets[n]));   // { 6100:239d }
      } else left--;                                                       // { 6100:23d6 }
    }
    g.SpellTargetCount = n;                                                // { 6100:23dc }
    if (n === 0) ok.v = 0;                                                 // { 6100:23e2 }
  }
}

// 6100:2414 BeginCast
export async function BeginCast(spell, auto, done) {
  const caster = g.SelectedChar;                                           // { 6100:241a }
  const f = box(1), w = box(0xFFFF);                                       // { 6100:2427 }
  done.v = 0;                                                              // { 6100:2430 }
  let sp = spell;                                                          // { 6100:2437 }
  if (sp === 0) sp = await SpellList(0, 1, w, f);                          // { 6100:243d }
  if (sp > 0 && SPELL(sp, 0x0B) === 0) {                                   // { 6100:245b }  DS:3205 combat-usable
    await X.ShowTimedBottomMessage('Camp Only Spell');                     // { 6100:2473 }
    sp = 0;                                                                // { 6100:2487 }
  }
  if (auto === 0) {                                                        // { 6100:248b }
    await X.DrawCombatLayout();                                            // { 6100:2491 }
    await X.FocusCombatant(caster, 3, 1);                                  // { 6100:2496 }
    await X.DrawCharacterSummary(caster);                                  // { 6100:24a7 }
  }
  if (sp > 0) {                                                            // { 6100:24b2 }
    const ct = Math.trunc(SPELL(sp, 0x0C) / 3);                            // { 6100:24bb }  DS:3206 casting time
    if (ct === 0) {                                                        // { 6100:24d5 }
      await X.CastSpell(sp, auto, 1, done);                                // { 6100:24db }
      done.v = b01(await X.ClearCombatantActionFlags(caster));             // { 6100:24f0 }
    } else {
      done.v = 1;                                                          // { 6100:2503 }
      await X.ShowCharacterMessage(caster, 'Begins Casting', 0x0A, 1);     // { 6100:250a }
      const r = cr(caster).b;
      r[CR.castSpell] = sp;                                                // { 6100:252a }
      if (S8(r, CR.initiative) > ct) r[CR.initiative] = byte(r[CR.initiative] - ct);   // { 6100:2538 }  signed
      else r[CR.initiative] = 1;                                           // { 6100:2561 }
    }
  }
}

// 6100:2574 CanBackstab
export async function CanBackstab(att, tgt) {
  let ok = false;                                                          // { 6100:257a }
  const w = rdy(att, 0);                                                   // { 6100:257e }
  let wt = 0;
  if (w !== null) wt = w.b[IT.type];                                       // { 6100:2591 }
  const arm = rdy(att, 2);                                                 // { 6100:25a3 }  +D4h
  if (S8(att.b, F.level + 6) > 0)                                          // { 6100:25b6 }  thief level +9Ch
    if (arm === null || arm.b[IT.type] === 0x32)                           // { 6100:25c1 }
      if (w === null || wt === 7 || wt === 8 || (wt > 0x22 && wt < 0x26))  // { 6100:25d3 }
        ok = true;                                                         // { 6100:25f3 }
  return ok && cr(tgt).b[CR.timesAttacked] > 1                             // { 6100:25f7 }
    && await DirectionTo(att, tgt) === cr(tgt).b[CR.facing];                     // { 6100:260c }
}

// 6100:263D DirectionTo
export async function DirectionTo(a, b) {
  const ax = await X.CombatantCol(a), ay = await X.CombatantRow(a);                    // { 6100:2643 }
  const bx = await X.CombatantCol(b), by = await X.CombatantRow(b);                    // { 6100:265f }
  let d = 0;                                                               // { 6100:267b }
  // quirk: never ends if a or b lies outside the 50x25 map
  while (!await X.InFrontArc(ax, ay, bx, by, d)) d = byte(d + 1);                // { 6100:267f }
  return d;                                                                // { 6100:26a1 }
}

// 6100:26B0 MissileAnim
export async function MissileAnim(att, tgt, it) {
  const d = await DirectionTo(att, tgt);                                         // { 6100:26b6 }
  let steps = 1, pause = 0x0A, frame = 0x0D;                               // { 6100:26c9 }
  // { 6100:26d5 } spd := g_6E36^.w[$11]; { 6100:26e0 } if VideoMode = 1 then spd := spd shr 2 — computed, never used
  const t = it.b[IT.type];                                                 // { 6100:26f1 }
  if (t === 9 || t === 0x15 || t === 0x1C || t === 0x1F || t === 0x49) {  // { 6100:26f8 }
    if (d & 1) {                                                           // { 6100:270f }
      if (d === 3 || d === 5) await X.CopyCombatAnimationFrame(frame + 1, 1, 0, b01(d === 5));   // { 6100:2716 }
      else await X.CopyCombatAnimationFrame(frame + 1, 0, 0, b01(d === 7));                   // { 6100:2740 }
    } else {
      await X.CopyCombatAnimationFrame(frame + (d % 4), d >>> 2, 0, 0);   // { 6100:275e }
    }
  } else if (t === 2 || t === 7 || t === 0x14) {                           // { 6100:278c }
    await X.BuildFourAnimationFrames(frame + 3);                           // { 6100:2798 }
    steps = 4; pause = 0x32;                                               // { 6100:27a6 }
  } else if (t === 0x55 || t === 0x56) {                                   // { 6100:27b0 }  TODO(decode): item types 55h/56h
    await X.BuildFourAnimationFrames(frame + 4);                           // { 6100:27b8 }
    steps = 4; pause = 0x32;                                               // { 6100:27c6 }
  } else {
    if (it.b[IT.type] === 0x2F) frame = frame + 1;                         // { 6100:27d0 }  sling stone
    await X.CopyCombatAnimationFrame(frame + 7, 0, 0, 0);                  // { 6100:27dd }
    await X.CopyCombatAnimationFrame(frame + 7, 1, 1, 0);                  // { 6100:27f4 }
    steps = 2; pause = 0x14;                                               // { 6100:280b }
  }
  await X.SetSoundTimerMode(0);                                            // { 6100:2813 }
  await X.PlayOrStopSound(snd(0x2620));                                    // { 6100:281b }
  await X.AnimateAlongPath(await X.CombatantCol(att), await X.CombatantRow(att), await X.CombatantCol(tgt), await X.CombatantRow(tgt), steps, pause);   // { 6100:2824 }
  await X.PlayOrStopSound(snd(0x262C));                                    // { 6100:2861 }
  await X.SetSoundTimerMode(0x0A);                                         // { 6100:286a }
}

// 6100:2879 CalcEnemyHpPct
export function CalcEnemyHpPct() {
  let sumMax = 0;                                                          // { 6100:287f }
  let sumHp = 0;                                                           // { 6100:2884 }
  let p = g.PartyHead;                                                     // { 6100:2889 }
  while (p !== null) {                                                     // { 6100:2896 }
    if (p.b[F.side] === 1) {                                               // { 6100:289e }
      if (p.b[F.active] !== 0) sumHp = word(sumHp + p.b[F.hp]);            // { 6100:28a9 }
      sumMax = word(sumMax + p.b[F.hp_max]);                               // { 6100:28c4 }
    }
    p = p.next;                                                            // { 6100:28d3 }
  }
  if (sumMax > 0)                                                          // { 6100:28e8 }
    g.enemy_HpPercent = byte(Math.trunc(word(0x14 * sumHp) / sumMax) * 5); // { 6100:28ee }  high word discarded
}

// 6100:2908 MaxEnemyMove
export async function MaxEnemyMove(c) {
  let best = 0;                                                            // { 6100:290e }
  let p = g.PartyHead;                                                     // { 6100:2912 }
  while (p !== null) {                                                     // { 6100:291f }
    if (p.b[F.side] === b01(await X.IsSideZero(c)) && p.b[F.active] !== 0) {   // { 6100:2927 }
      const m = (await CalcMove(p)) >>> 1;                                 // { 6100:2947 }
      if (m > best) best = m;                                              // { 6100:2958 }
    }
    p = p.next;                                                            // { 6100:2966 }
  }
  return best;                                                             // { 6100:297b }
}

// 6100:2998 ConfirmAttackAlly
export async function ConfirmAttackAlly(att, tgt) {
  if (att.b[F.side] === b01(await X.IsSideZero(tgt)) || att.b[F.controlled] !== 0) return true;   // { 6100:299e }
  if ((await X.AskYesNo('Attack Ally: ', 0x0D, 0x0A, 0x0F)) !== 'Y') return false;   // { 6100:29c5 }
  g.AllyAttacked = 1;                                                      // { 6100:29f0 }
  setEclW(0x6E33, 1);                                                      // { 6100:29f5 }  TODO(decode): ECL word 6E33h meaning
  let p = g.PartyHead;                                                     // { 6100:2a00 }
  while (p !== null) {                                                     // { 6100:2a0d }
    if (p.b[F.status] === 0 && p.b[F.npc_morale] > 0x7F) {                 // { 6100:2a15 }
      p.b[F.side] = 1;                                                     // { 6100:2a2b }
      cr(p).target = null;                                                 // { 6100:2a34 }
    }
    p = p.next;                                                            // { 6100:2a46 }
  }
  await X.CountActiveSides();                                              // { 6100:2a5b }
  return true;                                                             // { 6100:29ec }
}

// HorizontalMenu adapter: menus.js returns { key, ext } (Pascal: Char result + var ext)
async function hmenu(prompt, options, c1, c2, c3, allowExt, animate, ext) {
  const r = await X.HorizontalMenu(prompt, options, c1, c2, c3, allowExt, animate);
  if (typeof r === 'string') return r;
  if (ext) ext.v = b01(r.ext);
  return r.key;
}

// 6100:2AA0 TargetMenu
export async function TargetMenu(att, t, maxRange, showRange, unused) {
  let menu = '';                                                           // { 6100:2aa7 }
  const dist = await X.TargetDistance(att, t);                             // { 6100:2aab }
  await DirectionTo(att, t);                                                     // { 6100:2abf }  result unused
  if (showRange !== 0)                                                     // { 6100:2ad2 }
    await X.DrawText(0, 0x17, 0x0A, 'Range = ' + (await X.ByteToStr(dist)) + '  ');   // { 6100:2ad8 }
  if (dist <= maxRange) {                                                  // { 6100:2b14 }
    if (showRange === 0) menu = 'Target ';                                 // { 6100:2b1f }
    else if (att !== t) {                                                  // { 6100:2b3a }
      const ammo = box(null);
      if (!(await X.WeaponIsRanged(att))) menu = 'Target ';                // { 6100:2b4a }
      else if (await X.GetMissileAmmo(att, ammo))                          // { 6100:2b6e }
        if ((await X.CollectOppositeSideTargets(att, 1)) === 0 || (await X.FUN_00ba_2e46(att)))   // { 6100:2b82 }
          menu = 'Target ';                                                // { 6100:2ba3 }
    }
  }
  menu = 'Next Prev Manual ' + menu + 'Center Exit';                       // { 6100:2bb6 }
  await X.FocusCombatant(t, 3, 1);                                         // { 6100:2be8 }
  await X.DrawCharacterSummary(t);                                         // { 6100:2bf9 }
  hooks.emit('combatCursor', () => ({ mode: 'aim', menu, ...hooks.state.combatant(t) }));   // { 6100:2c04 }
  return hmenu('Aim:', menu, 0x0D, 0x0A, 0x0F, 0, 0, box(0));              // { 6100:2c04 }
}

// 6100:2C3D ConfirmTarget
export async function ConfirmTarget(att, t, mode, ok, tgt) {
  const ammo = box(null);                                                  // { 6100:2c43 }
  ok.v = 1;                                                                // { 6100:2c4b }
  if (mode === 1 && !(await ConfirmAttackAlly(att, t))) ok.v = 0;          // { 6100:2c52 }
  if (ok.v !== 0) {                                                        // { 6100:2c73 }
    tgt.char = t;                                                          // { 6100:2c7f }
    tgt.x = await X.CombatantCol(t);                                             // { 6100:2c8f }
    tgt.y = await X.CombatantRow(t);                                             // { 6100:2ca1 }
    g.cm_Map.b[4] = 0;                                                     // { 6100:2cb3 }  cursor
    await X.FocusSquare(g.cm_Map.b[2] + 3, g.cm_Map.b[3] + 3, 3, 8);       // { 6100:2cbc }
    if (mode === 1) {                                                      // { 6100:2ce1 }
      if (await FighterSweep(att, t)) ok.v = b01(await X.ClearCombatantActionFlags(att));   // { 6100:2cea }
      else {
        await FaceAttacker(att, t);                                              // { 6100:2d11 }
        if ((await X.WeaponIsRanged(att)) && (await X.GetMissileAmmo(att, ammo)) && (await X.FUN_00ba_2e46(att))   // { 6100:2d21 }
            && (await X.TargetDistance(att, t)) === 1)
          ammo.v = null;                                                   // { 6100:2d68 }
        await Attack(att, t, 0, ammo.v, ok);                               // { 6100:2d70 }
      }
    }
  } else {
    clearTgt(tgt);                                                         // { 6100:2d90 }
  }
}

// 6100:2DFA ManualAim
export async function ManualAim(att, start, maxRange, mode, allowEmpty, ok, tgt) {
  clearTgt(tgt);                                                           // { 6100:2e01 }
  let cx = await X.CombatantCol(start), cy = await X.CombatantRow(start);              // { 6100:2e12 }
  let key = ' ';                                                           // { 6100:2e2e }
  let dir = 8;                                                             // { 6100:2e32 }
  ok.v = 0;                                                                // { 6100:2e36 }
  g.cm_Map.b[4] = 1;                                                       // { 6100:2e3d }  cursor
  g.cm_Map.b[5] = 1;                                                       // { 6100:2e46 }  TODO(decode): map +5 meaning
  const occ = box(0), ground = box(0), ammo = box(null);
  while (!(key === '\0' || key === '\r' || key === 'E' || key === 'T')) { // { 6100:2e4f }
    await X.FocusSquare(cx, cy, 3, dir);                                   // { 6100:2e62 }
    cx = cx + DX(dir);                                                     // { 6100:2e76 }
    cy = cy + DY(dir);                                                     // { 6100:2e84 }
    if (cx < 0) cx = 0;                                                    // { 6100:2e92 }
    if (cy < 0) cy = 0;                                                    // { 6100:2e9c }
    if (cx > 0x31) cx = 0x31;                                              // { 6100:2ea6 }
    if (cy > 0x18) cy = 0x18;                                              // { 6100:2eb0 }
    await X.CellAt(cx, cy, occ, ground);                                   // { 6100:2eba }
    await X.FUN_0899_0104();                                               // { 6100:2ed1 }  input poll (disabled routine)
    let valid = false;                                                     // { 6100:2ed6 }
    const rng = box(0xFF);                                                 // { 6100:2eda }  word
    const tx = box(cx), ty = box(cy);                                      // { 6100:2edf }
    if (await X.TraceLine(await X.CombatantCol(att), await X.CombatantRow(att), tx, ty, rng, g.cm_Map)) {   // { 6100:2eeb }
      valid = true;                                                        // { 6100:2f23 }
      if (mode !== 0)                                                      // { 6100:2f27 }
        await X.DrawText(0, 0x17, 0x0A, 'Range = ' + (await X.WordToStr(word(rng.v) >>> 1)) + '  ');   // { 6100:2f2d }
    } else if (mode !== 0) {                                               // { 6100:2f6d }
      await X.ClearRectangle(0, 0x17, 0x27, 0x17);                               // { 6100:2f73 }
    }
    rng.v = word(rng.v) >>> 1;                                             // { 6100:2f84 }
    start = null;                                                          // { 6100:2f8c }  parameter reused: combatant under the cursor
    if (valid) {                                                           // { 6100:2f94 }
      if (occ.v > 0) start = g.cb_Char[occ.v];                             // { 6100:2f9d }
      else if (ground.v === 0x1F) {                                        // { 6100:2fbe }
        for (let k = 1; k <= g.BodyCount; k++)                             // { 6100:2fc4 }
          if (g.BodyList[k].x === cx && g.BodyList[k].y === cy)            // { 6100:2fd9 }
            start = g.BodyList[k].char;                                    // { 6100:3003 }
      }
    }
    if (start !== null) await X.DrawCharacterSummary(start);               // { 6100:3025 }
    else await X.ClearRectangle(0x17, 1, 0x26, 0x15);                            // { 6100:303a }
    if (maxRange < rng.v || ds(0x2744 + ground.v * 4) === 0xFF) valid = false;   // { 6100:304b }  CombatTerrain; TODO(decode): field meaning
    if (start !== null) {                                                  // { 6100:306b }
      if (!(await CanAttack(att, start))) valid = false;                   // { 6100:3076 }
      if (mode === 1) {                                                    // { 6100:308e }
        if (att === start || (occ.v === 0 && ground.v === 0x1F)) valid = false;   // { 6100:3094 }
        else if (await X.WeaponIsRanged(att)) {                            // { 6100:30b6 }
          if (!(await X.GetMissileAmmo(att, ammo))) valid = false;         // { 6100:30c5 }
          else if ((await X.CollectOppositeSideTargets(att, 1)) > 0 && !(await X.FUN_00ba_2e46(att)))   // { 6100:30d9 }
            valid = false;                                                 // { 6100:30fa }
        }
      }
    } else if (allowEmpty === 0) valid = false;                            // { 6100:3100 }
    let menu = 'Center Exit';                                              // { 6100:310a }
    if (valid) menu = 'Target ' + menu;                                    // { 6100:311d }
    hooks.emit('combatCursor', () => ({ mode: 'manual', col: cx, row: cy, valid, under: start ? hooks.state.combatant(start) : null }));   // { 6100:314b }
    key = await hmenu('(Use Cursor keys) ', menu, 0x0D, 0x0A, 0x0F, 1, 0, gbox('g_6E31'));   // { 6100:314b }
    switch (key) {                                                         // { 6100:317b }
      case '\r': case 'T':
        g.cm_Map.b[4] = 0;                                                 // { 6100:3189 }
        if (valid) {                                                       // { 6100:3192 }
          tgt.x = cx; tgt.y = cy;                                          // { 6100:3198 }
          tgt.char = start !== null ? start : null;                        // { 6100:31ac }
          if (mode === 1) await ConfirmTarget(att, tgt.char, mode, ok, tgt);   // { 6100:31d2 }
          else ok.v = 1;                                                   // { 6100:31fc }
        }
        if (!valid || ok.v === 0) {                                        // { 6100:3203 }
          await X.RedrawSquare(cx, cy);                                    // { 6100:3212 }
          ok.v = 0;                                                        // { 6100:321f }
          clearTgt(tgt);                                                   // { 6100:3226 }
        }
        break;
      case 'H': dir = 0; break;                                            // { 6100:323a }
      case 'I': dir = 1; break;                                            // { 6100:3245 }
      case 'M': dir = 2; break;                                            // { 6100:3250 }
      case 'Q': dir = 3; break;                                            // { 6100:325b }
      case 'P': dir = 4; break;                                            // { 6100:3265 }
      case 'O': dir = 5; break;                                            // { 6100:326f }
      case 'K': dir = 6; break;                                            // { 6100:3279 }
      case 'G': dir = 7; break;                                            // { 6100:3283 }
      case '\0': case 'E':                                                 // { 6100:328d }
        await X.RedrawSquare(cx, cy);                                      // { 6100:3295 }
        clearTgt(tgt);                                                     // { 6100:32a2 }
        ok.v = 0;                                                          // { 6100:32b3 }
        break;
      case 'C':                                                            // { 6100:32bc }
        await X.FocusSquare(cx, cy, 0, 8);                                 // { 6100:32c0 }
        dir = 8;                                                           // { 6100:32d3 }
        break;
      default: dir = 8;                                                    // { 6100:32d9 }
    }
  }
}

// 6100:3558 SelectTarget (with nested 6100:32E6 CombatBuildTargetList and 6100:3389 NextTarget)
export async function SelectTarget(att, range, mode, allowEmpty, ok, tgt) {
  const L = [];                                  // parent list L[1..n] (3-byte entries copied from tg_List)
  let n = 0, cur = 0;                            // [BP-0DAh], cur
  let px = 0, py = 0;                            // [BP-0DEh], [BP-0DFh]

  // 6100:32E6 CombatBuildTargetList (nested)
  async function CombatBuildTargetList(c) {
    await X.BuildTargetList(await X.CombatantCol(c), await X.CombatantRow(c), 0x7F, 0xFF, await X.CombatantSize(c), g.cm_Map);   // { 6100:32ec }
    n = g.tg_Count;                                                        // { 6100:3324 }
    for (let i = 1; i <= n; i++) {                                         // { 6100:332f }
      const e = g.tg_List[i];
      L[i] = { ...e };                                                          // { 6100:3349 }  CopyBytes 3
    }
  }

  // 6100:3389 NextTarget (nested)
  async function NextTarget(step, draw) {
    if (draw !== 0) {                                                      // { 6100:338f }
      px = g.cb_Col[L[cur].who];                                            // { 6100:3395 }
      py = g.cb_Row[L[cur].who];                                            // { 6100:33c3 }
    } else {
      await X.RedrawSquare(px, py);                                        // { 6100:33f3 }
    }
    cur = byte(cur + step);                                                // { 6100:340a }
    if (cur === 0) cur = n;                                                // { 6100:3415 }
    if (cur > n) cur = 1;                                                  // { 6100:3430 }
    const t = g.cb_Char[L[cur].who];                                        // { 6100:344b }
    const nx = g.cb_Col[L[cur].who];                                        // { 6100:347b }
    const ny = g.cb_Row[L[cur].who];                                        // { 6100:34a9 }
    if (draw !== 0) {                                                      // { 6100:34d7 }
      await X.AnimateAlongPath(px, py, nx, ny, 1, 0);                      // { 6100:34dd }
      px = nx;                                                             // { 6100:350c }
      py = ny;                                                             // { 6100:351c }
    }
    return t;                                                              // { 6100:352c }
  }

  await X.CopyCombatAnimationFrame(0x19, 0, 0, 0);                         // { 6100:355f }
  clearTgt(tgt);                                                           // { 6100:3570 }
  ok.v = 0;                                                                // { 6100:3581 }
  let maxR = range;                                                        // { 6100:3588 }
  if (maxR === 0xFF) {                                                     // { 6100:358f }
    const w = rdy(att, 0);
    if (w !== null) maxR = byte(ITEMS(w.b[IT.type], 12) - 1);              // { 6100:3596 }
    else maxR = 1;                                                         // { 6100:35c6 }
  }
  if (maxR === 0 || maxR === 0xFF) maxR = 1;                               // { 6100:35cb }
  await CombatBuildTargetList(att);                                        // { 6100:35de }
  cur = 1;                                                                 // { 6100:35e9 }
  let skip = 0;                                                            // { 6100:35ee }
  let t = await NextTarget(skip, 1);                                       // { 6100:35f3 }
  skip = 1;                                                                // { 6100:3608 }
  let key = ' ';                                                           // { 6100:360d }
  let move = 0;                                  // TODO(decode): garbage — uninitialised before the first N/P/M/T/C
  const exitKey = () => key === '\0' || key === 'E';
  while (ok.v === 0 && !exitKey()) {                                       // { 6100:3612 }
    if (!(await CanAttack(att, t))) {                                      // { 6100:3632 }
      t = await NextTarget(shortint(skip), 0);                             // { 6100:3648 }
    } else {
      key = await TargetMenu(att, t, maxR, mode, allowEmpty);              // { 6100:3660 }
      switch (key) {
        case 'N': skip = 1; move = 1; break;                               // { 6100:3687 }
        case 'P': skip = -1; move = -1; break;                             // { 6100:3698 }
        case 'M':                                                          // { 6100:36a9 }
          await ManualAim(att, t, maxR, mode, allowEmpty, ok, tgt);        // { 6100:36ad }
          await X.CopyCombatAnimationFrame(0x19, 0, 0, 0);                 // { 6100:36d6 }
          await CombatBuildTargetList(att);                                // { 6100:36e7 }
          move = 0;                                                        // { 6100:36f2 }
          break;
        case 'T':                                                          // { 6100:36f9 }
          await ConfirmTarget(att, t, mode, ok, tgt);                      // { 6100:36fd }
          await X.CopyCombatAnimationFrame(0x19, 0, 0, 0);                 // { 6100:371d }
          await CombatBuildTargetList(att);                                // { 6100:372e }
          move = 0;                                                        // { 6100:3739 }
          break;
        case 'C':                                                          // { 6100:3740 }
          await X.FocusSquare(await X.CombatantCol(t), await X.CombatantRow(t), 0, 8); // { 6100:3744 }
          move = 0;                                                        // { 6100:376b }
          break;
        default: break;                          // quirk: other keys keep the previous `move`
      }
      await X.RedrawSquare(await X.CombatantCol(t), await X.CombatantRow(t));          // { 6100:3770 }
      t = await NextTarget(move, b01(ok.v === 0 && !exitKey()));           // { 6100:3791 }
    }
  }
  if (mode !== 0) await X.ClearRectangle(0, 0x17, 0x27, 0x17);                  // { 6100:37c7 }
}

// 6100:37E4 AutoTarget
export async function AutoTarget(c, range, ignoreBlock, fresh) {
  let pass = 0, found = false, last = 0;                                   // { 6100:37ea }
  const t = cr(c).target;                                                  // { 6100:37f6 }
  if (fresh !== 0) cr(c).target = null;                                    // { 6100:380c }
  else if (t !== null && t !== undefined) {                                // { 6100:3812 }
    if (t.b[F.side] === c.b[F.side] || t.b[F.active] === 0 || !(await CanAttack(c, t)))   // { 6100:381a }
      cr(c).target = null;                                                 // { 6100:384b }
  }
  if (cr(c).target !== null && cr(c).target !== undefined) found = true;   // { 6100:385d }
  while (!found && last === 0) {                                           // { 6100:3873 }
    last = pass;                                                           // { 6100:3885 }
    if (pass !== 0 && fresh === 0) g.cm_Map.b[6] = 1;                      // { 6100:388b }  TODO(decode): map +6 scan flag
    let tries = 20;                                                        // { 6100:38a0 }
    let n = await X.CollectOppositeSideTargets(c, range);                  // { 6100:38a4 }
    while (tries > 0 && !found && n > 0) {                                 // { 6100:38b6 }
      tries--;                                                             // { 6100:38d1 }
      const r = await Roll(1, n);                                          // { 6100:38d4 }
      if (g.foe_List[r] > 0) {                                             // { 6100:38e3 }
        const e = g.cb_Char[g.foe_List[r]];                                // { 6100:38f4 }
        if ((ignoreBlock !== 0 && g.cm_Map.b[6] !== 0) || (await CanAttack(c, e))) {   // { 6100:3915 }
          found = true;                                                    // { 6100:393a }
          cr(c).target = e;                                                // { 6100:393e }
        } else {
          g.foe_List[r] = 0;                                               // { 6100:3956 }
          for (let k = 1; k <= n; k++)                                     // { 6100:3962 }
            if (g.foe_List[k] > 0) found = true;                           // { 6100:3977 }  reused as "any left"
          if (found) found = false;                                        // { 6100:3991 }
          else n = 0;                                                      // { 6100:399d }
        }
      }
    }
    if (pass === 0) pass = 1;                                              // { 6100:39a4 }
  }
  g.cm_Map.b[6] = 0;                                                       // { 6100:39b1 }
  return found;                                                            // { 6100:39ba }
}

// 6100:39D2 EffRake — effect handler 49h
export async function EffRake(c, eff, event) {
  if (g.SlotHits[1] !== 2) return;                                         // { 6100:39d8 }
  if (cr(c).target.b[F.active] === 0) return;                              // { 6100:39e2 }
  cr(c).b[CR.attackSlot] = 2;                                              // { 6100:39f9 }
  c.b[F.attacks_left + 2] = 2;                                             // { 6100:3a06 }
  c.b[F.dmg_dice + 2] = 2;                                                 // { 6100:3a0f }
  c.b[F.dmg_sides + 2] = 4;                                                // { 6100:3a18 }
  c.b[F.attacks_left + 1] = 0;                                             // { 6100:3a21 }
  await X.ShowCharacterMessage(c, 'Rakes...', 0x0A, 1);                    // { 6100:3a2a }
  const d = box(0);
  await Attack(c, cr(c).target, 0, null, d);                               // { 6100:3a4a }
  d.v = b01(await X.ClearCombatantActionFlags(c));                         // { 6100:3a72 }
}

// 6100:3A86 EffHold — effect handler 4Ah (name L; TODO(decode): which monster ability, effect 3Ah)
export async function EffHold(c, eff, event) {
  g.HookOpponent = g.cb_Char[eff.b[3]];                                    // { 6100:3a8c }  g_6826, eff p3
  if (event !== 0 || c.b[F.active] === 0 || g.HookOpponent.b[F.active] === 0) {   // { 6100:3aaa }
    await RemoveEffect(g.HookOpponent, 0x3A, null);                        // { 6100:3ac7 }
    if (event === 0) {                                                     // { 6100:3add }
      eff.b[4] = 0;                                                        // { 6100:3ae3 }  p4
      await RemoveEffect(c, 0x4A, eff);                                    // { 6100:3aeb }
    }
  } else {
    c.b[F.attacks_left + 1] = 1;                                           // { 6100:3b01 }
    c.b[F.attacks_left + 2] = 0;                                           // { 6100:3b0a }
    c.b[F.dmg_dice + 1] = 3;                                               // { 6100:3b13 }
    c.b[F.dmg_sides + 1] = 4;                                              // { 6100:3b1c }
    const d = box(0);
    await Attack(c, g.HookOpponent, 1, null, d);                           // { 6100:3b25 }
    d.v = b01(await X.ClearCombatantActionFlags(c));                       // { 6100:3b45 }
    if (g.HookOpponent.b[F.active] === 0) await RemoveEffect(c, 0x4A, eff);   // { 6100:3b53 }
  }
}

// 6100:3B93 GodsIntervene — `START STING` debug cheat
export async function GodsIntervene() {
  if ((await X.ParamStr(1)) !== 'STING') return false;                     // { 6100:3b9e }
  await X.ShowTimedBottomMessage('The Gods intervene!');                   // { 6100:3bc0 }
  let p = g.PartyHead;                                                     // { 6100:3bd4 }
  while (p !== null) {                                                     // { 6100:3be1 }
    if (p.b[F.side] === 1) {                                               // { 6100:3be9 }
      p.b[F.active] = 0;                                                   // { 6100:3bf4 }
      p.b[F.status] = 6;                                                   // { 6100:3bfd }  Dead
      g.cb_Size[await X.CombatantIndex(p)] = 0;                                  // { 6100:3c06 }
    }
    await X.ClearCombatantActionFlags(p);                                  // { 6100:3c1e }
    p = p.next;                                                            // { 6100:3c2c }
  }
  await X.FocusSquare(g.cm_Map.b[2] + 3, g.cm_Map.b[3] + 3, 0xFF, 8);      // { 6100:3c41 }
  return true;                                                             // { 6100:3bbc }
}

// 6100:3C6D ov13_init — unit initialisation, empty
export function ov13_init() {}
