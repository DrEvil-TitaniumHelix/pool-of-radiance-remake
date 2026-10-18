// game/areas/combat_ov19.js — ov19 (seg 7F00): character sheet, View menu, Items menu and item actions
// (ready/use/trade/drop/halve/join/sell/identify), coins (trade/drop/value), party cycling, spell-list header.
// Source: decode/pseudo/COMBAT.pas.md "## ov19 (7F00)" (FINAL, verified), combat_parts/ov19_notes.md,
// COMBAT_SCREENS.md COMBAT-46..60, evidence decode/listings/ov19.lst. Conventions: combat_core.js header.
//
// Local conventions of this unit (in addition to combat_core.js)
// - Pascal `var` parameters are ref objects `{ v }` (read/written through `.v`); var arrays (TreasureMoney)
//   are passed as the JS array itself. Callers of ViewMenu/ItemsMenu/UseItem/IdentifyItem/SpellList pass refs.
// - Externals with var parameters get refs in Pascal position; menus may return the key either as a Char or as
//   `{ key, ext }` (engine menus.js), `keyOf()` accepts both.
// - TChar readied[0..12] (+CCh + slot*4 far pointers, rebuilt by RecalcCharacter) = JS array `c.readied`.
// - Item record: name +00 string[40], type +2Eh, word[1..3] +2Fh, plus +32h, plus2 +33h, readied +34h,
//   hidden +35h, magic_flag/cursed +36h, weight +37h (word), count +39h, value +3Ah (word), power[k] +3Bh+k.
// - Menu-list nodes built by TradeCoins/DropCoins: { b: Uint8Array(0x2E) (text string[40] +00, flag +29h), next }
//   (same layout as an item record's first 2Eh bytes, which is what VerticalListMenu reads).

import { X, g, ds, dsPstr, rdW, wrW, pstr, setPstr, newItem, byte, word, integer, S8, cr } from './combat_core.js';
import { CallEffectHandler } from './combat_ov24.js';

// ---- local helpers -------------------------------------------------------------------------------------
const ref = (v) => ({ v });
const keyOf = (r) => (r !== null && typeof r === 'object' ? r.key : r);
const rdy = (c, slot) => (c.readied ? c.readied[slot] ?? null : null);    // TChar +CCh + slot*4
const money = (c, i) => rdW(c.b, 0x88 + 2 * i);                           // TChar +88h money[0..6]
const setMoney = (c, i, v) => wrW(c.b, 0x88 + 2 * i, v);
const itemName = (it) => pstr(it.b, 0);
const power = (it, k) => it.b[0x3B + k];                                   // power[1..3] = +3Ch..+3Eh
const itSlot = (t) => ds(0x5582 + t * 16);                                 // ITEMS[t].slot
const itHands = (t) => ds(0x5583 + t * 16);                                // ITEMS[t].hands
const itUsable = (t) => ds(0x558F + t * 16);                               // ITEMS[t].usable_by
const coinName = (i) => dsPstr(0x0FFA + i * 11);                           // CoinName DS:0FFA string[10]
const coinValue = (i) => ds(0x0D24 + 4 * i) | (ds(0x0D25 + 4 * i) << 8) | (ds(0x0D26 + 4 * i) << 16) | (ds(0x0D27 + 4 * i) << 24);  // CoinValue DS:0D24 LongInt
const eclWord49E5 = () => { const m = g.ecl_Mem4900; return m ? (m[0xE5] ?? 0) : 0; };   // ecl_Mem4900^ word at byte +1CAh (TODO(decode): meaning, notes (c)1)
const selRef = () => ({ get v() { return g.SelectedChar; }, set v(x) { g.SelectedChar = x; } });   // @SelectedChar (DS:5D92)

