// game/areas/res_00ba_u.js — resident unit 00BA part U (00BA:0000 .. 00BA:148B), lane por-build-res00ba.
// Source: decode/pseudo/ENGINE.pas.md "## res_00BA (00BA) part U"; evidence decode/listings/res_00BA.lst (H routines
// 0000, 0442, 0767, 09E3, 0BB8 re-read against the asm while translating); fields by decode/data/SAVES.md.
// Conventions: game/areas/res_00ba_core.js (records c.b / item.b / c.readied[0..12], g, X, ds).
//
// Sync / async: everything here is synchronous except DrawCharacterSummary (ShowCharacterMessage, DrawWrappedText wait).
// RecalcCharacter and BuildItemName are called without await by other areas, so they must stay sync — they rely on
// HasEffect (part V) being a pure synchronous list walk (00BA:2199).
//
// Values in "60 − x" units (SAVES.md): thac0 +110h / base_thac0 +2Dh, ac +111h / base_ac +A9h: bigger = better.

import { g, X, ds, dsPstr, byte, word, shortint, integer, S8, rdW, wrW, pstr, setPstr, charName } from './res_00ba_core.js';
import { text as TXT } from '../engine/text.js';
import { HasEffect, DrawCharacterName, ShowCharacterMessage } from './res_00ba_v.js';
import { pointer, setPointerRegion, KEY } from '../engine/input.js';

// ITEMS[t].j = DS:5582 + t*16 + j (SAVES.md §6): j0 slot, j1 hands, j6 ac_value, j9 dice, j10 sides, j11 dmg_bonus, j14 wflags2
const ITEMS = (t, j) => ds(0x5582 + t * 16 + j);
const rd = (c, k) => (c.readied ? c.readied[k] ?? null : null);   // c^.readied[k] (+CCh + k*4), nil if never rebuilt

function hasEffect(c, id) {                    // HasEffect(c, id, var node) — 00BA:2199 (part V), must be sync here
  const r = HasEffect(c, id, { v: null });
  if (r && typeof r.then === 'function') throw new Error('res_00ba_u: HasEffect must be synchronous (00BA:2199)');
  return !!r;
}

// 00BA:0000 RecalcWeaponStats(c) — THAC0 and attack-1 damage from the readied weapon (readied[0] = +CCh)
export function RecalcWeaponStats(c) {
  const w = rd(c, 0);                                                         // { 00ba:0006 }
  if (w === null) return;                                                     // { 00ba:0019 }
  const t = w.b[0x2E] /* type */;                                             // { 00ba:0024 }
  c.b[0x110] /* thac0 */ = c.b[0x2D] /* base_thac0 */;                        // { 00ba:002e }
  if ((ITEMS(t, 14) & 2) !== 0)                                               // { 00ba:003d  wflags2 bit 1 }
    c.b[0x110] = byte(c.b[0x110] + DexMissileAdj(c));                         // { 00ba:0052 }
  c.b[0x119] /* dmg_bonus[1] */ = ITEMS(t, 11);                               // { 00ba:0073 }
  if ((ITEMS(t, 14) & 4) !== 0) {                                             // { 00ba:008a  wflags2 bit 2 }
    c.b[0x110] = byte(c.b[0x110] + StrToHitAdj(c));                           // { 00ba:009f }
    c.b[0x119] = byte(S8(c.b, 0x119) + StrDamageAdj(c));                      // { 00ba:00c0 }
  }
  let plus = S8(w.b, 0x32) /* plus */;                                        // { 00ba:00e0  ShortInt }
  if (ITEMS(t, 14) > 0x7F && rd(c, 12) !== null)                              // { 00ba:00ea  bit 7: quarrels +FCh }
    plus = shortint(plus + S8(rd(c, 12).b, 0x32));                            // { 00ba:010b }
  if ((ITEMS(t, 14) & 1) !== 0 && rd(c, 11) !== null)                         // { 00ba:0123  bit 0: arrows +F8h }
    plus = shortint(plus + S8(rd(c, 11).b, 0x32));                            // { 00ba:0147 }
  c.b[0x119] = byte(S8(c.b, 0x119) + plus);                                   // { 00ba:015f }
  const wt = w.b[0x2E];
  if (c.b[0x2E] /* race */ === 2 &&                                           // { 00ba:0178  Elf }
      ((wt > 0x28 && wt < 0x2D) || wt === 0x25 || wt === 0x24))
    plus = shortint(plus + 1);                                                // { 00ba:01aa }
  // quirk: the elf bonus is added to THAC0 only (plus was already added to the damage bonus).
  c.b[0x110] = byte(c.b[0x110] + plus);                                       // { 00ba:01ad }
  c.b[0x115] /* dmg_dice[1] */ = ITEMS(t, 9);                                 // { 00ba:01c7 }
  c.b[0x117] /* dmg_sides[1] */ = ITEMS(t, 10);                               // { 00ba:01de }
}

