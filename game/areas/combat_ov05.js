// game/areas/combat_ov05.js — COMBAT ov05 (seg 3900): after combat — outcome, duel, experience, treasure.
// Lane por-build-combat. Source: decode/pseudo/COMBAT.pas.md "## ov05 (seg 3900)" (FINAL, verified),
// combat_parts/ov05_notes.md, COMBAT_SCREENS.md (COMBAT-01..05); evidence decode/listings/ov05.lst.
// Conventions: combat_core.js header; local conventions as combat_ov24.js:
// - Pascal `var` parameters = ref objects `{ v }` (ComputeCombatXP(ref), ChooseLootItem(refs), TakeTreasureMenu(refs);
//   external TreasurePoolStatus(refMoney, refItems), AddItemToChar(item, refRefused), ViewMenu(refSpecial),
//   CastSpell(spell, a, b, refSpecial), VerticalListMenu(..., refFlag, refIndex, refCur)).
// - HorizontalMenu = engine menus.js shape: X.HorizontalMenu(title, items, c0E, c0C, c0A, enterOk, animate)
//   -> { key, ext }; the pseudocode's `var special` is `ext`. Esc = '\0', Enter = '\r'.
// - ecl_Mem6B00^.w[x] = g.ecl_Mem6B00[x >> 1] (the VM's Uint16Array mem6B00; byte offset x).
// - LongInt arithmetic wraps to 32 bits (`| 0`); TreasureMoney = g.TreasureMoney[0..6] (LongInts).

import { g, X, cr, charName, rdW, newItem, integer, shortint, byte } from './combat_core.js';
import { Roll } from './combat_ov24.js';

// TChar fields (SAVES.md §3)
const STR = 0x10, INT = 0x11, WIS = 0x12, DEX = 0x13, MEM_SPELL = 0x17, CLASS = 0x2F, LEVEL_MAIN = 0x73,
  NPC_MORALE = 0x84, B85 = 0x85, MONEY = 0x88, XP = 0xAC, HP_ROLLED = 0xB1, XP_VALUE = 0xB8, XP_PER_HP = 0xBA,
  STATUS = 0x10C, ACTIVE = 0x10D, SIDE = 0x10E, HP = 0x11B;
// Item fields (SAVES.md §4)
const I_PLUS = 0x32, I_READIED = 0x34, I_VALUE = 0x3A;
const ITEM_SIZE = 0x3F;

const eclW = (x) => g.ecl_Mem6B00[x >> 1];
const setEclW = (x, v) => { g.ecl_Mem6B00[x >> 1] = v & 0xFFFF; };
const L = (v) => v | 0;                                     // LongInt wrap
const ldiv = (a, b) => {                                    // @LongDivMod (signed); 0 -> runtime error 200
  if (b === 0) throw new Error('Runtime error 200 (division by zero)');
  return L(Math.trunc(a / b));
};
const rdL = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) | 0;
const wrL = (b, o, v) => { b[o] = v & 0xFF; b[o + 1] = (v >>> 8) & 0xFF; b[o + 2] = (v >>> 16) & 0xFF; b[o + 3] = (v >>> 24) & 0xFF; };
const isNonParty = (c) => cr(c).b[0x13] === 1;              // combat record +13h = 1: not a party member (M)

async function hmenu(title, items, c0E, c0C, c0A, enterOk, animate) {
  const r = await X.HorizontalMenu(title, items, c0E, c0C, c0A, enterOk, animate);
  return typeof r === 'string' ? { key: r, ext: false } : r;
}