// 7F00:004A DrawCharacterSheet
export async function DrawCharacterSheet() {
  g.ViewChar = g.SelectedChar;                                            // 7f00:0051
  const v = g.ViewChar;
  X.ClearScreen();                                                        // 7f00:005f
  X.DrawFrame(1, 1, 38, 22, 0);                                           // 7f00:0064
  X.DrawCharacterName(v, 1, 1, false);                                    // 7f00:0078
  if (v.b[0x84] /* npc_morale */ > 0x7F)                                  // 7f00:008e
    X.DrawText(pstr(v.b, 0).length + 3, 1, 0x0A, '(NPC)');                // 7f00:009a
  let x = 1;                                                              // 7f00:00c2
  let s = dsPstr(0x0FEC + v.b[0x9E] /* gender */ * 7);                    // 7f00:00c6 GenderName
  X.DrawText(x, 3, 0x0F, s);                                              // 7f00:00ec
  x = x + s.length + 1;                                                   // 7f00:0101
  s = dsPstr(0x0F03 + v.b[0x2E] /* race */ * 10);                         // 7f00:0114 RaceName
  X.DrawText(x, 3, 0x0F, s);                                              // 7f00:0139
  x = x + s.length + 1;                                                   // 7f00:014e
  X.DrawText(x, 3, 0x0F, 'Age ' + X.WordToStr(rdW(v.b, 0x30) /* age */));   // 7f00:0161
  X.DrawText(1, 4, 0x0F, dsPstr(0x0F53 + v.b[0xA0] /* alignment */ * 17));  // 7f00:0198 AlignmentName
  X.DrawText(1, 5, 0x0F, dsPstr(0x0D38 + v.b[0x2F] /* class */ * 27));      // 7f00:01d2 ClassName
  for (let i = 0; i <= 5; i++) {                                          // 7f00:020b
    switch (i) {                                                          // 7f00:0214
      case 0: s = 'STR '; break; case 1: s = 'INT '; break; case 2: s = 'WIS '; break;
      case 3: s = 'DEX '; break; case 4: s = 'CON '; break; case 5: s = 'CHA '; break;
    }
    X.DrawText(1, i + 7, 0x0A, s);                                        // 7f00:02b2
    DrawAbility(i, false);                                                // 7f00:02cb
  }
  DrawMoney();                                                            // 7f00:02df
  X.DrawText(1, 15, 0x0F, 'Level');                                       // 7f00:02e3
  let any = false;                                                        // 7f00:0301
  s = '';                                                                 // 7f00:0306
  for (let i = 0; i <= 7; i++)                                            // 7f00:030b
    if (S8(v.b, 0x96 + i) /* level[i] */ > 0) {                           // 7f00:0314 signed test
      if (any) s = s + '/';                                               // 7f00:0326
      s = s + X.ByteToStr(v.b[0x96 + i]);                                 // 7f00:0357
      any = true;                                                         // 7f00:0397
    }
  X.DrawText(7, 15, 0x0F, s);                                             // 7f00:03a5
  const xp = v.b[0xAC] | (v.b[0xAD] << 8) | (v.b[0xAE] << 16) | (v.b[0xAF] << 24);   // +ACh xp LongInt
  X.DrawText(17, 15, 0x0F, 'Exp ' + X.LongToStr(xp));                     // 7f00:03b9
  await DrawCombatStats();                                                    // 7f00:03f5
  let row = 20;                                                           // 7f00:03f9
  if (rdy(v, 0) !== null) {                                               // 7f00:03fd +CCh weapon
    X.DrawText(1, row, 0x0F, 'Weapon');                                   // 7f00:040d
    X.BuildItemName(v, rdy(v, 0), 8, row, false, true);                   // 7f00:042c
  }
  row = row + 1;                                                          // 7f00:0454
  if (rdy(v, 2) !== null) {                                               // 7f00:0457 +D4h armour
    X.DrawText(2, row, 0x0F, 'Armor');                                    // 7f00:0467
    X.BuildItemName(v, rdy(v, 2), 8, row, false, true);                   // 7f00:0486
  }
  row = row + 1;                                                          // 7f00:04ae
  X.DrawText(1, row, 0x0F, 'Status');                                     // 7f00:04b1
  X.DrawText(8, row, 0x0A, dsPstr(0x1047 + v.b[0x10C] /* status */ * 13));   // 7f00:04d0 StatusNameTable
  if (g.opt_Portraits !== 0 && g.DataSet === 3)                           // 7f00:04f6
    await X.ShowPortrait();                                               // 7f00:0504
}

// 7F00:050D DrawMoney
export function DrawMoney() {
  const c = g.SelectedChar;
  X.ClearRectangle(12, 7, 26, 14);                                        // 7f00:0514
  let row = 7;                                                            // 7f00:0525
  for (let i = 6; i >= 0; i--)                                            // 7f00:0529
    if (money(c, i) > 0) {                                                // 7f00:0532
      const s = coinName(i);                                              // 7f00:0546
      X.DrawText(20 - s.length, row, 0x0A, s);                            // 7f00:0565 right-aligned to col 19
      X.DrawText(21, row, 0x0A, X.WordToStr(money(c, i)));                // 7f00:0583
      row = row + 1;                                                      // 7f00:05ae
    }
}

// 7F00:0608 DrawCombatStats
export async function DrawCombatStats() {
  const c = g.SelectedChar;                                               // 7f00:060f
  X.RecalcCharacter(c);                                                   // 7f00:061c
  const row = 17;                                                         // 7f00:0627
  X.DrawText(1, row, 0x0F, 'AC    ');                                     // 7f00:062b
  X.DrawAC(c, 4, row);                                                    // 7f00:0649
  X.DrawText(1, row + 1, 0x0F, 'HP    ');                                 // 7f00:065b
  X.DrawHP(c, 4, row + 1, 0);                                             // 7f00:067c
  let col = 8;                                                            // 7f00:0694
  X.DrawText(col + 1, row, 0x0F, 'THAC0   ');                             // 7f00:0698
  X.DrawText(col + 7, row, 0x0A, X.ByteToStr(byte(60 - c.b[0x110] /* thac0 */)));   // 7f00:06ba
  let s = X.ByteToStr(c.b[0x115] /* dmg_dice[1] */) + 'd' + X.ByteToStr(c.b[0x117] /* dmg_sides[1] */);   // 7f00:06ec
  const bonus = S8(c.b, 0x119);                                           // dmg_bonus[1] signed
  if (bonus > 0) s = s + '+' + X.ByteToStr(c.b[0x119]);                   // 7f00:0731
  if (bonus < 0) s = s + '-' + X.ByteToStr(byte(Math.abs(bonus)));        // 7f00:077d
  X.DrawText(col, row + 1, 0x0F, 'Damage        ');                       // 7f00:07cf
  X.DrawText(col + 7, row + 1, 0x0A, s);                                  // 7f00:07f1
  col = 22;                                                               // 7f00:080e
  X.DrawText(col, row, 0x0F, 'Encumbrance      ');                        // 7f00:0812
  X.DrawText(col + 12, row, 0x0A, X.WordToStr(rdW(c.b, 0x102) /* encumbrance */));   // 7f00:0831
  let mv = c.b[0x11C];                                                    // 7f00:0859 move
  const node = ref(null);
  if (await X.HasEffect(c, 0x2A, node)) mv = byte(mv * 2);                      // 7f00:0864
  if (await X.HasEffect(c, 0x27, node)) mv = mv >> 1;                           // 7f00:0885
  X.DrawText(col + 3, row + 1, 0x0F, 'Movement   ');                      // 7f00:08a6
  X.DrawText(col + 12, row + 1, 0x0A, X.ByteToStr(mv));                   // 7f00:08cd
}