// 00BA:01FB ArmourMoveLimit(c, item) — body armour (slot 2) limits movement by weight
export function ArmourMoveLimit(c, item) {
  if (ITEMS(item.b[0x2E], 0) /* slot */ !== 2) return;                        // { 00ba:01fe }
  const w = rdW(item.b, 0x37) /* weight */;                                   // { 00ba:0214 }
  if (w <= 150) c.b[0x11C] /* move */ = c.b[0x72] /* base_move */;            // { 00ba:021b }
  else if (w >= 151 && w <= 399) c.b[0x11C] = 9;                              // { 00ba:0236 }
  else c.b[0x11C] = 6;                                                        // { 00ba:024b }
  // quirk: magic armour adds 3 only when the limit is <= 9 (12 stays 12, 9 -> 12, 6 -> 9)
  if (item.b[0x32] /* plus */ !== 0 && c.b[0x11C] <= 9)                       // { 00ba:0254 }
    c.b[0x11C] = byte(c.b[0x11C] + 3);                                        // { 00ba:0269 }
}

// 00BA:0282 AddItemAC(c, item, var part[0..4]: ShortInt, var magicArmour: Boolean)
// part = the caller's ShortInt array (passed by reference, 60−AC units); magicArmour = { v } ref.
export function AddItemAC(c, item, part, magicArmour) {
  let acv = ITEMS(item.b[0x2E], 6) /* ac_value */;                            // { 00ba:0288 }
  if (acv <= 0x7F) return;                                                    // { 00ba:029e  not an AC item }
  acv &= 0x7F;                                                                // { 00ba:02a7 }
  const slot = ITEMS(item.b[0x2E], 0);                                        // { 00ba:02af }
  const plus = S8(item.b, 0x32);
  if (slot === 1) {                                                           // { 00ba:02c5  shield }
    part[1] = shortint(acv + plus);                                           // { 00ba:02cb }
  } else if (acv === 0) {                                                     // { 00ba:02e6  protection item }
    if (slot === 9) {                                                         // { 00ba:02ec  ring: best one only }
      if (plus > part[3]) part[3] = plus;                                     // { 00ba:02f2  signed }
    } else {
      part[2] = shortint(part[2] + plus);                                     // { 00ba:0312 }
    }
    c.b[0x101] /* ac_item_bonus */ = byte(S8(c.b, 0x101) + S8(item.b, 0x33) /* plus2 */);   // { 00ba:032d }
  } else if (acv + plus > part[4]) {                                          // { 00ba:034c  signed 16-bit compare }
    part[4] = shortint(acv + plus);                                           // { 00ba:036b }
    if (plus > 0 && slot === 2) magicArmour.v = true;                         // { 00ba:0383 }
  }
}

