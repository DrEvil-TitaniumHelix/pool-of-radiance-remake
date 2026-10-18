// startup.js — the start-up sequence: InitGameState (ov11), ShowTitle / ShowCredits (ov01), CodeWheelCheck (ov02).
// Source: decode/pseudo/PARTY.pas.md (areas ov01, ov02, ov11) — translated by build-engine for milestone M1 (title sequence);
// ownership of these routines passes to build-party (game/areas/party.js) with the rest of PARTY.
// Screens: SCREENS_INDEX SU-02 .. SU-06.

import { state as pic, AllocPicture, LoadPicture, PutPicture, Load8x8Set } from '../engine/pictures.js';
import { text, LoadTextFont, DrawText, DrawRepeatedGlyph, DrawTitledFrame, ReadBottomLine, ShowTimedBottomPrompt,
  ClearMenuLine } from '../engine/text.js';
import { TimeInHundredths, Delay, yieldShort } from '../engine/timer.js';
import { KeyPressed } from '../engine/input.js';
import { Random, Randomize } from '../engine/tp.js';
import { fetchFile } from '../engine/dax.js';
import { G } from '../engine/state.js';
import { dev } from '../engine/dev.js';

// 5700:002D InitGameState — the parts that produce screen output or are needed by the start-up screens.
export async function InitGameState() {
  pic.symbolPic = AllocPicture(8, 1, 1, 0);                    // 5700:00b7
  pic.viewPic = AllocPicture(0xA8, 0x15, 1, 0);                // 5700:00cf
  pic.saveBuf = AllocPicture(0x18, 3, 1, 0);                   // 5700:00e7
  const vw = await import('./view.js');                       // 5700:02ca portrait slots 1 = head (DS:6B00), 2 = body (DS:6B05):
  G.g_6B00 = 0xFF; G.g_6B05 = 0xFF;                            // 5700:02e4  loaded record id := none (fix request #a-7: HEAD id 0
  vw.view.headPic = null; vw.view.bodyPic = null;              // 5700:02fa  of head_pic 1 must load on the first sheet)
  G.TreasureItems = null;                                      // 5700:031c
  G.party_Ahead = 0; G.party_CellAttr = 0;                     // 5700:032e  FillChar(party_MapX, 5, 0): DS:6AAD..6AB1
  G.party_MapX = 15; G.party_MapY = 1; G.party_Dir = 6;        // 5700:0333 .. 033d
  G.door_CanBash = 1; G.door_CanPick = 1; G.door_CanKnock = 1;   // 5700:034e  FillChar(door_CanBash, 3, 1)
  G.opt_Portraits = 1; G.opt_MonsterPics = 1; G.DebugFlag = 0; // 5700:0392 .. 039c
  G.g_49F8 = 0; G.g_49FB = 0;                                  // 5700:03a6 / 03ab
  G.PartyHead = null; G.SelectedChar = null;                   // 5700:03b0 / 03b8
  G.g_49F4 = 0;                                                // 5700:03cb
  text.TextOutputActive = 1;                                   // 5700:03a1
  G.GameSpeed = 1; text.GameSpeed = 1;                         // 5700:03c6
  pic.DataSet = 1;                                             // 5700:03d0
  G.PrevDataSet = 1;                                           // 5700:03d5
  G.g_547A = 1; G.g_5378 = 1;                                  // 5700:03da / 03e0  words
  G.view_AreaMap = 0;                                          // 5700:03e6
  G.g_49F9 = 1;                                                // 5700:03eb
  G.travel_Mode = 1;                                           // 5700:03f0
  G.g_6DDC = 0;                                                // 5700:0400  (menu_Top := 1 at 0405: menus.js menu.top starts at 1)
  G.DuelActive = 0; G.g_6DDA = 0;                              // 5700:040b / 0410
  G.g_84DD = 0; G.g_84DE = 0; G.g_84DF = 0; G.g_84E0 = 0;      // 5700:0415 .. 0424
  G.PartyDead = 0;                                             // 5700:0429
  pic.ClipPictures = 1;                                        // 5700:042e
  G.enc_SpriteOnScreen = 0; G.NoDiskPrompt = 0;                // 5700:0433 / 0438
  G.g_557D = 0;                                                // 5700:0447  (g_6B0A := 0 / g_6B1C := FFh at 043d/0442: view_ov28 animName/animId start so)
  G.g_6F69 = 0xE8; G.g_6F68 = 0xDB;                            // 5700:044c / 0451  backdrop keys
  G.enc_MenuActive = 0;                                        // 5700:0456  (SoundTransientMode := 0 at 045b: audio.js state starts at 0)
  const saved = pic.DataPath; pic.DataPath = '';               // 5700:0477
  await LoadTextFont();                                        // 5700:0481
  ClearMenuLine();                                             // 5700:0486
  DrawText(0, 24, 0x0A, 'Loading...Please Wait');              // 5700:04a3  (SU-02)
  await dev.screen('SU-02');
  await Load8x8Set(0xCA, 4);                                   // 5700:04ae
  await Load8x8Set(0xCB, 0);                                   // 5700:04b9
  G.TileSetLo = await LoadPicture('sqrpaci', 1, 0, 0);         // 5700:04db
  G.TileSetHi = await LoadPicture('sqrpaci', 2, 0, 0);         // 5700:04fd
  // combat sprites (engine fix request #p1-1): LoadCombatIcon = VIEW ov32 C000:01C8 (view_ov32.js, poses id and id+80h)
  const v = await import('./view.js');
  const ov32 = await import('./view_ov32.js');
  if (!v.view.g) v.view.g = G;                                 // ecl_host binds view.g later (eclG proxies the same G store)
  for (let i = 0; i <= 11; i++) await ov32.LoadCombatIcon('COMSPR', i, i + 13);   // 5700:0502 / 0529  COMSPR 0..11 -> slots 13..24
  await ov32.LoadCombatIcon('COMSPR', 25, 25);                 // 5700:054a  COMSPR 25 -> slot 25
  const items = await fetchFile('ITEMS');                      // 5700:05a1  (ITEMS disk prompt PARTY-ov11-02 never needed here)
  if (items) G.ItemTypeTable = items.slice(2, 2 + 0x810);      // 5700:05db  128 types x 16 bytes (2048 read)
  pic.DataPath = saved;                                        // 5700:05f8
  ClearMenuLine();                                             // 5700:05fd
  Randomize();                                                 // 5700:0602
  const magic = await import('./magic.js');                    // 5700:0607 InitSpellTable (MAGIC ov22 8E00:3413, stub ov22 e10)
  await magic.ensureMagicBound();
  magic.InitSpellTable();
  const party = await import('./party.js');                    // 5700:060c InstallEffectHandlers (PARTY ov12 5C00:31A2)
  await party.InstallEffectHandlers();
}

