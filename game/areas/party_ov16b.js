// game/areas/party_ov16b.js — PARTY ov16 part B (seg 7000, 1F37..4454): DropCharacter, ModifyCharacter, TrainCharacter,
// AddCharacterMenu, RemoveFromParty, PortraitMenu, IconEditor (+ nested DrawIconPreview / CopyIconSlot), ConHpBonus,
// MinHitPoints, MaxHitPoints, RollHitDice, PayGold, ov16_init.
// Source: decode/pseudo/party_parts/ov16b.pas.md (= PARTY.pas.md ov16 part B), menu loops re-read against
// decode/listings/ov16.lst (FABLE_CONFIRM §5(2)). Screens: PARTY-ov16b-01..09 = SCREENS_INDEX PM-06/07/09/10/11/12.
// Conventions: party_core.js. TMenuItem = { text, isHeader, next } (engine/menus.js). Var parameters are { v } objects.

import { g, X, env, ds, dsPstr, Random, byte, word, shortint, integer, rdW, wrW, pstr, setPstr, newChar, Copy } from './party_core.js';
import { state as pic } from '../engine/pictures.js';
import { dev } from '../engine/dev.js';

// TChar fields (decode/data/SAVES.md §3)
const T = {
  name: 0x00, abil: 0x10, str: 0x10, int: 0x11, wis: 0x12, dex: 0x13, con: 0x14, cha: 0x15, str_exc: 0x16,
  race: 0x2E, class: 0x2F, hp_max: 0x32, known_spell: 0x32 /* +id */, levels_drained: 0x74, hp_drained: 0x75,
  npc_morale: 0x84, unk_85: 0x85, money: 0x88, level: 0x96, gender: 0x9E, unk_AB: 0xAB, xp: 0xAC, hp_rolled: 0xB1,
  spell_slots: 0xB2, head_pic: 0xBB, body_pic: 0xBC, icon_head: 0xBD, icon_body: 0xBE, party_slot: 0xBF,
  icon_size: 0xC0, icon_colours: 0xC1 /* [0..5] */, status: 0x10C, active: 0x10D, hp: 0x11B,
};

// DS tables (image bytes; ov16b.pas.md "Tables")
const RACE_LIMITS = 0x3DA3;     // RaceAbilityLimits[race*16 + k]
const CLASS_MIN = 0x3F81;       // ClassAbilityMin[class*6 + stat]
const XP_FOR_LEVEL = 0x409B;    // XpForLevel LongInt [cls*38h + lvl*4]
const TRAIN_BITS = 0x05DE;      // ClassTrainBits[cls]
const CON_HP_ADJ = 0x408E;      // ConHpAdj[con] ShortInt
const HD_COUNT = 0x08B6, HD_SIDES = 0x08BE;   // HitDiceCount / HitDieSides [cls]
const COIN_VALUE = 0x0D24;      // CoinValue LongInt[0..4]
const ICON_MENU = 0x07BF;       // IconMenuText string[40] [state*29h]
const ICON_SLOT = 0x3CF5;       // IconColourSlot[1..6]
const CLASS_NAME = 0x0D38;      // ClassName string[26] [cls*27]

const keyOf = (r) => (r !== null && typeof r === 'object' ? r.key : r);
const chr = (r) => { const k = keyOf(r); return typeof k === 'number' ? String.fromCharCode(k) : (k ?? '\0'); };
const lvl = (c, cls) => shortint(c.b[T.level + cls]);                  // levels are tested signed (JG / JLE)
const rdL = (b, o) => (rdW(b, o) | (rdW(b, o + 2) << 16)) | 0;           // LongInt
const wrL = (b, o, v) => { wrW(b, o, v & 0xFFFF); wrW(b, o + 2, (v >>> 16) & 0xFFFF); };
const dsL = (o) => (ds(o) | (ds(o + 1) << 8) | (ds(o + 2) << 16) | (ds(o + 3) << 24)) | 0;
const xpFor = (cls, l) => dsL(XP_FOR_LEVEL + cls * 0x38 + l * 4);
const coinValue = (i) => dsL(COIN_VALUE + 4 * i);
const raceLim = (c, k) => ds(RACE_LIMITS + c.b[T.race] * 16 + k);
const classMin = (c, stat) => ds(CLASS_MIN + c.b[T.class] * 6 + stat);
const className = (cls) => dsPstr(CLASS_NAME + cls * 27);
const money = (c, i) => rdW(c.b, T.money + 2 * i);
const setMoney = (c, i, v) => wrW(c.b, T.money + 2 * i, v);

// ---------------------------------------------------------------------------------------------------------------------

// 7000:1F37 DropCharacter
export async function DropCharacter() {
  if (g.SelectedChar === null || g.SelectedChar === undefined) return;            // 7000:1f3e
  const c = g.SelectedChar;                                                       // 7000:1f4a
  const name = pstr(c.b, T.name);
  dev.screenSoon('PM-09');
  if (chr(await X.AskYesNo('Drop ' + name + ' forever? ', 0x0E, 0x0A, 0x0F)) === 'Y') {   // 7000:1f81
    if (chr(await X.AskYesNo('Are you sure? ', 0x0E, 0x0A, 0x0F)) === 'Y') {        // 7000:1fa6
      if (c.b[T.active] === 0)                                                    // 7000:1faf
        await X.ShowTimedBottomMessage('You dump ' + name + ' out back.');        // 7000:1fde
      else
        await X.ShowTimedBottomMessage(name + ' bids you farewell.');             // 7000:1fff
      await RemoveFromParty(0, 1);                                                // 7000:200b
      return;                                                                     // 7000:200e
    }
  }
  await X.ShowTimedBottomMessage(name + ' breathes a sigh of relief.');           // 7000:202a
  // quirk: nothing is deleted on disk (the roster file is not touched)
}