// 7F00:0901 DrawAbility(stat: ShortInt; highlight: Boolean)
export function DrawAbility(stat, highlight) {
  const c = g.SelectedChar;
  const colour = highlight ? 0x0D : 0x0A;                                 // 7f00:0908
  let col = 5;                                                            // 7f00:0918
  X.ClearRectangle(col, stat + 7, 11, stat + 7);                          // 7f00:091c
  if (c.b[0x10 + stat] < 10) col = col + 1;                               // 7f00:0938 abil[stat]
  X.DrawText(col, stat + 7, colour, X.ByteToStr(c.b[0x10 + stat]));       // 7f00:094c
  if (stat === 0 && c.b[0x10] /* str */ === 18 && c.b[0x16] /* str_exc */ > 0) {   // 7f00:097b
    let s = X.ByteToStr(c.b[0x16]);                                       // 7f00:09a0
    if (c.b[0x16] < 10) s = '0' + s;                                      // 7f00:09c2
    if (c.b[0x16] === 100) s = '00';                                      // 7f00:09f5
    X.DrawText(7, 7, colour, '(' + s + ')');                              // 7f00:0a13
  }
}

// 7F00:0AB3 ViewMenu(var turnUsed: Boolean)
export async function ViewMenu(turnUsed) {
  if (g.game_Mode === 5) await X.PaletteFlashOff();                       // 7f00:0aba
  let key = ' ';                                                          // 7f00:0ac6
  turnUsed.v = false;                                                     // 7f00:0aca
  g.TradePartner = g.SelectedChar;                                        // 7f00:0ad1
  await DrawCharacterSheet();                                             // 7f00:0adf
  while (!(key === '\0' || key === 'E') && !turnUsed.v) {                 // 7f00:0ae3 / 0af6
    let menu = '';                                                        // 7f00:0b02
    const hasSpells = ref(false);                                         // 7f00:0b06 (Boolean local; SpellList stores the count into it)
    let hasMoney = false;                                                 // 7f00:0b0a
    const v = g.ViewChar;
    for (let i = 0; i <= 20; i++)                                         // 7f00:0b0e
      if (v.b[0x17 + i] /* mem_spell[i] */ > 0) hasSpells.v = true;       // 7f00:0b17
    for (let i = 0; i <= 6; i++)                                          // 7f00:0b33
      if (money(v, i) > 0) hasMoney = true;                               // 7f00:0b3c
    if (v.items !== null) menu = menu + 'Items ';                         // 7f00:0b5a
    if (hasSpells.v) menu = menu + 'Spells ';                             // 7f00:0b92
    if ((v.b[0x84] < 0x80 || v.b[0x10D] === 0 || v.b[0x10C] === 1)
        && hasMoney && g.game_Mode !== 5)                                 // 7f00:0bc0
      menu = menu + 'Trade ';                                             // 7f00:0bf1
    if (hasMoney) menu = menu + 'Drop ';                                  // 7f00:0c19
    menu = menu + 'Exit';                                                 // 7f00:0c47
    const ext = ref(false);
    key = keyOf(await X.HorizontalMenu('View:', menu, 0x0D, 0x0A, 0x0F, false, false, ext));   // 7f00:0c6f
    const spellIdx = ref(-1);                                             // 7f00:0c9f
    switch (key) {                                                        // 7f00:0ca4
      case 'I': await ItemsMenu(turnUsed); break;                         // 7f00:0cab
      case 'S': { const n = await SpellList(0, 0, spellIdx, hasSpells); void n; break; }   // 7f00:0cba result unused
      case 'T': await TradeCoins(); break;                                // 7f00:0cd7
      case 'D': await DropCoins(); DrawMoney(); break;                    // 7f00:0ce1
    }
    // quirk: Enter (#13) matches no case and no exit test: the menu simply repeats (notes (c)6).
    if (!turnUsed.v && (key === 'I' || key === 'S' || key === 'T'))       // 7f00:0ce9
      await DrawCharacterSheet();                                         // 7f00:0d02
  }
  if (g.game_Mode === 5) await X.PaletteFlashOn();                        // 7f00:0d09
  await X.RedrawCurrentMode();                                            // 7f00:0d15
}

// 7F00:0D70 MayLoseItem(item): Boolean
export async function MayLoseItem(item) {
  let result = false;                                                     // 7f00:0d76
  if (item.b[0x34] /* readied */ !== 0)                                   // 7f00:0d7a
    await X.ShowTimedBottomMessage('Must be unreadied');                  // 7f00:0d84
  else if (!await X.IsScroll(item))                                             // 7f00:0d9b
    result = true;                                                        // 7f00:0daa
  else if (power(item, 1) > 0x7F || power(item, 2) > 0x7F || power(item, 3) > 0x7F) {   // 7f00:0db1
    const sc = g.SelectedChar;
    X.DrawCharacterName(sc, 1, 21, false);                                // 7f00:0dcf
    g.text_Col = byte(pstr(sc.b, 0).length + 2);                          // 7f00:0de5
    g.text_Row = 21;                                                      // 7f00:0df3
    await X.DrawWrappedText(1, 21, 38, 22, 0x0E, false, ' was going to scribe from that scroll');   // 7f00:0df8
    if (keyOf(await X.AskYesNo('is it Okay to lose it? ', 0x0D, 0x0A, 0x0F)) === 'Y')   // 7f00:0e1e
      result = true;                                                      // 7f00:0e3f
  } else
    result = true;                                                        // 7f00:0e45
  X.ClearRectangle(1, 21, 38, 22);                                        // 7f00:0e49
  return result;                                                          // 7f00:0e5a
}

