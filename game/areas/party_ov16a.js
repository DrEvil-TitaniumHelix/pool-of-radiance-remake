// game/areas/party_ov16a.js — PARTY ov16 part A (seg 7000, 0000..1F36): FreeCharacter, PartyCreationMenu, CreateCharacter.
// Source: decode/pseudo/party_parts/ov16a.pas.md (= PARTY.pas.md ov16 part A; #fable-6 re-verified CreateCharacter after
// 7000:07A8 statement by statement) and decode/listings/ov16.lst (re-read while translating: CreateCharacter is a
// FABLE_CONFIRM §5(4) routine). Screens: PARTY_SCREENS PARTY-ov16a-01..09 = SCREENS_INDEX PM-01..PM-05.
// Conventions: party_core.js. TMenuItem (ov25 NewMenuList node) = { text: string[40] (+0), isHeader (+29h), next (+2Ah) }.

import { g, X, env, ds, dsW, dsPstr, Random, byte, word, shortint, integer, Copy, newChar } from './party_core.js';
import { state as pic } from '../engine/pictures.js';
import { keyState } from '../engine/input.js';
import { dev } from '../engine/dev.js';
import { setPointerRegion } from '../engine/input.js';

// TChar fields (decode/data/SAVES.md §3)
const T = {
  name: 0x00, abil: 0x10, str: 0x10, int: 0x11, wis: 0x12, dex: 0x13, con: 0x14, cha: 0x15, str_exc: 0x16,
  base_thac0: 0x2D, race: 0x2E, class: 0x2F, age: 0x30, hp_max: 0x32, known_spell: 0x32 /* +id */, size: 0x6C,
  base_move: 0x72, level_main: 0x73, money: 0x88, level: 0x96, gender: 0x9E, alignment: 0xA0, attacks: 0xA1,
  base_dmg_dice: 0xA2 /* +1..2 */, base_dmg_sides: 0xA4 /* +1..2 */, base_ac: 0xA9, unk_AA: 0xAA, unk_AB: 0xAB,
  class_mask: 0xB0, hp_rolled: 0xB1, spell_slots: 0xB2, head_pic: 0xBB, body_pic: 0xBC, icon_size: 0xC0,
  icon_colours: 0xC0 /* +1..6 */, status: 0x10C, active: 0x10D, hp: 0x11B,
};

// DS tables (image bytes; PARTY.pas.md ov16 part A "Data tables")
const MENU_ENTRY = 0x0619, MENU_ENTRY_SIZE = 42, MENU_ENABLED = 0x29;   // MenuEntry{g_0619}: string[40] + enabled byte
const HOTKEYS = 0x05F0;                     // g_05F0 'C D M T V A R L S B E J'
const RACE_NAME = 0x0F03, CLASS_NAME = 0x0D38, GENDER_NAME = 0x0FEC, ALIGN_NAME = 0x0F53;   // 10 / 27 / 7 / 17 bytes
const ICON_SEED = 0x3CF5;                   // IconColourSlot{g_3CF5}[1..6]
const RACE_CLASSES = 0x3E17;                // RaceClasses[race*12]: count, ids
const CLASS_ALIGNS = 0x3FE7;                // ClassAligns[class*10]: count, ids
const START_AGE = 0x3E5B;                   // StartAge[race*28 + cls*4] = (word base, dice, sides)
const AGE_CATEGORY = 0x3F31;                // AgeCategory[race*10] = 5 words
const RACE_LIMITS = 0x3DA3;                 // RaceAbilityLimits[race*16 + k]
const CLASS_MIN = 0x3F81;                   // ClassAbilityMin[class*6 + ability]
const BASE_THAC0 = 0x3C7C;                  // BaseThac0[cls*11 + level]
const CLASS_MASK_BIT = 0x05D6;              // ClassMaskBit[cls]
const START_GOLD = 0x4263;                  // StartGoldDice[cls*2] = (dice, sides)
const SPELL_TABLE = 0x31FA;                 // SpellTable[id*16]: +0 class, +1 level

// Menu-entry enabled flags (DS bytes MenuEntry[i] + 29h; written in the DS image like the original)
const EN = { create: 0x0642, drop: 0x066C, modify: 0x0696, train: 0x06C0, view: 0x06EA, add: 0x0714, remove: 0x073E,
  load: 0x0768, save: 0x0792, begin: 0x07BC, exit: 0x07E6 };