// 7000:2033 DrawModifyField(highlight) — nested in ModifyCharacter; `st.field` = the parent's [BP-0Dh]
async function DrawModifyField(st, highlight) {
  if (st.field < 6) await X.DrawAbility(st.field, highlight);                     // 7000:2039 / 204c
  else await X.DrawHP(g.SelectedChar, 4, 0x12, highlight);                         // 7000:2065
}

// 7000:209F ModifyCharacter
export async function ModifyCharacter() {
  const sc = g.SelectedChar;
  if (rdL(sc.b, T.xp) > 0) {                                                       // 7000:20a6  signed LongInt
    await X.ShowTimedBottomPrompt(pstr(sc.b, T.name) + " can't be modified.", 0x0E);   // 7000:20da
    return;
  }
  await X.DrawCharacterSheet();                                                   // 7000:20e2
  const saved = Array.from(g.SelectedChar.b.subarray(T.str, T.str + 6));          // 7000:20fa  Move(+10h, saved, 6)
  const savedExc = g.SelectedChar.b[T.str_exc];                                    // 7000:20ff
  const savedHp = g.SelectedChar.b[T.hp_max];                                      // 7000:210a
  const st = { field: 6 };                                                        // 7000:2115
  await DrawModifyField(st, false);                                               // 7000:211e
  st.field = 0;                                                                   // 7000:2121
  await DrawModifyField(st, true);                                                // 7000:212a
  const c = g.SelectedChar;                                                       // 7000:212d
  const b = c.b;
  let key, ext;
  do {
    dev.screenSoon('PM-10');
    const r = await X.HorizontalMenu('Modify character: ', 'Keep Exit', 0x0D, 0x0A, 0x0F, true, false);   // 7000:2169
    key = chr(r); ext = !!(r && r.ext);
    await DrawModifyField(st, false);                                             // 7000:2176
    if (ext) {                                                                    // 7000:2179
      if (key === 'P' || key === '\r') {                                          // 7000:2182  Down
        st.field = byte(st.field + 1); if (st.field > 6) st.field = 0;            // 7000:218d  byte, JBE
      } else if (key === 'H') {                                                   // 7000:219d  Up
        st.field = byte(st.field - 1); if (st.field === 0xFF) st.field = 6;       // 7000:21a1
      } else if (key === 'K') {                                                   // 7000:21b1  Left = decrease
        if (st.field < 6) {                                                       // 7000:21b8
          const i = st.field;                                                     // 7000:21c1
          b[T.abil + i] = byte(b[T.abil + i] - 1);                                // 7000:21d0
          switch (i) {
            case 0:
              if (b[T.str_exc] > 0) {                                             // 7000:21de
                b[T.str_exc] = byte(b[T.str_exc] - 1); b[T.str] = byte(b[T.str] + 1);   // 7000:21eb / 21f8
              } else if (b[T.str] < raceLim(c, 0 + b[T.gender]) || b[T.str] < classMin(c, 0))   // 7000:221a / 2241
                b[T.str] = raceLim(c, 0 + b[T.gender]);                            // 7000:2271  quirk: race minimum
              break;
            case 1:
              if (b[T.int] < raceLim(c, 6) || b[T.int] < classMin(c, 1)) b[T.int] = raceLim(c, 6);   // 7000:2297 / 22e1
              break;
            case 2:
              if (b[T.wis] < raceLim(c, 8) || b[T.wis] < classMin(c, 2)) b[T.wis] = raceLim(c, 8);   // 7000:230a / 2354
              if (b[T.spell_slots] > 0) b[T.spell_slots] = 1;                     // 7000:2365
              await X.WisdomBonusSpells(g.SelectedChar);                          // 7000:2381
              break;
            case 3:
              if (b[T.dex] < raceLim(c, 0x0A) || b[T.dex] < classMin(c, 3)) b[T.dex] = raceLim(c, 0x0A);   // 7000:239b / 23e5
              break;
            case 4:
              if (b[T.con] < raceLim(c, 0x0C) || b[T.con] < classMin(c, 4)) b[T.con] = raceLim(c, 0x0C);   // 7000:240e / 2458
              if (MaxHitPoints(g.SelectedChar) < b[T.hp_max]) b[T.hp_max] = MaxHitPoints(g.SelectedChar);   // 7000:2472 / 2487
              b[T.hp] = b[T.hp_max];                                              // 7000:2491
              st.field = 6; await DrawModifyField(st, false); st.field = 4;       // 7000:24a0 / 24a9 / 24ac
              break;
            case 5:
              if (b[T.cha] < raceLim(c, 0x0E) || b[T.cha] < classMin(c, 5)) b[T.cha] = raceLim(c, 0x0E);   // 7000:24c4 / 250e
              break;
          }
        } else {                                                                  // HP
          b[T.hp_max] = byte(b[T.hp_max] - 1);                                    // 7000:2521
          if (MinHitPoints(g.SelectedChar) > b[T.hp_max]) b[T.hp_max] = MinHitPoints(g.SelectedChar);   // 7000:2531 / 2546
          b[T.hp] = b[T.hp_max];                                                  // 7000:2550
        }
      } else if (key === 'M') {                                                   // 7000:2562  Right = increase
        if (st.field < 6) {                                                       // 7000:2569
          const i = st.field;                                                     // 7000:2572
          b[T.abil + i] = byte(b[T.abil + i] + 1);                                // 7000:2581
          switch (i) {
            case 0:
              if (b[T.str] > raceLim(c, 2 + b[T.gender])) {                       // 7000:25aa
                if (b[T.str] > 18 && lvl(c, 2) > 0 && raceLim(c, 4 + b[T.gender]) > b[T.str_exc])   // 7000:25c8 / 25cf / 25f5
                  b[T.str_exc] = byte(b[T.str_exc] + 1);                          // 7000:2605  quirk: fighter level only
                b[T.str] = raceLim(c, 2 + b[T.gender]);                           // 7000:2624
              }
              break;
            case 1: if (b[T.int] > raceLim(c, 7)) b[T.int] = raceLim(c, 7); break;        // 7000:264a / 266d
            case 2:
              if (b[T.wis] > raceLim(c, 9)) b[T.wis] = raceLim(c, 9);             // 7000:2693 / 26b6
              if (b[T.spell_slots] > 0) b[T.spell_slots] = 1;                     // 7000:26c7
              await X.WisdomBonusSpells(g.SelectedChar);                          // 7000:26e3
              break;
            case 3: if (b[T.dex] > raceLim(c, 0x0B)) b[T.dex] = raceLim(c, 0x0B); break;  // 7000:26fd / 2720
            case 4:
              if (b[T.con] > raceLim(c, 0x0D)) b[T.con] = raceLim(c, 0x0D);       // 7000:2749 / 276c
              if (MinHitPoints(g.SelectedChar) > b[T.hp_max]) b[T.hp_max] = MinHitPoints(g.SelectedChar);   // 7000:2786 / 279b  quirk: Min on increase
              b[T.hp] = b[T.hp_max];                                              // 7000:27a5
              st.field = 6; await DrawModifyField(st, false); st.field = 4;       // 7000:27b4 / 27bd / 27c0
              break;
            case 5: if (b[T.cha] > raceLim(c, 0x0F)) b[T.cha] = raceLim(c, 0x0F); break;  // 7000:27d8 / 27fb
          }
        } else {                                                                  // HP
          b[T.hp_max] = byte(b[T.hp_max] + 1);                                    // 7000:280e
          if (MaxHitPoints(g.SelectedChar) < b[T.hp_max]) b[T.hp_max] = MaxHitPoints(g.SelectedChar);   // 7000:281e / 2833
          b[T.hp] = b[T.hp_max];                                                  // 7000:283d
        }
      }
    } else if (key === 'E' || key === '\0') {                                     // 7000:284e  Exit / Esc: undo
      for (let i = 0; i <= 5; i++) g.SelectedChar.b[T.abil + i] = saved[i];      // 7000:2859
      g.SelectedChar.b[T.str_exc] = savedExc;                                     // 7000:287f
      g.SelectedChar.b[T.hp_max] = savedHp;                                       // 7000:288a
      g.SelectedChar.b[T.hp] = b[T.hp_max];                                       // 7000:2895
      await X.RecalcCharacter(g.SelectedChar);                                    // 7000:28ad
      return;
    }
    await X.RecalcCharacter(g.SelectedChar);                                      // 7000:28bc
    await X.DrawCombatStats();                                                    // 7000:28c1
    await DrawModifyField(st, true);                                              // 7000:28cb
  } while (ext || key !== 'K');                                                   // 7000:28ce / 28d7
  g.SelectedChar.b[T.unk_85] = 1;                                                 // 7000:28e0  "Keep"
}

