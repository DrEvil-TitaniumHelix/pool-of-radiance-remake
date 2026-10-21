// game/areas/magic_ov15.js — MAGIC ov15 (seg 6B00): camp — rest, memorize, scribe, effects display, party options.
// por-only: Pool spell ids, tables, dispatch, class limits and magic rules (whole module) (profile: engine.areaModules / pediaSources.spells; game/profiles/PORONLY.md)
// Lane por-build-magic. Source: decode/pseudo/MAGIC.pas.md "## ov15 (6B00)" (verified, MAGIC_VERIFY.md; Camp per fix
// #fable-1) and MAGIC_SCREENS.md MAGIC-10/12/13/14/15/16. The pseudocode summarises most menu loops in prose, so every
// routine below was re-read against decode/listings/ov15.lst (`python decode/ecl/hdis.py ov15 START END`): ext-key /
// plain-key split, exit sets (CS set constants decoded), colours, menu strings and the push order of every call
// (first pushed = first Pascal argument; callee declarations from ENGINE/COMBAT/PARTY/VIEW .pas.md).
// Conventions: magic_core.js header, plus (as the COMBAT build):
// - Pascal `var` parameters = ref objects `{ v }`.
// - HorizontalMenu = engine menus.js shape: X.HorizontalMenu(prompt, options, c1, c2, c3, allowExt, animate) -> { key, ext }.
// - Menu-list items (TMenuItem, 2Eh bytes: string[40] +0, header byte +29h, next +2Ah) = { text, header, next }.
// - Globals: RestClock = DS:6DC2..6DCF as 7 words (PARTY.pas.md ov20); ECL memory g.ecl_Mem4900 = the VM's Uint16Array
//   region 0 (word index = byte offset >> 1), as the COMBAT build.
// - Spell table DS:31FA + id*16: +0 class (cleric 0 / magic-user 1), +1 level 1..3, +0Ah effect type; names DS:28E9 + id*29h.

import { g, X, ds, dsPstr, byte, word, chain, charName } from './magic_core.js';
import { IsScroll, CastSpell } from './magic_ov22.js';

// TChar fields (SAVES.md §3)
const MEM_SPELL = 0x17;        // mem_spell[0..20] (+17h..+2Bh); bit 7 = chosen, not yet memorised
const REST_NEED = 0x2C;        // rest_need (MAGIC.pas.md: TChar +2Ch resolved)
const KNOWN_SPELL = 0x32;      // known_spell[id] = +32h + id
const SLOTS_M1 = 0xB1;         // spell_slots[cls*3 + lvl - 1] at +B2h = byte +B1h + cls*3 + lvl
const STATUS = 0x10C, ACTIVE = 0x10D;
// Item fields: power bytes +3Ch..+3Eh = +3Bh + k, k = 1..3 (scroll spell ids, bit 7 = being scribed)
const POWER_M1 = 0x3B;

const spellClass = (id) => ds(0x31FA + id * 16);
const spellLevel = (id) => ds(0x31FB + id * 16);
const spellEffect = (id) => ds(0x3204 + id * 16);
const spellName = (id) => dsPstr(0x28E9 + id * 0x29);

// Pascal string[n] assignment
const str = (s, n) => s.slice(0, n);

// 6B00:0000 RestTimeNeeded(c): minutes of rest needed for the pending memorisations and scribings; sets c^.rest_need.

// RestClock DS:6DC2 = 7 words shared with PARTY ov20 as a JS array (party_ov20.js creates it lazily the same way); the
// shared state may hold the plain DS word there until then.
function restClock() {
  if (!Array.isArray(g.RestClock)) g.RestClock = [0, 0, 0, 0, 0, 0, 0];
  return g.RestClock;
}

export async function RestTimeNeeded(c) {
  let maxMem = 0, maxScr = 0, sumMem = 0, sumScr = 0;                         // 6b00:0006..0012  bytes
  for (let i = 0; i <= 0x14; i++) {                                           // 6b00:0016
    if (c.b[MEM_SPELL + i] > 0x7F) {                                          // 6b00:0029
      const lvl = spellLevel(c.b[MEM_SPELL + i] & 0x7F);                      // 6b00:0048  DS:31FB + id*16
      if (lvl > maxMem) maxMem = lvl;                                         // 6b00:0052
      sumMem = byte(sumMem + lvl);                                            // 6b00:0060  quirk: byte sum
    }
  }
  for (let it = c.items; it !== null; it = it.next) {                         // 6b00:0069  TChar +C8h item list
    if (await IsScroll(it)) {                                                 // 6b00:008a
      for (let k = 1; k <= 3; k++) {                                          // 6b00:0093
        if (it.b[POWER_M1 + k] > 0x7F) {                                      // 6b00:00a6
          const lvl = spellLevel(it.b[POWER_M1 + k] & 0x7F);                  // 6b00:00c5
          if (lvl > maxScr) maxScr = lvl;                                     // 6b00:00cf
          sumScr = byte(sumScr + lvl);                                        // 6b00:00dd
        }
      }
    }
  }
  let need = 0;                                                               // 6b00:00f9
  if (sumMem > 0 || sumScr > 0) need = 4;                                     // 6b00:00fd / 0103
  if (maxMem > 2 || maxScr > 2) need = 6;                                     // 6b00:010d / 0113
  c.b[REST_NEED] = need;                                                      // 6b00:0123
  return word(need * 60 + sumMem * 15 + sumScr * 15);                         // 6b00:0127..014b
}

