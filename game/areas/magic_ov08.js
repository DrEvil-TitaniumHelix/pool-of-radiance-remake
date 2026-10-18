// game/areas/magic_ov08.js — MAGIC ov08 (seg 4800): combat round loop and the player's turn menu. Lane por-build-magic.
// Source: decode/pseudo/MAGIC.pas.md "## ov08 (4800)" (FINAL, verified MAGIC_VERIFY.md); every routine re-read against
// decode/listings/ov08.lst (python decode/ecl/hdis.py ov08 ...) while translating (build-area-template caution rules):
// all call argument orders below are from the push sequences; menu loops, exit sets (CS:0626, CS:0646, CS:0E25,
// CS:10AF decoded from the overlay bytes) and colours from the bytes.
// Conventions: magic_core.js header; combat-area conventions (combat_ov13.js header) for the shared records:
// - combat record cr(c) = c.combat = { b: Uint8Array(0x16), target } (+0Ah target far ptr = JS reference .target);
// - `var` parameters are boxes { v }; a global passed as var is gbox('name');
// - g.cb_Char[i] = DS:65B9 + 4i combatant table; g.cm_Map = { b } combat map record (+2 viewX, +3 viewY);
// - g.ecl_Mem4900 / g.ecl_Mem6B00 = the VM's Uint16Array regions (index = ECL address − base).
// Cross-part calls (CastSpell 8E00:0C20, SelectTargetsCamp 8E00:0A91) and other areas go through X (magic.js binds
// the MAGIC exports into env.ext as well), so this unit loads before its siblings exist.

import { X, g, ds, S8, byte } from './magic_core.js';

const box = (v) => ({ v });
const gbox = (name) => ({ get v() { return g[name]; }, set v(x) { g[name] = x; } });
const cr = (c) => c.combat;
// TChar fields (SAVES.md §3)
const F = { mem_spell: 0x17, npc_morale: 0x84, level: 0x96, item_count: 0xC7, status: 0x10C, active: 0x10D, side: 0x10E, controlled: 0x10F };
// combat record (MAGIC.pas.md ov08 header; combat_ov13.js CR)
const CR = { castSpell: 0, mayCast: 1, initiative: 3, moveLeft: 6, f07: 7, facing: 9, dyingTurns: 0x0E, f0F: 0x0F, hasTurned: 0x11, f12: 0x12, extra: 0x13 };
const CombatTerrainCost = (t) => ds(0x2744 + t * 4);         // DS:2744 + 4*tile, +0 = movement cost
const eclMem4900W = (byteOfs) => (g.ecl_Mem4900 ? g.ecl_Mem4900[byteOfs >> 1] : 0);
const b01 = (f) => (f ? 1 : 0);
const sideCount = (i) => byte(g.side_ActiveCount?.[i] ?? 0); // DS:6814 + i side_ActiveCount: Byte[0..1] (CountActiveSides 00BA:23DB; fix #xref-6)

// 4800:0000 EndCombat
export async function EndCombat() {
  while (g.sc_List) g.sc_List = g.sc_List.next;               // 4800:0006 .. 003f  FreeMem(sc_List, 13h) along +4 links
  g.cm_Map = null;                                            // 4800:004d  FreeMem(cm_Map, 4E9h); cm_Map := nil
  g.g_6E36 = X.FreePicture(g.g_6E36);                         // 4800:005f  FreePicture(var g_6E36)
  await X.PaletteFlashOff();                                  // 4800:0064
  g.SpellHandlers[0] = X.SelectTargetsCamp;                   // 4800:0069  := 0096:0034 = stub ov22 e4 (8E00:0A91)
}