// 7000:29AE TrainCharacter — training hall (party request #qa-3)
export async function TrainCharacter() {
  const sting = () => g.StingMode !== 0;
  if (g.SelectedChar.b[T.status] !== 0 && !sting()) {                             // 7000:29b5 / 29c1
    await X.ShowTimedBottomPrompt('we only train conscious people', 0x0E); return;   // 7000:29da
  }
  if (X.MoneyInGold(g.SelectedChar) < 1000 && !sting()) {                         // 7000:29ea / 29fb  signed LongInt
    await X.ShowTimedBottomPrompt('Training costs 1000 gp.', 0x0E); return;       // 7000:2a14
  }
  let canBits = 0, haveBits = 0;                                                  // 7000:2a1c / 2a20
  const c = g.SelectedChar, b = c.b;                                              // 7000:2a24
  let xpCap = 0;                                                                  // 7000:2a2e
  for (let cls = 0; cls <= 7; cls++) {                                            // 7000:2a36
    if (lvl(c, cls) > 0) {                                                        // 7000:2a48  JG
      haveBits = byte(haveBits + ds(TRAIN_BITS + cls));                           // 7000:2a59
      let blocked = false;                                                        // 7000:2a60
      const l = b[T.level + cls];                                                 // 7000:2a6d
      const str = b[T.str];
      switch (b[T.race]) {                                                        // 7000:2a78  demi-human level limits
        case 1: if (cls === 2 && ((l === 8 && str === 17) || (l === 7 && str < 17))) blocked = true; break;              // 7000:2a80 dwarf
        case 2: if (cls === 2 && (l === 7 || (l === 6 && str === 17) || (l === 5 && str < 17))) blocked = true; break;   // 7000:2ab1 elf
        case 3: if (cls === 2 && (l === 6 || (l === 5 && str < 18))) blocked = true; break;                             // 7000:2ae8 gnome
        case 4:                                                                                                         // 7000:2b0e half-elf
          if (cls === 0 && l === 5) blocked = true;
          else if (cls === 2 && (l === 8 || (l === 7 && str === 17) || (l === 6 && str < 17))) blocked = true;          // 7000:2b20
          break;
        case 5: if (cls === 2 && (l === 6 || (l === 5 && str === 17) || (l === 4 && str < 17))) blocked = true; break;   // 7000:2b56 halfling
      }
      if (!blocked) {                                                             // 7000:2b86
        const next = xpFor(cls, byte(l + 1));
        if (next <= rdL(b, T.xp) || sting()) {                                    // 7000:2ba8 / 2bc3  signed
          if (next > 0) {                                                         // 7000:2be6  -1 = no further level
            canBits = byte(canBits + ds(TRAIN_BITS + cls));                       // 7000:2c02
            const nextXp = xpFor(cls, byte(l + 2));                               // 7000:2c24
            if (nextXp > 0 && rdL(b, T.xp) >= nextXp && nextXp > xpCap)           // 7000:2c32 / 2c40 / 2c59
              xpCap = (nextXp - 1) | 0;                                           // 7000:2c6b
          }
        }
      }
    }
  }
  if (xpCap > 0) wrL(b, T.xp, xpCap);                                             // 7000:2c86 / 2c94  quirk: before the hall checks
  let trainBits;
  if (!sting()) {                                                                 // 7000:2ca7
    const hall = g.ecl_Mem6B00[0x550 >> 1];
    if ((haveBits & hall) === 0) {                                                // 7000:2cae
      await X.ShowTimedBottomPrompt("We don't train that class here", 0x0E); return;   // 7000:2cd2
    }
    if ((canBits & hall) === 0) {                                                 // 7000:2cdc
      await X.ShowTimedBottomPrompt('Not Enough Experience', 0x0E); return;       // 7000:2d00
    }
    trainBits = byte(canBits & hall);                                             // 7000:2d0f
  } else trainBits = canBits;                                                     // 7000:2d22
  await X.ClearRectangle(1, 1, 0x26, 0x16);                                       // 7000:2d34
  let row = 4;                                                                    // 7000:2d39
  await X.DrawCharacterName(g.SelectedChar, 4, row, false);                       // 7000:2d4f
  await X.DrawText(pstr(b, T.name).length + 4, row, 0x0A, ' will become:');       // 7000:2d76
  for (let cls = 0; cls <= 7; cls++)                                              // 7000:2d7b
    if (lvl(c, cls) > 0 && (ds(TRAIN_BITS + cls) & trainBits) !== 0) {            // 7000:2d8d / 2da2
      row++;                                                                      // 7000:2dac
      const lv = X.ByteToStr(byte(b[T.level + cls] + 1));
      if (row === 5) await X.DrawText(6, row, 0x0A, '    a level ' + lv + ' ' + className(cls));   // 7000:2e10
      else await X.DrawText(6, row, 0x0A, 'and a level ' + lv + ' ' + className(cls));          // 7000:2e72
    }
  dev.screenSoon('PM-11');
  if (chr(await X.AskYesNo('Do you wish to train? ', 0x0D, 0x0A, 0x0F)) !== 'Y') return;   // 7000:2e98
  await X.ShowTimedBottomMessage('Congratulations...');                           // 7000:2eb3
  if (!sting()) PayGold(1000, g.SelectedChar);                                    // 7000:2eb8 / 2ecf
  let nClasses = 0;                                                               // 7000:2ed2
  const oldMuLvl = shortint(b[T.level + 5]);                                      // 7000:2ed6
  for (let cls = 0; cls <= 7; cls++)                                              // 7000:2ee1
    if (lvl(c, cls) > 0) {                                                        // 7000:2ef3  JLE
      nClasses = byte(nClasses + 1);                                              // 7000:2efb
      if ((ds(TRAIN_BITS + cls) & trainBits) !== 0) {                             // 7000:2f04
        b[T.level + cls] = byte(b[T.level + cls] + 1);                            // 7000:2f18
        if (b[T.levels_drained] > 0) {                                            // 7000:2f20  JBE
          b[T.hp_drained] = byte(b[T.hp_drained] - Math.trunc(b[T.hp_drained] / b[T.levels_drained]));   // 7000:2f27 .. 2f41
          b[T.levels_drained] = byte(b[T.levels_drained] - 1);                    // 7000:2f48
        }
      }
    }
  await X.UpdateLevelStats(g.SelectedChar);                                       // 7000:2f5a
  if (shortint(b[T.level + 5]) > oldMuLvl) {                                      // 7000:2f62  JLE (signed)
    const index = { v: -1 }, count = { v: 0 };                                    // 7000:2f6c
    let spell;
    do spell = byte(await X.SpellList(4, 4, index, count));                       // 7000:2f81
    while (!(spell > 0 || count.v === 0));                                        // 7000:2f89 / 2f8f
    b[T.known_spell + spell] = 1;                                                 // 7000:2f95  quirk: spell 0 -> +32h = hp_max := 1
  }
  const hpRoll = RollHitDice(g.SelectedChar, trainBits);                          // 7000:2fb1
  let gain = Math.trunc(hpRoll / nClasses); if (gain === 0) gain = 1;             // 7000:2fc4 / 2fc9  quirk: all classes
  b[T.hp_rolled] = byte(b[T.hp_rolled] + gain);                                   // 7000:2fd4
  const conAdj = ConHpBonus(g.SelectedChar);                                      // 7000:2fe8  CBW
  gain = Math.trunc((hpRoll + conAdj) / nClasses); if (gain < 1) gain = 1;        // 7000:2ffd / 3002
  const wounds = byte(b[T.hp_max] - b[T.hp]);                                     // 7000:300d
  b[T.hp_max] = byte(b[T.hp_max] + gain);                                         // 7000:3027
  b[T.hp] = byte(b[T.hp_max] - wounds);                                           // 7000:3031
}