// 6B00:0159 CancelMemorizing(c): clear every chosen-but-unlearnt slot.
export function CancelMemorizing(c) {
  for (let i = 0; i <= 0x14; i++)                                             // 6b00:015f
    if (c.b[MEM_SPELL + i] > 0x7F) c.b[MEM_SPELL + i] = 0;                    // 6b00:0172 / 0183
  c.b[REST_NEED] = 0;                                                         // 6b00:0191
}

// 6B00:019C CancelScribing(c): clear bit 7 of the power bytes of every scroll.
export async function CancelScribing(c) {
  for (let it = c.items; it !== null; it = it.next) {                         // 6b00:01a2
    if (await IsScroll(it)) {                                                 // 6b00:01c3
      for (let k = 1; k <= 3; k++) it.b[POWER_M1 + k] &= 0x7F;               // 6b00:01cc..01f1
    }
  }
}

// 6B00:0214 CancelAllStudy: for each party member.
export async function CancelAllStudy() {
  for (const c of chain(g.PartyHead)) {                                       // 6b00:021a
    CancelMemorizing(c);                                                      // 6b00:0236
    await CancelScribing(c);                                                  // 6b00:0240
  }
}

// 6B00:025C FreeSlots(lvl, cls): free memorisation slots of SelectedChar for class cls, spell level lvl.
// quirk: the result is a Byte (AL): more memorised spells than slots wraps to 255.. (callers test it unsigned).
export function FreeSlots(lvl, cls) {
  const c = g.SelectedChar;
  let used = 0;                                                               // 6b00:0262
  for (let i = 0; i <= 0x14; i++) {                                           // 6b00:0266
    const m = c.b[MEM_SPELL + i];
    if (m > 0) {                                                              // 6b00:027a  any state
      const id = m & 0x7F;
      if (spellLevel(id) === byte(lvl) && spellClass(id) === byte(cls)) used = byte(used + 1);   // 6b00:029e / 02c0
    }
  }
  return byte(c.b[SLOTS_M1 + cls * 3 + lvl] - used);                          // 6b00:02d1..02f6  (cls, lvl sign-extended)
}

// 6B00:036C CanUseMagic(what): what = 1 cast, 2 memorize, 3 scribe; shows the reason when not possible.
export async function CanUseMagic(what) {
  let msg = '';                                                               // 6b00:0373
  const c = g.SelectedChar;
  if (what === 1 && word(g.ecl_Mem4900[0x1CA >> 1]) > 0) {                   // 6b00:0377 / 0381  ECL 49E5 (ecl_Mem4900^ +1CAh), unsigned
    msg = 'cannot cast spells in this area';                                  // 6b00:0389  CS:0302
  } else if (c.b[STATUS] === 1 || c.b[ACTIVE] === 0) {                        // 6b00:039f / 03ab  Animated or inactive
    msg = 'is in no condition to ';                                           // 6b00:03ba  CS:0322
    if (what === 1) msg = str(msg + 'cast any spells', 40);                   // 6b00:03e4  CS:0339
    else if (what === 2) msg = str(msg + 'memorize spells', 40);              // 6b00:0412  CS:0349
    else if (what === 3) msg = str(msg + 'scribe any scrolls', 40);           // 6b00:0440  CS:0359
  }
  if (msg === '') return true;                                                // 6b00:0458
  await X.ShowCharacterMessage(g.SelectedChar, msg, 0x0A, 1);                 // 6b00:047b
  return false;
}

// 6B00:04A1 CastMenu (stub ov15 e2; ExploreCommand 'C', MagicMenu 'C').
// Pseudo correction (por-build-magic): CanUseMagic(1) is tested once before the loop only; the loop repeats while
// SpellList returned a spell (6b00:0556 jumps back to 04C6, not to the CanUseMagic test at 04B8).
export async function CastMenu() {
  let cast = false;                                                           // 6b00:04a7
  const idx = { v: -1 };                                                      // 6b00:04ab  Integer
  const found = { v: 0 };
  g.sp_CampTarget = null;                                                     // 6b00:04b2  g_6DB5 (word 0)
  g.g_6DB7 = 0;                                                               // 6b00:04b5
  if (!await CanUseMagic(1)) return;                                          // 6b00:04bc
  let s;
  do {
    s = await X.SpellList(0, 1, idx, found);                                  // 6b00:04d6  memorised spells, menu kind 1
    if (s !== 0) {                                                            // 6b00:04de
      cast = true;                                                            // 6b00:04e4
      X.DrawFrame(1, 0x11, 0x26, 0x16, 0);                                    // 6b00:04f7
      X.ClearRectangle(1, 0x11, 0x26, 0x16);                                  // 6b00:0508
      await CastSpell(s, 0, 1, { v: 0 });                                     // 6b00:051c  CastSpell(spell, 0, 1, var dummy [BP-5])
      idx.v = -1;                                                             // 6b00:0521
    } else if (found.v !== 0) {                                               // 6b00:0528
      cast = true;                                                            // 6b00:052e
    } else {
      await X.ShowCharacterMessage(g.SelectedChar, 'has no spells memorized', 0x0A, 1);   // 6b00:0551  CS:0489
    }
  } while (s !== 0);                                                          // 6b00:0556
  if (cast) await X.RedrawCurrentMode();                                      // 6b00:0565
}