// 4800:007A CombatMain (stub ov08 e1; ECL COMBAT opcode)
export async function CombatMain() {
  g.game_Mode = 5;                                            // 4800:0080  g_49F3
  g.SpellHandlers[0] = X.CollectSpellTargets;                 // 4800:0085  := 0068:0066 = stub ov13 e14 (6100:20C3)
  await X.StartCombat();                                      // 4800:0092  5200:1E31 (stub ov10)
  const over = box(0);                                        // 4800:0097
  if (sideCount(0) === 0 || sideCount(1) === 0) over.v = 1;           // 4800:009b / 00a2  side counts
  while (over.v === 0) {                                      // 4800:00ad
    await X.CountActiveSides();                               // 4800:00b3
    for (let c = g.PartyHead; c; c = c.next) await X.StartCombatRound(c);   // 4800:00d3
    g.ecl_Mem6B00[0x6DCB - 0x6B00] = 0;                       // 4800:00f3  ecl_Mem6B00^.w[$596] (SURPRISE result)
    const who = box(null);
    await NextToAct(who);                                     // 4800:00fe
    while (who.v) {                                           // 4800:0101
      await TakeTurn(who.v);                                  // 4800:0110
      await NextToAct(who);                                   // 4800:0119
    }
    await EndOfRound(over);                                   // 4800:0124
  }
  await EndCombat();                                          // 4800:012a
}

// 4800:0131 NextToAct(var who)
// For each list member a fresh Roll(1,100); a member wins if its initiative (signed byte) is > the best so far, or
// equal with a roll >= the best roll. who := nil when the best initiative is 0.
export async function NextToAct(who) {
  let best = 0, bestRoll = 0;                                 // [bp-1] (unsigned), [bp-2]
  for (let c = g.PartyHead; c; c = c.next) {                  // 4800:013f
    const r = byte(await X.Roll(1, 100));                     // 4800:015d  push 1, 64h
    const ini = S8(cr(c).b, CR.initiative);                   // 4800:0174  CBW (signed) vs zero-extended best
    if (ini > best) bestRoll = r;                             // 4800:017b  JLE
    if (ini >= best && r >= bestRoll) {                       // 4800:0199 JL / 01a1 JB
      bestRoll = r;
      best = byte(ini);                                       // 4800:01b5
      who.v = c;                                              // 4800:01c1
    }
  }
  if (best === 0) who.v = null;                               // 4800:01de
  // quirk: who keeps the caller's old value when nothing qualifies and best stays 0 — then it is set to nil anyway.
}

// 4800:01F6 TakeTurn(c)
export async function TakeTurn(c) {
  const b = cr(c).b;
  b[CR.f0F] = 0; b[CR.f12] = 0; b[CR.f07] = 0;                // 4800:0204 / 0211 / 021e
  await X.CallEffectHooks(7, c);                              // 4800:022c  push 7, c
  if (S8(b, CR.initiative) > 0) {                             // 4800:023e  JG
    if (b[CR.initiative] === 0x14) b[CR.initiative] = 0x13;   // 4800:024b
    g.SelectedChar = c;                                       // 4800:0265
    await X.FocusCombatant(c, 2, 1);                          // 4800:0278  push c, 2, 1
    await X.RecalcCharacter(c);                               // 4800:0283
    await X.DrawCharacterSummary(c);                          // 4800:028e
    await X.CallEffectHooks(0x0F, c);                         // 4800:029c
    if (S8(b, CR.initiative) > 0) {                           // 4800:02ae  JLE skip
      if (c.b[F.controlled] !== 0) await X.AiCombatTurn(c);   // 4800:02c1
      else await PlayerTurn(c);                               // 4800:02cf
    }
    await X.RedrawSquare(X.CombatantCol(c), X.CombatantRow(c));   // 4800:02ea  push col, row
  }
}