// 7000:306D AddCharacterMenu
export async function AddCharacterMenu() {
  await X.ClearRectangle(1, 1, 0x26, 0x16);                                       // 7000:3080
  const list = await X.ReadCharList();                                            // 7000:308a
  if (list === null || list === undefined) return;                                // 7000:308f
  const index = { v: 0 }, item = { v: list }, redraw = { v: true };               // 7000:309a .. 30ab
  const showExit = false;                                                         // TODO(decode): garbage — [BP-14h] never initialised; "Exit" is in the options already
  let key, pcCount = 0;
  const mem = () => g.ecl_Mem6B00;
  do {
    dev.screenSoon('PM-12');
    key = chr(await X.VerticalListMenu('Add a character: ', 'Add Exit', 0x0D, 0x0A, 0x0F, 1, 2, 0x26, 0x16,
      list, showExit, redraw, index, item));                                      // 7000:30fb
    if ((key === '\r' || key === 'A') && item.v && item.v.text[0] !== '*') {      // 7000:3103 / 3112
      const newC = newChar();                                                     // 7000:3123  GetMem $11D
      await X.ReadCharacter(item.v.text, newC, false, true);                      // 7000:313f
      item.v.text = ('* ' + item.v.text).substring(0, 40);                        // 7000:3167  quirk: marked before the checks
      pcCount = 0;                                                                // 7000:316c
      if (g.PartyHead === null || g.PartyHead === undefined) {                    // 7000:3170
        mem()[0x67C >> 1] = 0;                                                    // 7000:317f
        await X.AddToParty(newC);                                                 // 7000:318a
        await X.LoadCharacterIcon(1);                                             // 7000:3192
      } else {
        let p = g.PartyHead;                                                      // 7000:319a
        const nm = pstr(newC.b, T.name);
        while (p !== null && !(pstr(p.b, T.name) === nm && p.b[T.unk_AB] === newC.b[T.unk_AB])) {   // 7000:31a7 / 31b9 / 31cb
          if (p.b[T.npc_morale] < 0x80) pcCount++;                                // 7000:31d2
          p = p.next;                                                             // 7000:31e0
        }
        if (p === null &&                                                         // 7000:31f5
            ((newC.b[T.npc_morale] < 0x80 && pcCount < 6) ||                     // 7000:31fd / 3208
             (newC.b[T.npc_morale] > 0x7F && mem()[0x67C >> 1] < 8))) {          // 7000:320e / 3219
          await X.AddToParty(newC);                                               // 7000:322b
          await X.LoadCharacterIcon(1);                                           // 7000:3233
          if (newC.b[T.npc_morale] < 0x80) pcCount++;                             // 7000:3238
        }
        // else FreeMem(newC, $11D)                                               // 7000:3252
      }
    }
  } while (!(key === 'E' || key === '\0' || pcCount > 5 || mem()[0x67C >> 1] > 7));   // 7000:3257 .. 326d
  await X.WriteCharList(list);                                                    // 7000:327e
  X.FreeMenuList({ v: list });                                                    // 7000:3288
}

