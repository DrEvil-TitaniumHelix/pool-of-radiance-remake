// game/areas/combat_ov09.js — COMBAT ov09 (seg 4D00): the turn of a computer-controlled combatant (monsters and
// party members in Quick mode): hot keys, morale/flight, magic items, spells, turn undead, weapon choice,
// step-by-step movement and the attack. Lane por-build-combat.
// Source: decode/pseudo/COMBAT.pas.md "## ov09 (seg 4D00)" (FINAL), combat_parts/ov09_notes.md; evidence
// decode/listings/ov09.lst. Conventions: combat_core.js header.
//
// Local conventions of this file (to be kept consistent with the siblings):
// - `cb` = c.combat.b (the 22-byte combat record, ov09 field table); the far pointer cb+0Ah `target` is the JS
//   reference c.combat.target (null = nil).
// - TChar readied[0..12] far pointers (+CCh + k*4) are the JS references c.readied[k] (null = nil).
// - Pascal `var` parameters of scalar/pointer type are passed as a ref box `{ v }` in their Pascal position.
// - Pointer tables / per-combatant tables are JS arrays indexed like the original (1-based where Pascal is):
//   g.cb_Char[n], g.cb_Col[n], g.cb_Row[n], g.tg_List[i].who (i = 1..g.tg_Count), g.foe_List[1..n],
//   g.side_ActiveCount[side].
// - ECL memory regions: g.ecl_Mem4900 / g.ecl_Mem6B00 = the VM's Uint16Array regions (ecl.js mem4900/mem6B00);
//   the original's byte offset o into the region is word index o >> 1.
// - Constant tables (ITEMS DS:5582, spell table DS:31FA, ai_DirOffsets DS:02AE, CombatTerrain DS:2744) are read
//   from the DS image with ds().

import { X, g, ds, S8, cr, byte, word, integer, chain } from './combat_core.js';
import {
  CalcMove, StepCombatant, AttacksOfOpportunity, Flee, CalcAttacks, FighterSweep, CanAttack, TurnUndead,
  FindTurnTarget, FaceAttacker, Attack, FindHealTarget, BeginCast, DirectionTo, MaxEnemyMove, AutoTarget,
  GodsIntervene,
} from './combat_ov13.js';
import { ReadyItem, UseItem } from './combat_ov19.js';
import { Roll, CallEffectHooks, RemoveEffect, RemoveFromCombat, ov24_1041, StinkingCloudCheck } from './combat_ov24.js';

// ---- local helpers ------------------------------------------------------------------------------------
const ref = (v) => ({ v });
const CB = (c) => cr(c).b;                                         // c+108h combat record bytes
const readied = (c, k) => (c.readied ? c.readied[k] ?? null : null);   // TChar +CCh + k*4
const ITEM = (t, j) => ds(0x5582 + t * 16 + j);                     // ITEMS[t] field j (SAVES.md §6)
const ITEMS_SLOT = 0, ITEMS_HANDS = 1, ITEMS_ROF = 5, ITEMS_DICE = 9, ITEMS_SIDES = 10, ITEMS_DMGBONUS = 11,
  ITEMS_RANGE = 12, ITEMS_USABLE = 13, ITEMS_WFLAGS2 = 14;
const ai_DirOffsets = (k) => ds(0x02AE + k);                        // g_02AE, row = movePattern, try 1..5
const CombatTerrainCost = (t) => ds(0x2744 + t * 4);               // g_2744 + 4t (+0 = movement cost)
const spell_AiValue = (s) => ds(0x3207 + s * 16);                  // g_3207 (spell table +0Dh)
const spell_NeedsTarget = (s) => ds(0x3208 + s * 16);              // g_3208 (+0Eh)
const spell_AreaSize = (s) => ds(0x3209 + s * 16);                 // g_3209 (+0Fh)
const sideZero = (c) => (X.IsSideZero(c) ? 1 : 0);                 // Ord(IsSideZero(c)) 00ba:23b7
const eclMem4900W = (o) => g.ecl_Mem4900[o >> 1];                  // ecl_Mem4900^ word at byte offset o
const eclMem6B00W = (o) => g.ecl_Mem6B00[o >> 1];                  // ecl_Mem6B00^ word at byte offset o
const keyCode = (k) => (typeof k === 'string' ? k.charCodeAt(0) : k);

// combat record offsets (ov09 table)
const CB_CASTING = 0x00, CB_MAYCAST = 0x01, CB_MAYUSEITEMS = 0x02, CB_INITIATIVE = 0x03, CB_MOVELEFT = 0x06,
  CB_FACING = 0x09, CB_TURNED = 0x10, CB_HASTURNED = 0x11, CB_FLEEING = 0x14, CB_MOVEPATTERN = 0x15;