// 6B00:05A4 ShowFreeSlots: "<name> can memorize:" and the free slots per class/level; false when no slots at all.
export async function ShowFreeSlots() {
  let any = false;                                                            // 6b00:05ab  [BP-43h]
  const has = [false, false];                                                 // [BP-3Eh + cls]
  const txt = [[], []];                                                       // string[2] [BP-42h + cls*3 + lvl*6]
  for (let cls = 0; cls <= 1; cls++) {                                        // 6b00:05af
    has[cls] = false;                                                         // 6b00:05be
    for (let lvl = 1; lvl <= 3; lvl++) {                                      // 6b00:05c2
      txt[cls][lvl] = str(X.ByteToStr(FreeSlots(lvl, cls)), 2);               // 6b00:05da / 05de / 0608
      if (g.SelectedChar.b[SLOTS_M1 + cls * 3 + lvl] === 0) txt[cls][lvl] = ' ';   // 6b00:0625 / 0657  CS:056E
      else { has[cls] = true; any = true; }                                   // 6b00:0664 / 0668
    }
  }
  if (any) {                                                                  // 6b00:067e
    await X.ShowCharacterMessage(g.SelectedChar, 'can memorize:', 0x0A, 0);   // 6b00:06a4  CS:0570
    let row = 3;                                                              // 6b00:06a9  [BP-42h] reused
    for (let cls = 0; cls <= 1; cls++) {                                      // 6b00:06ad
      if (!has[cls]) continue;                                                // 6b00:06bc
      const hdr = cls === 0 ? '    Cleric Spells:' : 'Magic-User Spells:';    // 6b00:06cc / 06e5  CS:057E / CS:0591
      X.DrawText(1, row + 0x11, 0x0A, hdr);                                   // 6b00:070c
      let col = 0x13;                                                         // 6b00:0711
      for (let lvl = 1; lvl <= 3; lvl++) {                                    // 6b00:0715
        X.DrawText(col + 1, row + 0x11, 0x0A, txt[cls][lvl]);                 // 6b00:0752  columns 20, 23, 26
        col += 3;                                                             // 6b00:0757
      }
      row++;                                                                  // 6b00:0761
    }
  }
  return any;                                                                 // 6b00:076d
}

// 6B00:077A Rest(var interrupted): preset the rest clock from the longest study need, run the rest loop (PARTY ov20).
export async function Rest(interrupted) {
  let t = 0;                                                                  // 6b00:0780  Word
  for (const c of chain(g.PartyHead)) {                                       // 6b00:0785
    const n = await RestTimeNeeded(c);                                        // 6b00:07a1
    if (t < n) t = n;                                                         // 6b00:07aa  unsigned
  }
  restClock()[3] = Math.floor(t / 60);                                        // 6b00:07d2  DS:6DC8 hours
  g.RestClock[2] = Math.floor((t - 60 * g.RestClock[3]) / 10);                // 6b00:07ea  DS:6DC6 ten-minutes
  g.RestClock[1] = t % 10;                                                    // 6b00:07f7  DS:6DC4 minutes
  interrupted.v = (await X.RestLoop()) ? 1 : 0;                               // 6b00:07fd / 0805
  restClock().fill(0);                                                        // 6b00:0814  FillChar(RestClock{g_6DC2}, 0Eh, 0): 7 words DS:6DC2..6DCF
  await X.DrawLocationTimeStatus();                                           // 6b00:0819
}

// 6B00:0824 SortMemorized: exchange sort of SelectedChar's mem_spell bytes by (id and 7Fh) ascending.
export function SortMemorized() {
  const b = g.SelectedChar.b;
  for (let i = 0; i <= 0x13; i++) {                                           // 6b00:082a .. 08b2
    for (let j = i; j <= 0x14; j++) {                                         // 6b00:083a
      if ((b[MEM_SPELL + i] & 0x7F) > (b[MEM_SPELL + j] & 0x7F)) {            // 6b00:0866  unsigned
        const t = b[MEM_SPELL + i];                                           // 6b00:0879
        b[MEM_SPELL + i] = b[MEM_SPELL + j];                                  // 6b00:0896
        b[MEM_SPELL + j] = t;                                                 // 6b00:08a8
      }
    }
  }
}