// 7000:3291 RemoveFromParty(keepCount, freeIcon)
export async function RemoveFromParty(keepCount, freeIcon) {
  if (g.PartyHead === null || g.PartyHead === undefined) return;                  // 7000:3297
  let p = g.PartyHead;                                                            // 7000:32a3
  const mem = g.ecl_Mem6B00;
  if (p === g.SelectedChar) {                                                     // 7000:32b0
    if (freeIcon) await X.FreeCombatIcon(g.SelectedChar.b[T.party_slot]);         // 7000:336b / 337b
    g.PartyHead = g.SelectedChar.next;                                            // 7000:3380
    p = g.SelectedChar.next;                                                      // 7000:3395
    X.FreeCharacter({ v: g.SelectedChar });                                       // 7000:33b2
    g.SelectedChar = p;                                                           // 7000:33b5
    if (!keepCount && mem) mem[0x67C >> 1] = word(mem[0x67C >> 1] - 1);           // 7000:33c2 / 33cc
  } else {
    while (p.next !== g.SelectedChar && p.next !== null) p = p.next;              // 7000:32c5 .. 32fd
    if (p.next !== null) {                                                        // 7000:3302
      if (freeIcon) await X.FreeCombatIcon(g.SelectedChar.b[T.party_slot]);       // 7000:3311 / 3321
      p.next = g.SelectedChar.next;                                               // 7000:3326
      X.FreeCharacter({ v: g.SelectedChar });                                     // 7000:334a
      g.SelectedChar = p;                                                         // 7000:334d  predecessor becomes selected
      if (!keepCount && mem) mem[0x67C >> 1] = word(mem[0x67C >> 1] - 1);         // 7000:335a / 3364
    }
  }
}

// 7000:33E7 PortraitMenu
export async function PortraitMenu() {
  const c = g.SelectedChar, b = c.b;                                              // 7000:33ed
  let head = b[T.head_pic], body = b[T.body_pic];                                 // 7000:33f7 / 3402
  let key;
  do {
    await X.ShowPortrait();                                                       // 7000:340d
    dev.screenSoon('PM-06');
    const r = await X.HorizontalMenu('', 'Head Body Keep', 0, 0x0F, 0x0A, false, false);   // 7000:3444
    key = chr(r);
    if (!(r && r.ext)) {                                                          // 7000:344c
      if (key === 'H') { if (b[T.head_pic] < 14) b[T.head_pic]++; else b[T.head_pic] = 1; }   // 7000:3459
      else if (key === 'B') { if (b[T.body_pic] < 12) b[T.body_pic]++; else b[T.body_pic] = 1; }   // 7000:347d
      else if (key === 'K') { head = b[T.head_pic]; body = b[T.body_pic]; }      // 7000:34a1
    }
  } while (key !== 'K');                                                          // 7000:34b7  quirk: only K leaves
  b[T.head_pic] = head; b[T.body_pic] = body;                                     // 7000:34c0 / 34cb
  await X.ClearMenuLine();                                                        // 7000:34d6
}

// ---- icon editor ----------------------------------------------------------------------------------------------------

const icons = () => g.CombatIcons;
const pose = (slot, k) => { const s = icons()[slot]; return s ? (s[k] ?? (k ? s.pose1 : s.pose0)) : null; };