// 7F00:0EF8 ItemsMenu(var turnUsed: Boolean)
export async function ItemsMenu(turnUsed) {
  const c = g.SelectedChar;                                               // 7f00:0eff
  let key = ' ';                                                          // 7f00:0f0c
  const sel = ref(c.items);                                               // 7f00:0f10
  const index = ref(0);                                                   // 7f00:0f23
  const redraw = ref(true);                                               // 7f00:0f28
  let fullRedraw = true;                                                  // 7f00:0f2c
  while (!(key === '\0' || key === 'E') && !turnUsed.v && c.b[0xC7] /* item_count */ > 0) {   // 7f00:0f30
    const oldCount = c.b[0xC7];                                           // 7f00:0f5d
    if (c.items !== null) {                                               // 7f00:0f68
      let menu = 'Ready';                                                 // 7f00:0f7a
      if (c.b[0x10D] /* active */ !== 0 && word(eclWord49E5()) === 0 &&
          ([2, 3, 4].includes(g.game_Mode) || (g.game_Mode === 5 && cr(c).b[2] !== 0)))   // 7f00:0f8d
        menu = menu + ' Use';                                             // 7f00:0fcf
      if ((c.b[0x84] < 0x80 || c.b[0x10D] === 0 || c.b[0x10C] === 1) && g.game_Mode !== 5)   // 7f00:0ff7
        menu = menu + ' Trade';                                           // 7f00:101f
      menu = menu + ' Drop';                                              // 7f00:1047
      if (c.b[0xC7] < 16) menu = menu + ' Halve';                         // 7f00:106f
      menu = menu + ' Join';                                              // 7f00:10a2
      if ((c.b[0x84] < 0x80 || c.b[0x10D] === 0 || c.b[0x10C] === 1) && g.game_Mode === 1)   // 7f00:10ca
        menu = menu + ' Sell';                                            // 7f00:10f2
      if (g.game_Mode === 1) menu = menu + ' Id';                         // 7f00:111a
      let p = c.items;                                                    // 7f00:1149
      while (p !== null) {                                                // 7f00:115c
        X.BuildItemName(c, p, 0, 0, true, false);                         // 7f00:1164
        p = p.next;                                                       // 7f00:1181
      }
      if (fullRedraw || g.ItemsChanged !== 0) {                           // 7f00:1194 g_6821
        X.ClearScreen();                                                  // 7f00:11a4
        X.DrawFrame(1, 1, 38, 22, 0);                                     // 7f00:11a9
        X.DrawCharacterName(c, 1, 1, true);                               // 7f00:11bd
        X.DrawText(pstr(c.b, 0).length + 4, 1, 0x0A, 'Items');            // 7f00:11d1
        X.DrawTitledFrame(1, 3, 38, 22, 0, 0, '');                        // 7f00:11f7
        X.DrawText(1, 3, 0x0F, 'Ready Item');                             // 7f00:121d
        redraw.v = true;                                                  // 7f00:123a
        fullRedraw = false;                                               // 7f00:123e
        g.ItemsChanged = 0;                                               // 7f00:1242
      }
      key = keyOf(await X.VerticalListMenu('', menu, 0x0D, 0x0A, 0x0F, 1, 5, 38, 22, c.items, true,
        redraw, index, sel));                                             // 7f00:1247
      if (sel.v !== null) {                                               // 7f00:1297
        const it = sel.v;
        switch (key) {                                                    // 7f00:12a2
          case 'R': await ReadyItem(it); break;                           // 7f00:12a9
          case 'U':
            if (it.b[0x34] === 0) {                                       // 7f00:12ba
              await X.ShowTimedBottomMessage('Must be Readied');          // 7f00:12c4
              key = ' ';                                                  // 7f00:12d8
            } else if (await X.IsScroll(it) || (power(it, 2) > 0 && power(it, 3) < 0x80)) {   // 7f00:12de
              await UseItem(it, turnUsed);                                // 7f00:1301
              if (g.game_Mode !== 5) turnUsed.v = false;                  // 7f00:1310
              if (!turnUsed.v) fullRedraw = true;                         // 7f00:131e
            }
            break;
          case 'T':                                                       // 7f00:132e
            if (await MayLoseItem(it)) await TradeItem(it);               // 7f00:1332
            else key = ' ';                                               // 7f00:134c
            fullRedraw = true;                                            // 7f00:1350
            break;
          case 'D':
            if (await MayLoseItem(it)) {                                  // 7f00:135e
              X.BuildItemName(c, it, 0, 0, false, false);                 // 7f00:136f
              await X.DrawWrappedText(1, 21, 38, 22, 0x0E, true,
                'Your ' + itemName(it) + 'will be gone forever');         // 7f00:138c (no blank: original text)
              if (keyOf(await X.AskYesNo('Drop It? ', 0x0D, 0x0A, 0x0F)) === 'Y') {   // 7f00:13c7
                X.LoseItem(g.SelectedChar, it);                           // 7f00:13e8
                redraw.v = true;                                          // 7f00:13fb
              }
              X.ClearRectangle(1, 21, 38, 22);                            // 7f00:13ff
            } else key = ' ';                                             // 7f00:1412
            break;
          case 'H': await HalveItem(it); break;                           // 7f00:141c
          case 'J': JoinItems(it); break;                                 // 7f00:142c
          case 'S':
            if (await MayLoseItem(it)) await SellItem(it);                // 7f00:143c
            else key = ' ';                                               // 7f00:1456
            break;
          case 'I': await IdentifyItem(it, redraw); break;                // 7f00:1460
        }
      }
      X.RecalcCharacter(c);                                               // 7f00:146f
    }
    if (c.b[0xC7] !== oldCount) redraw.v = true;                          // 7f00:147a
  }
}