// 4D00:000F AiCombatTurn
export async function AiCombatTurn(c) {
  const cb = CB(c);
  let done = !!(await CheckCombatHotkeys(c));                            // 4d00:0015
  await X.ClearMenuLine();                                               // 4d00:0022
  await X.ClearCharacterMessage();                                       // 4d00:0027
  if (c.b[0x10D] /* active */ === 0) done = !!(await X.ClearCombatantActionFlags(c));   // 4d00:002c
  let pat = cb[CB_MOVEPATTERN];                                          // 4d00:0045
  if (pat === 0 || pat > 4 || (await Roll(1, 4)) === 1) {                // 4d00:0054
    pat = await Roll(1, 8);                                              // 4d00:006f
    if (pat === 8) pat = byte((await Roll(1, 2)) + 4);                   // 4d00:007d
    else pat = await Roll(1, 4);                                         // 4d00:0098
  }
  cb[CB_MOVEPATTERN] = pat;                                              // 4d00:00a6  quirk: 5/6 always rerolled next turn
  if (!done) done = !!(await AiMoraleCheck(c));                          // 4d00:00b5
  if (cb[CB_FLEEING] !== 0 && cb[CB_TURNED] === 0)                       // 4d00:00c8
    await X.ShowCharacterMessage(c, 'flees in panic', 10, true);         // 4d00:00e6
  if (done) return;                                                      // 4d00:0106
  if (await AiTryUseMagicItem(c)) done = !!(await X.ClearCombatantActionFlags(c));   // 4d00:010f
  else if (cb[CB_CASTING] > 0) {                                         // 4d00:012e
    const r = ref(done);
    await X.CastSpell(cb[CB_CASTING], 1, 1, r);                          // 4d00:013c
    done = !!(await X.ClearCombatantActionFlags(c));                     // 4d00:0158
  }
  else if (await AiTryTurnUndead(c)) done = !!(await X.ClearCombatantActionFlags(c));  // 4d00:0169
  else if (await AiTryCastSpell(c)) done = true;                         // 4d00:0187
  else {
    await AiReadyBestWeapon(c);                                          // 4d00:019b
    done = !!(await CheckCombatHotkeys(c));                              // 4d00:01a5
    while (!done) {                                                      // 4d00:01b2
      if ((await AutoTarget(c, 0xFF, 1, 0)) && S8(cb, CB_INITIATIVE) > 0)   // 4d00:01b8  signed test
        done = !!(await AiMoveAttack(c));                                // 4d00:01df
      else
        done = !!(await AiEndTurn(c));                                   // 4d00:01ee
    }
  }
}

// 4D00:0203 AiTryTurnUndead
export async function AiTryTurnUndead(c) {
  const cb = CB(c);
  const u = ref(null);
  if (cb[CB_HASTURNED] === 0 && S8(c.b, 0x96) /* level[0] cleric */ > 0 &&   // 4d00:0209
      (await FindTurnTarget(c, u))) {                                    // 4d00:0223
    await TurnUndead(c);                                                 // 4d00:023b
    return true;                                                         // 4d00:0237
  }
  return false;                                                          // 4d00:0248
}

// 4D00:02EB AiSpellUseful
export async function AiSpellUseful(c, spell, minValue) {
  // 4D00:0255 AreaHitsFriend (nested: static link of AiSpellUseful)
  async function AreaHitsFriend(x, y, spell) {
    let result = false;                                                  // 4d00:025b
    await X.BuildTargetList(x, y, spell_AreaSize(spell), 0xFF, 1, g.cm_Map);   // 4d00:025f
    const n = g.tg_Count;
    for (let i = 1; i <= n; i++)                                         // 4d00:028c
      if (g.cb_Char[g.tg_List[i].who].b[0x10E] /* side */ !== sideZero(g.SelectedChar))   // 4d00:02a1
        result = true;                                                   // 4d00:02d6
    return result;
  }

  if (spell_AiValue(spell) < minValue) return false;                     // 4d00:02f5
  if (spell !== 3 && spell_NeedsTarget(spell) === 0) return true;       // 4d00:030c
  const f = ref(null);
  if (spell === 3 && (await FindHealTarget(c, f))) return true;          // 4d00:0324  3 = Cure Light Wounds
  // quirk: spell 3 without a wounded friend falls through to the enemy test (+0Eh not re-tested)
  const n = await X.CollectOppositeSideTargets(c, await X.SpellRange(spell));   // 4d00:0345
  if (n > 0) {                                                           // 4d00:035d
    if (spell_AreaSize(spell) === 0) return true;                        // 4d00:0363
    for (let i = 1; i <= n; i++)                                         // 4d00:037b
      if (await AreaHitsFriend(g.cb_Col[g.foe_List[i]], g.cb_Row[g.foe_List[i]], spell)) return false;   // 4d00:0390
    return true;                                                         // 4d00:03d7
  }
  return false;
}