// 00BA:03A0 EncumbranceMoveLimit(c)
export function EncumbranceMoveLimit(c) {
  // quirk: LongInt(encumbrance) − allowance, but only the low word is kept and tested (signed)
  let e = integer(rdW(c.b, 0x102) /* encumbrance */ - StrWeightAllowance(c)); // { 00ba:03a6 }
  if (e < 0) e = 0;                                                           // { 00ba:03c6 }
  let m;
  if (e >= 0 && e <= 512) m = c.b[0x11C] /* move */;                          // { 00ba:03d4 }
  else if (e >= 513 && e <= 768) m = 9;                                       // { 00ba:03eb }
  else if (e >= 769 && e <= 1024) m = 6;                                      // { 00ba:03fb }
  else m = 3;                                                                 // { 00ba:040b }
  if (m < c.b[0x11C]) c.b[0x11C] = m;                                         // { 00ba:040f  unsigned }
}

// 00BA:0442 BuildItemName(c, item, col, row, withReady, draw) — builds item^.name (string[40] at +00h); c unused
export function BuildItemName(c, item, col, row, withReady, draw) {
  let name = '';
  const asg = (s) => { name = s.substring(0, 40); setPstr(item.b, 0, name, 40); };   // StrAssign 28h
  asg('');                                                                    // { 00ba:0449 }
  if (withReady) {                                                            // { 00ba:0450 }
    if (item.b[0x34] /* readied */ !== 0) asg(' Yes  ');                      // { 00ba:0456 }
    else asg(' No   ');                                                       // { 00ba:0475 }
  }
  let detect = false;                                                         // { 00ba:0488 }
  let p = g.PartyHead;                                                        // { 00ba:048c }
  while (p && !detect) {                                                      // { 00ba:0499 }
    if (hasEffect(p, 5)) detect = true;                                       // { 00ba:04a7  5 = Detect Magic }
    p = p.next;                                                               // { 00ba:04c1 }
  }
  if (detect && (S8(item.b, 0x32) > 0 || S8(item.b, 0x33) > 0 || item.b[0x36] /* cursed */ !== 0))   // { 00ba:04d6 }
    asg(name + '*' + ' ');                                                    // { 00ba:04fa }
  const count = item.b[0x39];
  if (count > 0)                                                              // { 00ba:052c }
    asg(name + ByteToStr(count) + ' ');                                       // { 00ba:0536 }
  let shown = 0;                                                              // { 00ba:0575  bit k-1 = word k shown }
  for (let k = 1; k <= 3; k++)                                                // { 00ba:0579 }
    if (item.b[0x2E + k] /* word[k] */ !== 0 && ((item.b[0x35] /* hidden */ >> (3 - k)) & 1) === 0)   // { 00ba:0582 }
      shown = byte(shown + (1 << (k - 1)));                                   // { 00ba:05b5 }
  let plural = false;                                                         // { 00ba:05cd }
  const type = item.b[0x2E];
  for (let k = 3; k >= 1; k--) {                                              // { 00ba:05d1 }
    if (((shown >> (k - 1)) & 1) > 0) {                                       // { 00ba:05da }
      asg(name + dsPstr(word(0x10A7 + item.b[0x2E + k] * 21)));               // { 00ba:05f5  ItemWord string[20] }
      if (count < 2 || plural) {                                              // { 00ba:0635 }
        asg(name + ' ');                                                      // { 00ba:0645 }
      } else if ((1 << (k - 1)) === shown                                     // { 00ba:0670  only this word shown }
          || (k === 1 && shown > 4 && type !== 0x56)                          // { 00ba:068a }
          || (k === 2 && (shown & 1) === 0)                                   // { 00ba:06a0  word 1 not shown }
          || (k === 3 && type === 0x56)                                       // { 00ba:06ad }
          || ((type === 0x49 || type === 0x1C) && item.b[0x31] /* word[3] */ !== 0xB1)) {   // { 00ba:06bd  arrows/quarrels, not "Silver" }
        asg(name + 's ');                                                     // { 00ba:06db }
        plural = true;                                                        // { 00ba:0703 }
      } else {
        asg(name + ' ');                                                      // { 00ba:0709 }
      }
    }
  }
  if (draw) X.DrawText(col, row, 0x0A, name);                                 // { 00ba:073a }
}