const setEn = (a, v) => { env.g.ds[a] = v; };

const keyOf = (r) => (r !== null && typeof r === 'object' ? r.key : r);
const chr = (r) => { const k = keyOf(r); return typeof k === 'number' ? String.fromCharCode(k) : (k ?? '\0'); };

// 0899:0000 TerminateGame (no engine export yet: main.js installs keyState.onTerminate)
async function TerminateGame() {
  if (env.ext.TerminateGame) return X.TerminateGame();
  if (keyState.onTerminate) return keyState.onTerminate();
  throw new Error('TerminateGame');
}

// 7000:0000 FreeCharacter(var c: ^TChar) — the JS records are garbage-collected; the visible effect is c := nil.
export function FreeCharacter(c) {
  // 7000:0012 FreeMem(combatant) / 0034..0076 item list / 007d..00be effect list / 00cf FreeMem(c, 11Dh)
  c.v = null;                                                     // 7000:00d4
}

// 7000:0161 PartyCreationMenu — the start-of-game party creation screen (PM-01). Returns after BEGIN or a successful Load.
export async function PartyCreationMenu() {
  pic.DataSet = 3;                                                // 7000:0168
  const beginMode = 4;                                            // 7000:016d
  let redraw = true;
  g.StingMode = 0;                                                // 7000:0175
  g.game_Mode = 0;                                                // 7000:017a
  const turnUsed = { v: false };
  for (;;) {
    if (redraw) {                                                 // 7000:017f
      await X.DrawTitledFrame(1, 1, 0x26, 0x16, 0, 0, '');        // 7000:01a9
      if (g.SelectedChar !== null && g.SelectedChar !== undefined) {   // 7000:01ae
        await X.DrawPartyRoster(g.SelectedChar);                  // 7000:01bf
        setEn(EN.drop, 1); setEn(EN.modify, 1);                   // 7000:01c4
        if (g.ecl_Mem6B00[0x550 >> 1] !== 0 || g.StingMode !== 0) setEn(EN.train, 1);   // 7000:01ce  w[$550] unsigned > 0
        setEn(EN.view, 1); setEn(EN.remove, 1); setEn(EN.load, 0);   // 7000:01e6
        setEn(EN.save, 1); setEn(EN.begin, 1);                    // 7000:01f5
      } else {
        setEn(EN.drop, 0); setEn(EN.modify, 0); setEn(EN.train, 0); setEn(EN.view, 0);   // 7000:0201
        setEn(EN.remove, 0); setEn(EN.load, 1); setEn(EN.save, 0); setEn(EN.begin, 0);   // 7000:0215
      }
      let row = 0;                                                // 7000:0229
      const lineKeys = [];                                        // pointer layer: hotkey of each drawn line
      for (let i = 0; i <= 10; i++) {                             // 7000:022d
        const e = MENU_ENTRY + i * MENU_ENTRY_SIZE;
        if (ds(e + MENU_ENABLED) !== 0) {                         // 7000:0242
          const t = dsPstr(e);
          await X.DrawText(2, row + 12, 0x0F, t.charAt(0));       // 7000:0273  first letter, white
          await X.DrawText(3, row + 12, 0x0A, Copy(t, 2, t.length - 1));   // 7000:02bb  rest, green
          lineKeys.push(t.toUpperCase().charCodeAt(0));
          row++;                                                  // 7000:02c0
        }
      }
      // engine/input.js pointer layer: the hot keys of the menu line are invisible (colour 0), so a click on one of these
      // lines = its first letter (the same key a player types)
      setPointerRegion('pmenu', { x1: 16, y1: 12 * 8, x2: 0x26 * 8 + 7, y2: (12 + row) * 8 - 1, prio: 3,
        keysAt: (x, y) => { const k = lineKeys[Math.floor(y / 8) - 12]; return k ? [[k, 0]] : null; } });
      redraw = false;                                             // 7000:02cc
    }
    dev.screenSoon('PM-01');
    const r = await X.HorizontalMenu('Choose a function ', dsPstr(HOTKEYS), 0x0D, 0, 0, true, false);   // 7000:02f8  hot keys colour 0 = invisible
    const key = chr(r), ext = !!(r && r.ext);
    await X.ClearMenuLine();                                      // 7000:0300
    if (ext) {                                                    // 7000:0305
      if (key === 'G' || key === 'O') {                           // 7000:0314  Home / End scan codes
        await X.CycleSelectedChar(key);                           // 7000:031f
        await X.DrawPartyRoster(g.SelectedChar);                  // 7000:032c
      }
      continue;                                                   // 7000:0331  no redraw
    }
    if (!(key === 'E' || key === 'S')) g.GameSaved = 0;          // 7000:033d
    switch (key) {                                                // 7000:0349
      case 'C': if (ds(EN.create) !== 0) await CreateCharacter(); break;          // 7000:0350 / 0358
      case 'D': if (ds(EN.drop) !== 0) await X.DropCharacter(); break;            // 7000:0362 / 036a
      case 'M': if (ds(EN.modify) !== 0) await X.ModifyCharacter(); break;        // 7000:0374 / 037c
      case 'T': if (ds(EN.train) !== 0) await X.TrainCharacter(); break;          // 7000:0386 / 038e
      case 'V': if (ds(EN.view) !== 0) await X.ViewMenu(turnUsed); break;         // 7000:0398 / 03a4
      case 'A': if (ds(EN.add) !== 0) await X.AddCharacterMenu(); break;          // 7000:03b0 / 03b8
      case 'R':
        if (ds(EN.remove) !== 0 && g.SelectedChar !== null) {     // 7000:03c2
          await X.WriteCharacter(g.SelectedChar, '');             // 7000:03e9  store back to the roster (<name>.CHA)
          await X.RemoveFromParty(0, 1);                          // 7000:03f5
        }
        break;
      case 'L':
        if (ds(EN.load) !== 0) {                                  // 7000:03ff
          await X.LoadGame();                                     // 7000:0406
          if (g.game_Mode !== 0) { g.g_49F8 = 1; return; }        // 7000:040b  a game was loaded -> back to the main program
        }
        break;
      case 'S': if (ds(EN.save) !== 0 && g.PartyHead !== null) await X.SaveGame(); break;   // 7000:0421 / 0431
      case 'B':
        if (ds(EN.begin) !== 0 && g.PartyHead !== null) {         // 7000:043d
          g.game_Mode = beginMode;                                // 7000:0450  = 4
          await X.ClearMenuLine();                                // 7000:0453
          return;                                                 // 7000:0458
        }
        break;
      case 'E':
        if (ds(EN.exit) !== 0) {                                  // 7000:0462
          if (chr(await X.AskYesNo('Quit to DOS ', 0x0E, 0x0A, 0x0F)) === 'Y') {   // 7000:0481
            while (g.GameSaved === 0 && g.PartyHead !== null) await X.SaveGame();  // 7000:048f  quirk: keeps asking until saved
            await TerminateGame();                                // 7000:04a6
          }
        }
        break;
      case 'J':
        if (X.ParamStr(1) === 'STING') {                          // 7000:04bb / 04c5
          g.StingMode = 1;                                        // 7000:04cc
          await X.ShowTimedBottomMessage('I Understand, master...');   // 7000:04e1
        }
        break;
    }
    redraw = true;                                                // 7000:04e6
  }
}