// 4D00:03E4 AiTryUseMagicItem
export async function AiTryUseMagicItem(c) {
  const cb = CB(c);
  let result = false, chosen = null, minValue = 7;                       // 4d00:03ea
  const passes = await Roll(1, 7);                                       // 4d00:03fa
  done: {
    if (cb[CB_MAYUSEITEMS] === 0) break done;                            // 4d00:0408
    if (g.side_ActiveCount[sideZero(c)] === 0) break done;               // 4d00:041a  opponents still active
    if (eclMem4900W(0x1CA) !== 0) break done;                            // 4d00:0432  ECL variable 49E5h  TODO(decode): meaning
    for (let pass = 1; pass <= passes; pass++) {                         // 4d00:0441
      let it = c.items;                                                  // 4d00:0459
      while (it !== null && chosen === null) {                           // 4d00:046c
        let sp = it.b[0x3D];                                             // 4d00:0482  item +3Dh = SAVES power[2] (pseudo: power[1])
        const slot = ITEM(it.b[0x2E], ITEMS_SLOT); void slot;            // 4d00:048c  stored, never used
        if (!(await X.IsScroll(it)) && it.b[0x3E] /* SAVES power[3] */ < 0x80 && it.b[0x34] /* readied */ !== 0 && sp > 0) {   // 4d00:04a2
          if (sp > 0x38) sp = byte(sp - 0x17);                           // 4d00:04cb
          if (await AiSpellUseful(c, sp, minValue)) chosen = it;         // 4d00:04dc
        }
        it = it.next;                                                    // 4d00:04fe
      }
      minValue = byte(minValue - 1);                                     // 4d00:0512
    }
  }
  if (chosen !== null) {                                                 // 4d00:0520
    const dummy = ref(false);
    await UseItem(chosen, dummy);                                        // 4d00:0528
    result = true;                                                       // 4d00:0538
  }
  return result;
}

// 4D00:0545 AiTryCastSpell
export async function AiTryCastSpell(c) {
  const cb = CB(c);
  const list = new Uint8Array(21);
  let cnt = 0;                                                           // 4d00:054b
  if (cb[CB_MAYCAST] !== 0)                                              // 4d00:054f
    for (let k = 0; k <= 20; k++)                                        // 4d00:055e
      if (c.b[0x17 + k] > 0) { list[cnt] = c.b[0x17 + k]; cnt++; }      // 4d00:0567  quirk: bit 7 (not memorised) not filtered
  let chosen = 0, minValue = 7;                                          // 4d00:0599
  const passes = await Roll(1, 7);                                       // 4d00:05a1
  let pass = 1;                                                          // 4d00:05af
  if (cnt > 0 && (c.b[0x84] /* npc_morale */ > 0x7F || g.MagicOn !== 0) &&   // 4d00:05b3
      g.side_ActiveCount[sideZero(c)] > 0) {                             // 4d00:05ce
    while (pass <= passes && chosen === 0) {                             // 4d00:05e3
      let k = 1;                                                         // 4d00:05f1
      while (k < 4 && chosen === 0) {                                    // 4d00:05f5
        const pick = list[(await Roll(1, cnt)) - 1];                     // 4d00:0601
        if (await AiSpellUseful(c, pick, minValue)) chosen = pick;       // 4d00:0620
        k++;                                                             // 4d00:063c
      }
      minValue = byte(minValue - 1);                                     // 4d00:0641
      pass++;                                                            // 4d00:0644
    }
  }
  const r = ref(false);
  if (chosen > 0) await BeginCast(chosen, 1, r);                         // 4d00:0649
  else r.v = false;                                                      // 4d00:0662
  return !!r.v;                                                          // 4d00:0666
}