// 00BA:0767 DrawPartyRoster(sel) — "Name / AC  HP" list of PartyHead (monsters in the list are drawn too)
export function DrawPartyRoster(sel) {
  const x0 = g.game_Mode /* g_49F3 */ === 0 ? 1 : 0x11;                       // { 00ba:076d }
  let y = 2;                                                                  // { 00ba:077e }
  X.DrawText(x0, y, 0x0F, 'Name');                                            // { 00ba:0782 }
  X.DrawText(0x21, y, 0x0F, 'AC  HP');                                        // { 00ba:07a1 }
  y = byte(y + 2);                                                            // { 00ba:07bf }
  let p = g.PartyHead;                                                        // { 00ba:07c3 }
  while (p) {                                                                 // { 00ba:07d0 }
    X.ClearRectangle(x0, y, 0x26, y);                                         // { 00ba:07db }
    if (p === sel) X.DrawText(x0, y, 0x0F, charName(p));                      // { 00ba:07ef  selected: white }
    else DrawCharacterName(p, x0, y, false);                                  // { 00ba:0816 }
    const ac = p.b[0x111];                                                    // { 00ba:082b  right-align AC }
    let dx;
    if (ac <= 0x32) dx = 1;                                                   //   AC 10..60
    else if (ac >= 0x33 && ac <= 0x3C) dx = 2;                                //   AC 0..9
    else if (ac >= 0x3D && ac <= 0x45) dx = 1;                                //   AC -1..-9
    else dx = 0;
    DrawAC(p, 0x20 + dx, y);                                                  // { 00ba:0861 }
    const hp = p.b[0x11B];                                                    // { 00ba:0878 }
    if (hp <= 9) dx = 2;
    else if (hp >= 10 && hp <= 99) dx = 1;
    else dx = 0;
    DrawHP(p, 0x24 + dx, y, false);                                           // { 00ba:08a0 }
    y = byte(y + 1);                                                          // { 00ba:08ba }
    p = p.next;                                                               // { 00ba:08bd }
  }
  X.ClearRectangle(x0, y, 0x26, y);                                           // { 00ba:08d3 }
  // pointer layer (engine/input.js): a click on a member's row = End presses until that member is selected (End =
  // CycleSelectedChar next, 7F00:2874), only while the waiting menu takes extended keys (party menu, explore menu)
  const rows = byte(y - 4);
  setPointerRegion('roster', { x1: x0 * 8, y1: 4 * 8, x2: 0x26 * 8 + 7, y2: (4 + rows) * 8 - 1, prio: 2,
    keysAt: (px, py) => {
      if (!pointer.menuExt) return null;
      const k = Math.floor(py / 8) - 4;
      let s = 0, n = 0;
      for (let q = g.PartyHead; q; q = q.next) { if (q === g.SelectedChar) s = n; n++; }
      if (k < 0 || k >= n) return null;
      const steps = (k - s + n) % n;
      return steps ? Array.from({ length: steps }, () => KEY.end) : null;
    } });
}

// 00BA:08EF DrawAC(c, col, row) — AC = 60 − ac, '-' prefix when negative
export function DrawAC(c, col, row) {
  let s = ByteToStr(byte(Math.abs(c.b[0x111] /* ac */ - 60)));                // { 00ba:08f6 }
  if (c.b[0x111] > 60) s = '-' + s;                                           // { 00ba:0922 }
  X.DrawText(col, row, 0x0A, s);                                              // { 00ba:0957 }
}