// 6B00:090A MemorizeMenu.
export async function MemorizeMenu() {
  if (!await CanUseMagic(2)) return;                                          // 6b00:0914
  let done = false;                                                           // 6b00:091e
  const idx = { v: -1 };                                                      // 6b00:0922
  const found = { v: 0 };
  let s = await X.SpellList(5, 0, idx, found);                                // 6b00:0937  pending list
  let changed = true;                                                         // 6b00:093f
  if (found.v !== 0) {                                                        // 6b00:0943
    if (await X.AskYesNo('Memorize These Spells? ', 0x0E, 0x0A, 0x0F) === 'N') CancelMemorizing(g.SelectedChar);   // 6b00:0961 / 0973  CS:08BF
    else done = true;                                                         // 6b00:0978
  } else changed = false;                                                     // 6b00:097e
  idx.v = -1;                                                                 // 6b00:0982
  while (!done) {                                                             // 6b00:0987
    done = !await ShowFreeSlots();                                            // 6b00:0991 / 099b
    if (done) {
      await X.ShowCharacterMessage(g.SelectedChar, 'cannot memorize any spells', 0x0A, 1);   // 6b00:09c1  CS:08D7
    } else {
      s = await X.SpellList(1, 2, idx, found);                                // 6b00:09d9  from the spell book
      changed = true;                                                         // 6b00:09e1
      if (s === 0) done = true;                                               // 6b00:09e5
      else if (FreeSlots(spellLevel(s), spellClass(s)) > 0) {                 // 6b00:0a12  FreeSlots(lvl, cls); quirk: unsigned byte test
        let i = 0;                                                            // 6b00:0a19
        while (g.SelectedChar.b[MEM_SPELL + i] !== 0) i = byte(i + 1);        // 6b00:0a28  quirk: no bound (slots are counted first)
        g.SelectedChar.b[MEM_SPELL + i] = byte(s + 0x80);                     // 6b00:0a49
        SortMemorized();                                                      // 6b00:0a4e
      }
    }
  }
  if (idx.v !== -1) {                                                         // 6b00:0a54
    idx.v = -1;                                                               // 6b00:0a5a
    s = await X.SpellList(5, 0, idx, found);                                  // 6b00:0a6f
    if (found.v !== 0 &&
        await X.AskYesNo('Memorize these spells? ', 0x0E, 0x0A, 0x0F) === 'N')   // 6b00:0a77 / 0a95  CS:08F2
      CancelMemorizing(g.SelectedChar);                                       // 6b00:0aa7
  }
  if (changed) await X.RedrawCurrentMode();                                   // 6b00:0aaa / 0ab0
}

// 6B00:0B5B ScribeMenu.
export async function ScribeMenu() {
  if (!await CanUseMagic(3)) return;                                          // 6b00:0b65
  let done = false;                                                           // 6b00:0b6f
  const idx = { v: -1 };                                                      // 6b00:0b73
  const found = { v: 0 };
  let s = await X.SpellList(6, 0, idx, found);                                // 6b00:0b88  pending scribings
  let changed = true;                                                         // 6b00:0b90
  if (found.v !== 0) {                                                        // 6b00:0b94
    if (await X.AskYesNo('Scribe These Spells? ', 0x0E, 0x0A, 0x0F) === 'N') await CancelScribing(g.SelectedChar);   // 6b00:0bb2 / 0bc4  CS:0AB9
    else done = true;                                                         // 6b00:0bc9
  } else changed = false;                                                     // 6b00:0bcf
  idx.v = -1;                                                                 // 6b00:0bd3
  while (!done) {                                                             // 6b00:0bd8
    s = await X.SpellList(3, 3, idx, found);                                  // 6b00:0bf1  spells on scrolls
    if (s === 0) {                                                            // 6b00:0bf9
      done = true;                                                            // 6b00:0bff
      if (found.v === 0) await X.ShowCharacterMessage(g.SelectedChar, 'has no copyable scrolls', 0x0A, 1);   // 6b00:0c26  CS:0ACF
      else changed = true;                                                    // 6b00:0c2d
      continue;
    }
    changed = true;                                                           // 6b00:0c34
    const c = g.SelectedChar;
    if (c.b[KNOWN_SPELL + s] !== 0) {                                         // 6b00:0c43
      await X.ShowTimedBottomMessage('You already know that spell');          // 6b00:0c59  CS:0AE7
      continue;
    }
    let already = false;                                                      // 6b00:0c75
    for (let it = c.items; it !== null && !already; it = it.next) {           // 6b00:0c79 / 0c81
      if (await IsScroll(it)) {                                               // 6b00:0c8d
        for (let k = 1; k <= 3; k++) {                                        // 6b00:0c96
          if (it.b[POWER_M1 + k] > 0x7F && (it.b[POWER_M1 + k] & 0x7F) === s) {   // 6b00:0ca9 / 0cc0
            await X.ShowTimedBottomMessage('You are already scibing that spell');  // 6b00:0cd4  CS:0B03 (sic)
            already = true;                                                   // 6b00:0cd9  quirk: the k loop runs on
          }
        }
      }
    }
    if (already) continue;                                                    // 6b00:0cf6
    if (c.b[SLOTS_M1 + spellClass(s) * 3 + spellLevel(s)] > 0) {              // 6b00:0d2f  spell_slots[cls*3+lvl-1] (fix #fable-4)
      let marked = false;                                                     // [BP-0Dh] still 0 here
      for (let it = c.items; it !== null && !marked; it = it.next) {          // 6b00:0d3a / 0d4e
        // quirk: no IsScroll test here — the first item with a power byte equal to s is marked
        for (let k = 1; k <= 3 && !marked; k++) {                             // 6b00:0d5c / 0d9a / 0da0
          if (it.b[POWER_M1 + k] === s) {                                     // 6b00:0d6e
            it.b[POWER_M1 + k] |= 0x80;                                       // 6b00:0d81
            marked = true;                                                    // 6b00:0d93
          }
        }
      }
    } else {
      await X.ShowTimedBottomMessage('You can not scribe that spell.');       // 6b00:0dca  CS:0B26
    }
  }
  if (idx.v !== -1) {                                                         // 6b00:0dd2
    idx.v = -1;                                                               // 6b00:0dd8
    s = await X.SpellList(6, 0, idx, found);                                  // 6b00:0ded
    if (found.v !== 0 &&
        await X.AskYesNo('Scribe these spells? ', 0x0E, 0x0A, 0x0F) === 'N')  // 6b00:0df5 / 0e13  CS:0B45
      await CancelScribing(g.SelectedChar);                                   // 6b00:0e25
  }
  if (changed) await X.RedrawCurrentMode();                                   // 6b00:0e28 / 0e2e
}