// 4D00:0675 AiCanStep
export async function AiCanStep(c, tryNo, baseDir, blocked) {
  const cb = CB(c);
  blocked.v = false;                                                     // 4d00:067b
  const dir = (ai_DirOffsets(cb[CB_MOVEPATTERN] * 5 + tryNo) + baseDir) % 8;   // 4d00:0686
  const occupant = ref(0), terrain = ref(0);
  await X.ProbeMove(c, dir, occupant, terrain);                          // 4d00:06c6
  if (terrain.v === 0) { blocked.v = true; return false; }               // 4d00:06df
  if (occupant.v !== 0) return false;                                    // 4d00:06ef
  if (!(CombatTerrainCost(terrain.v) < cb[CB_MOVELEFT])) return false;   // 4d00:06f8
  let cost = 2;                                                          // 4d00:0718
  if (dir & 1) cost = 3;                                                 // 4d00:071c  diagonal
  cost = byte(cost * CombatTerrainCost(terrain.v));                      // 4d00:0727
  const e = ref(null);
  if (terrain.v === 0x1E && !(await X.HasEffect(c, 0x20, e)) && !(await X.HasEffect(c, 0x1E, e)) &&   // 4d00:0744
      !(await X.HasEffect(c, 0x6F, e)) && !(await X.HasEffect(c, 0x7D, e)))   // TODO(decode): terrain 1Eh / effect names
    cost = byte(cb[CB_MOVELEFT] + 1);                                    // 4d00:07a6  impassable without one of these
  return cb[CB_MOVELEFT] >= cost;                                        // 4d00:07b8
}

// 4D00:07F2 AiMove
export async function AiMove(c) {
  const cb = CB(c);
  await X.DrawText(0, 24, 0x0A, 'Move/Attack, Move Left = ' + (await X.ByteToStr(cb[CB_MOVELEFT] >> 1)) + ' ');   // 4d00:07f9
  if (await CheckCombatHotkeys(c)) return;                               // 4d00:0842
  let stop;
  if ((cb[CB_MOVELEFT] >> 1) > 0 && S8(cb, CB_INITIATIVE) > 0 &&         // 4d00:0853  initiative signed
      !(cb[CB_FLEEING] === 0 && c.b[0x2F] /* class */ === 5)) {          // 4d00:087c  pure Magic-User does not advance
    let dir;
    if (cb[CB_FLEEING] === 0)
      dir = await DirectionTo(c, cr(c).target);                          // 4d00:08a7
    else {
      cb[CB_MOVEPATTERN] = await Roll(1, 2);                             // 4d00:08c7
      dir = byte(g.party_Dir - (((g.party_Dir + 2) % 4) >> 1));          // 4d00:08de
      if (c.b[0x10E] /* side */ === 0) dir = byte(dir + 4);              // 4d00:08fa
      dir = dir % 8;                                                     // 4d00:0910
    }
    const blocked = ref(false); stop = false; let i = 1;                 // 4d00:091f
    while (i < 6 && !stop) {                                             // 4d00:092b
      if (await AiCanStep(c, i, dir, blocked)) break;                    // 4d00:0937
      if (cb[CB_FLEEING] !== 0 && blocked.v) stop = !!(await Flee(c));   // 4d00:0952
      else i++;                                                          // 4d00:0977
    }
    let newDir = 0;
    if (stop) {                                                          // 4d00:097c
      cb[CB_MOVELEFT] = 0;                                               // 4d00:0982
      cb[CB_FLEEING] = 0;                                                // 4d00:098f
      stop = !!(await X.ClearCombatantActionFlags(c));                   // 4d00:099c
    } else {
      // quirk: with i = 6 the index runs into the next pattern row (row 6: past the 24h-byte table)
      newDir = (ai_DirOffsets(cb[CB_MOVEPATTERN] * 5 + i) + dir) % 8;    // 4d00:09ad
      if (i === 6 || (newDir + 4) % 8 === g.ai_LastStepDir) {            // 4d00:09e7  no free square, or stepping back
        g.ai_StuckCount = byte(g.ai_StuckCount + 1);                     // 4d00:0a0a
        cb[CB_MOVEPATTERN] = cb[CB_MOVEPATTERN] % 6 + 1;                 // 4d00:0a0e
        if (g.ai_StuckCount > 1) {                                       // 4d00:0a30
          cr(c).target = null;                                           // 4d00:0a37
          if (g.ai_StuckCount > 2) {                                     // 4d00:0a49
            cb[CB_MOVELEFT] = 0;                                         // 4d00:0a50
            stop = true;                                                 // 4d00:0a5d
          }
          else if (!(await AutoTarget(c, 0xFF, 1, 0)))                   // 4d00:0a63
            stop = !!(await AiEndTurn(c));                               // 4d00:0a7b
        }
      }
      if (i < 6) g.ai_LastStepDir = newDir;                              // 4d00:0a88
      else stop = true;                                                  // 4d00:0a96
    }
    if (stop) return;                                                    // 4d00:0a9a
    await X.ShowCombatant(c, newDir, 0, false);                          // 4d00:0aa3
    await AttacksOfOpportunity(c, cb[CB_FACING]);                        // 4d00:0ab8
    if (c.b[0x10D] /* active */ === 0) stop = !!(await X.ClearCombatantActionFlags(c));   // 4d00:0ad0
    else {
      await StepCombatant(c, cb[CB_FACING]);                             // 4d00:0aeb
      if (c.b[0x10D] === 0) stop = !!(await X.ClearCombatantActionFlags(c));   // 4d00:0b03
      await StinkingCloudCheck(c);                                       // 4d00:0b1c
    }
  }
  else stop = !!(await AiEndTurn(c));                                    // 4d00:0b29
}