// 3900:0000 ComputeCombatXP(var xp: LongInt)
export async function ComputeCombatXP(xp) {
  if (g.DuelActive !== 0 && eclW(0x5CC) !== 0) {                                       // { 3900:0006 }
    xp.v = integer(shortint(g.SelectedChar.b[LEVEL_MAIN]) * 100);                      // { 3900:0019  16-bit product, CWD }
    return;
  }
  let total = 0;                                                                       // { 3900:0035 }
  let c = g.PartyHead;                                                                 // { 3900:003d }
  let taken = 0;                                                                       // { 3900:004a }
  while (c) {                                                                          // { 3900:004e }
    let it = c.items;                                                                  // { 3900:0059 }
    if (c.b[SIDE] === 1 && c.b[STATUS] !== 3) {                                        // { 3900:006c  enemy, not Running }
      g.EnemiesFought = 1;                                                             // { 3900:0088 }
      for (let k = 0; k <= 6; k++)                                                     // { 3900:008d }
        g.TreasureMoney[k] = L(g.TreasureMoney[k] + rdW(c.b, MONEY + 2 * k));          // { 3900:0096 }
      // quirk: hp_rolled * xp_per_hp is a 16-bit product, sign-extended (CWD): > 32767 turns negative.
      total = L(total + rdW(c.b, XP_VALUE) + integer(c.b[HP_ROLLED] * c.b[XP_PER_HP]));   // { 3900:00c4 }
      if (eclW(0x5C6) !== 1)                                                           // { 3900:00fb  1 = no loot }
        while (it) {                                                                   // { 3900:010a }
          if (rdW(it.b, I_VALUE) > 0 || (taken < 8 && Roll(1, 10) <= 3)) {             // { 3900:0115  short-circuit }
            taken = taken + 1;                                                         // { 3900:013a }
            const old = g.TreasureItems;                                               // { 3900:013d / 01a0 }
            const t = newItem();                                                       // { 3900:0146  GetMem($3F) }
            g.TreasureItems = t;
            await X.BuildItemName(c, it, 0, 0, 0, 0);                                  // { 3900:0156 }
            t.b.set(it.b.subarray(0, ITEM_SIZE));                                      // { 3900:0173  63-byte copy }
            t.b[I_READIED] = 0;                                                        // { 3900:0187 }
            t.next = old;                                                              // { 3900:0190  pushed at the head }
          }
          it = it.next;                                                                // { 3900:0209 }
        }
    }
    c = c.next;                                                                        // { 3900:021d }
  }
  const tm = g.TreasureMoney;
  total = L(total + ldiv(tm[0], 200));                                                 // { 3900:0233  copper }
  total = L(total + ldiv(tm[1], 20));                                                  // { 3900:024a  silver }
  total = L(total + ldiv(tm[2], 2));                                                   // { 3900:0261  electrum }
  total = L(total + tm[3]);                                                            // { 3900:0278  gold }
  total = L(total + Math.imul(tm[4], 5));                                              // { 3900:0285  platinum }
  total = L(total + Math.imul(tm[5], 250));                                            // { 3900:029c  gems }
  total = L(total + Math.imul(tm[6], 2200));                                           // { 3900:02b3  jewelry }
  let it = g.TreasureItems;                                                            // { 3900:02ca }
  while (it && it !== g.g_5D9A) {                                                      // { 3900:02d7  mark set in combat }
    if (shortint(it.b[I_PLUS]) > 0)                                                    // { 3900:02f1 }
      total = L(total + integer(shortint(it.b[I_PLUS]) * 400));                        // { 3900:02fb  16-bit MUL, CWD }
    it = it.next;                                                                      // { 3900:030f }
  }
  xp.v = ldiv(total, (eclW(0x67C) - byte(g.NonSharing)) & 0xFFFF);                    // { 3900:0322  0 -> RTE 200 }
}

// 3900:0355 AwardXP(xp: LongInt)
export function AwardXP(xp) {
  xp = L(xp);
  let c = g.PartyHead;                                                                 // { 3900:035b }
  while (c) {                                                                          // { 3900:0368 }
    if (c.b[ACTIVE] !== 0 && c.b[STATUS] !== 1) {                                      // { 3900:0373 }
      let share = xp;                                                                  // { 3900:038f }
      switch (c.b[CLASS]) {                                                            // { 3900:039b }
        case 0: if (c.b[WIS] > 15) share = L(ldiv(xp, 10) + xp); break;                // { 3900:03a6  cleric }
        case 2: if (c.b[STR] > 15) share = L(ldiv(xp, 10) + xp); break;                // { 3900:03d3  fighter }
        case 5: if (c.b[INT] > 15) share = L(ldiv(xp, 10) + xp); break;                // { 3900:0400  magic-user }
        case 6: if (c.b[DEX] > 15) share = L(ldiv(xp, 10) + xp); break;                // { 3900:042c  thief }
        case 8: case 10: case 11: case 12: case 13: case 14: case 16:
          share = ldiv(xp, 2); break;                                                  // { 3900:0454 }
        case 9: case 15:
          share = ldiv(xp, 3); break;                                                  // { 3900:047c }
      }                                                                                // druid, paladin, ranger, monk: xp
      wrL(c.b, XP, L(rdL(c.b, XP) + share));                                           // { 3900:049a }
    }
    c = c.next;                                                                        // { 3900:04ad }
  }
}