// 6B00:0E37 AddLine(header, text) — nested in DisplayEffects: append a TMenuItem to the parent's list tail.
// Pascal order corrected (por-build-magic): the header byte is pushed first ([BP+0Ch]), then the string ([BP+8]),
// then the parent frame link ([BP+6]); MAGIC.pas.md wrote AddLine(text, isHeader).
function AddLine(frame, header, text) {
  const item = { text: str(text, 40), isHeader: byte(header), next: null };      // 6b00:0e4b..0eb4  GetMem(2Eh)
  frame.tail.next = item;                                                     // 6b00:0e60  parent [BP-0Ch]
  frame.tail = item;                                                          // 6b00:0e7a
}

// Effect types shown with the name of the first spell whose table field +0Ah equals the type (6b00:1059..10b5).
const SPELL_EFFECT_TYPES = [1, 2, 5, [8, 0x0E], 0x10, 0x11, [0x13, 0x19], 0x1C, 0x1D, [0x20, 0x22], [0x24, 0x27],
  0x29, 0x2A, 0x2D, 0x2E, 0x31, [0x33, 0x35]];
const FIXED_EFFECT_TEXT = {                                                   // 6b00:1148..12af (CS:0EC8..0F95)
  0x04: 'Studying Manual of Bodily Health', 0x07: 'Training with Manual of Bodily Health', 0x1B: 'Feather Fall',
  0x1F: 'Helpless', 0x23: 'Prayer', 0x2C: 'Cause Disease', 0x32: 'Dreaded Mummy Disease', 0x36: 'Repulsed',
  0x37: 'Poisoned', 0x3B: 'Regenerating', 0x3D: 'Fire Resistance', 0x47: 'Invisible', 0x48: 'Camouflaged',
  0x59: 'Displaced',
};
const inList = (v, list) => list.some((x) => Array.isArray(x) ? v >= x[0] && v <= x[1] : v === x);

// 6B00:0FBC DisplayEffects: every party member with the spell effects on him, in a scrolling list 'Display'.
export async function DisplayEffects() {
  const head = { text: ' ', isHeader: 0, next: null };                          // 6b00:0fc7 .. 1002  first line: ' ' (CS:0EBE)
  const frame = { tail: head };                                               // [BP-0Ch]; [BP-8] = head
  for (const c of chain(g.PartyHead)) {                                       // 6b00:1006
    let lines = 0;                                                            // 6b00:101e  [BP-13h]
    AddLine(frame, 1, charName(c));                                           // 6b00:102c  name line (header)
    for (let e = c.effects; e !== null; e = e.next) {                         // 6b00:102f  TChar +7Fh, next at +5
      let show = true;                                                        // 6b00:104c
      const type = e.b[0];                                                    // 6b00:1053
      let t = '';
      if (inList(type, SPELL_EFFECT_TYPES)) {                                 // 6b00:105c..10b5
        let found = false;
        for (let id = 1; id <= 0x38 && !found; id++) {                        // 6b00:10ba / 10c2
          if (spellEffect(id) === type) { t = spellName(id); found = true; }  // 6b00:10d9 / 10ff
        }
        if (!found) t = str('Funky--' + X.ByteToStr(type), 40);               // 6b00:111e  CS:0EC0
      } else if (type in FIXED_EFFECT_TEXT) {
        t = FIXED_EFFECT_TEXT[type];
      } else show = false;                                                    // 6b00:12af  not listed
      if (show) {                                                             // 6b00:12b3
        lines = byte(lines + 1);                                              // 6b00:12b9
        AddLine(frame, 0, ' ' + t);                                           // 6b00:12db
      }
    }
    if (lines === 0) AddLine(frame, 0, ' <No Spell Effects>');                // 6b00:12f2 / 130c  CS:0F9F
    AddLine(frame, 0, ' ');                                                   // 6b00:1323
  }
  const redraw = { v: 1 };                                                    // 6b00:133c  [BP-17h]
  const index = { v: 0 };                                                     // 6b00:1342  [BP-42h]
  const item = { v: frame.tail };                                             // [BP-0Ch]
  X.DrawTitledFrame(1, 1, 0x26, 0x16, 0, 0x0F, 'Display');                    // 6b00:1366  CS:0FB3
  await X.VerticalListMenu('', '', 0x0B, 0x0A, 0x0F, 1, 4, 0x26, 0x16, head, 1, redraw, index, item);   // 6b00:13b6
  X.FreeMenuList({ v: head });                                                // 6b00:13c3  FreeMenuList(var list)
  await X.RedrawCurrentMode();                                                // 6b00:13c8
}