// 4D00:0B3C AiMoveAttack
export async function AiMoveAttack(c) {
  const cb = CB(c);
  g.ai_LastStepDir = 8; g.ai_StuckCount = 0; g.g_443E = 0;               // 4d00:0b42  g_443E: written only
  let steps = 0, going = true, done = false;                             // 4d00:0b51
  await CallEffectHooks(0x0E, c);                                        // 4d00:0b5d
  if (cb[CB_INITIATIVE] === 0) going = false;                            // 4d00:0b6b
  while (!done && going) {                                               // 4d00:0b7e
    if (cb[CB_FLEEING] !== 0)                                            // 4d00:0b90
      while (cb[CB_MOVELEFT] > 0 && S8(cb, CB_INITIATIVE) > 0 && S8(cb, CB_INITIATIVE) < 0x14)   // 4d00:0b9f
        await AiMove(c);                                                 // 4d00:0bcc
    if (cb[CB_INITIATIVE] === 0 || cb[CB_INITIATIVE] === 0x14) going = false;   // 4d00:0bd8
    else done = false;                                                   // 4d00:0bfc
    if (done || !going) continue;                                        // 4d00:0c00
    steps++;                                                             // 4d00:0c12
    if (steps > 20) {                                                    // 4d00:0c15
      done = true;                                                       // 4d00:0c1b
      going = !(await AiEndTurn(c));                                     // 4d00:0c1f  (the rest of this pass still runs)
    }
    let canHit = false;                                                  // 4d00:0c33
    let range = 1;                                                       // 4d00:0c37
    const w = readied(c, 0);
    if (w !== null) range = byte(ITEM(w.b[0x2E], ITEMS_RANGE) - 1);      // 4d00:0c3b
    if (range === 0 || range === 0xFF) range = 1;                        // 4d00:0c68
    let tgt = cr(c).target;                                              // 4d00:0c78
    // quirk: the original reads tgt.active/side even when tgt = nil (IVT bytes 0000:010D/010E); either way nil stays nil
    if (tgt === null || tgt.b[0x10D] === 0 || tgt.b[0x10E] === 0) tgt = null;   // 4d00:0c8e  only side-1 targets kept
    if (tgt !== null)                                                    // 4d00:0cac
      if (await CanAttack(c, tgt)) {                                     // 4d00:0cb7
        const tx = ref(await X.CombatantCol(tgt)), ty = ref(await X.CombatantRow(tgt));   // 4d00:0ccc
        const dist = ref(range);                                         // 4d00:0ce8  word
        if ((await X.TraceLine(await X.CombatantCol(c), await X.CombatantRow(c), tx, ty, dist, g.cm_Map)) &&   // 4d00:0cf0
            (word(dist.v) >> 1) <= range)
          canHit = true;                                                 // 4d00:0d38
      }
    if (!canHit) {                                                       // 4d00:0d3c
      const n = await X.CollectOppositeSideTargets(c, range);            // 4d00:0d45
      if (n === 0) {
        if (await AutoTarget(c, 0xFF, 0, 0)) await AiMove(c);           // 4d00:0d5d
        else done = !!(await AiEndTurn(c));                              // 4d00:0d81
      } else {
        const k = await Roll(1, n);                                      // 4d00:0d91
        tgt = g.cb_Char[g.foe_List[k]];                                  // 4d00:0da0
        if ((await X.WeaponIsRanged(c)) && !(await X.FUN_00ba_2e46(c)) &&   // 4d00:0dc1
            (await X.CollectOppositeSideTargets(c, 1)) > 0) {            // 4d00:0ddf  enemy adjacent: change weapon
          await AiReadyBestWeapon(c);                                    // 4d00:0df1
          done = true;                                                   // 4d00:0dfb
        }
        else if ((await X.TargetDistance(c, tgt)) === 1 || (await CanAttack(c, tgt)))   // 4d00:0e01
          canHit = true;                                                 // 4d00:0e2b
      }
    }
    if (canHit)                                                          // 4d00:0e2f
      await X.FocusSquare(await X.CombatantCol(c), await X.CombatantRow(c), 2, await DirectionTo(c, tgt));   // 4d00:0e35
    if (canHit) {                                                        // 4d00:0e67
      if (await FighterSweep(c, tgt)) done = !!(await X.ClearCombatantActionFlags(c));   // 4d00:0e70
      else {
        await FaceAttacker(c, tgt);                                      // 4d00:0e96
        const ammo = ref(null);                                          // 4d00:0ea7
        if (await X.WeaponIsRanged(c)) {                                 // 4d00:0eaf
          canHit = !!(await X.GetMissileAmmo(c, ammo));                  // 4d00:0ebe
          if ((await X.FUN_00ba_2e46(c)) && (await X.TargetDistance(c, tgt)) === 1) ammo.v = null;   // 4d00:0ed1
        }
        const d = ref(done ? 1 : 0);
        await Attack(c, tgt, 0, ammo.v, d);                              // 4d00:0efd
        done = !!d.v;
        if (done) going = false;                                         // 4d00:0f1c
        else if (tgt.b[0x10D] /* active */ === 0) done = true;           // 4d00:0f28
      }
    }
  }
  return !going;                                                         // 4d00:0f3a
}