// 3900:04C9 ResolveCombatOutcome
export async function ResolveCombatOutcome() {
  g.NonSharing = 0;                                                                    // { 3900:04cf }
  g.PartyDead = 1;                                                                     // { 3900:04d4 }
  g.PartyFled = 0;                                                                     // { 3900:04d9 }
  let c = g.PartyHead;                                                                 // { 3900:04de }
  while (c && !isNonParty(c)) {                                                        // { 3900:04eb }
    if (c.b[STATUS] === 3) g.PartyFled = 1;                                            // { 3900:0502 }
    c = c.next;                                                                        // { 3900:0512 }
  }
  if (g.DuelActive !== 0) g.PartyDead = 0;                                             // { 3900:0527 }
  g.PartyWon = 0;                                                                      // { 3900:0533 }
  c = g.PartyHead;                                                                     // { 3900:0538 }
  const xpRef = { v: g.CombatXP };
  if (g.DuelActive === 0) {                                                            // { 3900:0545 }
    while (c && !isNonParty(c)) {                                                      // { 3900:054f }
      if ([3, 1, 0].includes(c.b[STATUS]) || eclW(0x5CC) === 1)                        // { 3900:056c }
        if (c.b[SIDE] === 0 && c.b[NPC_MORALE] < 0x80) g.PartyDead = 0;                // { 3900:0599 }
      if ([1, 0].includes(c.b[STATUS])) {                                              // { 3900:05b4 }
        g.PartyWon = 1;                                                                // { 3900:05ca }
        g.PartyFled = 0;                                                               // { 3900:05cf }
      }
      if (c.b[ACTIVE] === 0 || c.b[STATUS] === 1) g.NonSharing = byte(g.NonSharing + 1);   // { 3900:05d4 }
      c = c.next;                                                                      // { 3900:05ee }
    }
    if (g.PartyWon !== 0) {                                                            // { 3900:0604 }
      await ComputeCombatXP(xpRef); g.CombatXP = xpRef.v;                              // { 3900:060b }
      AwardXP(g.CombatXP);                                                             // { 3900:0614 }
    }
    c = g.PartyHead;                                                                   // { 3900:0620 }
    if (g.PartyDead === 0) {                                                           // { 3900:062d }
      while (c && !isNonParty(c)) {                                                    // { 3900:0637 }
        if (g.PartyFled === 0) {                                                       // { 3900:0654 }
          switch (c.b[STATUS]) {                                                       // { 3900:065b }
            case 3: c.b[STATUS] = 0; c.b[ACTIVE] = 1; break;                           // { 3900:0667  Running -> Okay }
            case 5: c.b[STATUS] = 4; break;                                            // { 3900:067f  Dying -> Unconscious }
            case 4: if (c.b[HP] > 0) { c.b[STATUS] = 0; c.b[ACTIVE] = 1; } break;      // { 3900:068e }
          }
        } else {
          setEclW(0x58E, 0x81);                                                        // { 3900:06ad  fled }
          if (c.b[STATUS] === 3) { c.b[STATUS] = 0; c.b[ACTIVE] = 1; }                 // { 3900:06b8 }
          else {
            g.SelectedChar = c;                                                        // { 3900:06d7 }
            // quirk: a member left behind after fleeing is removed from the party (record freed).
            await X.RemoveFromParty(0, 1);                                             // { 3900:06e4 }
          }
        }
        c = c.next;                                                                    // { 3900:06ef  quirk: read after c may have been freed }
      }
    } else {
      c = g.PartyHead;                                                                 // { 3900:0707 }
      let stop = false;                                                                // { 3900:0714 }
      while (c && !stop) {                                                             // { 3900:0718 }
        if (isNonParty(c)) stop = true;                                                // { 3900:0726 }
        else {
          g.SelectedChar = c;                                                          // { 3900:0735 }
          await X.RemoveFromParty(0, 1);                                               // { 3900:0742 }
        }
        c = c.next;                                                                    // { 3900:0753  read after free }
      }
      setEclW(0x67C, 0);                                                               // { 3900:0768  no party members }
    }
  } else {                                                                             // duel
    c = g.PartyHead;                                                                   // { 3900:0776 }
    while (c) {                                                                        // { 3900:0783 }
      if (c.b[ACTIVE] === 1 && c.b[STATUS] === 0 && c.b[SIDE] !== 1) {                 // { 3900:078b }
        g.PartyWon = 1;                                                                // { 3900:07ac }
        await ComputeCombatXP(xpRef); g.CombatXP = xpRef.v;                            // { 3900:07b1 }
        AwardXP(g.CombatXP);                                                           // { 3900:07ba }
      }
      c = c.next;                                                                      // { 3900:07c6 }
    }
    c = g.PartyHead;                                                                   // { 3900:07db }
    while (c) {                                                                        // { 3900:07e8 }
      if ([0, 1].includes(c.b[STATUS])) c.b[ACTIVE] = 1;                               // { 3900:07f0 }
      if (c.b[STATUS] === 5) c.b[STATUS] = 4;                                          // { 3900:080f }
      c = c.next;                                                                      // { 3900:0823 }
    }
  }
}