// 2500:0000 WaitSecondsOrKey(secs): the key is NOT consumed (0899:0104 is a no-op)
async function WaitSecondsOrKey(secs) {
  const target = TimeInHundredths() + ((secs * 100) & 0xFFFF);  // 2500:0011
  while (TimeInHundredths() < target && !KeyPressed()) await yieldShort();   // 2500:0025
}

// 2500:0206 ShowCredits (SU-05)
async function ShowCredits() {
  DrawTitledFrame(1, 1, 38, 3, 0, 0, '');                      // 2500:022d
  DrawTitledFrame(1, 5, 38, 23, 0, 0, '');                     // 2500:0253
  const T = [
    [0x05, 0x01, 0x0A, 'scenario created by:'], [0x1A, 0x01, 0x0E, 'tsr, inc.'], [0x0F, 0x02, 0x0A, 'jim ward'],
    [0x02, 0x03, 0x0A, 'david cook,steve winter,mike breault'], [0x01, 0x05, 0x0A, 'game created by:'],
    [0x12, 0x05, 0x0E, 'ssi special projects'], [0x0E, 0x06, 0x0B, 'version 1.3'], [0x02, 0x07, 0x0E, 'programming:'],
    [0x14, 0x07, 0x0E, 'original'], [0x02, 0x08, 0x0B, 'scot bayless'], [0x14, 0x08, 0x0E, 'programming:'],
    [0x02, 0x09, 0x0B, 'brad myers'], [0x14, 0x09, 0x0B, 'keith brors'], [0x02, 0x0A, 0x0B, 'russ brown'],
    [0x14, 0x0A, 0x0B, 'brad myers'], [0x02, 0x0B, 0x0B, 'ted greer'], [0x02, 0x0D, 0x0E, 'graphic arts:'],
    [0x14, 0x0D, 0x0E, 'encounter coding:'], [0x02, 0x0E, 0x0B, 'tom wahl'], [0x14, 0x0E, 0x0B, 'paul murray'],
    [0x02, 0x0F, 0x0B, 'fred butts'], [0x14, 0x0F, 0x0B, 'russ brown'], [0x02, 0x10, 0x0B, 'darla marasco'],
    [0x14, 0x10, 0x0B, 'victor penman'], [0x02, 0x11, 0x0B, 'susan halbleib'], [0x14, 0x11, 0x0B, 'dave shelley'],
    [0x02, 0x13, 0x0E, 'project manager'], [0x14, 0x13, 0x0E, 'developer:'], [0x02, 0x14, 0x0B, 'victor penman'],
    [0x14, 0x14, 0x0B, 'george mac donald'], [0x02, 0x16, 0x0E, 'testing:'], [0x0B, 0x16, 0x0B, 'joel billings,steve salyer'],
    [0x02, 0x17, 0x0B, 'james kucera,robert daly,rick white'],
  ];                                                           // 2500:0270 .. 0610
  for (const [c, r, col, s] of T) DrawText(c, r, col, s);
  await dev.screen('SU-05');
  await WaitSecondsOrKey(10);                                  // 2500:061a
}