// 4D00:0F4F AiEndTurn
export async function AiEndTurn(c) {
  await X.ClearCharacterMessage();                                       // 4d00:0f55
  if ((await X.IsHelpless(c)) || (await X.WeaponIsRanged(c)) || CB(c)[CB_INITIATIVE] === 0)   // 4d00:0f5a
    return !!(await X.ClearCombatantActionFlags(c));                     // 4d00:0f87
  return !!(await X.SetGuarding(c));                                     // 4d00:0f97
}

// 4D00:0FC1 CheckCombatHotkeys
export async function CheckCombatHotkeys(c) {
  let result = false;                                                    // 4d00:0fc7
  if (X.KeyPressed()) {                                                  // 4d00:0fcb
    let key = keyCode(await X.ReadGameKey());                            // 4d00:0fd7
    if (key === 0) key = keyCode(await X.ReadGameKey());                 // 4d00:0fdf  extended key: scan code
    // asm 4d00:0fed..109f: one byte compared after the optional #0 prefix — no plain/extended split, so
    // 32h = '2' or Alt-M, 20h = space or Alt-D (scan 20h), 2Dh = '-' or Alt-X (quirk: both forms act)
    if (key === 0x32) {                                                  // 4d00:0fed  '2' or scan code of M (Alt-M)
      g.MagicOn = g.MagicOn === 0 ? 1 : 0;                               // 4d00:0ff4
      if (g.MagicOn !== 0) await X.ShowTimedBottomMessage('Magic On');   // 4d00:1001
      else await X.ShowTimedBottomMessage('Magic Off');                  // 4d00:101e
    }
    else if (key === 0x20) {                                             // 4d00:1034  space
      for (const p of chain(g.PartyHead))                                // 4d00:1038
        if (p.b[0x84] /* npc_morale */ < 0x80 && p.b[0x10C] /* status */ !== 1) p.b[0x10F] /* quick */ = 0;   // 4d00:104d
      if (c.b[0x10F] === 0) {                                            // 4d00:1081
        CB(c)[CB_INITIATIVE] = 0x14;                                     // 4d00:108c
        result = true;                                                   // 4d00:1099
      }
    }
    else if (key === 0x2D)                                               // 4d00:109f  '-' (or scan code of X)
      await GodsIntervene();                                             // 4d00:10a3  result unused
  }
  await X.FUN_0899_0104();                                               // 4d00:10ac  no-op in the original
  return result;
}