// 3900:0916 ShowCombatResult(xp: LongInt) — COMBAT-01
export async function ShowCombatResult(xp) {
  const title = '';                                                                    // { 3900:091d }
  await X.DrawTitledFrame(1, 1, 38, 22, 0, 15, '');                                    // { 3900:0922 }
  if (g.EnemiesFought !== 0 || g.DuelActive !== 0) {                                   // { 3900:0949 }
    if (g.DuelActive !== 0 && g.PartyWon === 0) {                                      // { 3900:095a }
      await X.DrawText(1, 3, 10, 'You have lost the duel.');                           // { 3900:0968 }
      xp = 0;                                                                          // { 3900:0986 }
    } else if (g.DuelActive !== 0)
      await X.DrawText(1, 3, 10, 'You have won the duel.');                            // { 3900:0997 }
    else
      await X.DrawText(1, 3, 10, 'The party has won.');                                // { 3900:09b7 }
  } else if (g.PartyFled !== 0) {                                                      // { 3900:09d7 }
    await X.DrawText(1, 3, 10, 'The party has fled.');                                 // { 3900:09de }
    xp = 0;                                                                            // { 3900:09fc }
  } else
    await X.DrawText(1, 3, 10, 'The party has found Treasure!');                       // { 3900:0a06 }
  const n = String(L(xp)).slice(0, 10);                                                // { 3900:0a24  Str(xp:0, n) string[10] }
  let s;
  if (g.DuelActive !== 0) s = 'The duelist receives ' + n;                             // { 3900:0a3b }
  else s = 'Each character receives ' + n;                                             // { 3900:0a6d }
  await X.DrawText(1, 5, 10, s);                                                       // { 3900:0a96 }
  await X.DrawText(1, 7, 10, 'experience points.');                                    // { 3900:0aaa }
  await hmenu(title, 'press <enter>/<return> to continue', 15, 15, 15, 1, 0);          // { 3900:0ac8  result unused }
}

// 3900:0B14 ChooseLootItem(var key, var sel, var cur, var index)
export async function ChooseLootItem(key, sel, cur, index) {
  const flag = { v: 1 };                                                               // { 3900:0b1a }
  await X.DrawTitledFrame(1, 1, 38, 22, 0, 15, 'Loot');                                // { 3900:0b1e }
  let it = g.TreasureItems;                                                            // { 3900:0b44 }
  while (it) {                                                                         // { 3900:0b51 }
    await X.BuildItemName(null, it, 0, 0, 0, 0);                                       // { 3900:0b59 }
    it = it.next;                                                                      // { 3900:0b76 }
  }
  const list = g.TreasureItems;                                                        // { 3900:0b89 }
  key.v = await X.VerticalListMenu('Items: ', 'Take', 13, 10, 15, 1, 4, 38, 22, list, 1, flag, index, cur);   // { 3900:0b96 }
  sel.v = cur.v;                                                                       // { 3900:0bec }
}