// 7000:34DF DrawIconPreview(col, row) — nested in IconEditor
function DrawIconPreview(col, row) {
  const view = g.g_4A20 ?? pic.viewPic;
  if (g.VideoMode === 0)                                                          // 7000:34e2  CGA
    X.FillPictureRect(col * 3, row * 24, 0x0C, 0x18, 3, g.g_260A, view);          // 7000:3518
  else {
    X.FillPictureRect(col * 3, row * 24, 0x0C, 0x18, 0, g.g_260A, view);          // 7000:354e
    X.DrawIconAt(col, row, 0, 0, 0x19);                                           // 7000:3564
    X.DrawIconAt(col + 3, row, 0, 1, 0x19);                                       // 7000:357f
  }
  X.DrawIconAt(col, row, 0, 0, 0x0C);                                             // 7000:3595  ready
  X.DrawIconAt(col + 3, row, 0, 1, 0x0C);                                         // 7000:35b0  action
  X.FlushViewDirtyLines();                                                        // 7000:35b5
}

// 7000:35BE CopyIconSlot(src, dst, recolour) — nested in IconEditor; pictures of slot dst must exist
function CopyIconSlot(src, dst, recolour) {
  for (let k = 0; k <= 1; k++) {                                                  // 7000:35c4 .. 36ce  pixels + mask of both poses
    const s = pose(src, k), d = pose(dst, k);
    if (!s || !d) continue;
    if (d.px && s.px) d.px.set(s.px.subarray(0, d.px.length));
    if (d.mask && s.mask) d.mask.set(s.mask.subarray(0, d.mask.length));
  }
  if (recolour) {                                                                 // 7000:36d3
    const c = g.SelectedChar;                                                     // 7000:36dc
    const fromCol = [], toCol = [];
    for (let k = 0; k <= 15; k++) { fromCol[k] = k; toCol[k] = k; }               // 7000:36e6
    for (let i = 1; i <= 6; i++) {                                                // 7000:370f
      toCol[ds(ICON_SLOT + i)] = c.b[T.icon_colours + i - 1] & 0x0F;              // 7000:3718
      toCol[ds(ICON_SLOT + i) + 8] = (c.b[T.icon_colours + i - 1] & 0xF0) >> 4;   // 7000:373d
    }
    X.RecolorPicture(fromCol, toCol, 0, false, pose(dst, 0));                     // 7000:3795
    X.RecolorPicture(fromCol, toCol, 0, false, pose(dst, 1));                     // 7000:37bd
  }
}

// IconMenuText[state] lives in the DS image and is edited in place (quirk: keeps the last 'Hair'/'Face').
const iconMenu = (state) => dsPstr(ICON_MENU + state * 0x29);
function setIconMenu(state, s) {
  const o = ICON_MENU + state * 0x29; s = s.substring(0, 40);
  env.g.ds[o] = s.length; for (let i = 0; i < s.length; i++) env.g.ds[o + 1 + i] = s.charCodeAt(i) & 0xFF;
}
const replaceAt13 = (s, w) => { const d = s.slice(0, 12) + s.slice(16); return d.slice(0, 12) + w + d.slice(12); };   // Delete(s,13,4); Insert(w,s,13)