// CPU-bound lightning trigger of ShowTitle (2500:071c): passes of the busy loop per second on the reference machine.
// TODO(decode): calibrate against the DOSBox reference (cycles=3000); the original's rate depends on CPU speed (PARTY quirk).
const TITLE_LOOP_PASSES_PER_SEC = 20000;

// 2500:0627 ShowTitle (SU-03, SU-04)
export async function ShowTitle(cfgFullIntro) {
  let acc = 0;                                                 // 2500:062d
  const saved = pic.DataPath; pic.DataPath = '';               // 2500:064b / 0650
  let p = await LoadPicture('title', 1, 0, 0);                 // 2500:0672
  PutPicture(0, 0, p);                                         // 2500:0683
  await dev.screen('SU-03');
  await WaitSecondsOrKey(5);                                   // 2500:068d
  if (cfgFullIntro === 0) { pic.DataPath = saved; return; }    // 2500:0690  quirk: no credits
  p = await LoadPicture('title', 2, 0, 0);                     // 2500:06ca
  pic.DataPath = saved;                                        // 2500:06dd
  PutPicture(0, 0, p);                                         // 2500:06ee
  await dev.screen('SU-04');
  const endTime = TimeInHundredths() + 500;                    // 2500:06fd
  do {
    // one browser slice = the busy-loop passes of ~10 ms on the reference machine
    for (let k = 0; k < TITLE_LOOP_PASSES_PER_SEC / 100; k++) {
      acc += Random(4);                                        // 2500:071c (EGA only; VideoMode = 1 here)
      if (acc > 50000) {                                       // 2500:0729
        acc = 0;
        const n = Random(3) + 1;                               // 2500:074a
        for (let i = 0; i <= n; i++) {                         // 2500:0753
          pic.display.setPaletteRegister(1, 0x09); await Delay(150);   // 2500:076b
          pic.display.setPaletteRegister(1, 0x0B); await Delay(100);   // 2500:077f
          pic.display.setPaletteRegister(1, 0x0F); await Delay(50);    // 2500:0793
          pic.display.setPaletteRegister(1, 0x0B); await Delay(100);   // 2500:07a7
          pic.display.setPaletteRegister(1, 0x09); await Delay(150);   // 2500:07bb
          pic.display.setPaletteRegister(1, 0x01);                     // 2500:07cf
        }
        break;
      }
    }
    await Delay(10);
  } while (!(KeyPressed() || TimeInHundredths() >= endTime)); // 2500:07dc
  await ShowCredits();                                         // 2500:0802
}