// 6B00:13F1 MagicMenu(var done) — camp 'M'.
// Pseudo correction (por-build-magic): as Camp (fix #fable-1), an extended key cycles the selection; other plain keys
// do nothing (no "select a character" else). Exit set CS:13D1 = [#0, 'E'].
export async function MagicMenu(done) {
  let key = ' ';                                                              // 6b00:13f7
  while (!done.v && !(key === '\0' || key === 'E')) {                         // 6b00:13fb / 140f
    const r = await X.HorizontalMenu('', dsPstr(0x0531), 0x0D, 0x0A, 0x0F, 1, 1);   // 6b00:1442  'Cast Memorize Scribe Display Rest Exit'
    key = r.key;                                                              // 6b00:1447
    if (r.ext) {                                                              // 6b00:144a
      X.CycleSelectedChar(key);                                               // 6b00:1454
      await X.DrawPartyRoster(g.SelectedChar);                                // 6b00:1461
    } else if (key === 'C') await CastMenu();                                 // 6b00:1470
    else if (key === 'M') await MemorizeMenu();                               // 6b00:147a
    else if (key === 'S') await ScribeMenu();                                 // 6b00:1484
    else if (key === 'D') await DisplayEffects();                             // 6b00:148e
    else if (key === 'R') await Rest(done);                                   // 6b00:149d
  }
}

// 6B00:14A9 MoveSelectedDown (PartyOrder Home/'G').
// Pseudo correction (por-build-magic): the bytes move SelectedChar one place towards the FRONT of the PartyHead list
// (swap with its predecessor); the first member wraps to the end.
export function MoveSelectedDown() {
  const sel = g.SelectedChar;
  let p = g.PartyHead, prev = null;                                           // 6b00:14af / 14bc
  if (p === sel) {                                                            // 6b00:14ca
    while (p.next !== null) p = p.next;                                       // 6b00:14d6  p := last
  } else {
    while (p.next !== sel) { prev = p; p = p.next; }                          // 6b00:14fc / 1515  p := predecessor of sel
  }
  const n = sel.next;                                                         // 6b00:1536
  if (g.PartyHead === sel) {                                                  // 6b00:154a  first -> end
    if (n !== null) g.PartyHead = n;                                          // 6b00:155d
    p.next = sel;                                                             // 6b00:1579
    sel.next = null;                                                          // 6b00:1586
  } else {
    p.next = n;                                                               // 6b00:159e
    sel.next = p;                                                             // 6b00:15b1
    if (p === g.PartyHead || prev === null) g.PartyHead = sel;                // 6b00:15c5 / 15d1
    else prev.next = sel;                                                     // 6b00:15f0
  }
}

// 6B00:1601 MoveSelectedUp (PartyOrder End/'O').
// Pseudo correction (por-build-magic): the bytes move SelectedChar one place towards the END (swap with its
// successor); the last member wraps to the front.
export function MoveSelectedUp() {
  const sel = g.SelectedChar;
  let p = g.PartyHead;                                                        // 6b00:1607
  while (p !== sel && p.next !== sel) p = p.next;                             // 6b00:161a / 1633  p := predecessor (or sel when first)
  const n = sel.next;                                                         // 6b00:1654
  if (n === null) {                                                           // 6b00:1668  last -> front
    sel.next = g.PartyHead;                                                   // 6b00:167b
    g.PartyHead = sel;                                                        // 6b00:168c
    p.next = n;                                                               // 6b00:1699  nil
  } else {
    sel.next = n.next;                                                        // 6b00:16b5
    if (g.PartyHead === sel) g.PartyHead = n;                                 // 6b00:16ca / 16dc
    if (p !== sel) p.next = n;                                                // 6b00:16e9 / 16fb
    n.next = sel;                                                             // 6b00:1712
  }
}

// 6B00:1780 PartyOrder — Alter 'O'. Exit set CS:1720 = [#0, 'E']; mode toggle set CS:174E = [#13, 'P', 'S'].
export async function PartyOrder() {
  let place = 0;                                                              // 6b00:1786  0 select, 1 place
  let key = ' ';                                                              // 6b00:178a
  while (!(key === '\0' || key === 'E')) {                                    // 6b00:178e / 1797
    const opts = dsPstr(0x0584 + place * 0x29);                               // 6b00:17bb  'Select Exit' / DS:05AD 'Place Exit'
    const r = await X.HorizontalMenu('Party Order: ', opts, 0x0D, 0x0A, 0x0F, 1, 1);   // 6b00:17d5  CS:1740
    key = r.key;                                                              // 6b00:17da
    if (r.ext) {                                                              // 6b00:17dd
      if (place === 0) {                                                      // 6b00:17e3
        X.CycleSelectedChar(key);                                             // 6b00:17ed
        await X.DrawPartyRoster(g.SelectedChar);                              // 6b00:17fa
      } else {
        if (key === 'G') MoveSelectedDown();                                  // 6b00:1809  Home (scan 47h)
        else if (key === 'O') MoveSelectedUp();                               // 6b00:1813  End (scan 4Fh)
        await X.DrawPartyRoster(g.SelectedChar);                              // 6b00:181e
      }
    } else if (key === '\r' || key === 'P' || key === 'S') {                  // 6b00:182e  set CS:174E
      place = place ? 0 : 1;                                                  // 6b00:1835
      if (place) await X.ShowCharacterMessage(g.SelectedChar, 'has been selected', 0x0A, 0);   // 6b00:1864  CS:176E
      else await X.ClearCharacterMessage();                                   // 6b00:186b
    }
  }
}