// 3900:0C06 TakeLootItems
export async function TakeLootItems() {
  const sel = { v: null };                                                             // { 3900:0c0c }
  const cur = { v: g.TreasureItems };                                                  // { 3900:0c14 }
  const index = { v: 0 };                                                              // { 3900:0c21 }
  const key = { v: '\0' };
  let done;
  do {
    await ChooseLootItem(key, sel, cur, index);                                        // { 3900:0c26 }
    if (key.v !== 'T' && key.v !== '\r') done = true;                                  // { 3900:0c3e }
    else {
      done = false;                                                                    // { 3900:0c51 }
      const refused = { v: false };
      await X.AddItemToChar(sel.v, refused);                                           // { 3900:0c55  give to SelectedChar }
      if (!refused.v) {                                                                // { 3900:0c65 }
        const s = sel.v;
        if (g.TreasureItems === s) g.TreasureItems = s.next;                           // { 3900:0c6e }
        else {
          let p = g.TreasureItems;                                                     // { 3900:0c6e }
          while (p.next !== s) p = p.next;                                             // { 3900:0c9f }
          p.next = s.next;                                                             // { 3900:0cc7 }
        }
        s.next = null;                                                                 // { 3900:0cdd }
        // FreeMem(sel, $3F) when sel <> nil                                           { 3900:0cea }
        if (!g.TreasureItems) done = true;                                             // { 3900:0d01 }
      }
    }
  } while (!done);                                                                     // { 3900:0d0e }
  await X.RedrawCurrentMode();                                                         // { 3900:0d17 }
}

// 3900:0D38 TakeTreasureMenu(var money, var items) — COMBAT-04
export async function TakeTreasureMenu(money, items) {
  let done = false;                                                                    // { 3900:0d3e }
  if (!money.v) { await TakeLootItems(); return; }                                     // { 3900:0d42 / 0e24 }
  if (!items.v) { await X.TakeMoney(); await X.RedrawCurrentMode(); return; }          // { 3900:0d4e / 0e18 }
  do {
    const { key } = await hmenu('Take: ', 'Money Items Exit', 13, 10, 15, 1, 1);       // { 3900:0d5a }
    switch (key) {                                                                     // { 3900:0d94 }
      case 'M': await X.TakeMoney(); await X.RedrawCurrentMode(); break;               // { 3900:0d9b }
      case 'I': await TakeLootItems(); break;                                          // { 3900:0dab }
      case 'E': case '\0': done = true; break;                                         // { 3900:0db9 }
      case 'G': case 'O': await X.CycleSelectedChar(key); break;                       // { 3900:0dc3 / 0dd2  special ignored }
    }
    await X.DrawPartyRoster(g.SelectedChar);                                           // { 3900:0ddb }
    await X.TreasurePoolStatus(money, items);                                          // { 3900:0de8 }
    if (!money.v || !items.v) done = true;                                             // { 3900:0df7 }
  } while (!done);                                                                     // { 3900:0e0d }
}