// 7F00:14D0 ReadyItem(item)
export async function ReadyItem(item) {
  const hasHook = power(item, 3) > 0x7F;                                  // 7f00:14d7
  const c = g.SelectedChar;                                               // 7f00:14e7
  if (item.b[0x34] /* readied */ !== 0) {                                 // 7f00:14f4
    if (item.b[0x36] /* magic_flag (cursed) */ !== 0)                     // 7f00:14fe
      await X.ShowTimedBottomMessage("It's Cursed");                      // 7f00:1508
    else {
      item.b[0x34] = 0;                                                   // 7f00:151e
      if (hasHook) await CallEffectHandler(power(item, 3), c, item, 1); // 7f00:1526
    }
  } else {
    let err = 0;                                                          // 7f00:154b
    if (itHands(item.b[0x2E]) + c.b[0x100] /* hands_used */ > 2) err = 3; // 7f00:154f
    let slot = itSlot(item.b[0x2E]);                                      // 7f00:157b
    if (slot <= 8) {                                                      // 7f00:1591
      if (rdy(c, slot) !== null) err = 2;                                 // 7f00:159c
    } else if (slot === 9) {                                              // 7f00:15bb
      if (rdy(c, 10) !== null) err = 2;                                   // 7f00:15bf quirk: tests the 2nd ring (+F4h), slot stays 9
    }
    if (item.b[0x2E] === 0x49 && rdy(c, 11) !== null) { err = 2; slot = 11; }   // 7f00:15d2 / 15eb
    if (item.b[0x2E] === 0x1C && rdy(c, 12) !== null) { err = 2; slot = 12; }   // 7f00:15f3 / 160c
    if ((itUsable(item.b[0x2E]) & c.b[0xB0] /* class_mask */) === 0) err = 1;   // 7f00:1614 (overrides 2/3)
    switch (err) {                                                        // 7f00:1637
      case 0:
        item.b[0x34] = 1;                                                 // 7f00:163e
        if (hasHook) await CallEffectHandler(power(item, 3), c, item, 0);   // 7f00:1646
        break;
      case 1: await X.ShowTimedBottomMessage('Wrong Class'); break;       // 7f00:166f
      case 2: {
        // quirk: for rings readied[9] (+F0h) is named although readied[10] was tested (nil deref in the original if unset).
        const other = rdy(c, slot);
        X.BuildItemName(c, other, 0, 0, false, false);                    // 7f00:168a
        await X.ShowTimedBottomMessage('already using ' + itemName(other));   // 7f00:16b8
        break;
      }
      case 3:
        if (g.game_Mode !== 5 || c.b[0x10F] /* controlled */ === 0)       // 7f00:16ec
          await X.ShowTimedBottomMessage('Your hands are full!');         // 7f00:16fe
        break;
    }
  }
}

// 7F00:1734 TradeItem(item)
export async function TradeItem(item) {
  const whom = ref(g.TradePartner);                                       // 7f00:173a
  await X.RedrawCurrentMode();                                            // 7f00:1747
  await X.SelectPartyCharacter('Trade with Whom?', true, whom);           // 7f00:174c
  if (whom.v !== null) {                                                  // 7f00:1768
    g.TradePartner = whom.v;                                              // 7f00:1770
    if (ItemOverloads(whom.v, item))                                      // 7f00:177d
      await X.ShowTimedBottomMessage('Overloaded');                       // 7f00:1791
    else {
      X.AppendItemCopy(whom.v, item);                                     // 7f00:17a7
      X.LoseItem(g.SelectedChar, item);                                   // 7f00:17b8
      X.RecalcCharacter(whom.v);                                          // 7f00:17cb
    }
  }
}

// 7F00:17ED HalveItem(item)
export async function HalveItem(item) {
  const half = item.b[0x39] >> 1;                                         // 7f00:17f3
  if (half > 0) {                                                         // 7f00:1801
    const rest = item.b[0x39] - half;                                     // 7f00:1807
    const p = newItem();                                                  // 7f00:181c GetMem(p, 3Fh)
    p.b.set(item.b);                                                      // 7f00:182b Move(item^, p^, 3Fh)
    p.b[0x39] = half;                                                     // 7f00:183e
    p.b[0x34] = 0;                                                        // 7f00:1848
    p.next = item.next;                                                   // 7f00:1850
    item.b[0x39] = rest;                                                  // 7f00:1866
    item.next = p;                                                        // 7f00:1870
  } else
    await X.ShowTimedBottomMessage("Can't halve that");                   // 7f00:1883
  // item_count is not updated here; ItemsMenu's RecalcCharacter recounts the list.
}

// 7F00:189D JoinItems(item)
export function JoinItems(item) {
  let target = item;                                                      // 7f00:18a3
  let total = target.b[0x39];                                             // 7f00:18af
  let p = g.SelectedChar.items;                                           // 7f00:18b9
  while (p !== null) {                                                    // 7f00:18cd
    const nxt = p.next;                                                   // 7f00:18d8
    const pb = p.b, tb = target.b;
    if (p !== target && pb[0x39] > 0
        && pb[0x2F] === tb[0x2F] && pb[0x30] === tb[0x30] && pb[0x31] === tb[0x31]
        && pb[0x2E] === tb[0x2E] && pb[0x32] === tb[0x32] && pb[0x33] === tb[0x33]
        && pb[0x36] === tb[0x36] && rdW(pb, 0x37) === rdW(tb, 0x37)
        // quirk: the original compares power[1..3] of p with itself (7f00:19a1/19c1/19d4); only power[1] < 2 restricts.
        && pb[0x3C] === pb[0x3C] && pb[0x3C] < 2
        && pb[0x3D] === pb[0x3D] && pb[0x3E] === pb[0x3E]) {              // 7f00:18e9 .. 19e2
      if (pb[0x39] + total <= 255) {                                      // 7f00:19e4
        total = total + pb[0x39];                                         // 7f00:19fb
        X.LoseItem(g.SelectedChar, p);                                    // 7f00:1a05
      } else {
        tb[0x39] = 255;                                                   // 7f00:1a1a
        pb[0x39] = byte(pb[0x39] - (255 - total));                        // 7f00:1a22
        total = pb[0x39];                                                 // 7f00:1a42
        target = p;                                                       // 7f00:1a4c
      }
    }
    p = nxt;                                                              // 7f00:1a58
  }
  target.b[0x39] = byte(total);                                           // 7f00:1a67
}