// 00BA:0973 DrawHP(c, col, row, highlight) — yellow when hurt, magenta when highlighted
export function DrawHP(c, col, row, highlight) {
  let colour = c.b[0x11B] /* hp */ < c.b[0x32] /* hp_max */ ? 0x0E : 0x0A;   // { 00ba:097a }
  if (highlight) colour = 0x0D;                                               // { 00ba:0995 }
  X.DrawText(col, row, colour, ByteToStr(c.b[0x11B]));                        // { 00ba:099f }
}

// 00BA:09E3 DrawCharacterSummary(c) — right panel (cols 23..38): name, Hitpoints, AC, weapon, status
export async function DrawCharacterSummary(c) {
  X.ClearRectangle(0x17, 1, 0x26, 0x15);                                      // { 00ba:09e9 }
  let y = 1;                                                                  // { 00ba:09fa }
  await ShowCharacterMessage(c, ' ', y, false);                               // { 00ba:09fe  name line }
  y = byte(y + 1);                                                            // { 00ba:0a1e }
  X.DrawText(0x17, y + 1, 0x0A, 'Hitpoints');                                 // { 00ba:0a21  row 3 }
  DrawHP(c, 0x21, y + 1, false);                                              // { 00ba:0a42 }
  y = byte(y + 2);                                                            // { 00ba:0a59 }
  X.DrawText(0x17, y + 1, 0x0A, 'AC');                                        // { 00ba:0a5d  row 5 }
  DrawAC(c, 0x1A, y + 1);                                                     // { 00ba:0a7e }
  TXT.row = byte(y + 1);                                                      // { 00ba:0a92  text_Row }
  const w = rd(c, 0);
  if (w !== null) {                                                           // { 00ba:0a9b }
    y = byte(y + 2);                                                          // { 00ba:0aaa }
    // quirk: local [bp-1] := 17h at 00ba:0aae is never read.
    BuildItemName(c, w, 0, 0, false, false);                                  // { 00ba:0ab2 }
    await X.DrawWrappedText(0x17, y + 1, 0x26, y + 3, 0x0A, true, pstr(w.b, 0));   // { 00ba:0ad5  rows 7..9 }
  }
  y = byte(TXT.row + 1);                                                      // { 00ba:0b00 }
  if (c.b[0x10D] /* active */ === 0)                                          // { 00ba:0b09 }
    X.DrawText(0x17, y + 1, 0x0F, dsPstr(word(shortint(c.b[0x10C]) * 13 + 0x1047)));   // { 00ba:0b14  StatusName (CBW index) }
  else if (IsHelpless(c))                                                     // { 00ba:0b3e }
    X.DrawText(0x17, y + 1, 0x0F, '(Helpless)');                              // { 00ba:0b4c }
}

// 00BA:0B73 IsHelpless(c): Boolean — any of the effects DS:286C..286F (33h 34h 35h 1Fh)
export function IsHelpless(c) {
  let r = false;                                                              // { 00ba:0b79 }
  for (let k = 1; k <= 4; k++)                                                // { 00ba:0b7d }
    if (hasEffect(c, ds(0x286B + k))) r = true;                               // { 00ba:0b86  HelplessEffectIds }
  return r;                                                                   // { 00ba:0baf }
}