// 7000:382D IconEditor
export async function IconEditor() {
  await X.DrawTitledFrame(1, 1, 0x26, 0x16, 0, 0, '');                            // 7000:3855
  await X.PaletteFlashOn();                                                       // 7000:385a
  let c;
  do {                                                                            // 7000:385f
    await X.LoadCharacterIcon(0);                                                 // 7000:3862
    c = g.SelectedChar; const b = c.b;                                            // 7000:3867
    let state = 1;                                                                // 7000:3871
    const cColours = Array.from(b.subarray(T.icon_colours, T.icon_colours + 6));  // 7000:3887
    const savedSlot = b[T.party_slot]; b[T.party_slot] = 12;                      // 7000:388c / 3897
    await X.LoadCharacterIcon(0);                                                 // 7000:38a3  same icon into slot 12
    b[T.party_slot] = savedSlot;                                                  // 7000:38a8
    let cHead = b[T.icon_head], cBody = b[T.icon_body], cSize = b[T.icon_size];   // 7000:38b3 / 38be / 38c9
    CopyIconSlot(b[T.party_slot], 12, true);                                      // 7000:38e5
    DrawIconPreview(1, 2);                                                        // 7000:38f0  "old"
    await X.DrawText(8, 6, 0x0F, 'old');                                          // 7000:390b
    await X.DrawText(3, 0x0A, 0x0F, 'ready   action');                            // 7000:3928
    await X.DrawText(8, 0x0C, 0x0F, 'new');                                       // 7000:3945
    await X.DrawText(3, 0x10, 0x0F, 'ready   action');                            // 7000:3962
    let prev = 1, part = 'H', slot = 1, hiNib = 0, key;
    do {
      DrawIconPreview(1, 4);                                                      // 7000:396f  "new"
      let sizeStr = '';                                                           // 7000:3972
      if (state === 4) sizeStr = b[T.icon_size] === 2 ? 'Small' : 'Large';        // 7000:397c / 3995 / 39aa
      dev.screenSoon('PM-07');
      const r = await X.HorizontalMenu('', sizeStr + iconMenu(state), 0x0D, 0x0A, 0x0F, false, false);   // 7000:39f9
      key = chr(r);
      if (!(r && r.ext)) {                                                        // 7000:3a01
        switch (state) {
          case 1:                                                                 // 7000:3a0a
            prev = 1;                                                             // 7000:3a14
            if (key === 'P') state = 2;                                           // 7000:3a1b
            else if (key === '1') { state = 3; hiNib = 0; setIconMenu(3, replaceAt13(iconMenu(3), 'Hair')); }   // 7000:3a25 .. 3a55
            else if (key === '2') { state = 3; hiNib = 1; setIconMenu(3, replaceAt13(iconMenu(3), 'Face')); }   // 7000:3a5c .. 3a8c
            else if (key === 'S') state = 4;                                      // 7000:3a93
            break;
          case 2:                                                                 // 7000:3a9e
            prev = 2;                                                             // 7000:3aa2
            if (key === '\0' || key === 'E') state = 1;                           // 7000:3aaf
            else { part = key; state = 5; }                                       // 7000:3abc
            break;
          case 3:                                                                 // 7000:3ac9
            prev = 3;                                                             // 7000:3acd
            switch (key) {
              case 'W': slot = 6; break; case 'B': slot = 1; break; case 'H': case 'F': slot = 4; break;   // 7000:3ad4 .. 3af6
              case 'S': slot = 5; break; case 'A': slot = 2; break; case 'L': slot = 3; break;            // 7000:3afc .. 3b14
              default: slot = 1;                                                  // 7000:3b1a
            }
            state = (key === '\0' || key === 'E') ? 1 : 5;                        // 7000:3b27
            break;
          case 4:                                                                 // 7000:3b3b  size
            if (key === 'L') { b[T.icon_size] = 2; await X.LoadCharacterIcon(0); }        // 7000:3b46 / 3b52
            else if (key === 'S') { b[T.icon_size] = 1; await X.LoadCharacterIcon(0); }   // 7000:3b5d / 3b69
            else if (key === 'K') { cSize = b[T.icon_size]; state = 1; key = ' '; }       // 7000:3b74
            else if (key === 'E' || key === '\0') { b[T.icon_size] = cSize; state = 1; key = ' '; }   // 7000:3b91
            await X.LoadCharacterIcon(0);                                         // 7000:3ba7
            break;
          case 5:
            if (prev === 2) {                                                     // 7000:3bb6
              if (part === 'H') {                                                 // 7000:3bc0
                if (key === 'P') { if (b[T.icon_head] > 0) b[T.icon_head]--; else b[T.icon_head] = 13; }        // 7000:3bd1
                else if (key === 'N') { if (b[T.icon_head] < 13) b[T.icon_head]++; else b[T.icon_head] = 0; }   // 7000:3bf5
                else if (key === 'K') { cHead = g.SelectedChar.b[T.icon_head]; state = prev; key = ' '; }       // 7000:3c19
                else if (key === 'E' || key === '\0') { b[T.icon_head] = cHead; state = prev; key = ' '; }      // 7000:3c42
                await X.LoadCharacterIcon(0);                                     // 7000:3c5a
              } else if (part === 'W') {                                          // 7000:3c62
                if (key === 'P') { if (b[T.icon_body] > 0) b[T.icon_body]--; else b[T.icon_body] = 0x1F; }      // 7000:3c70
                else if (key === 'N') { if (b[T.icon_body] < 0x1F) b[T.icon_body]++; else b[T.icon_body] = 0; } // 7000:3c94
                else if (key === 'K') { cBody = g.SelectedChar.b[T.icon_body]; state = prev; key = ' '; }       // 7000:3cb8
                else if (key === 'E' || key === '\0') { b[T.icon_body] = cBody; state = prev; key = ' '; }      // 7000:3ce1
                await X.LoadCharacterIcon(0);                                     // 7000:3cf9
              }
            } else if (prev === 3) {                                              // 7000:3d01  browse a colour
              const o = T.icon_colours + slot - 1;
              let lo = b[o] & 0x0F;                                               // 7000:3d08
              let hi = (b[o] & 0xF0) >> 4;                                        // 7000:3d1c
              if (key === 'N') {
                if (hiNib !== 0) hi = (hi + 1) % 16; else lo = (lo + 1) % 16;     // 7000:3d3e / 3d56
                b[o] = byte((hi << 4) + lo);                                      // 7000:3d66
              } else if (key === 'P') {
                if (hiNib !== 0) hi = (hi - 1) & 0x0F; else lo = (lo - 1) & 0x0F; // 7000:3d91 / 3da5
                b[o] = byte((hi << 4) + lo);                                      // 7000:3db1
              } else if (key === 'K') {                                           // 7000:3ded
                for (let i = 0; i < 6; i++) cColours[i] = b[T.icon_colours + i];
                state = prev; key = ' ';
              } else if (key === 'E' || key === '\0') {                           // 7000:3e18
                for (let i = 0; i < 6; i++) b[T.icon_colours + i] = cColours[i];
                state = prev; key = ' ';
              }
            }
            break;
        }
      }
      CopyIconSlot(b[T.party_slot], 12, true);                                    // 7000:3e38
    } while (!(prev === 1 && (key === '\0' || key === 'E')));                     // 7000:3e3b / 3e4d
    b[T.icon_head] = cHead; b[T.icon_body] = cBody; b[T.icon_size] = cSize;       // 7000:3e57 .. 3e6d
    for (let i = 0; i < 6; i++) b[T.icon_colours + i] = cColours[i];              // 7000:3e8a
    CopyIconSlot(b[T.party_slot], 12, true);                                      // 7000:3ea0
    CopyIconSlot(12, b[T.party_slot], false);                                     // 7000:3eb4
    await X.ClearMenuLine();                                                      // 7000:3eb7
    await X.FreeCombatIcon(12);                                                   // 7000:3ebf
    if (g.travel_Mode > 1) {                                                      // 7000:3ec4
      await X.LoadCombatIcon('ICON', 0, 0x0B);                                    // 7000:3ee0
      await X.LoadCombatIcon('ICON', 1, 0x0C);                                    // 7000:3efa
    }
  } while (chr(await X.AskYesNo('Is this icon ok? ', 0x0D, 0x0A, 0x0F)) !== 'Y'); // 7000:3f17 / 3f1f
  await X.PaletteFlashOff();                                                      // 7000:3f28
}