// 6B00:18E5 DropCharacter — Alter 'D'.
export async function DropCharacter() {
  const sel = g.SelectedChar;
  if (sel.next === null && sel === g.PartyHead) {                             // 6b00:18ef / 1902  the only member
    if (await X.AskYesNo('quit TO DOS: ', 0x0E, 0x0A, 0x0F) === 'Y') {        // 6b00:1926  CS:1877
      await X.RemoveFromParty(0, 1);                                          // 6b00:1935  (keepCount false, freeIcon true)
      await X.TerminateGame();                                                // 6b00:193a
    }
    return;
  }
  await X.ShowCharacterMessage(g.SelectedChar, 'will be gone', 0x0A, 0);      // 6b00:1964  CS:1885
  if (await X.AskYesNo('Drop from party? ', 0x0E, 0x0A, 0x0F) === 'Y') {      // 6b00:1981  CS:1892
    if (g.SelectedChar.b[ACTIVE] !== 0)                                       // 6b00:1991
      await X.ShowCharacterMessage(g.SelectedChar, 'bids you farewell', 0x0A, 1);       // 6b00:19b6  CS:18A4
    else await X.ShowCharacterMessage(g.SelectedChar, 'is dumped in a ditch', 0x0A, 1);  // 6b00:19da  CS:18B6
    await X.RemoveFromParty(0, 1);                                            // 6b00:19e5
    X.ClearRectangle(0x11, 1, 0x26, 0x0B);                                    // 6b00:19f6  roster area
    await X.DrawPartyRoster(g.SelectedChar);                                  // 6b00:1a03
  } else {
    await X.ShowCharacterMessage(g.SelectedChar, 'Breathes A sigh of relief', 0x0A, 1);  // 6b00:1a27  CS:18CB
  }
}

// 6B00:1A97 GameSpeedMenu — Alter 'S'. Exit set CS:1A77 = [#0, 'E'].
// Ext ↓ (50h) / ↑ (48h) are bounded 0..9; 'F' / 'S' are not (quirk: safe only because ' Faster' / ' Slower' are
// offered only inside the range — MAGIC_VERIFY note).
export async function GameSpeedMenu() {
  let key;
  do {
    X.DrawText(1, 0x12, 0x0A, 'Game Speed = ' + X.ByteToStr(g.GameSpeed) + ' (0=fastest 9=slowest)');   // 6b00:1ad5  CS:1A30 / CS:1A3E
    let opts = '';                                                            // 6b00:1ada
    if (g.GameSpeed > 0) opts = str(opts + ' Faster', 40);                    // 6b00:1ade / 1b08  CS:1A55
    if (g.GameSpeed < 9) opts = str(opts + ' Slower', 40);                    // 6b00:1b0d / 1b37  CS:1A5D
    opts = str(opts + ' Exit', 40);                                           // 6b00:1b5f  CS:1A65
    const r = await X.HorizontalMenu('Game Speed:', opts, 0x0D, 0x0A, 0x0F, 1, 1);   // 6b00:1b8c  CS:1A6B
    key = r.key;                                                              // 6b00:1b91
    if (r.ext) {                                                              // 6b00:1b94
      if (key === '\x50') { if (g.GameSpeed > 0) g.GameSpeed = byte(g.GameSpeed - 1); }   // 6b00:1b9d / 1ba8
      else if (key === '\x48') { if (g.GameSpeed < 9) g.GameSpeed = byte(g.GameSpeed + 1); }   // 6b00:1bae / 1bb9
    } else if (key === 'F') g.GameSpeed = byte(g.GameSpeed - 1);              // 6b00:1bc2 / 1bc6
    else if (key === 'S') g.GameSpeed = byte(g.GameSpeed + 1);                // 6b00:1bcc / 1bd0
  } while (!(key === '\0' || key === 'E'));                                   // 6b00:1bdd
  await X.ClearCharacterMessage();                                            // 6b00:1be7
}