// 4800:031A PlayerTurn(c)
export async function PlayerTurn(c) {
  const b = cr(c).b;
  const done = box(0);                                        // [bp-2]
  if (c.b[F.active] === 0) {                                  // 4800:0323
    done.v = b01(await X.ClearCombatantActionFlags(c));       // 4800:05eb
    return;
  }
  if (b[CR.castSpell] > 0) {                                  // 4800:0336  JBE (unsigned)
    const s = b[CR.castSpell];                                // 4800:0344
    b[CR.castSpell] = 0;                                      // 4800:0352
    await X.CastSpell(s, 0, 1, done);                         // 4800:0365  push s, 0, 1, @done
    done.v = b01(await X.ClearCombatantActionFlags(c));       // 4800:0370
    return;
  }
  done.v = 0;                                                 // 4800:037b
  while (done.v === 0) {                                      // 4800:037f  pre-test
    const key = box('\0');
    await CombatMenu(c, key);                                 // 4800:0394
    switch (key.v) {
      case 'M': await MoveAttack(c, done); break;             // 4800:03aa
      case 'V':
        await X.ViewMenu(done);                               // 4800:03b9
        await X.CalcAttacks(c);                               // 4800:03c4
        if (done.v === 0 || done.v === false) await X.DrawCombatLayout();   // 4800:03cf
        break;
      case 'A': {
        const tgt = { char: null, x: 0, y: 0, b6: 0 };          // [bp-0Dh] TTargetRec
        await X.SelectTarget(c, 0xFF, 1, 0, done, tgt);       // 4800:03f4  push c, FFh, 1, 0, @done, @tgt
        break;
      }
      case 'U':
        await X.ItemsMenu(done);                              // 4800:0405
        await X.CalcAttacks(c);                               // 4800:0410
        if (done.v === 0 || done.v === false) await X.DrawCombatLayout();   // 4800:041b
        break;
      case 'C': await X.BeginCast(0, 0, done); break;         // 4800:0432  push 0, 0, @done
      case 'T':
        await X.TurnUndead(c);                                // 4800:0444
        done.v = b01(await X.ClearCombatantActionFlags(c));   // 4800:044f
        break;
      case 'Q':
        await SetQuick(c);                                    // 4800:0465
        X.ClearMenuLine();                                    // 4800:0468
        await X.FUN_0899_0104();                              // 4800:046d  (disabled no-op, ENGINE)
        await X.Delay(200);                                   // 4800:0476  Crt.Delay(C8h)
        done.v = 1;                                           // 4800:047b
        await X.AiCombatTurn(c);                              // 4800:0485
        break;
      case 'D': await DoneMenu(c, done); break;               // 4800:049d
      case '\x32':                                            // Alt-M (scan 32h): Magic On / Off
        g.MagicOn = g.MagicOn === 0 ? 1 : 0;                  // 4800:04a7 .. 04b1  g_6E30
        if (g.MagicOn !== 0) await X.ShowTimedBottomMessage('Magic On');    // 4800:04ca
        else await X.ShowTimedBottomMessage('Magic Off');     // 4800:04e0
        break;
      case ' ':                                               // take back control of every PC
        for (let p = g.PartyHead; p; p = p.next)              // 4800:04ec
          if (p.b[F.npc_morale] < 0x80) p.b[F.controlled] = 0;   // 4800:0504 JAE / 050f
        break;
      case '\x10':                                            // Alt-Q (scan 10h): quick for everyone
        b[CR.initiative] = 0x14;                              // 4800:0539
        for (let p = g.PartyHead; p; p = p.next) await SetQuick(p);   // 4800:055a
        X.ClearMenuLine();                                    // 4800:0572
        await X.Delay(200);                                   // 4800:057b
        done.v = 1;                                           // 4800:0580
        break;
      case '\x2D':                                            // Alt-X (scan 2Dh): the STING cheat
        if (await X.GodsIntervene()) {                        // 4800:058a
          await X.FocusCombatant(c, 3, 0);                    // 4800:059f  push c, 3, 0
          done.v = 1;                                         // 4800:05a4
        } else await X.ShowTimedBottomMessage("That doesn't work");   // 4800:05b9
        break;
      // quirk: Alt-R (scan 13h) passes CombatMenu's exit set (CS:0646) but has no case here — the menu just repeats.
    }
    if (done.v === 0 || done.v === false) {                   // 4800:05be
      await X.FocusCombatant(c, 2, 1);                        // 4800:05d0
      await X.DrawCharacterSummary(c);                        // 4800:05db
    }
  }
}