// 00BA:0BB8 RecalcCharacter(c) — readied pointers, encumbrance, damage, AC, movement, fighter level
export function RecalcCharacter(c) {
  if (!c.readied) c.readied = [];
  for (let k = 0; k <= 12; k++) c.readied[k] = null;                          // { 00ba:0bbe }
  let holding = false;                                                        // { 00ba:0be6 }
  c.b[0xC7] /* item_count */ = 0;                                             // { 00ba:0bea }
  let it = c.items;                                                           // { 00ba:0bf3 }
  c.b[0x100] /* hands_used */ = 0;                                            // { 00ba:0c06 }
  wrW(c.b, 0x102, 0) /* encumbrance */;                                       // { 00ba:0c0f }
  g.ReadiedWeight = 0;                                                        // { 00ba:0c19  g_4846 }
  while (it) {                                                                // { 00ba:0c1e }
    c.b[0xC7] = byte(c.b[0xC7] + 1);                                          // { 00ba:0c29 }
    let w = rdW(it.b, 0x37) /* weight */;                                     // { 00ba:0c31 }
    if (it.b[0x39] /* count */ > 0) w = word(it.b[0x39] * w);                 // { 00ba:0c3b  MUL low word }
    wrW(c.b, 0x102, word(rdW(c.b, 0x102) + w));                               // { 00ba:0c54 }
    if (it.b[0x34] /* readied */ !== 0) {                                     // { 00ba:0c5f }
      g.ReadiedWeight = word(g.ReadiedWeight + w);                            // { 00ba:0c6c }
      const s = ITEMS(it.b[0x2E], 0) /* slot */;                              // { 00ba:0c73 }
      if (s <= 8) c.readied[s] = it;                                          // { 00ba:0c89 }
      else if (s === 9) {                                                     // { 00ba:0cb3  rings +F0h, then +F4h }
        if (c.readied[9] !== null) {
          if (c.readied[10] === null) c.readied[10] = it;                     // { 00ba:0cc6 }
        } else c.readied[9] = it;                                             // { 00ba:0cea }
      }
      if (it.b[0x2E] === 0x49) c.readied[11] = it;                            // { 00ba:0cfd  arrows +F8h }
      if (it.b[0x2E] === 0x1C) c.readied[12] = it;                            // { 00ba:0d1a  quarrels +FCh }
      if (it.b[0x2F] /* word[1] */ === 0xBA) holding = true;                  // { 00ba:0d37  "Holding" }
      c.b[0x100] = byte(c.b[0x100] + ITEMS(it.b[0x2E], 1) /* hands */);       // { 00ba:0d45 }
    }
    it = it.next;                                                             // { 00ba:0d70 }
  }
  for (let k = 0; k <= 6; k++)                                                // { 00ba:0d84  one unit per coin }
    wrW(c.b, 0x102, word(rdW(c.b, 0x88 + 2 * k) /* money[k] */ + rdW(c.b, 0x102)));
  for (let k = 1; k <= 2; k++) {                                              // { 00ba:0db3 }
    c.b[0x114 + k] /* dmg_dice[k] */ = c.b[0xA2 + k] /* base_dmg_dice[k] */;  // { 00ba:0dbc }
    c.b[0x116 + k] /* dmg_sides[k] */ = c.b[0xA4 + k];                        // { 00ba:0dda }
    c.b[0x118 + k] /* dmg_bonus[k] */ = c.b[0xA6 + k];                        // { 00ba:0df8 }
  }
  const f = [0, 0, 0, 0, 0];                                                  // { 00ba:0e1c  [bp-0Dh..bp-9] }
  const magicArmour = { v: false };                                           // { 00ba:0e35  [bp-7] }
  c.b[0x101] /* ac_item_bonus */ = 0;                                         // { 00ba:0e39 }
  c.b[0x111] /* ac */ = c.b[0xA9] /* base_ac */;                              // { 00ba:0e42 }
  c.b[0x11C] /* move */ = c.b[0x72] /* base_move */;                          // { 00ba:0e52 }
  c.b[0x110] /* thac0 */ = c.b[0x2D] /* base_thac0 */;                        // { 00ba:0e61 }
  f[0] = DexDefenseAdj(c);                                                    // { 00ba:0e70 }
  if (rd(c, 0) === null) {                                                    // { 00ba:0e7d  no weapon: STR on the natural attack }
    c.b[0x110] = byte(c.b[0x110] + StrToHitAdj(c));                           // { 00ba:0e8c }
    c.b[0x119] = byte(S8(c.b, 0x119) + StrDamageAdj(c));                      // { 00ba:0ead }
  }
  RecalcWeaponStats(c);                                                       // { 00ba:0ecd }
  it = c.items;                                                               // { 00ba:0ed7 }
  while (it) {                                                                // { 00ba:0eea }
    if (it.b[0x34] !== 0) {                                                   // { 00ba:0ef2 }
      ArmourMoveLimit(c, it);                                                 // { 00ba:0efc }
      AddItemAC(c, it, f, magicArmour);                                       // { 00ba:0f0c }
    }
    it = it.next;                                                             // { 00ba:0f26 }
  }
  if (magicArmour.v) f[3] = 0;                                                // { 00ba:0f39  rings do not stack with magic armour }
  if (holding) {                                                              // { 00ba:0f43 }
    if (rdW(c.b, 0x102) < 5000) wrW(c.b, 0x102, 0);                           // { 00ba:0f49 }
    else wrW(c.b, 0x102, rdW(c.b, 0x102) - 5000);                             // { 00ba:0f61 }
    if (rdW(c.b, 0x102) < g.ReadiedWeight) wrW(c.b, 0x102, g.ReadiedWeight);  // { 00ba:0f6b  never below the readied weight }
  }
  EncumbranceMoveLimit(c);                                                    // { 00ba:0f84 }
  // quirk: f[4] (ShortInt, CBW) is compared signed against the unsigned ac byte.
  if (f[4] < c.b[0x111]) f[4] = shortint(c.b[0x111]);                         // { 00ba:0f8e }
  c.b[0x111] = 0;                                                             // { 00ba:0fad }
  for (let k = 0; k <= 4; k++) c.b[0x111] = byte(c.b[0x111] + f[k]);          // { 00ba:0fb6 }
  c.b[0x112] /* ac_rear */ = byte(f[4] + f[2] + f[3] - 2);                    // { 00ba:0fe5  no shield, no DEX }
  // quirk: ac_item_bonus (+101h, item plus2) is recomputed but not added to ac here.
  if (S8(c.b, 0x98) /* level[2] fighter */ > 0 && S8(c.b, 0x2E) /* race */ > 0)   // { 00ba:1003  signed (JLE) }
    c.b[0x6B] /* fighter_lvl_eff */ = c.b[0x98];                              // { 00ba:1018 }
  else c.b[0x6B] = 1;                                                         // { 00ba:1029 }
}