// DS:0002 CodeWheelTable (13 x 21 bytes, image) — PARTY.pas.md §CodeWheelTable
const WHEEL = [
  ['BEWARE', [0x1D, 0x1E], [0x6C, 0x70], '- - - - -'], ['ZOMBIE', [0x5B, 0x5C], [0x4D, 0xFF], '-..-..-..'],
  ['NOTNOW', [0x2C, 0x2D], [0x6A, 0xFF], '.........'], ['COPPER', [0x09, 0x0A], [0x43, 0xFF], '- - - - -'],
  ['DRAGON', [0x01, 0x02], [0x68, 0xFF], '-..-..-..'], ['EFREET', [0x11, 0x12], [0x6D, 0xFF], '.........'],
  ['FRIEND', [0x17, 0x18], [0x3F, 0xFF], '- - - - -'], ['JUNGLE', [0x19, 0x1A], [0x4E, 0xFF], '-..-..-..'],
  ['KNIGHT', [0x22, 0x23], [0x6C, 0xFF], '.........'], ['SAVIOR', [0x2E, 0x2F], [0x42, 0xFF], '- - - - -'],
  ['TEMPLE', [0x36, 0x37], [0x4B, 0xFF], '-..-..-..'], ['VULCAN', [0x34, 0x35], [0x6E, 0xFF], '.........'],
  ['WYVERN', [0x2C, 0x2D], [0x47, 0xFF], '- - - - -'],
];

// 2A00:00FD CodeWheelCheck (SU-06); returns false when the third answer was wrong (caller terminates)
export async function CodeWheelCheck() {
  let tries = 1;                                               // 2a00:0104
  for (;;) {
    let idx = Random(13);                                      // 2a00:0111
    if (dev.wheelEntry !== null) idx = dev.wheelEntry;         // acceptance hook only (?wheelentry=n)
    const e = WHEEL[idx];
    DrawTitledFrame(1, 1, 38, 22, 0, 0, '');                   // 2a00:013a
    DrawText(1, 1, 0x0A, 'USE THE TRANSLATION WHEEL TO DECIPHER');   // 2a00:0157
    DrawText(1, 2, 0x0A, 'THE CODE WORD.');                    // 2a00:0174
    DrawText(1, 5, 0x0A, 'MATCH THE ESPRUAR RUNE (OUTER RING)');      // 2a00:0191
    DrawRepeatedGlyph(8, 6, 0x0C, 1, String.fromCharCode(e[1][0] + 0x40), false);   // 2a00:01bb
    DrawRepeatedGlyph(9, 6, 0x0C, 1, String.fromCharCode(e[1][1] + 0x40), false);   // 2a00:01e5
    DrawText(1, 8, 0x0A, 'WITH THE DETHEK RUNE (INNER RING)');       // 2a00:0202
    DrawRepeatedGlyph(8, 9, 0x0C, 1, String.fromCharCode(e[2][0] + 0x40), false);   // 2a00:022c
    if (e[2][1] !== 0xFF) DrawRepeatedGlyph(9, 9, 0x0C, 1, String.fromCharCode(e[2][1] + 0x40), false);   // 2a00:0269
    DrawText(1, 11, 0x0A, 'AND READ THE CODE WORD UNDER THE PATH:');  // 2a00:0286
    DrawText(1, 13, 0x0C, '     ' + e[3]);                     // 2a00:02bb
    DrawText(1, 14, 0x0A, 'READ FROM THE INSIDE TO THE OUTSIDE.');    // 2a00:02d8
    dev.screenSoon('SU-06');
    const answer = await ReadBottomLine('INPUT THE CODE WORD: ', 0x0D, 6);   // 2a00:02fd
    if (answer === e[0]) return true;                          // 2a00:0327
    await ShowTimedBottomPrompt("Sorry, that's incorrect.", 0x0E);   // 2a00:0342
    if (tries === 3) return false;                             // 2a00:0347  TerminateGame
    tries++;
  }
}