// 4800:0666 CombatMenu(c, var key)
const CM_EXT_KEEP = new Set([0x10, 0x13, 0x2D, 0x32]);                                         // set CS:0626
const CM_EXIT = new Set([0x10, 0x13, 0x20, 0x2D, 0x32, 0x41, 0x43, 0x44, 0x4D, 0x51, 0x54, 0x55, 0x56]);   // set CS:0646
export async function CombatMenu(c, key) {
  await X.CallEffectHooks(0x0F, c);                           // 4800:0676  push 0Fh, c
  let opts = '';                                              // [bp-29h] string[40]
  if (cr(c).b[CR.moveLeft] > 0) opts = (opts + 'Move ').slice(0, 40);        // 4800:0687 JBE
  opts = (opts + 'View Aim ').slice(0, 40);                   // 4800:06c6
  if (c.b[F.item_count] > 0) opts = (opts + 'Use ').slice(0, 40);            // 4800:06e1
  let anySpell = false;                                       // [bp-2Bh]
  for (let i = 0; i <= 0x14; i++) if (c.b[F.mem_spell + i] > 0) anySpell = true;   // 4800:071e .. 0737  any non-zero byte (pending >= 80h counts too)
  if (anySpell && cr(c).b[CR.mayCast] !== 0 && eclMem4900W(0x1CA) === 0)     // 4800:0739 / 0747 / 0752  (ECL word 49E5h)
    opts = (opts + 'Cast ').slice(0, 40);                     // 4800:076a
  if (S8(c.b, F.level) > 0 && cr(c).b[CR.hasTurned] === 0)   // 4800:0785 JLE (cleric level, signed) / 0795
    opts = (opts + 'Turn ').slice(0, 40);                     // 4800:07ac
  opts = (opts + 'Quick Done').slice(0, 40);                  // 4800:07d4
  do {                                                        // 4800:07ec
    const r = await X.HorizontalMenu('', opts, 0x0D, 0x0A, 0x0F, 1, 0);   // 4800:0814  push '', opts, 0Dh, 0Ah, 0Fh, 1, 0, @ext[bp-2Bh]
    key.v = r.key;                                            // 4800:081c
    if (r.ext && !CM_EXT_KEEP.has(key.v.charCodeAt(0))) key.v = '\0';   // 4800:081f / 0831 JNE / 083b
  } while (!CM_EXIT.has(key.v.charCodeAt(0)));                // 4800:084b  JE loop
  // quirk: Esc (#0) is not in the exit set — the menu cannot be left with Esc.
}

// 4800:0880 EndOfRound(var over)
export async function EndOfRound(over) {
  await X.AdvanceClock(1, 1);                                 // 4800:088c  push 1, 1
  g.g_6DE3 = byte(g.g_6DE3 + 1);                              // 4800:0891  combat round counter (byte)
  await X.CalcEnemyHpPct();                                   // 4800:0895
  for (let c = g.PartyHead; c; c = c.next) {                  // 4800:089a
    await X.CallEffectHooks(0x13, c);                         // 4800:08bc
    await X.StinkingCloudCheck(c);                            // 4800:08c7
    if (c.b[F.status] === 5) {                                // 4800:08cf  Dying
      const b = cr(c).b;
      b[CR.dyingTurns] = byte(b[CR.dyingTurns] + 1);          // 4800:08df
      if (b[CR.dyingTurns] > 9) c.b[F.status] = 6;            // 4800:08eb JBE / 08f5  Dead
    }
  }
  if (await AnyoneDying(0)) await X.ShowTimedBottomMessage('Your Teammate is Dying');   // 4800:0917 / 092d
  await X.CountActiveSides();                                 // 4800:0932
  await X.FocusSquare(S8(g.cm_Map.b, 2) + 3, S8(g.cm_Map.b, 3) + 3, 0xFF, 8);   // 4800:0957  CBW; push x, y, FFh, 8
  if (sideCount(0) === 0 || sideCount(1) === 0) over.v = 1;           // 4800:095c .. 096d
  if (sideCount(0) > 0 && sideCount(1) === 0 && g.g_49F4 === 0)       // 4800:0971 .. 0984
    if ((await X.AskYesNo('Continue Battle:', 0x0D, 0x0A, 0x0F)) === 'Y') over.v = 0;   // 4800:099e / 09a3
}