// 00BA:1037 ByteToStr(v: Byte): String — Str(LongInt(v)) width 0
export function ByteToStr(v) { return String(byte(v)); }                     // { 00ba:103e }

// 00BA:1073 WordToStr(v: Word): String
export function WordToStr(v) { return String(word(v)); }                     // { 00ba:107a }

// 00BA:10AD LongToStr(v: LongInt): String
export function LongToStr(v) { return String(v | 0); }                       // { 00ba:10b4 }

// 00BA:10E6 DexDefenseAdj(c): ShortInt — AC adjustment in 60−AC units
export function DexDefenseAdj(c) {
  const d = c.b[0x13] /* dex */;                                              // { 00ba:10ec }
  if (d >= 1 && d <= 3) return -4;
  if (d >= 4 && d <= 6) return shortint(d - 7);
  if (d >= 15 && d <= 18) return shortint(d - 14);
  if (d >= 19 && d <= 20) return 4;
  if (d >= 21 && d <= 23) return 5;
  if (d >= 24 && d <= 25) return 6;
  return 0;
}

// 00BA:1168 DexMissileAdj(c): ShortInt
export function DexMissileAdj(c) {
  const d = c.b[0x13] /* dex */;                                              // { 00ba:116e }
  if (d <= 2) return -4;
  if (d >= 3 && d <= 5) return shortint(d - 6);
  if (d >= 16 && d <= 18) return shortint(d - 15);
  if (d >= 19 && d <= 20) return 3;
  if (d >= 21 && d <= 23) return 4;
  if (d >= 24 && d <= 25) return 5;
  return 0;
}