// 7F00:1A8A UseItem(item; var done: Boolean)
export async function UseItem(item, done) {
  const spellIdx = ref(-1);                                               // 7f00:1a90
  g.ItemCast = 0;                                                         // 7f00:1a95
  let spell = 0;                                                          // 7f00:1a9a
  const n = ref(0);
  if (await X.IsScroll(item)) {                                                 // 7f00:1a9e
    g.ScrollItem = item;                                                  // 7f00:1aad
    spell = await SpellList(2, 1, spellIdx, n);                           // 7f00:1aba mode 2 'on Scroll'
  } else if (power(item, 2) > 0 && power(item, 3) < 0x80) {               // 7f00:1ad3
    g.ItemCast = 1;                                                       // 7f00:1ae7
    spell = power(item, 2);                                               // 7f00:1aec
  }
  if (spell === 0) {                                                      // 7f00:1af6
    done.v = false;                                                       // 7f00:1afc
    return;
  }
  const sc = () => g.SelectedChar;
  if (g.game_Mode === 5 && sc().b[0x10F] === 0) await X.DrawCombatLayout();   // 7f00:1b06
  if (g.ItemCast !== 0) {                                                 // 7f00:1b1e
    if (spell > 0x38) spell = spell - 0x17;                               // 7f00:1b28 TODO(decode): item-only spell numbering (notes (c)5)
    await X.ShowCharacterMessage(sc(), 'uses an item', 0x0A, 0);          // 7f00:1b32
    if (g.game_Mode === 5) {                                              // 7f00:1b54
      X.DrawText(0, 23, 0x0A, 'Item:');                                   // 7f00:1b5b
      X.BuildItemName(sc(), item, 5, 23, false, true);                    // 7f00:1b78
    } else
      X.BuildItemName(sc(), item, 1, 22, false, true);                    // 7f00:1b99
    await X.MessageDelay();                                               // 7f00:1bb8
    await X.ClearCharacterMessage();                                      // 7f00:1bbd
  }
  g.ItemCast = 1;                                                         // 7f00:1bc2
  await X.CastSpell(spell, sc().b[0x10F] /* controlled */, 0, done);      // 7f00:1bc7
  g.ItemCast = 0;                                                         // 7f00:1be2
  if (g.game_Mode === 5 && ds(0x3205 + spell * 16) !== 0)                 // 7f00:1be7 g_3205 = spell table byte 11 (TODO(decode): name)
    done.v = await X.ClearCombatantActionFlags(sc());                     // 7f00:1c00
  if (done.v) {                                                           // 7f00:1c13
    if (await X.IsScroll(item))                                                 // 7f00:1c1c
      await X.UseScrollSpell(sc(), item, spell);                          // 7f00:1c2b
    else if (power(item, 1) > 0) {                                        // 7f00:1c44
      if (item.b[0x39] > 1)                                               // 7f00:1c4e
        item.b[0x39] = item.b[0x39] - 1;                                  // 7f00:1c58
      else {
        item.b[0x3C] = byte(item.b[0x3C] - 1);                            // 7f00:1c61
        if (item.b[0x3C] === 0) X.LoseItem(sc(), item);                   // 7f00:1c68
      }
    }
  }
}

// 7F00:1CEE SellItem(item)
export async function SellItem(item) {
  let price = 0;                                                          // 7f00:1cf5
  const value = rdW(item.b, 0x3A);
  if (value > 0) price = value >> 1;                                      // 7f00:1cfa
  if (item.b[0x39] > 1) {                                                 // 7f00:1d10
    // quirk: (type <> 49h) or (type <> 1Ch) is always true (7f00:1d1a), the else branch is unreachable.
    if (item.b[0x2E] !== 0x49 || item.b[0x2E] !== 0x1C)
      price = Math.trunc(word(item.b[0x39] * price) / 20);                // 7f00:1d2e 16-bit product, DIV 14h
    else
      price = word(item.b[0x39] * price);                                 // 7f00:1d46 unreachable
  }
  X.BuildItemName(g.ViewChar, item, 0, 0, false, false);                  // 7f00:1d55
  await X.DrawWrappedText(1, 21, 38, 22, 0x0E, true,
    "I'll give you " + X.WordToStr(price) + ' gold pieces for your ' + itemName(item));   // 7f00:1d74
  if (keyOf(await X.AskYesNo('Is It a Deal? ', 0x0D, 0x0A, 0x0F)) === 'Y') {   // 7f00:1dc2
    await X.ShowTimedBottomMessage('Sold!');                              // 7f00:1de6
    const c = g.SelectedChar;
    X.LoseItem(c, item);                                                  // 7f00:1dfa
    const plat = Math.trunc(price / 5);                                   // 7f00:1e0d
    const gold = price % 5;                                               // 7f00:1e1a
    const room = ref(0);
    if (await X.WouldOverload(c, word(gold + plat), room)) {                    // 7f00:1e28 true = overloaded
      await X.ShowTimedBottomMessage('Overloaded.  Money will be put in pool.');   // 7f00:1e45
      const r = word(room.v);
      if (r > plat)                                                       // 7f00:1e59 unsigned (JBE)
        setMoney(c, 4, word(money(c, 4) + plat));                         // 7f00:1e61
      else {
        setMoney(c, 4, word(money(c, 4) + r));                            // 7f00:1e6f
        g.TreasureMoney[4] = (g.TreasureMoney[4] + word(plat - r)) | 0;   // 7f00:1e7b g_6804 LongInt
      }
      setMoney(c, 3, word(money(c, 3) + gold));                           // 7f00:1e8b
    } else {
      setMoney(c, 4, word(money(c, 4) + plat));                           // 7f00:1e99
      setMoney(c, 3, word(money(c, 3) + gold));                           // 7f00:1ea5
    }
  }
  X.ClearRectangle(1, 21, 38, 22);                                        // 7f00:1eb1
}