// 4800:09DF MoveAttack(c, var done)
export async function MoveAttack(c, done) {
  const b = cr(c).b;
  const savedMove = b[CR.moveLeft];                           // 4800:09ee [bp-1]
  const savedFacing = b[CR.facing];                           // 4800:09fd [bp-2]
  const savedCol = byte(await X.CombatantCol(c));             // 4800:0a0a [bp-3]
  const savedRow = byte(await X.CombatantRow(c));             // 4800:0a18 [bp-4]
  let key = ' ';                                              // 4800:0a20 [bp-0Ah]
  done.v = 0;                                                 // 4800:0a27
  let dir = 8;                                                // 4800:0a2b [bp-7]
  while (b[CR.moveLeft] > 1 && key !== '\0' && key !== '\r') {   // 4800:0a37 JA / 0a41 / 0a4a
    X.ClearRectangle(0x18, 0x18, 0x27, 0x18);                 // 4800:0a5f  push 18h, 18h, 27h, 18h (row 24 from col 24)
    const prompt = ('Move/Attack, Move Left = ' + X.ByteToStr(b[CR.moveLeft] >> 1) + ' ').slice(0, 255);   // 4800:0a6a .. 0a9a
    const r = await X.HorizontalMenu(prompt, '', 0x0A, 0x0A, 0x0F, 1, 0);    // 4800:0ac3  push prompt, '', 0Ah, 0Ah, 0Fh, 1, 0, @g_6E31
    g.g_6E31 = r.ext ? 1 : 0;                                 // var ext = DS:6E31
    key = r.key;                                              // 4800:0ac8
    if (key === '\0') {                                       // 4800:0ace  Esc: undo the move
      b[CR.moveLeft] = savedMove;                             // 4800:0ae0
      await X.RestoreTerrain(0, 0, await X.CombatantIndex(c));   // 4800:0af6  push 0, 0, index
      done.v = b01(!(await X.PlaceCombatant(c, savedCol, savedRow, 0)));   // 4800:0b0c / 0b11 .. 0b1b
      await X.FocusSquare(await X.CombatantCol(c), await X.CombatantRow(c), 0, 8);   // 4800:0b3c
      b[CR.facing] = savedFacing;                             // 4800:0b4c
      dir = 8;                                                // 4800:0b50
    } else {
      // scan code -> direction (whatever the ext flag says)    4800:0b56 .. 0ba6
      dir = { '\x48': 0, '\x49': 1, '\x4D': 2, '\x51': 3, '\x50': 4, '\x4F': 5, '\x4B': 6, '\x47': 7 }[key] ?? 8;
    }
    if (dir < 8) {                                            // 4800:0baa
      await X.ShowCombatant(c, dir, 0, 0);                    // 4800:0bc3  push c, dir, 0, 0
      const occ = box(0), tile = box(0);
      await X.ProbeMove(c, dir, occ, tile);                   // 4800:0bdc  push c, dir, @occ[bp-8], @tile[bp-9]
      if (occ.v > 0) await AttackTarget(c, g.cb_Char[occ.v], done);   // 4800:0be1 JBE / 0c06
      else if (tile.v === 0) {                                // 4800:0c0c  off the battlefield
        const a = await X.AskYesNo('Flee:', 0x0D, 0x0A, 0x0F);   // 4800:0c2a
        if (a === 'Y') done.v = b01(await X.Flee(c));         // 4800:0c39
        else if (a === 'N') done.v = 0;                       // 4800:0c46
      } else if (CombatTerrainCost(tile.v) > b[CR.moveLeft]) {   // 4800:0c5f / 0c6b JBE
        await X.ShowTimedBottomMessage('Blocked');            // 4800:0c80
      } else {
        await X.AttacksOfOpportunity(c, dir);                 // 4800:0c92  push c, dir
        if (c.b[F.active] === 0) done.v = b01(await X.ClearCombatantActionFlags(c));   // 4800:0c9a / 0ca8
        else {
          await X.StepCombatant(c, dir);                      // 4800:0cbf
          if (c.b[F.active] === 0) done.v = b01(await X.ClearCombatantActionFlags(c));   // 4800:0cc7 / 0cd5
          await X.StinkingCloudCheck(c);                      // 4800:0ce6
          if (await X.IsHelpless(c)) done.v = b01(await X.ClearCombatantActionFlags(c));   // 4800:0cf1 / 0d00
        }
      }
    }
    // quirk: the loop condition does not test done — after an attack it continues while moveLeft > 1.
  }
  if (b[CR.moveLeft] < 2) b[CR.moveLeft] = 0;                 // 4800:0d16 JAE / 0d25
}