// 00BA:11EA StrengthIndex(c): Byte — 0..17 = STR, 18..23 = 18/xx, 24..30 = STR 19..25
export function StrengthIndex(c) {
  const s = c.b[0x10] /* str */;
  let r = 0;   // quirk: STR > 25, or STR 18 with str_exc > 100, leave r unassigned (stack garbage); 0 here
  if (s <= 17) r = s;                                                         // { 00ba:11f3 }
  else if (s === 18) {                                                        // { 00ba:120b }
    const e = c.b[0x16] /* str_exc */;
    if (e === 0) r = 18;
    else if (e >= 1 && e <= 50) r = 19;
    else if (e >= 51 && e <= 75) r = 20;
    else if (e >= 76 && e <= 90) r = 21;
    else if (e >= 91 && e <= 99) r = 22;
    else if (e === 100) r = 23;                                               // 18/00
  } else if (s >= 19 && s <= 25) r = byte(s + 5);                             // { 00ba:1262 }
  return r;
}

// 00BA:1282 StrToHitAdj(c): ShortInt
export function StrToHitAdj(c) {
  let r = 0;                                                                  // { 00ba:1288 }
  const i = StrengthIndex(c);                                                 // { 00ba:128c }
  if (c.b[0xAA] /* unk_AA: STR bonuses apply */ !== 0) {                      // { 00ba:1299 }
    if (i >= 1 && i <= 3) r = -3;
    else if (i >= 4 && i <= 5) r = -2;
    else if (i >= 6 && i <= 7) r = -1;
    else if (i >= 17 && i <= 19) r = 1;
    else if (i >= 20 && i <= 22) r = 2;
    else if (i >= 23 && i <= 25) r = 3;
    else if (i >= 26 && i <= 27) r = 4;
    else if (i >= 28 && i <= 30) r = shortint(i - 23);
  }
  return r;
}

// 00BA:1325 StrDamageAdj(c): ShortInt
export function StrDamageAdj(c) {
  let r = 0;                                                                  // { 00ba:132b }
  const i = StrengthIndex(c);                                                 // { 00ba:132f }
  if (c.b[0xAA] !== 0) {                                                      // { 00ba:133c }
    if (i >= 1 && i <= 2) r = -2;
    else if (i >= 3 && i <= 5) r = -1;
    else if (i === 16) r = 1;
    else if (i >= 17 && i <= 19) r = shortint(i - 16);
    else if (i >= 20 && i <= 29) r = shortint(i - 17);
    else if (i === 30) r = 14;
  }
  return r;
}

// 00BA:13AB StrWeightAllowance(c): Integer
export function StrWeightAllowance(c) {
  const i = StrengthIndex(c);                                                 // { 00ba:13b1 }
  let r;
  if (i >= 1 && i <= 3) r = -350;
  else if (i >= 4 && i <= 5) r = -250;
  else if (i >= 6 && i <= 7) r = -150;
  else if (i >= 12 && i <= 13) r = 100;
  else if (i >= 14 && i <= 15) r = 200;
  else if (i === 16) r = 350;
  else if (i >= 17 && i <= 21) r = (i - 17) * 250 + 500;
  else if (i >= 22 && i <= 26) r = (i - 22) * 1000 + 2000;
  else if (i === 27) r = 7500;
  else if (i >= 28 && i <= 30) r = (i - 28) * 3000 + 9000;
  else r = 0;
  return integer(r);
}

// 00BA:148B ForgetMemorizedSpell(id) — clears the first mem_spell slot of SelectedChar holding id
export function ForgetMemorizedSpell(id) {
  let k = 0;                                                                  // { 00ba:1491 }
  while (k <= 20) {                                                           // { 00ba:1495 }
    if (g.SelectedChar.b[0x17 + k] /* mem_spell[k] */ === byte(id)) {         // { 00ba:149b }
      g.SelectedChar.b[0x17 + k] = 0;                                         // { 00ba:14af }
      k = 21;                                                                 // { 00ba:14bf  exit after the first match }
    }
    k++;                                                                      // { 00ba:14c3 }
  }
}