// 7000:0161 PartyCreationMenu — M1 version (PM-01): the screen and its key loop; the commands themselves are build-party's
// (game/areas/party.js replaces this whole routine). Without a party only Create / Add / Load / Exit are offered.
const MENU = [
  ['Create New Character', 1], ['Drop Character', 0], ['Modify Character', 0], ['Train Character', 0], ['View Character', 0],
  ['Add Character to Party', 1], ['Remove Character from Party', 0], ['Load Saved Game', 1], ['Save Current Game', 0],
  ['BEGIN Adventuring', 0], ['Exit to DOS', 1],
];                                                             // DS:0619 MenuEntry (text, enabled byte +29h)
export async function PartyCreationMenuM1(commands = {}) {
  const { HorizontalMenu, ClearMenuLine: clr, AskYesNo } = await import('../engine/menus.js');
  let res = null;
  try { res = await import('./res_00ba.js'); } catch (e) { res = null; }
  pic.DataSet = 3;                                             // 7000:0168
  G.StingMode = 0; G.game_Mode = 0;                            // 7000:0175 / 017a
  let redraw = true;
  for (;;) {
    if (redraw) {
      DrawTitledFrame(1, 1, 0x26, 0x16, 0, 0, '');             // 7000:01a9
      const sel = G.SelectedChar !== null;                     // 7000:01ae
      if (sel && res && res.DrawPartyRoster) await res.DrawPartyRoster(G.SelectedChar);   // 7000:01bf
      for (const i of [1, 2, 4, 6, 8, 9]) MENU[i][1] = sel ? 1 : 0;   // 7000:01c4 / 0201  Drop, Modify, View, Remove, Save, BEGIN
      if (sel) { if ((G.ecl_Mem6B00 && G.ecl_Mem6B00[0x550 >> 1] > 0) || G.StingMode) MENU[3][1] = 1; }   // 7000:01ce Train
      else MENU[3][1] = 0;
      MENU[7][1] = sel ? 0 : 1;                                // Load
      let row = 0;
      for (const [t, en] of MENU) if (en) {                    // 7000:022d
        DrawText(2, row + 12, 0x0F, t[0]);                     // 7000:0273
        DrawText(3, row + 12, 0x0A, t.slice(1));               // 7000:02bb
        row++;
      }
      redraw = false;
    }
    dev.screenSoon('PM-01');
    const { key, ext } = await HorizontalMenu('Choose a function ', 'C D M T V A R L S B E J', 0x0D, 0, 0, true, false);   // 7000:02f8
    clr();                                                     // 7000:0300
    if (ext) continue;                                         // 7000:0305 (Home/End: CycleSelectedChar, ov19 — TODO)
    const idx = 'CDMTVARLSBE'.indexOf(key);
    if (key === 'E') {                                         // 7000:0462
      if (await AskYesNo('Quit to DOS ', 0x0E, 0x0A, 0x0F) === 'Y') return 'quit';   // 7000:0481
    } else if (idx >= 0 && MENU[idx][1] && commands[key]) {
      const r = await commands[key]();
      if (r === 'begin') return r;
    }
    redraw = true;                                             // 7000:04e6
  }
}