// 3900:0ECD TreasureMenu — COMBAT-03 / COMBAT-05
export async function TreasureMenu() {
  const title = '';                                                                    // { 3900:0ed4 }
  let done = false;                                                                    // { 3900:0ed9 }
  const money = { v: false }, items = { v: false }, special = { v: false };
  let spell = 0;                                                                       // TODO(decode): garbage (uninitialised local, only read after Detect was offered)
  await X.RedrawCurrentMode();                                                         // { 3900:0ede }
  do {
    money.v = false;                                                                   // { 3900:0ee3 }
    await X.TreasurePoolStatus(money, items);                                          // { 3900:0ee7 }
    let menu = 'View Pool Exit';                                                       // { 3900:0ef6 }
    let i = 0;                                                                         // { 3900:0f0a }
    let tail = ' Exit';                                                                // { 3900:0f0f  string[13] }
    let detect = false;                                                                // { 3900:0f23 }
    while (items.v && i <= 20 && !detect) {                                            // { 3900:0f28 }
      const m = g.SelectedChar.b[MEM_SPELL + i];
      if (m === 5 || m === 0x0B) {                                                     // { 3900:0f3c  Detect Magic }
        detect = true;                                                                 // { 3900:0f62 }
        spell = m;                                                                     // { 3900:0f67 }
      }
      i = i + 1;                                                                       // { 3900:0f7b }
    }
    if (detect) tail = ' Detect Exit';                                                 // { 3900:0f81 }
    if (money.v) menu = 'View Take Pool Share' + tail;                                 // { 3900:0f9c }
    else if (items.v) menu = 'View Take Pool' + tail;                                  // { 3900:0fce }
    const r = await hmenu(title, menu, 13, 10, 15, 1, 1);                              // { 3900:0ffe }
    const key = r.key; special.v = r.ext;
    switch (key) {                                                                     // { 3900:1028 }
      case 'V': await X.ViewMenu(special); break;                                      // { 3900:1030 }
      case 'T': await TakeTreasureMenu(money, items); break;                           // { 3900:1042 }
      case 'P': if (!special.v) await X.PoolMoney(); break;                            // { 3900:1057 }
      case 'S': await X.ShareMoney(); break;                                           // { 3900:106a }
      case 'D': await X.CastSpell(spell, 0, 0, special); break;                        // { 3900:1076 }
      case 'E': case '\0':                                                             // { 3900:109a }
        await X.TreasurePoolStatus(money, items);
        if (!money.v && !items.v) done = true;                                         // { 3900:10a9 / 115f }
        else {
          menu = '~Yes ~No';                                                           // { 3900:10b8 }
          await X.DrawWrappedText(1, 17, 38, 22, 10, 1, 'There is still treasure left.  ');   // { 3900:10cc }
          await X.DrawWrappedText(1, 17, 38, 22, 15, 0, 'Do you want to go back and claim your treasure?');   // { 3900:10f3 }
          const ans = await X.MenuSelect(title, menu, 13, 10, 15, 0, 0);              // { 3900:111a }
          if (ans === 1) done = true;                                                  // { 3900:113e  "No" }
          else await X.ClearTextRectangle(1, 17, 38, 22);                              // { 3900:114c }
        }
        break;
      case 'G': case 'O':                                                              // { 3900:116a / 1187 }
        await X.CycleSelectedChar(key); await X.DrawPartyRoster(g.SelectedChar); break;
    }
  } while (!done);                                                                     // { 3900:119e }
}

// 3900:11AC RemoveMonstersAfterCombat
export async function RemoveMonstersAfterCombat() {
  setEclW(0x590, 0);                                                                   // { 3900:11b2 }
  let c = g.PartyHead;                                                                 // { 3900:11bd }
  while (c) {                                                                          // { 3900:11ca }
    if (isNonParty(c) || c.b[SIDE] === 1) {                                            // { 3900:11d5 }
      if (c.b[ACTIVE] !== 1) setEclW(0x590, eclW(0x590) + 1);                          // { 3900:11ef  defeated enemies }
      const n = c.next;                                                                // { 3900:1203 }
      g.SelectedChar = c;                                                              // { 3900:1216 }
      await X.RemoveFromParty(isNonParty(c) ? 1 : 0, 1);                               // { 3900:1223 }
      c = n;                                                                           // { 3900:123e }
    } else {
      if (c.combat) {                                                                  // { 3900:124c }
        c.combat = null;                                                               // { 3900:125b / 1271  FreeMem($16), nil }
      }
      c = c.next;                                                                      // { 3900:1280 }
    }
  }
  g.SelectedChar = g.PartyHead;                                                        // { 3900:1296 }
}