// 6B00:1C59 AlterMenu — camp 'A'. Exit set CS:1BF0 = [#0, 'E'] (outer and the Pics submenu).
export async function AlterMenu() {
  let key = ' ';                                                              // 6b00:1c60
  while (!(key === '\0' || key === 'E')) {                                    // 6b00:1c64 / 1c6d
    const r = await X.HorizontalMenu('Alter: ', dsPstr(0x055A), 0x0D, 0x0A, 0x0F, 1, 1);   // 6b00:1c9f  'Order Drop Speed Icon Pics Exit'
    key = r.key;                                                              // 6b00:1ca4
    if (r.ext) {                                                              // 6b00:1ca7
      X.CycleSelectedChar(key);                                               // 6b00:1cb1
      await X.DrawPartyRoster(g.SelectedChar);                                // 6b00:1cbe
    } else if (key === 'O') await PartyOrder();                               // 6b00:1cce
    else if (key === 'D') await DropCharacter();                              // 6b00:1cd9
    else if (key === 'S') await GameSpeedMenu();                              // 6b00:1ce4
    else if (key === 'I') {
      await X.IconEditor();                                                   // 6b00:1cee  PARTY ov16
      await X.RedrawCurrentMode();                                            // 6b00:1cf3
    } else if (key === 'P') {                                                 // 6b00:1cfb
      let k;
      do {
        let opts = g.opt_MonsterPics !== 0 ? 'Monsters on  ' : 'Monsters off  ';   // 6b00:1d02 .. 1d2c  CS:1C18 / CS:1C26
        opts = str(opts + (g.opt_Portraits !== 0 ? 'Portraits on  ' : 'Portraits off  '), 40);   // 6b00:1d31 .. 1d85  CS:1C35 / CS:1C44
        opts = str(opts + 'Exit', 40);                                        // 6b00:1dad  CS:1C54
        const rr = await X.HorizontalMenu('', opts, 0x0D, 0x0A, 0x0F, 0, 1);  // 6b00:1dda  allowExt 0
        k = rr.key;                                                           // 6b00:1ddf
        if (k === 'M') g.opt_MonsterPics = g.opt_MonsterPics === 0 ? 1 : 0;   // 6b00:1de5 / 1df3  g_49F6
        else if (k === 'P') g.opt_Portraits = g.opt_Portraits === 0 ? 1 : 0;  // 6b00:1df8 / 1e06  g_49F5
      } while (!(k === '\0' || k === 'E'));                                   // 6b00:1e12  set CS:1BF0
    }
  }
}

// 6B00:1E6F Camp(var done) — stub ov15 e1 (Encamp key / ECL PROGRAM 9 via ecl_CampCheck). Fix #fable-1.
// JS mapping of the var parameter: `done` may be passed as a ref { v }; the routine also resolves to done as a boolean
// (magic.js host: `const rested = await Camp()`).
export async function Camp(done = { v: 0 }) {
  const saved = g.game_Mode;                                                  // 6b00:1e75  g_49F3
  g.game_Mode = 2;                                                            // 6b00:1e7b
  g.HealCounter = 0;                                                          // 6b00:1e82  g_6DD8
  restClock().fill(0);                                                        // 6b00:1e91  FillChar(RestClock{g_6DC2}, 0Eh, 0)
  await X.RedrawCurrentMode();                                                // 6b00:1e96
  X.ClearRectangle(1, 0x11, 0x26, 0x16);                                      // 6b00:1ea7
  X.DrawText(1, 0x12, 0x0A, 'The party makes camp...');                       // 6b00:1ec4  CS:1E23
  await CancelAllStudy();                                                     // 6b00:1eca
  done.v = 0;                                                                 // 6b00:1ed0
  let key = ' ';                                                              // 6b00:1ed4
  while (!done.v && !(key === '\0' || key === 'E')) {                         // 6b00:1ed8 / 1eed  set CS:1E3B
    const r = await X.HorizontalMenu('Camp: ', dsPstr(0x0508), 0x0D, 0x0A, 0x0F, 1, 1);   // 6b00:1f1f  'Save View Magic Rest Alter Exit'
    key = r.key;                                                              // 6b00:1f24
    if (r.ext) {                                                              // 6b00:1f27
      X.CycleSelectedChar(key);                                               // 6b00:1f31
      await X.DrawPartyRoster(g.SelectedChar);                                // 6b00:1f3e
    } else if (key === 'S') {                                                 // 6b00:1f48
      await X.SaveGame();                                                     // 6b00:1f4c
      if (await X.AskYesNo('Quit TO DOS ', 0x0E, 0x0A, 0x0F) === 'Y') await X.TerminateGame();   // 6b00:1f69 / 1f72  CS:1E62
    } else if (key === 'V') {
      await X.ViewMenu({ v: 0 });                                             // 6b00:1f82  var byte local [BP-3]
    } else if (key === 'M') await MagicMenu(done);                            // 6b00:1f93
    else if (key === 'R') await Rest(done);                                   // 6b00:1fa2
    else if (key === 'A') await AlterMenu();                                  // 6b00:1fac
  }
  await CancelAllStudy();                                                     // 6b00:1fb3
  g.sp_CampTarget = null;                                                     // 6b00:1fb8  g_6DB5 (word 0)
  g.g_6DB7 = 0;                                                               // 6b00:1fbb
  g.game_Mode = saved;                                                        // 6b00:1fc1
  await X.DrawLocationTimeStatus();                                           // 6b00:1fc4
  await X.ClearCharacterMessage();                                            // 6b00:1fc9
  X.ClearMenuLine();                                                          // 6b00:1fce
  return !!done.v;
}

// 6B00:1FD9 ov15_init — empty.
export function ov15_init() {}