// 4D00:10D7 AiMoraleCheck
export async function AiMoraleCheck(c) {
  const cb = CB(c);
  cb[CB_FLEEING] = 0;                                                    // 4d00:10e1
  await ov24_1041(c);                                                    // 4d00:10ee  RemoveEffect 4Ah, 4Bh
  if (cb[CB_TURNED] !== 0) {                                             // 4d00:10f9
    cb[CB_FLEEING] = 1;                                                  // 4d00:1108
    await X.ShowCharacterMessage(c, 'is forced to flee', 10, true);      // 4d00:1115
    return false;                                                        // 4d00:1135
  }
  if (c.b[0x84] /* npc_morale */ <= 0x7F) return false;                  // 4d00:1138
  g.MoraleValue = byte((c.b[0x84] & 0x7F) * 2);                          // 4d00:1146  g_6825
  if (g.MoraleValue > 0x66) g.MoraleValue = 0;                           // 4d00:1157
  await CallEffectHooks(0x11, c);                                        // 4d00:1163  may change g_6825
  const hp = c.b[0x11B], hpMax = c.b[0x32];
  // quirk: hp_max = 0 is a Turbo Pascal runtime error 200 (division by zero) in the original
  if (hpMax === 0) throw new RangeError('AiMoraleCheck: Runtime error 200 (hp_max = 0) at 4d00:1171');
  const hpTerm = 100 - Math.trunc(integer(word(hp * 100)) / hpMax);     // word MUL, signed IDIV
  if (g.MoraleValue >= hpTerm && g.MoraleValue !== 0) return false;      // 4d00:1171  signed compare
  const saved = g.MoraleValue; void saved;                               // 4d00:11aa  never used again
  g.MoraleValue = g.enemy_HpPercent;                                     // 4d00:11b0  g_6E2F
  await CallEffectHooks(0x11, c);                                        // 4d00:11b6
  if (g.MoraleValue >= word(100 - eclMem6B00W(0x58C)) && g.MoraleValue !== 0 &&   // 4d00:11c4  ECL var 6DC6h, unsigned
      c.b[0x10E] /* side */ !== 0) return false;
  if ((await MaxEnemyMove(c)) <= ((await CalcMove(c)) >> 1)) {           // 4d00:11f0
    cb[CB_FLEEING] = 1;                                                  // 4d00:1218
    await RemoveEffect(c, 0x4A, null);                                   // 4d00:1225
    await RemoveEffect(c, 0x4B, null);                                   // 4d00:1239
  }
  else if (c.b[0x11] /* int */ > 5) {                                    // 4d00:124f
    await RemoveFromCombat(c, 4, 'Surrenders');                          // 4d00:1259
    return !!(await X.ClearCombatantActionFlags(c));                     // 4d00:1276
  }
  return false;
}

// 4D00:128D AiWeaponScore
export function AiWeaponScore(c, it) {
  const t = it.b[0x2E];                                                  // 4d00:1293  ITEMS[t] copied to a local
  const tDice = ITEM(t, ITEMS_DICE), tSides = ITEM(t, ITEMS_SIDES), tDmgBonus = (ITEM(t, ITEMS_DMGBONUS) << 24) >> 24,
    tWflags2 = ITEM(t, ITEMS_WFLAGS2), tRof = ITEM(t, ITEMS_ROF), tHands = ITEM(t, ITEMS_HANDS);
  let s = byte(tDice * tSides);                                          // 4d00:12b6
  if (S8(it.b, 0x32) /* plus */ > 0) s = byte(s + S8(it.b, 0x32) * 8);   // 4d00:12c7
  if (tDmgBonus > 0) s = byte(s + tDmgBonus * 2);                        // 4d00:12e9
  const tg = cr(c).target;
  if (t === 0x55 && tg !== null && S8(tg.b, 0x76) > 0) s = 8;            // 4d00:1301  Holy Water vs undead
  if ((tWflags2 & 8) !== 0) s = byte(s + (tRof - 1) * 2);               // 4d00:1334  launcher: rate of fire
  if (tHands <= 1) s = byte(s + 3);                                      // 4d00:1351
  if (c.b[0x100] /* hands_used */ + tHands > 3) s = 0;                   // 4d00:1362
  if (it.b[0x3E] /* SAVES power[3] */ === 0x84 && (it.b[0x3D] /* power[2] */ & 0x0F) !== c.b[0xA0] /* alignment */) s = 0;   // 4d00:137e
  if (it.b[0x3D] === 0x53) s = 0;                                        // 4d00:139f  TODO(decode): power 53h meaning
  if (it.b[0x36] /* cursed */ !== 0) s = 0;                              // 4d00:13ad
  return s;                                                              // 4d00:13bb
}