// 3900:12E8 NpcTakesShare — COMBAT-02
export async function NpcTakesShare() {
  let hid = false;                                                                     // { 3900:12ef }
  let c = g.PartyHead;                                                                 // { 3900:12f3 }
  let npcShares = 0, totalShares = 0;                                                  // { 3900:1300 }
  while (c) {                                                                          // { 3900:1308 }
    if (c.b[NPC_MORALE] > 0x7F && c.b[STATUS] === 0) {                                 // { 3900:1310 }
      npcShares = byte(npcShares + (c.b[B85] & 7));                                    // { 3900:1326 }
      totalShares = byte(totalShares + (c.b[B85] & 7));                                // { 3900:1333 }
    } else totalShares = byte(totalShares + 1);                                        // { 3900:1342 }
    c = c.next;                                                                        // { 3900:1345 }
  }
  if (npcShares > 0)                                                                   // { 3900:135a }
    for (let k = 0; k <= 6; k++)                                                       // { 3900:1360 }
      if (g.TreasureMoney[k] > 0) {                                                    // { 3900:1369  signed }
        const per = byte(ldiv(g.TreasureMoney[k], totalShares));                       // { 3900:1383 }  quirk: quotient truncated to a byte
        g.TreasureMoney[k] = L(g.TreasureMoney[k] - integer(per * npcShares));         // { 3900:13a8 }
        hid = true;                                                                    // { 3900:13cd }
      }
  if (hid) {                                                                           // { 3900:13d7 }
    await X.DrawTitledFrame(1, 1, 38, 22, 0, 15, '');                                  // { 3900:13e0 }
    c = g.PartyHead;                                                                   // { 3900:1406 }
    let row = 0;                                                                       // { 3900:1413 }
    while (c) {                                                                        // { 3900:1417 }
      if (c.b[NPC_MORALE] > 0x7F && c.b[STATUS] === 0 && c.b[B85] > 0) {               // { 3900:141f }  quirk: b85 > 0, not (b85 and 7)
        await X.DrawWrappedText(5, row + 5, 34, 22, 10, 1, charName(c) + ' takes and hides his share.');   // { 3900:1440 }
        row = row + 2;                                                                 // { 3900:1477 }
      }
      c = c.next;                                                                      // { 3900:147b }
    }
    await hmenu('', 'press <enter>/<return> to continue', 15, 15, 15, 1, 0);           // { 3900:1490 }
  }
}

// 3900:1527 AfterCombat — host.afterCombat() (ecl_op24_Combat)
export async function AfterCombat() {
  setEclW(0x58E, 0);                                                                   // { 3900:152d  combat result }
  g.EnemiesFought = 0;                                                                 // { 3900:1538 }
  g.game_Mode = 6;                                                                     // { 3900:153d  after combat }
  await ResolveCombatOutcome();                                                        // { 3900:1542 }
  await RemoveMonstersAfterCombat();                                                   // { 3900:1546 }
  if (g.PartyDead === 0 || g.DuelActive !== 0) {                                       // { 3900:154a }
    await NpcTakesShare();                                                             // { 3900:1558 }
    await ShowCombatResult(g.CombatXP);                                                // { 3900:155c }
    await TreasureMenu();                                                              // { 3900:1568 }
    let it = g.TreasureItems;                                                          // { 3900:156c  unclaimed items are lost }
    while (it) {                                                                       // { 3900:1579 }
      const n = it.next;                                                               // { 3900:1581 }
      it = n;                                                                          // { 3900:159e  FreeMem(it, $3F) }
    }
    g.TreasureItems = null;                                                            // { 3900:15af }
  } else {
    setEclW(0x58E, 0x80);                                                              // { 3900:15b9  party destroyed }
    await X.DrawTitledFrame(1, 1, 38, 22, 0, 15, 'The END!');                          // { 3900:15c4 }
    g.text_Col = 2; g.text_Row = 6;                                                    // { 3900:15ea }
    await X.DrawWrappedText(2, 5, 37, 22, 10, 1, 'The monsters rejoice for the party has been destroyed');   // { 3900:15f4 }
    await X.ShowBottomPromptAndReadKey(13, 'Press any key to continue');               // { 3900:161a }
  }
  g.TextOutputActive = 1;                                                              // { 3900:1631  both paths }
  setEclW(0x6E0, 0);                                                                   // { 3900:1636  side to-hit modifiers }
  setEclW(0x6E2, 0);                                                                   // { 3900:1641 }
  setEclW(0x6E4, 0);                                                                   // { 3900:164c }
  setEclW(0x5C6, 0);                                                                   // { 3900:1657  "no loot" flag }
  setEclW(0x5CC, 0);                                                                   // { 3900:1662  duel-XP flag }
}

// 3900:1671 ov05_init — empty unit initialiser
export function ov05_init() {}
