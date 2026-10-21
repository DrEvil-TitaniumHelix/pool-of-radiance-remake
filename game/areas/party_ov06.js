// game/areas/party_ov06.js — PARTY ov06 (seg 3E00): the shop. Source: decode/pseudo/party_parts/ov06.pas.md
// por-only: Pool character/party creation, roster, save layouts, shops and training rules (whole module) (profile: engine.areaModules / recordSizes / saveFormat; game/profiles/PORONLY.md)
// (= PARTY.pas.md ## ov06), asm decode/listings/ov06.lst. Screens: EV-13 / EV-13a / EV-13c (PARTY-ov06-01..04).
// Conventions: party_core.js.
//
// Wares = TreasureItems (DS:6810, item chain filled by the ECL script); money pool = TreasureMoney (DS:67F4, 7 LongInts,
// a JS array). Item fields: name string[40] +00h, +29h (= the menu isHeader byte in the original's shared layout),
// value word +3Ah. The ov25 list menu takes { text, isHeader, next } nodes (engine/menus.js), so ShopItemsMenu builds a
// node chain over the item chain (node.item = the ware) — the original passes the item list itself (layouts coincide).

import { X, g, rdW, wrW, pstr, setPstr, newItem } from './party_core.js';
import { dev } from '../engine/dev.js';

// 3E00:0030 ShopItemsMenu(var key; var chosen; var cur; var index)
export async function ShopItemsMenu(key, chosen, cur, index) {
  const redraw = { v: true };                                     // 3e00:0036
  for (let item = g.TreasureItems; item; item = item.next) {      // 3e00:003a / 0047
    const line = Array(30).fill(' ');                             // 3e00:0060  string[30], CS:0000 = 30 blanks
    if (rdW(item.b, 0x3A) === 0) wrW(item.b, 0x3A, 1);            // 3e00:0068  quirk: free wares cost 1 gp
    const num = String(rdW(item.b, 0x3A));                        // 3e00:008f  Str(LongInt(value):0, num)
    for (let k = 1; k <= num.length; k++) line[30 - num.length + k - 1] = num[k - 1];   // 3e00:00d0
    const name = pstr(item.b, 0);
    // 3e00:00ea / 010d: name over the left part; quirk: characters past 30 land outside the 30-char line (lost)
    for (let k = 1; k <= name.length; k++) if (k <= 30) line[k - 1] = name[k - 1];
    setPstr(item.b, 0, line.join(''), 40);                        // 3e00:0126  StrAssign(40)
    item.b[0] = 30;                                               // 3e00:012e
  }
  X.DrawTitledFrame(1, 1, 38, 22, 0, 15, 'Shop');                 // 3e00:0167  pushes 1, 1, 26h, 16h, 0, 0Fh
  // list := TreasureItems (3e00:016c) — as menu nodes
  let head = null, last = null, curNode = null;
  for (let item = g.TreasureItems; item; item = item.next) {
    const n = { text: pstr(item.b, 0), isHeader: item.b[0x29], next: null, item };
    if (!head) head = n; else last.next = n;
    last = n;
    if (item === cur.v) curNode = n;
  }
  const node = { v: curNode };
  dev.screenSoon('EV-13a');
  key.v = await X.VerticalListMenu('Items: ', 'Buy', 0x0D, 0x0A, 0x0F, 1, 4, 38, 22, head, true, redraw, index, node);   // 3e00:01c4
  cur.v = node.v ? node.v.item : null;
  chosen.v = cur.v;                                               // 3e00:01cf
  for (let item = g.TreasureItems; item; item = item.next)        // 3e00:01e3 / 01f0
    X.BuildItemName(null, item, 0, 0, false, false);              // 3e00:0210  restore the name
}

// 3E00:0239 AddItemToChar(item; var failed) — stub ov06 e2; also called by ov05 TakeLootItems
export async function AddItemToChar(item, failed) {
  const c = g.SelectedChar;
  if (await X.ItemOverloads(c, item)) {                           // 3e00:024d
    await X.ShowTimedBottomMessage('OverLoaded');                 // 3e00:0265
    failed.v = true;                                              // 3e00:026a
    return;                                                       // 3e00:0271  no RecalcCharacter on this path
  }
  failed.v = false;                                               // 3e00:0274
  const q = newItem();                                            // 3e00:029b / 0300  GetMem($3F)
  q.b.set(item.b.subarray(0, 0x3F));                              // 3e00:02b4 / 0319  CopyBytes 3Fh
  q.next = null;                                                  // 3e00:02bc / 0321
  let p = c.items;                                                // 3e00:027b  +C8h
  if (p === null) c.items = q;                                    // 3e00:02cc
  else {
    while (p.next !== null) p = p.next;                           // 3e00:02dc
    p.next = q;                                                   // 3e00:0331
  }
  await X.RecalcCharacter(c);                                     // 3e00:0344
}