// 4800:0D45 AttackTarget(c, target, var done)
export async function AttackTarget(c, target, done) {
  if ((await X.WeaponIsRanged(c)) && !(await X.FUN_00ba_2e46(c))) {   // 4800:0d51 / 0d60  missile weapon without usable ammunition
    await X.ShowTimedBottomMessage('Not with that weapon');   // 4800:0d78
    return;
  }
  if (!(await X.ConfirmAttackAlly(c, target))) return;        // 4800:0d8b  push c, target
  cr(c).target = target;                                      // 4800:0da2  cs^ +0Ah
  if (await X.FighterSweep(c, target)) done.v = 1;            // 4800:0db6 / 0dc2
  else {
    await X.FaceAttacker(c, target);                          // 4800:0dd4  push c, target
    await X.Attack(c, target, 0, null, done);                 // 4800:0df3  push c, target, 0, nil (0:0), @done
  }
}

// 4800:0E45 DoneMenu(c, var done)
const DM_EXIT = new Set([0x00, 0x45]);                         // set CS:0E25 = [#0, 'E']
export async function DoneMenu(c, done) {
  done.v = 0;                                                 // 4800:0e4c
  let opts = '';                                              // 4800:0e53
  if (!(await X.WeaponIsRanged(c)) || (await X.FUN_00ba_2e46(c)))   // 4800:0e5d / 0e6c
    opts = (opts + 'Guard ').slice(0, 40);                    // 4800:0e85
  opts = (opts + 'Delay Quit ').slice(0, 40);                 // 4800:0ead
  if (await AnyoneDying(0)) opts = (opts + 'Bandage ').slice(0, 40);   // 4800:0ec9 / 0ee0
  opts = (opts + 'Speed Exit').slice(0, 40);                  // 4800:0f08
  let key = ' ';                                              // 4800:0f20
  while (!DM_EXIT.has(key.charCodeAt(0)) && !(done.v)) {      // 4800:0f2d / 0f3a  pre-test
    const r = await X.HorizontalMenu('', opts, 0x0D, 0x0A, 0x0F, 0, 0);   // 4800:0f6b  push '', opts, 0Dh, 0Ah, 0Fh, 0, 0, @g_6E31
    g.g_6E31 = r.ext ? 1 : 0;
    key = r.key;                                              // 4800:0f70
    if (key === 'G') done.v = b01(await X.SetGuarding(c));    // 4800:0f80
    else if (key === 'D') { cr(c).b[CR.initiative] = 1; done.v = 1; }   // 4800:0f99 / 0fa1  delay to the end of the round
    else if (key === 'Q') done.v = b01(await X.ClearCombatantActionFlags(c));   // 4800:0fb1
    else if (key === 'B') {
      done.v = b01(await AnyoneDying(1));                     // 4800:0fc6  (overwritten next)
      done.v = b01(await X.ClearCombatantActionFlags(c));     // 4800:0fd5
    } else if (key === 'S') await GameSpeedMenu();            // 4800:0fe7
  }
}