// one VerticalListMenu pick of the creation lists (prompt '', options '', colours 0Dh/0Ah/0Fh, window (1,2)-(38,22));
// returns the 1-based index, or null on #0 (Esc / Exit)
async function pickFromList(list, screenId) {
  const item = { v: list.v }, index = { v: 1 }, redraw = { v: 1 };   // e.g. 7000:0710 .. 0725
  const showExit = 1;
  for (;;) {
    dev.screenSoon(screenId);
    const key = chr(await X.VerticalListMenu('', '', 0x0D, 0x0A, 0x0F, 1, 2, 0x26, 0x16, list.v, showExit, redraw, index, item));   // e.g. 7000:0775
    if (key === '\0') return null;                                // e.g. 7000:077d  quirk: c and the list are not freed
    if (key === '\r') return index.v;                             // e.g. 7000:0786
  }
}

// 7000:056C CreateCharacter (+ its second half 7000:1551) — PM-03..PM-05; the record is written to the roster only.
export async function CreateCharacter() {
  const c = newChar();                                            // 7000:0577 GetMem(c, 11Dh) / 058e FillChar(c^, 11Dh, 0)
  const b = c.b;
  let p = c;                                                      // 7000:0593 [BP-27h]
  for (let k = 1; k <= 6; k++)                                    // 7000:059c
    b[T.icon_colours + k] = byte((ds(ICON_SEED + k) + 8) * 16 + ds(ICON_SEED + k));   // 7000:05ac  91 A2 B3 C4 E6 F7
  b[T.base_ac] = 0x32;                                            // 7000:05e4  AC 10
  b[T.base_thac0] = 0x28;                                         // 7000:05ed  THAC0 20 (recomputed below)
  b[T.status] = 0; b[T.active] = 1;                               // 7000:05f5 / 05fe
  b[T.head_pic] = 1; b[T.body_pic] = 1; b[T.size] = 1;            // 7000:0607 / 0610 / 0619
  b[T.unk_AB] = Random(256);                                      // 7000:0622

  // ---- race ----
  const list = { v: null };
  await X.NewMenuList(7, list);                                   // 7000:0638
  list.v.isHeader = 1; list.v.text = 'Pick Race';                 // 7000:0640 / 0653
  let raceLoop;
  for (raceLoop = 1; raceLoop <= 7; raceLoop++) {                 // 7000:0658
    if (raceLoop >= 1 && raceLoop <= 5)                           // 7000:0664  signed JL/JG
      X.ListItem(raceLoop, list.v).text = ('  ' + dsPstr(RACE_NAME + raceLoop * 10)).slice(0, 40);   // 7000:0677 .. 06b1
    else if (raceLoop === 7)                                      // 7000:06b8
      X.ListItem(raceLoop - 1, list.v).text = ('  ' + dsPstr(RACE_NAME + raceLoop * 10)).slice(0, 40);   // 7000:06c8 .. 0702  item 6 = Human; Half-Orc not offered
  }
  raceLoop = 7;                                                   // loop variable after `for 1 to 7` (7000:0707 exits at 7)
  let index = await pickFromList(list, 'PM-03');                  // 7000:0710 .. 0786
  if (index === null) return;
  if (index === 6) index = 7;                                     // 7000:078c
  b[T.race] = index;                                              // 7000:07a4
  switch (b[T.race]) {                                            // 7000:07ab  innate racial effects
    case 5:                                                       // Halfling
      b[T.icon_size] = 1;                                         // 7000:07b3
      await X.AddEffect(c, 0x5A, 0, 0xFF, 0);                     // 7000:07ce
      await X.AddEffect(c, 0x61, 0, 0xFF, 0);                     // 7000:07e5
      break;
    case 1:                                                       // Dwarf
      b[T.icon_size] = 1;                                         // 7000:07f1
      await X.AddEffect(c, 0x5A, 0, 0xFF, 0);                     // 7000:080c
      await X.AddEffect(c, 0x61, 0, 0xFF, 0);                     // 7000:0823
      await X.AddEffect(c, 0x1A, 0, 0xFF, 0);                     // 7000:083a
      await X.AddEffect(c, 0x2F, 0, 0xFF, 0);                     // 7000:0851
      break;
    case 3:                                                       // Gnome
      b[T.icon_size] = 1;                                         // 7000:085d
      await X.AddEffect(c, 0x61, 0, 0xFF, 0);                     // 7000:0878
      await X.AddEffect(c, 0x12, 0, 0xFF, 0);                     // 7000:088f
      await X.AddEffect(c, 0x2F, 0, 0xFF, 0);                     // 7000:08a6
      await X.AddEffect(c, 0x30, 0, 0xFF, 0);                     // 7000:08bd
      break;
    case 2:                                                       // Elf
      b[T.icon_size] = 2;                                         // 7000:08c8
      await X.AddEffect(c, 0x6B, 0, 0xFF, 0);                     // 7000:08e3
      break;
    case 4:                                                       // Half-Elf
      b[T.icon_size] = 2;                                         // 7000:08ee
      await X.AddEffect(c, 0x7C, 0, 0xFF, 0);                     // 7000:0909
      break;
    default: b[T.icon_size] = 2;                                  // 7000:0910  Human
  }
  await X.FreeMenuList(list);                                     // 7000:091e

  // ---- gender ----
  await X.NewMenuList(3, list);                                   // 7000:092c
  list.v.isHeader = 1; list.v.text = 'Pick Gender';               // 7000:0934 / 0947
  for (let k = 0; k <= 1; k++)                                    // 7000:094c
    X.ListItem(k + 1, list.v).text = ('  ' + dsPstr(GENDER_NAME + k * 7)).slice(0, 40);   // 7000:0961 .. 099b
  index = await pickFromList(list, 'PM-03');                      // 7000:09a6 .. 0a1c
  if (index === null) return;
  b[T.gender] = byte(index - 1);                                  // 7000:0a29
  await X.FreeMenuList(list);                                     // 7000:0a33

  // ---- class ----
  const race = b[T.race];
  let n = ds(RACE_CLASSES + race * 12);                           // 7000:0a47
  await X.NewMenuList(n + 1, list);                               // 7000:0a5a
  list.v.isHeader = 1; list.v.text = 'Pick Class';                // 7000:0a62 / 0a75
  for (let k = 1; k <= n; k++)                                    // 7000:0a7a
    X.ListItem(k, list.v).text = ('  ' + dsPstr(CLASS_NAME + ds(RACE_CLASSES + race * 12 + k) * 27)).slice(0, 40);   // 7000:0a9b .. 0aee
  index = await pickFromList(list, 'PM-03');                      // 7000:0afb .. 0b71
  if (index === null) return;
  p = c;                                                          // 7000:0b77
  b[T.class] = ds(RACE_CLASSES + race * 12 + index);              // 7000:0b80
  b[T.level_main] = 1;                                            // 7000:0ba2
  const L1 = (...cls) => { for (const k of cls) b[T.level + k] = 1; };
  switch (b[T.class]) {                                           // 7000:0baa  level 1 in each base class
    case 8: L1(0, 2); break;                                      // 7000:0bd0  C/F
    case 9: L1(0, 2, 5); break;                                   // 7000:0be9  C/F/MU
    case 10: L1(0, 4); break;                                     // 7000:0c0b  C/R
    case 11: L1(0, 5); break;                                     // 7000:0c24  C/MU
    case 12: L1(0, 6); break;                                     // 7000:0c3d  C/T
    case 13: L1(2, 5); break;                                     // 7000:0c55  F/MU
    case 14: L1(2, 6); break;                                     // 7000:0c6d  F/T
    case 15: L1(2, 5, 6); break;                                  // 7000:0c85  F/MU/T
    case 16: L1(5, 6); break;                                     // 7000:0ca6  MU/T
    default: if (b[T.class] <= 7) b[T.level + b[T.class]] = 1;    // 7000:0bc3  0..7
  }
  if (shortint(b[T.level + 6]) > 0) await X.UpdateThiefSkills(c); // 7000:0cb8 / 0cc9  signed
  b[T.class_mask] = 0; b[T.base_thac0] = 0;                       // 7000:0cce / 0cd7
  for (let cls = 0; cls <= 7; cls++)                              // 7000:0cdf
    if (shortint(b[T.level + cls]) > 0) {                         // 7000:0cf1  signed
      const t = ds(BASE_THAC0 + cls * 11 + b[T.level + cls]);
      if (t > b[T.base_thac0]) b[T.base_thac0] = t;               // 7000:0d17 / 0d49  best of the classes (unsigned)
      b[T.class_mask] = byte(b[T.class_mask] + ds(CLASS_MASK_BIT + cls));   // 7000:0d53
    }
  await X.UpdateSaves(c);                                         // 7000:0d6b  ov23 e3
  await X.FreeMenuList(list);                                     // 7000:0d75

  // ---- alignment ----
  const cl = b[T.class];
  n = ds(CLASS_ALIGNS + cl * 10);                                 // 7000:0d89
  await X.NewMenuList(n + 1, list);                               // 7000:0d9c
  list.v.isHeader = 1; list.v.text = 'Pick Alignment';            // 7000:0da4 / 0db7
  for (let k = 1; k <= n; k++)                                    // 7000:0dbc
    X.ListItem(k, list.v).text = ('  ' + dsPstr(ALIGN_NAME + ds(CLASS_ALIGNS + cl * 10 + k) * 17)).slice(0, 40);   // 7000:0ddd .. 0e30
  index = await pickFromList(list, 'PM-03');                      // 7000:0e3d .. 0eb3
  if (index === null) return;
  b[T.alignment] = ds(CLASS_ALIGNS + cl * 10 + index);            // 7000:0ecd
  await X.FreeMenuList(list);                                     // 7000:0ede

  // ---- age ----
  const age = (v) => { b[T.age] = v & 0xFF; b[T.age + 1] = (v >> 8) & 0xFF; };
  const ageEntry = (cls) => START_AGE + race * 28 + cls * 4;
  if (shortint(cl) <= 7) {                                        // 7000:0ee6  signed
    const a = ageEntry(cl);                                       // 7000:0eef
    age(word(dsW(a) + await X.Roll(ds(a + 2), ds(a + 3))));       // 7000:0f26
  } else {
    p = c;                                                        // 7000:0f3d
    const max = (k) => { const a = ageEntry(k); return word(dsW(a) + ds(a + 2) * ds(a + 3)); };
    switch (cl) {                                                 // 7000:0f49  multi-class: base + dice*sides
      case 8: case 9: case 11: case 12: age(max(0)); break;       // 7000:0f51 / 0fa4 / 0ff7 / 104a  cleric entry
      case 13: case 15: case 16: age(max(5)); break;              // 7000:109d / 1143 / 1195  magic-user entry
      case 14: age(max(2)); break;                                // 7000:10f0  fighter entry
      default: break;                                             // quirk: class 10 (C/R) leaves age 0
    }
  }

  const saved = g.SelectedChar; g.SelectedChar = c;               // 7000:11e1
  await X.DrawCharacterSheet();                                   // 7000:11fb
  dev.screenSoon('PM-04');

  // ---- ability rolls; "Keep this character?" No restarts here (7000:1200) ----
  const ageOf = () => b[T.age] | (b[T.age + 1] << 8);
  for (;;) {
    b[T.str_exc] = 0;                                             // 7000:1203
    for (let abil = 0; abil <= 5; abil++) {                       // 7000:1208 / 120e / 1bd8
      b[T.abil + abil] = 0;                                       // 7000:121a
      for (let tr = 1; tr <= 6; tr++) {                           // 7000:121f  best of six rolls of 3d6
        let r = await X.Roll(3, 6);                               // 7000:122e
        switch (raceLoop) {                                       // 7000:1236  quirk: the race-list loop variable, always 7 -> never applies
          case 1: if (abil === 4) r++; else if (abil === 5) r--; break;            // 7000:123d  dwarf
          case 2: if (abil === 3) r++; else if (abil === 4) r--; break;            // 7000:1256  elf
          case 5: if (abil === 0) r--; else if (abil === 3) r++; break;            // 7000:126f  halfling
          case 6: if (abil === 0) r++; else if (abil === 4) r++; else if (abil === 5) r -= 2; break;   // 7000:1288  half-orc
        }
        r = byte(r);
        if (b[T.abil + abil] < r) b[T.abil + abil] = r;           // 7000:12a5  unsigned
      }
      p = c;                                                      // 7000:12d0
      const pb = p.b, pr = pb[T.race], A = (i) => dsW(AGE_CATEGORY + pr * 10 + i * 2), ag = ageOf();
      const Lim = (k) => ds(RACE_LIMITS + pr * 16 + k), Cmin = (a) => ds(CLASS_MIN + pb[T.class] * 6 + a);
      const at = T.abil + abil;
      const clamp = (lo, hi) => { if (pb[at] < lo) pb[at] = lo; if (pb[at] > hi) pb[at] = hi; };   // unsigned, minimum first
      const classMin = () => { if (pb[at] < Cmin(abil)) pb[at] = Cmin(abil); };
      switch (abil) {                                             // 7000:12d9 / 1551
        case 0:                                                   // STR
          if (pb[at] > 0 && A(0) < ag) pb[at] = byte(pb[at] + 1); // 7000:12e3
          if (pb[at] > 0 && A(1) < ag) pb[at] = byte(pb[at] - 1); // 7000:131c
          if (pb[at] > 0 && A(2) < ag) pb[at] = byte(pb[at] - 2); // 7000:1355
          if (pb[at] > 0 && A(3) < ag) pb[at] = byte(pb[at] - 1); // 7000:138f
          if (pb[at] < Lim(0 + pb[T.gender])) pb[at] = Lim(0 + pb[T.gender]);   // 7000:13c8  race/gender minimum
          if (pb[at] > Lim(2 + pb[T.gender])) pb[at] = Lim(2 + pb[T.gender]);   // 7000:1424  race/gender maximum
          classMin();                                             // 7000:1480
          if (pb[at] === 18 && shortint(pb[T.level + 2]) > 0) {   // 7000:14da  fighter level > 0 (signed)
            pb[T.str_exc] = byte(Random(100) + 1);                // 7000:14f3
            if (Lim(4 + pb[T.gender]) < pb[T.str_exc]) pb[T.str_exc] = Lim(4 + pb[T.gender]);   // 7000:151b
          }
          break;
        case 1:                                                   // INT
          if (A(1) < ag) pb[at] = byte(pb[at] + 1);               // 7000:1558
          if (A(3) < ag) pb[at] = byte(pb[at] + 1);               // 7000:1581
          clamp(Lim(6), Lim(7));                                  // 7000:15aa / 15ec
          classMin();                                             // 7000:162e
          break;
        case 2:                                                   // WIS
          if (A(0) >= ag) pb[at] = byte(pb[at] - 1);              // 7000:1692  young adult
          if (A(1) < ag) pb[at] = byte(pb[at] + 1);               // 7000:16bb
          if (A(2) < ag) pb[at] = byte(pb[at] + 1);               // 7000:16e4
          if (A(3) < ag) pb[at] = byte(pb[at] + 1);               // 7000:170d
          clamp(Lim(8), Lim(9));                                  // 7000:1736 / 1778
          classMin();                                             // 7000:17ba
          if (pb[at] < 13 && pb[T.class] >= 8 && pb[T.class] <= 12) pb[at] = 13;   // 7000:1814  set CS:0525 = [8..12]
          break;
        case 3:                                                   // DEX
          if (A(2) < ag) pb[at] = byte(pb[at] - 2);               // 7000:1850
          if (A(3) < ag) pb[at] = byte(pb[at] - 1);               // 7000:187a
          clamp(Lim(0x0A), Lim(0x0B));                            // 7000:18a3 / 18e5
          classMin();                                             // 7000:1927
          break;
        case 4:                                                   // CON
          if (A(1) < ag) pb[at] = byte(pb[at] - 1);               // 7000:198b
          if (A(2) < ag) pb[at] = byte(pb[at] - 1);               // 7000:19b4
          if (A(3) < ag) pb[at] = byte(pb[at] - 1);               // 7000:19dd
          clamp(Lim(0x0C), Lim(0x0D));                            // 7000:1a06 / 1a48
          classMin();                                             // 7000:1a8a
          break;
        case 5:                                                   // CHA — no age adjustment
          clamp(Lim(0x0E), Lim(0x0F));                            // 7000:1aee / 1b30
          classMin();                                             // 7000:1b72
          break;
      }
      await X.DrawAbility(abil, 0);                               // 7000:1bd3
    }

    p = c;                                                        // 7000:1be1
    const pb = p.b;
    pb[T.hp] = pb[T.hp_max];                                      // 7000:1bed  (old value; set again below)
    pb[T.attacks] = 2; pb[T.base_dmg_dice + 1] = 1; pb[T.base_dmg_sides + 1] = 2;   // 7000:1bfc / 1c05 / 1c0e  +A1h, +A3h, +A5h
    pb[T.unk_AA] = 1; pb[T.base_move] = 12;                       // 7000:1c14 / 1c1d
    let goldSum = 0, nCls = 0;                                    // 7000:1c25 / 1c29
    for (let cls = 0; cls <= 7; cls++) {                          // 7000:1c2d
      if (shortint(pb[T.level + cls]) <= 0) continue;             // 7000:1c3f  signed
      if (cls === 0) pb[T.spell_slots + 0] = 1;                   // 7000:1c51  +B2h
      else if (cls === 5) pb[T.spell_slots + 3] = 1;              // 7000:1c60  +B5h
      goldSum = byte(goldSum + await X.Roll(ds(START_GOLD + cls * 2), ds(START_GOLD + cls * 2 + 1)));   // 7000:1c83  byte add
      nCls = byte(nCls + 1);                                      // 7000:1c8b
      if (cls === 0) {                                            // 7000:1c91
        await X.WisdomBonusSpells(c);                             // 7000:1c9b
        for (let k = 1; k <= 0x38; k++)                           // 7000:1ca0
          if (ds(SPELL_TABLE + k * 16) === 0 && ds(SPELL_TABLE + k * 16 + 1) === 1)   // 7000:1cc1 / 1cca
            pb[T.known_spell + k] = 1;                            // 7000:1cdb  every level-1 cleric spell
      } else if (cls === 5) {                                     // 7000:1ce8
        pb[0x3D] = 1; pb[0x44] = 1; pb[0x45] = 1; pb[0x47] = 1;   // 7000:1cec .. 1d07  spells 0Bh, 12h, 13h, 15h
      }
    }
    const gold = Math.trunc(integer(goldSum * 10) / nCls);        // 7000:1d15 .. 1d27  IDIV
    pb[T.money + 6] = gold & 0xFF; pb[T.money + 7] = (gold >> 8) & 0xFF;   // 7000:1d2c  money[3] gold (+8Eh)
    pb[T.hp_rolled] = byte(await X.RollHitDice(c, 0xFF));         // 7000:1d3b
    pb[T.hp_max] = pb[T.hp_rolled];                               // 7000:1d49
    const conAdj = shortint(await X.ConHpBonus(c));               // 7000:1d5c / 1d5f CBW
    if (conAdj < 0) {                                             // 7000:1d63
      if (pb[T.hp_max] > Math.abs(conAdj) + nCls)                 // 7000:1d69 .. 1d87  signed word JLE
        pb[T.hp_max] = byte(Math.trunc((pb[T.hp_max] + conAdj) / nCls));   // 7000:1d9d  IDIV
      else pb[T.hp_max] = 1;                                      // 7000:1da8
    } else
      pb[T.hp_max] = byte(Math.trunc((pb[T.hp_max] + conAdj) / nCls));     // 7000:1dc6
    pb[T.hp] = pb[T.hp_max];                                      // 7000:1dcf
    pb[T.hp_rolled] = byte(Math.trunc(pb[T.hp_rolled] / nCls));   // 7000:1df0
    await X.DrawCombatStats();                                    // 7000:1dfa
    await X.DrawMoney();                                          // 7000:1dff
    dev.screenSoon('PM-04');
    const key = chr(await X.AskYesNo('Keep this character? ', 0x0D, 0x0A, 0x0F));   // 7000:1e1c
    if (key === 'Y') break;                                       // 7000:1e24  else goto 1200 (quirk: known spells stay set)
  }

  await X.DrawCharacterSheet();                                   // 7000:1e2d
  g.SelectedChar = saved;                                         // 7000:1e32
  let nm;
  do {
    dev.screenSoon('PM-05');
    nm = String(await X.ReadBottomLine('Character name: ', 0x0D, 0x0F)).slice(0, 15);   // 7000:1e5a / 1e68  StrAssign max 15
    b[0] = nm.length; for (let i = 0; i < nm.length; i++) b[1 + i] = nm.charCodeAt(i) & 0xFF;
  } while (b[0] === 0);                                           // 7000:1e70
  const saved2 = g.SelectedChar; g.SelectedChar = c;              // 7000:1e76 / 1e83
  await X.PortraitMenu();                                         // 7000:1e91
  await X.IconEditor();                                           // 7000:1e95
  await X.WriteCharacter(c, '');                                  // 7000:1ead  SAVE\<name>.CHA (+.ITM/.SPC) + charlist.txt
  g.SelectedChar = saved2;                                        // 7000:1eb2
  // 7000:1ec9 FreeMem(c, 11Dh) — quirk: the racial effect list is not freed (no visible effect)
}