// 7F00:1F52 IdentifyItem(item; var redraw: Boolean)
export async function IdentifyItem(item, redraw) {
  let paid = false;                                                       // 7f00:1f59
  X.BuildItemName(g.ViewChar, item, 0, 0, false, false);                  // 7f00:1f5d
  await X.DrawWrappedText(1, 21, 38, 22, 0x0E, true,
    "For 200 gold pieces I'll identify your " + itemName(item));          // 7f00:1f7c
  if (keyOf(await X.AskYesNo('Is It a Deal? ', 0x0D, 0x0A, 0x0F)) === 'Y') {   // 7f00:1fad
    let m = MoneyInGold(g.SelectedChar);                                  // 7f00:1fd1
    if (m >= 200) {                                                       // 7f00:1fe3
      paid = true;                                                        // 7f00:1ff2
      m = m - 200;                                                        // 7f00:1ff6
      X.SetCharMoneyGold(word(m));                                        // 7f00:1fff
    } else {
      m = await X.MoneyValueInGold(g.TreasureMoney);                            // 7f00:2009 @DS:67F4
      if (m >= 200) {                                                     // 7f00:2019
        paid = true;                                                      // 7f00:2028
        m = m - 200;                                                      // 7f00:202c
        X.SetPoolMoneyGold(word(m));                                      // 7f00:2035
      } else
        await X.ShowTimedBottomMessage('Not Enough Money');               // 7f00:203f
    }
  }
  if (paid) {                                                             // 7f00:2053
    if (item.b[0x35] /* hidden */ === 0)                                  // 7f00:205c
      await X.DrawWrappedText(1, 21, 38, 22, 0x0E, true,
        "I can't tell anything new about your " + itemName(item));        // 7f00:2066
    else {
      item.b[0x35] = 0;                                                   // 7f00:2099
      X.BuildItemName(g.ViewChar, item, 0, 0, false, false);              // 7f00:20a1
      await X.DrawWrappedText(1, 21, 38, 22, 0x0E, true,
        'It looks like some sort of ' + itemName(item));                  // 7f00:20c0
      redraw.v = true;                                                    // 7f00:20f1
    }
  }
  if (paid) await X.MessageDelay();                                       // 7f00:20f8
  X.ClearRectangle(1, 21, 38, 22);                                        // 7f00:2103
}

// Coin list shared by TradeCoins / DropCoins (7f00:21b1..2312 and 24b2..2613): one node per non-zero kind,
// new node in front (list ends up Jewelry first); text = blanks(8 - len) + CoinName + ' ' + count.
function buildCoinList(c) {
  let head = null, prev = null, kinds = 0;                                // 7f00:21b1
  for (let i = 0; i <= 6; i++)                                            // 7f00:21ce
    if (money(c, i) !== 0) {                                              // 7f00:21d7
      kinds = kinds + 1;                                                  // 7f00:21ee (counted, never read)
      if (head === null) {                                                // 7f00:21f1
        head = { b: new Uint8Array(0x2E), next: null };                   // 7f00:21f9 GetMem(head, 2Eh)
      } else {
        prev = head;                                                      // 7f00:2217
        head = { b: new Uint8Array(0x2E), next: prev };                   // 7f00:2223
      }
      const num = String(money(c, i));                                    // 7f00:2243 Str(LongInt:0)
      const pad = byte(8 - coinName(i).length);                           // 7f00:2269
      const blanks = ' '.repeat(pad);                                     // 7f00:2284 / 2295
      setPstr(head.b, 0, blanks + coinName(i) + ' ' + num, 40);           // 7f00:22b9 string[40]
      head.b[0x29] = 0;                                                   // 7f00:2301
    }
  void kinds;
  return head;
}

// 7F00:2156 TradeCoins  (7F00:231A false entry and 7F00:2468 loop tail are inside this routine)
export async function TradeCoins() {
  // quirk: noMoney (BP-131h) is uninitialised when the coin list is cancelled on the first pass.
  let noMoney = true;                                                     // TODO(decode): garbage — fixed to non-zero (= leave)
  do {                                                                    // 7f00:215d
    const whom = ref(g.TradePartner);                                     // 7f00:215d
    await X.RedrawCurrentMode();                                          // 7f00:216a
    await X.SelectPartyCharacter('Trade to?', true, whom);                // 7f00:216f
    if (whom.v === null)
      noMoney = true;                                                     // 7f00:2194
    else {
      await DrawCharacterSheet();                                         // 7f00:219c
      let done;
      do {                                                                // 7f00:21a0
        DrawMoney();                                                      // 7f00:21a0
        g.TradePartner = whom.v;                                          // 7f00:21a4
        const list = ref(buildCoinList(g.SelectedChar));                  // 7f00:21b1 .. 2312
        const index = ref(0);                                             // 7f00:231e
        const redraw = ref(true);                                         // 7f00:2323
        const sel = ref(null);
        await X.VerticalListMenu('Select type of coin', '', 0x0D, 0x0A, 0x0F, 12, 7, 25, 13,
          list.v, true, redraw, index, sel);                              // 7f00:2328
        if (sel.v === null)
          done = true;                                                    // 7f00:2387
        else {
          const cn = ref('');                                             // 7f00:238f
          const coin = await X.CoinFromText(sel.v, cn);                         // 7f00:2394
          cn.v = 'How much ' + cn.v + 'will you trade? ';                 // 7f00:23a7
          const amount = await X.InputNumber(money(g.SelectedChar, coin), cn.v, 0x0A);   // 7f00:23db
          await X.TransferCoins(selRef(), whom, amount, coin);            // 7f00:23fe @SelectedChar, @whom
          done = true;                                                    // 7f00:2415
          noMoney = true;                                                 // 7f00:241a
          for (let i = 0; i <= 6; i++)                                    // 7f00:241f
            if (money(g.SelectedChar, i) > 0) {                           // 7f00:2428
              noMoney = false;                                            // 7f00:243c
              done = false;                                               // 7f00:2441
            }
        }
        if (list.v !== null) X.FreeMenuList(list);                        // 7f00:244c
      } while (!done);                                                    // 7f00:245e
    }
  } while (!noMoney);                                                     // 7f00:2468
}