// 4D00:13CA AiReadyBestWeapon
export async function AiReadyBestWeapon(c) {
  const hands = (it) => ITEM(it.b[0x2E], ITEMS_HANDS);
  if (readied(c, 0) !== null) c.b[0x100] = byte(c.b[0x100] - hands(readied(c, 0)));   // 4d00:13d0
  if (readied(c, 1) !== null) c.b[0x100] = byte(c.b[0x100] - hands(readied(c, 1)));   // 4d00:140f
  let bestMissile = null, bestMelee = null, bestShield = null;           // 4d00:144e
  let missileScore = 1;                                                  // 4d00:1466
  let meleeScore = byte(c.b[0xA3] * c.b[0xA5]);                          // 4d00:146a  base_dmg_dice[1] x base_dmg_sides[1]
  if (S8(c.b, 0xA7) > 0) meleeScore = byte(meleeScore + S8(c.b, 0xA7) * 2);   // 4d00:1485
  let shieldScore = 0;                                                   // 4d00:14a7
  for (let it = c.items; it !== null; it = it.next) {                    // 4d00:14ab / 14be / 15ef
    const t = it.b[0x2E];                                                // 4d00:14c9
    if (ITEM(t, ITEMS_SLOT) === 0 && (ITEM(t, ITEMS_USABLE) & c.b[0xB0] /* class_mask */) !== 0) {   // 4d00:14d3
      const s = AiWeaponScore(c, it);                                    // 4d00:1506
      if ((ITEM(t, ITEMS_WFLAGS2) & 8) !== 0 || (ITEM(t, ITEMS_WFLAGS2) & 0x10) !== 0)   // 4d00:1519
        if (s > missileScore) { bestMissile = it; missileScore = s; }    // 4d00:1543
      if ((ITEM(t, ITEMS_WFLAGS2) & 8) === 0 && s > meleeScore) { bestMelee = it; meleeScore = s; }   // 4d00:155d
    }
    if (ITEM(t, ITEMS_SLOT) === 1 && (ITEM(t, ITEMS_USABLE) & c.b[0xB0]) > 0) {   // 4d00:158c
      const s = S8(it.b, 0x32) >= 0 ? byte(S8(it.b, 0x32) + 1) : 0;      // 4d00:15b9
      if (s > shieldScore) { bestShield = it; shieldScore = s; }         // 4d00:15d5
    }
  }
  const throwable = bestMissile !== null && ITEM(bestMissile.b[0x2E], ITEMS_RANGE) > 1 &&   // 4d00:1603
    (ITEM(bestMissile.b[0x2E], ITEMS_WFLAGS2) & 0x14) === 0x14;
  let canShoot = false, ammo = null, fl = 0;                             // 4d00:1644
  if (bestMissile !== null) {                                            // 4d00:1654
    fl = ITEM(bestMissile.b[0x2E], ITEMS_WFLAGS2);                       // 4d00:165c
    if ((fl & 0x10) !== 0) ammo = bestMissile;                           // 4d00:1672  thrown: its own ammo
    if ((fl & 8) !== 0) {                                                // 4d00:1687
      if ((fl & 1) !== 0) ammo = readied(c, 11);                         // 4d00:1690  +F8h arrows
      if ((fl & 0x80) !== 0) ammo = readied(c, 12);                      // 4d00:16ac  +FCh quarrels
    }
  }
  if (ammo !== null || fl === 0x0A) canShoot = true;                     // 4d00:16c8  0Ah = sling
  let chosen;
  if (bestMissile !== null && missileScore > (meleeScore >> 1) && canShoot &&   // 4d00:16da
      (throwable || (await X.CollectOppositeSideTargets(c, 1)) === 0))
    chosen = bestMissile;                                                // 4d00:1712
  else chosen = bestMelee;                                               // 4d00:1720
  let changed = false, ok = true;                                        // 4d00:172c
  if (readied(c, 0) !== null && (readied(c, 0) === chosen || readied(c, 0).b[0x36] !== 0)) ok = false;   // 4d00:1734
  if (ok) {                                                              // 4d00:176d
    if (readied(c, 0) !== null) await ReadyItem(readied(c, 0));          // 4d00:1776  un-ready the old weapon
    await X.RecalcCharacter(c);                                          // 4d00:1797
    if (readied(c, 1) !== null && readied(c, 1).b[0x36] === 0)
      c.b[0x100] = byte(c.b[0x100] - hands(readied(c, 1)));              // 4d00:17a2
    if (chosen !== null) await ReadyItem(chosen);                        // 4d00:17f0
    changed = true;                                                      // 4d00:1803
  }
  await X.RecalcCharacter(c);                                            // 4d00:1807
  await CalcAttacks(c);                                                  // 4d00:1812
  ok = true;                                                             // 4d00:181d
  if (readied(c, 1) !== null && (readied(c, 1) === bestShield || readied(c, 1).b[0x36] !== 0)) ok = false;   // 4d00:1821
  if (c.b[0x100] > 2) {                                                  // 4d00:185a
    if (readied(c, 1) !== null && readied(c, 1).b[0x36] === 0) await ReadyItem(readied(c, 1));   // 4d00:1894
    else await ReadyItem(chosen);                                        // 4d00:1883  quirk: chosen may be nil
    changed = true;                                                      // 4d00:188e / 18a6
  }
  else if (c.b[0x100] < 2 && ok) {                                       // 4d00:18ac
    if (readied(c, 1) !== null) await ReadyItem(readied(c, 1));          // 4d00:18bd
    await X.RecalcCharacter(c);                                          // 4d00:18de
    if (bestShield !== null) await ReadyItem(bestShield);                // 4d00:18e9
    changed = true;                                                      // 4d00:18fc
  }
  await X.RecalcCharacter(c);                                            // 4d00:1900
  if (changed) await X.DrawCharacterSummary(c);                          // 4d00:190b
}

// 4D00:1922 ov09_init — empty unit initialiser
export function ov09_init() {}                                           // 4d00:1922