// ---- hit points and money -------------------------------------------------------------------------------------------

// 7000:3F31 ConHpBonus(c): ShortInt
export function ConHpBonus(c) {
  let sum = 0;                                                                    // 7000:3f37
  for (let cls = 0; cls <= 7; cls++)                                              // 7000:3f44
    if (lvl(c, cls) > 0) {                                                        // 7000:3f56
      sum = shortint(sum + shortint(ds(CON_HP_ADJ + c.b[T.con])));                // 7000:3f69
      if (c.b[T.con] > 16 && c.b[T.class] === 2) sum = shortint(sum + 1);         // 7000:3f73 / 3f7d  quirk: pure Fighter only
      if (c.b[T.con] > 17 && c.b[T.class] === 2) sum = shortint(sum + 1);         // 7000:3f8a / 3f94
    }
  return sum;                                                                     // 7000:3fa4
}

// shared tail of Min/MaxHitPoints: (sum + adj) div n with the negative-adjustment floor
function averageHp(sum, n, adj) {
  let r;
  if (adj < 0) {
    if (sum > n + Math.abs(adj)) r = Math.trunc((sum + adj) / n); else r = 1;
  } else r = Math.trunc((sum + adj) / n);
  return byte(r);
}

// 7000:3FB3 MinHitPoints(c): Byte
export function MinHitPoints(c) {
  let n = 0, sum = 0;                                                             // 7000:3fc2 / 3fc6
  for (let cls = 0; cls <= 7; cls++)                                              // 7000:3fca
    if (lvl(c, cls) > 0) {                                                        // 7000:3fdc
      sum = byte(sum + c.b[T.level + cls]); n = byte(n + 1);                      // 7000:3fed / 3ff5
      if (cls === 4 || cls === 7) sum = byte(sum + 1);                            // 7000:3ffb / 4004
    }
  const adj = ConHpBonus(c);                                                      // 7000:4018
  return averageHp(sum, n, adj);                                                  // 7000:4024 .. 407d
}

// 7000:408C MaxHitPoints(c): Byte — quirk: the CON adjustment is taken from SelectedChar, not c
export function MaxHitPoints(c) {
  let n = 0, sum = 0;                                                             // 7000:409b / 409f
  for (let cls = 0; cls <= 7; cls++)                                              // 7000:40a3
    if (lvl(c, cls) > 0) {                                                        // 7000:40b5
      n = byte(n + 1);                                                            // 7000:40c0
      const l = c.b[T.level + cls];
      switch (cls) {
        case 0: case 1: sum = byte(sum + l * 8); break;                           // 7000:40ca / 40e7
        case 2: case 3: sum = byte(sum + l * 10); break;                          // 7000:4104 / 4122
        case 4: sum = byte(sum + (l + 1) * 8); break;                             // 7000:413f
        case 5: sum = byte(sum + l * 4); break;                                   // 7000:415c
        case 6: sum = byte(sum + l * 6); break;                                   // 7000:4178
        case 7: sum = byte(sum + (l + 1) * 4); break;                             // 7000:4198
      }
    }
  const adj = ConHpBonus(g.SelectedChar);                                         // 7000:41c1
  return averageHp(sum, n, adj);                                                  // 7000:41cd .. 4226
}

// 7000:4235 RollHitDice(c, classBits): Byte
export function RollHitDice(c, classBits) {
  let sum = 0;                                                                    // 7000:423b
  for (let cls = 0; cls <= 7; cls++)                                              // 7000:423f
    if (lvl(c, cls) > 0 && (ds(TRAIN_BITS + cls) & classBits) !== 0) {            // 7000:4251 / 425f
      let r = byte(X.Roll(ds(HD_COUNT + cls), ds(HD_SIDES + cls)));               // 7000:4280
      const floor = Math.trunc(ds(HD_SIDES + cls) * 2 / 3);
      if (c.b[T.level + cls] === 1 && r < floor) r = floor;                       // 7000:4291 / 42a5 / 42b8
      sum = byte(sum + r);                                                        // 7000:42cf
    }
  return sum;                                                                     // 7000:42de
}

// 7000:42ED PayGold(gold, c) — smallest coins first, change in the largest coins
export function PayGold(gold, c) {
  let due = Math.imul(gold, 200) | 0;                                             // 7000:42fe  copper
  let i = 0;                                                                      // 7000:4309
  while (due > 0) {                                                               // 7000:4316  quirk: no bound on i
    if (i > 6) break;                                                             // TODO(decode): the original runs into unrelated data past jewelry; callers check MoneyInGold first
    let n = (Math.trunc(due / coinValue(i)) + 1) | 0;                             // 7000:4342
    if (money(c, i) < n) n = money(c, i);                                         // 7000:435b / 4370
    due = (due - Math.imul(n, coinValue(i))) | 0;                                 // 7000:438f
    setMoney(c, i, money(c, i) - n);                                              // 7000:43a8
    i++;                                                                          // 7000:43ad
  }
  if (due < 0) {                                                                  // 7000:43b8
    due = Math.abs(due);                                                          // 7000:43d2
    i = 4;                                                                        // 7000:43dd
    while (due > 0 && i >= 0) {                                                   // 7000:43e1
      const n = Math.trunc(due / coinValue(i));                                   // 7000:4407
      due = (due - Math.imul(n, coinValue(i))) | 0;                               // 7000:4426
      setMoney(c, i, money(c, i) + n);                                            // 7000:443f
      i--;                                                                        // 7000:4444
    }
  }
}

// 7000:4454 ov16_init — empty
export function ov16_init() {}