// 7F00:24A7 DropCoins
export async function DropCoins() {
  let done;
  do {                                                                    // 7f00:24ae
    DrawMoney();                                                          // 7f00:24ae
    const list = ref(buildCoinList(g.SelectedChar));                      // 7f00:24b2 .. 2613
    const index = ref(0);                                                 // 7f00:261f
    const redraw = ref(true);                                             // 7f00:2624
    const sel = ref(null);
    await X.VerticalListMenu('Select type of coin', '', 0x0D, 0x0A, 0x0F, 12, 7, 25, 13,
      list.v, true, redraw, index, sel);                                  // 7f00:2628
    if (sel.v === null)
      done = true;                                                        // 7f00:2686
    else {
      const cn = ref('');                                                 // 7f00:268d
      const coin = await X.CoinFromText(sel.v, cn);                             // 7f00:2692
      cn.v = 'How much ' + cn.v + 'will you drop? ';                      // 7f00:26a5
      const amount = await X.InputNumber(money(g.SelectedChar, coin), cn.v, 0x0A);   // 7f00:26d9
      await X.DropCoinsToPool(g.SelectedChar, amount, coin);              // 7f00:26fc
      done = true;                                                        // 7f00:2711
      for (let i = 0; i <= 6; i++)                                        // 7f00:2715
        if (money(g.SelectedChar, i) > 0) done = false;                   // 7f00:271e
    }
    if (list.v !== null) X.FreeMenuList(list);                            // 7f00:273c
  } while (!done);                                                        // 7f00:274e
}

// 7F00:275B ItemOverloads(c, item): Boolean
export function ItemOverloads(c, item) {
  X.RecalcCharacter(c);                                                   // 7f00:2761
  let over = c.b[0xC7] /* item_count */ > 15;                             // 7f00:276c
  let w = rdW(item.b, 0x37);                                              // 7f00:277f weight
  if (item.b[0x39] > 0) w = word(item.b[0x39] * w);                       // 7f00:2789
  const limit = integer(X.StrWeightAllowance(c) + 1500);                  // 7f00:27a2 16-bit sum, CWD
  if (word(rdW(c.b, 0x102) + w) > limit)                                  // Word(enc + w) vs LongInt(limit)
    over = true;                                                          // 7f00:27cc
  return over;                                                            // 7f00:27d0
}

// 7F00:27DF CycleSelectedChar(key: Char)
export function CycleSelectedChar(key) {
  let p = g.PartyHead;                                                    // 7f00:27e5
  if (p !== null) {                                                       // 7f00:27f2
    if (key === 'G') {                                                    // 7f00:27fd scan 47h Home
      if (p === g.SelectedChar) {                                         // 7f00:2804
        while (p.next !== null) p = p.next;                               // 7f00:2816
      } else
        while (p !== null && p.next !== g.SelectedChar) p = p.next;       // 7f00:283c
    } else if (key === 'O') {                                             // 7f00:2874 scan 4Fh End
      if (g.SelectedChar.next !== null) p = g.SelectedChar.next;          // 7f00:2878
    } else
      p = g.PartyHead;                                                    // 7f00:289e
  }
  g.SelectedChar = p;                                                     // 7f00:28ab
}

// 7F00:28BE MoneyInGold(c): LongInt
export function MoneyInGold(c) {
  let total = 0;                                                          // 7f00:28c4
  for (let i = 0; i <= 4; i++)                                            // 7f00:28cc
    total = (total + Math.imul(money(c, i), coinValue(i))) | 0;           // 7f00:28d5 @LongMul
  return Math.trunc(((total + 100) | 0) / coinValue(3)) | 0;              // 7f00:290e CoinValue[3] = 200
}

// 7F00:299C SpellList(mode, flag: Byte; var index: Integer; var count: Byte): Byte
export async function SpellList(mode, flag, index, count) {
  let s;
  switch (mode) {                                                         // 7f00:29a3
    case 0: s = 'in Memory'; break;
    case 1: s = 'in Spell Book'; break;
    case 2: s = 'on Scroll'; break;
    case 3: s = 'on Scrolls'; break;
    case 4: s = 'to choose from'; break;
    case 5: s = 'to be memorized'; break;
    case 6: s = 'to be scribed'; break;
    default: s = '';                                                      // 7f00:2a57
  }
  count.v = byte(await X.BuildSpellList(mode));                           // 7f00:2a5b
  if (count.v !== 0) {                                                    // 7f00:2a6a
    if (index.v < 0) {                                                    // 7f00:2a76
      X.DrawTitledFrame(1, 1, 38, 1, 0, 0, '');                           // 7f00:2a7f
      X.DrawCharacterName(g.SelectedChar, 1, 1, true);                    // 7f00:2aa5
      X.DrawText(pstr(g.SelectedChar.b, 0).length + 4, 1, 0x0A, 'Spells ' + s);   // 7f00:2abb
    }
    return await X.ChooseSpell(flag, index);                              // 7f00:2aed
  }
  return 0;                                                               // 7f00:2b00
}

// 7F00:2B0D ov19_init — empty
export function ov19_init() {}                                            // 7f00:2b0d