// 3E00:0361 ShopBuy — buyer = SelectedChar; own coins first, else the pool
export async function ShopBuy() {
  const key = { v: '\0' }, chosen = { v: null };                  // 3e00:0367
  const cur = { v: g.TreasureItems }, index = { v: 1 };           // 3e00:036f / 037c
  let leave;
  do {
    await ShopItemsMenu(key, chosen, cur, index);                 // 3e00:0396
    if (key.v !== 'B' && key.v !== '\r') leave = true;            // 3e00:0399 / 039f  Exit, Esc
    else {
      leave = false;                                              // 3e00:03ac
      const price = rdW(chosen.v.b, 0x3A);                        // 3e00:03b0  word
      let gold = (await X.MoneyInGold(g.SelectedChar)) & 0xFFFF;  // 3e00:03c2  quirk: only the low word is kept
      const failed = { v: false };
      if (price <= gold) {                                        // 3e00:03ca  JA = unsigned
        await AddItemToChar(chosen.v, failed);                    // 3e00:03de
        if (!failed.v) {
          gold = (gold - price) & 0xFFFF;                         // 3e00:03e7
          await X.SetCharMoneyGold(gold);                         // 3e00:03f3
        }
      } else {
        let pool = (await X.MoneyValueInGold(g.TreasureMoney)) | 0;   // 3e00:03ff  LongInt
        if (price <= pool) {                                      // 3e00:040a .. 0419  signed LongInt compare
          await AddItemToChar(chosen.v, failed);                  // 3e00:0427
          if (!failed.v) {
            pool = (pool - price) | 0;                            // 3e00:0430
            await X.SetPoolMoneyGold(pool & 0xFFFF);              // 3e00:044c  low word
          }
        } else await X.ShowTimedBottomMessage('Not enough Money.');   // 3e00:0462
      }
    }
  } while (!leave);                                               // 3e00:0467
}

// 3E00:053E Shop — stub ov06 e1; ECL COMBAT with the shop flag (ecl.js host.shop())
export async function Shop() {
  g.game_Mode = 1;                                                // 3e00:0545
  await X.RedrawCurrentMode();                                    // 3e00:054a
  await X.DrawPartyRoster(g.SelectedChar);                        // 3e00:0557
  if (!Array.isArray(g.TreasureMoney)) g.TreasureMoney = [0, 0, 0, 0, 0, 0, 0];
  g.TreasureMoney.fill(0);                                        // 3e00:0568  FillChar(TreasureMoney, $1C, 0)
  const prompt = '';                                              // 3e00:056d
  g.PoolHasMoney = 0;                                             // 3e00:0571  g_6DC0
  let leave = false;                                              // 3e00:0576
  for (let item = g.TreasureItems; item; item = item.next)        // 3e00:05a7
    X.BuildItemName(null, item, 0, 0, false, false);
  const hasMoney = { v: false }, hasItems = { v: false };
  const appraised = { v: false };                                 // [BP-32h] uninitialised, but only read after AppraiseGems, which always writes it (8900:19b9)
  do {
    await X.TreasurePoolStatus(hasMoney, hasItems);               // 3e00:05c9
    const opts = hasMoney.v ? 'Buy View Take Pool Share Appraise Exit'   // 3e00:05e2
      : 'Buy View Pool Appraise Exit';                            // 3e00:05f7
    dev.screenSoon('EV-13');
    const r = await X.HorizontalMenu(prompt, opts, 0x0D, 0x0A, 0x0F, true, false);   // 3e00:061a
    const key = r.key;
    // quirk: the ext flag is ignored except for 'P' — extended keys whose scan code is an option letter act as it
    switch (key) {
      case 'B': await ShopBuy(); break;                           // 3e00:062a
      case 'V': await X.ViewMenu({ v: r.ext }); break;            // 3e00:0639  quirk: ViewMenu gets the menu's ext flag
      case 'T': await X.TakeMoney(); break;                       // 3e00:0645
      case 'P': if (!r.ext) await X.PoolMoney(); break;           // 3e00:0651
      case 'S': await X.ShareMoney(); break;                      // 3e00:0663
      case 'A': await X.AppraiseGems(appraised); break;           // 3e00:0674
      case 'E': {                                                 // 3e00:067c
        await X.TreasurePoolStatus(hasMoney, hasItems);           // 3e00:068d
        if (!hasMoney.v) leave = true;                            // 3e00:073b
        else {
          await X.DrawWrappedText(1, 17, 38, 22, 10, true,
            'As you Leave the Shopkeeper says, "Excuse me but you have Left Some Money here."  ');   // 3e00:06d0
          await X.DrawWrappedText(1, 17, 38, 22, 15, false, 'Do you want to go back and get your Money?');   // 3e00:06f6
          dev.screenSoon('EV-13c');
          if ((await X.MenuSelect(prompt, '~Yes ~No', 0x0D, 0x0A, 0x0F, false, 0)) === 1) leave = true;   // 3e00:0714 / 071c  1 = No
          else X.ClearTextRectangle(1, 17, 38, 22);               // 3e00:0734
        }
        break;
      }
      case 'G': case 'O': await X.CycleSelectedChar(key); break;  // 3e00:0749 / 0758  Home / End scan codes
    }
    if (key === 'B' || key === 'T') await X.RedrawCurrentMode();  // 3e00:075d / 0768
    else if (key === 'A' && appraised.v) await X.RedrawCurrentMode();   // 3e00:076f / 0779
    await X.DrawPartyRoster(g.SelectedChar);                      // 3e00:0786
  } while (!leave);                                               // 3e00:078b
}

// 3E00:0798 ov06_init — empty unit initialiser (main init chain 0000:00D3)
export function ov06_init() {}