// 4800:0FFF AnyoneDying(bandage): Boolean
// A member counts if cs^.extra = 0, side (+10Eh) = 0 and status = 5 (Dying). With bandage the first one found is
// bandaged (status 4 Unconscious, dyingTurns 0, "is bandaged"); bandage is then cleared, so one per call.
export async function AnyoneDying(bandage) {
  let found = 0;                                              // [bp-6]
  for (let c = g.PartyHead; c; c = c.next) {                  // 4800:1009
    if (cr(c).b[CR.extra] === 0 && c.b[F.side] === 0 && c.b[F.status] === 5) {   // 4800:1029 / 1033 / 103e
      found = 1;                                              // 4800:1046
      if (bandage) {                                          // 4800:104a
        c.b[F.status] = 4;                                    // 4800:1053
        cr(c).b[CR.dyingTurns] = 0;                           // 4800:1061
        await X.ShowCharacterMessage(c, 'is bandaged', 0x0A, 1);   // 4800:1081  push c, 'is bandaged', 0Ah, 1
        bandage = 0;                                          // 4800:1086
      }
    }
  }
  return found;                                               // 4800:10a0
}

// 4800:10F6 GameSpeedMenu
const GS_EXIT = new Set([0x00, 0x45]);                         // set CS:10AF = [#0, 'E']
export async function GameSpeedMenu() {
  let key = ' ';                                              // 4800:10fd
  while (!GS_EXIT.has(key.charCodeAt(0))) {                   // 4800:110a  pre-test
    const prompt = ('GameSpeed (' + X.ByteToStr(g.GameSpeed) + ') :').slice(0, 40);   // 4800:111f .. 114b  string[40]
    let opts = ' ';                                           // 4800:115e  CS:10DF = ' '
    if (g.GameSpeed < 9) opts = (opts + 'Slower ').slice(0, 40);   // 4800:1168 JAE
    if (g.GameSpeed > 0) opts = (opts + 'Faster ').slice(0, 40);   // 4800:1197 JBE
    opts = (opts + 'Exit').slice(0, 40);                      // 4800:11d6
    const r = await X.HorizontalMenu(prompt, opts, 0x0D, 0x0A, 0x0F, 0, 0);   // 4800:1207  push prompt, opts, 0Dh, 0Ah, 0Fh, 0, 0, @g_6E31
    g.g_6E31 = r.ext ? 1 : 0;
    key = r.key;                                              // 4800:120c
    if (key === 'S') g.GameSpeed = byte(g.GameSpeed + 1);     // 4800:1216  (no bound check; 'S' is offered only below 9)
    else if (key === 'F') g.GameSpeed = byte(g.GameSpeed - 1);   // 4800:1220
  }
}

// 4800:122B SetQuick(c): computer control on; a target on the combatant's own side is dropped
export async function SetQuick(c) {
  c.b[F.controlled] = 1;                                      // 4800:1231  +10Fh
  const t = cr(c).target;                                     // 4800:123f
  if (t && t.b[F.side] === c.b[F.side]) cr(c).target = null;  // 4800:1255 .. 1272
}

// 4800:127A ov08_init — empty.
export function ov08_init() {}
