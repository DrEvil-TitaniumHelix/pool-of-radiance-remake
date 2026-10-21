// game/areas/party_ov21.js — PARTY ov21 (seg 8900): encumbrance, coins, treasure-pool money, number input, random
// por-only: Pool character/party creation, roster, save layouts, shops and training rules (whole module) (profile: engine.areaModules / recordSizes / saveFormat; game/profiles/PORONLY.md)
// magic items (MakeTreasureItem), gem/jewel appraisal. Lane por-build-party.
// Source: decode/pseudo/PARTY.pas.md ## ov21 (= decode/pseudo/party_parts/ov21.pas.md, verified PARTY_VERIFY.md),
// party_parts/ov21_notes.md (MagicItemTable dump, javelin quirk), PARTY_SCREENS PARTY-ov21-01..08; evidence
// decode/listings/ov21.lst. Conventions: party_core.js header.
//
// Local conventions of this unit
// - Pascal `var` parameters are ref objects `{ v }`; var arrays (TreasureMoney DS:67F4, 7 LongInts) are the JS array.
// - TChar fields: money[0..6] +88h (words: copper, silver, electrum, gold, platinum, gems, jewelry), npc_morale +84h,
//   item_count +C7h, encumbrance +102h (word). Item (63 B): type +2Eh, word[1..3] +2Fh..+31h, plus +32h, plus2 +33h,
//   readied +34h, hidden +35h, magic_flag +36h, weight +37h (word), count +39h, value +3Ah (word), power[1..3] +3Ch..+3Eh.
// - Menu-list nodes built here (TakeMoney) have the ov19 shape { b: Uint8Array(0x2E) (text string[40] +0, isHeader +29h),
//   next }; CoinFromText accepts such a node or a plain string.
// - Word arithmetic wraps as in the original (16-bit ADD/SUB); LongInt pool amounts are JS numbers (|0 where stored).

import { X, g, ds, dsW, dsPstr, rdW, wrW, pstr, setPstr, newItem, byte, word, integer, shortint, Random, UpCase } from './party_core.js';
import { dev } from '../engine/dev.js';
import { hooks } from '../plus/hooks.js';   // GBP W1/W3 (docs/PLUS_HOOKS.md)

// ---- local helpers ------------------------------------------------------------------------------------------
const ref = (v) => ({ v });
const keyOf = (r) => (r !== null && typeof r === 'object' ? r.key : r);
const money = (c, i) => rdW(c.b, 0x88 + 2 * i);                         // TChar +88h money[i] (word)
const setMoney = (c, i, v) => wrW(c.b, 0x88 + 2 * i, v);
const enc = (c) => rdW(c.b, 0x102);                                     // TChar +102h encumbrance (word)
const coinValue = (k) => (dsW(0x0D24 + 4 * k) | (dsW(0x0D26 + 4 * k) << 16));   // CoinValue DS:0D24 LongInt[0..4] = 1,10,100,200,1000
const coinName = (k) => dsPstr(0x0FFA + 11 * k);                        // CoinName DS:0FFA string[10] x 7
const magicItem = (w) => dsW(0x0970 + 2 * w);                           // MagicItemTable DS:0970, word index
const tm = () => g.TreasureMoney;                                       // DS:67F4 LongInt[0..6]
const longint = (v) => v | 0;
const nodeText = (n) => (n && n.b ? pstr(n.b, 0) : String(n ?? ''));

// item field setters (63-byte record)
const IT = { type: 0x2E, word: 0x2E /* +k, k = 1..3 */, plus: 0x32, plus2: 0x33, readied: 0x34, hidden: 0x35,
  magic: 0x36, weight: 0x37, count: 0x39, value: 0x3A, power: 0x3B /* +k, k = 1..3 */ };

// 8900:0000 MaxCarryWeight(c): Word
export function MaxCarryWeight(c) {
  return word(X.StrWeightAllowance(c) + 1500);                          // 8900:0006
}

// 8900:0020 SubEncumbrance(c, amount)
export function SubEncumbrance(c, amount) {
  wrW(c.b, 0x102, word(enc(c) - amount));                               // 8900:0023
}

// 8900:003A AddEncumbrance(c, amount)
export function AddEncumbrance(c, amount) {
  wrW(c.b, 0x102, word(enc(c) + amount));                               // 8900:003d
}

// 8900:0054 WouldOverload(c, amount, var room): Boolean   (stub ov21 e1)
export function WouldOverload(c, amount, room) {
  if (word(enc(c) + amount) > MaxCarryWeight(c)) {                      // 8900:005a  16-bit ADD, unsigned JBE
    room.v = word(MaxCarryWeight(c) - enc(c));                          // 8900:0079
    return true;                                                        // 8900:0075
  }
  room.v = 0;                                                           // 8900:0097
  return false;                                                         // 8900:0093
}

// 8900:00A8 MoneyValueInGold(money: array[0..6] of LongInt): LongInt   (stub ov21 e12)
export function MoneyValueInGold(m) {
  let sum = 0;                                                          // 8900:00c1
  for (let k = 0; k <= 4; k++)                                          // 8900:00c9  gems/jewelry not counted
    sum = longint(sum + Math.imul(longint(m[k]), coinValue(k)));        // 8900:00dc  @LongMul
  return longint(Math.trunc(longint(sum + 100) / coinValue(3)));        // 8900:0105  (sum + 100) div 200
}

// 8900:0130 SetCharMoneyGold(gold)   (stub ov21 e10)
export function SetCharMoneyGold(gold) {
  gold = word(gold);
  const c = g.SelectedChar;
  for (let k = 0; k <= 4; k++) setMoney(c, k, 0);                       // 8900:0136
  setMoney(c, 4, Math.trunc(gold / 5));                                 // 8900:0158  platinum
  setMoney(c, 3, gold % 5);                                             // 8900:016b  gold
  // quirk: encumbrance is not updated here; callers rely on a later RecalcCharacter.
}

// 8900:0185 SetPoolMoneyGold(gold)   (stub ov21 e11)
export function SetPoolMoneyGold(gold) {
  gold = word(gold);
  for (let k = 0; k <= 4; k++) tm()[k] = 0;                             // 8900:018b
  tm()[4] = Math.trunc(gold / 5);                                       // 8900:01ae  g_6804
  tm()[3] = gold % 5;                                                   // 8900:01c1  g_6800
}

// 8900:0203 AddPlatinumOrPool(n)
export async function AddPlatinumOrPool(n) {
  n = word(n);
  const room = ref(0);
  const c = g.SelectedChar;
  if (WouldOverload(c, n, room)) {                                      // 8900:0209
    await X.ShowTimedBottomMessage('Overloaded.  Money will be put in Pool.');   // 8900:0221
    setMoney(c, 4, word(money(c, 4) + room.v));                         // 8900:0235
    AddEncumbrance(c, room.v);                                          // 8900:0241
    tm()[4] = longint(n + tm()[4] - room.v);                            // 8900:0250
  } else {
    setMoney(c, 4, word(money(c, 4) + n));                              // 8900:0273
    AddEncumbrance(c, n);                                               // 8900:027f
  }
}

// Val(s, v, code) for LongInt: digits only here (InputNumber builds the string from '0'..'9')
const valLong = (s) => (s === '' ? 0 : longint(Number(s)));

// 8900:0294 InputNumber(max, prompt, colour): Word   (stub ov21 e6)
export async function InputNumber(max, prompt, colour) {
  max = word(max);
  const p = String(prompt).slice(0, 40);                                // 8900:029b  string[40]
  X.ClearGlyphRun(0, 24, 0, 40);                                        // 8900:02ae
  X.DrawText(0, 24, colour, p);                                         // 8900:02bf
  const len = p.length; let col = len;                                  // 8900:02d3
  const maxStr = String(max).slice(0, 5);                               // 8900:02df  Str(max, string[5])
  let num = '';                                                         // 8900:02f7  string[6]
  let k;
  hooks.emit('inputStarted', () => ({ kind: 'number', prompt: p, maxLen: 6, max, col: len, row: 24, text: '' }));   // 8900:02fb
  do {
    k = await X.ReadGameKey();                                          // 8900:02fb
    if (k >= '0' && k <= '9') {                                         // 8900:0303
      num = (num + k).slice(0, 6);                                      // 8900:0314
      const v = valLong(num);                                           // 8900:0346
      if (v <= max) col = col + 1;                                      // 8900:035b
      else {
        num = maxStr;                                                   // 8900:0371  too large: clamp to max
        col = len + maxStr.length;                                      // 8900:0384
      }
      X.DrawText(len, 24, 0x0F, num);                                   // 8900:0395
    } else if (k === '\b' && num.length > 0) {                          // 8900:03ab
      num = num.slice(0, num.length - 1);                               // 8900:03b5
      X.ClearGlyphRun(col, 24, 0, 1);                                   // 8900:03de  quirk: blanks the cell after the last digit
      col = col - 1;                                                    // 8900:03f0
    }
    hooks.emit('inputChanged', () => ({ text: num }));                  // 8900:03f3
  } while (!(k === '\r' || k === '\x1B'));                              // 8900:03f3
  hooks.emit('inputEnded', () => ({ text: num, key: k === '\r' ? 'Enter' : 'Esc' }));   // 8900:0402
  X.ClearGlyphRun(0, 24, 0, 40);                                        // 8900:0402
  if (k === '\x1B') return 0;                                           // 8900:0413
  return word(valLong(num));                                            // 8900:0420  low word
}

// 8900:044C TransferCoins(var src, var dst, amount, coin)   (stub ov21 e7)
export async function TransferCoins(src, dst, amount, coin) {
  amount = word(amount); coin = shortint(coin);
  const s = src.v, d = dst.v;
  if (word(enc(d) + amount) <= MaxCarryWeight(d)) {                     // 8900:0452
    setMoney(s, coin, word(money(s, coin) - amount));                   // 8900:0474
    SubEncumbrance(s, amount);                                          // 8900:049f
    setMoney(d, coin, word(money(d, coin) + amount));                   // 8900:04b0
    AddEncumbrance(s, amount);                                          // 8900:04db  quirk: src again, not dst (both push [BP+0Eh])
  } else
    await X.ShowTimedBottomMessage('Overloaded');                       // 8900:04ee
}

// 8900:0508 PoolMoney   (stub ov21 e2)
export function PoolMoney() {
  let p = g.PartyHead;                                                  // 8900:050e
  g.PoolHasMoney = 1;                                                   // 8900:051b  g_6DC0
  while (p !== null && p !== undefined) {                               // 8900:0520
    const m = p.b[0x84];                                                // npc_morale
    if (m === 0 || m === 0xB3) {                                        // 8900:052b  PCs and animated dead
      for (let k = 0; k <= 6; k++) {                                    // 8900:0544
        tm()[k] = longint(tm()[k] + money(p, k));                       // 8900:0553
        SubEncumbrance(p, money(p, k));                                 // 8900:0591
      }
      p.b.fill(0, 0x88, 0x88 + 14);                                     // 8900:05b1  FillChar(money, 14, 0)
    }
    p = p.next;                                                         // 8900:05c6
  }
}

// 8900:05E0 CountMoneySharers: Byte
export function CountMoneySharers() {
  let p = g.PartyHead, n = 0;                                           // 8900:05e6
  while (p) {                                                           // 8900:05f7
    const m = p.b[0x84];
    if (m === 0 || m === 0xB3) n = byte(n + 1);                         // 8900:05ff
    p = p.next;                                                         // 8900:0618
  }
  return n;                                                             // 8900:062d
}

// 8900:063A ShareMoney   (stub ov21 e3)
export function ShareMoney() {
  let p = g.PartyHead;                                                  // 8900:0640
  const n = CountMoneySharers();                                        // 8900:0651
  const share = new Array(7).fill(0), rest = new Array(7).fill(0);      // 8900:0658  words
  const room = ref(0);
  for (let k = 0; k <= 6; k++)                                          // 8900:067a
    if (longint(tm()[k]) > 0) {                                         // 8900:068d  signed LongInt
      // quirk: n = 0 (every member is an NPC) → @LongDivMod divides by zero = Turbo Pascal runtime error 200, the
      // program halts. Kept: the build stops with the same error.
      if (n === 0) throw new Error('Runtime error 200 (division by zero) in ShareMoney 8900:069d');
      share[k] = word(Math.trunc(longint(tm()[k]) / n));                // 8900:069d
      rest[k] = word(longint(tm()[k]) % n);                             // 8900:06cc
    } else {
      share[k] = 0; rest[k] = 0;                                        // 8900:0701
    }
  // pass 1: everyone with npc_morale < 80h gets a share, highest coin first
  while (p) {                                                           // 8900:0724
    if (p.b[0x84] < 0x80) {                                             // 8900:072f  quirk: other test than CountMoneySharers
      for (let k = 6; k >= 0; k--) {                                    // 8900:073d
        if (!WouldOverload(p, share[k], room)) {                        // 8900:0746
          setMoney(p, k, word(money(p, k) + share[k]));                 // 8900:0767
          AddEncumbrance(p, share[k]);                                  // 8900:0796
          if (rest[k] > 0)                                              // 8900:07ab
            if (!WouldOverload(p, rest[k], room)) {                     // 8900:07b9  quirk: tests the whole rest, adds 1
              setMoney(p, k, word(money(p, k) + 1));                    // 8900:07d7
              AddEncumbrance(p, 1);                                     // 8900:07fa
              rest[k] = word(rest[k] - 1);                              // 8900:0808
            }
        } else {
          setMoney(p, k, word(money(p, k) + room.v));                   // 8900:0815  takes what fits
          rest[k] = word(share[k] + rest[k] - room.v);                  // 8900:083a
          AddEncumbrance(p, room.v);                                    // 8900:0862
        }
      }
    }
    p = p.next;                                                         // 8900:0878
  }
  // pass 2: hand the remainder to anyone with room, NPCs included
  for (let k = 6; k >= 0; k--)                                          // 8900:088e
    if (rest[k] > 0) {                                                  // 8900:0897
      p = g.PartyHead;                                                  // 8900:08a8
      while (p) {                                                       // 8900:08b5
        const r = word(MaxCarryWeight(p) - enc(p));                     // 8900:08c0
        if (r > 0) {                                                    // 8900:08d5  unsigned (JA)
          if (rest[k] > r) {                                            // 8900:08de
            setMoney(p, k, word(money(p, k) + r));                      // 8900:08ee
            AddEncumbrance(p, r);                                       // 8900:0913
            rest[k] = word(rest[k] - r);                                // 8900:0920
          } else {
            setMoney(p, k, word(money(p, k) + rest[k]));                // 8900:093d
            AddEncumbrance(p, rest[k]);                                 // 8900:096c
            rest[k] = 0;                                                // 8900:0981
          }
        }
        p = p.next;                                                     // 8900:098e
      }
    }
  g.PoolHasMoney = 0;                                                   // 8900:09ad
  for (let k = 0; k <= 6; k++) {                                        // 8900:09b2
    tm()[k] = rest[k];                                                  // 8900:09bb
    if (tm()[k] !== 0) g.PoolHasMoney = 1;                              // 8900:09de
  }
}

// 8900:0A01 DropCoinsToPool(c, amount, coin)   (stub ov21 e8)
export function DropCoinsToPool(c, amount, coin) {
  amount = word(amount); coin = shortint(coin);
  setMoney(c, coin, word(money(c, coin) - amount));                     // 8900:0a04
  SubEncumbrance(c, amount);                                            // 8900:0a29
  if (g.game_Mode === 6 || g.game_Mode === 1)                           // 8900:0a36  otherwise the coins are lost
    tm()[coin] = longint(tm()[coin] + amount);                          // 8900:0a44
}

// 8900:0A88 TakeCoins(c, amount, coin)
export async function TakeCoins(c, amount, coin) {
  amount = word(amount); coin = shortint(coin);
  const room = ref(0);
  if (WouldOverload(c, amount, room))                                   // 8900:0a8e
    await X.ShowTimedBottomMessage('Overloaded');                       // 8900:0aa4  nothing is taken
  else {
    if (amount > longint(tm()[coin])) amount = word(tm()[coin]);        // 8900:0abb  LongInt compare, low word kept
    tm()[coin] = longint(tm()[coin] - amount);                          // 8900:0aed
    setMoney(c, coin, word(money(c, coin) + amount));                   // 8900:0b22
    AddEncumbrance(c, amount);                                          // 8900:0b47
  }
}

// 8900:0B93 CoinFromText(text, var coinName): ShortInt   (stub ov21 e5)
export function CoinFromText(text, coinNameRef) {
  const t = nodeText(text);                                             // 8900:0b9a
  let i = 0; while (t[i] === ' ') i++;                                  // 8900:0bae
  let result = 0;                                                       // TODO(decode): garbage — uninitialised [bp-1] for other first letters; fixed 0
  switch (t[i]) {                                                       // 8900:0bc8
    case 'G':
      if (UpCase(t[i + 1] ?? '\0') === 'E') { result = 5; coinNameRef.v = 'Gems '; }   // 8900:0bd8
      else { coinNameRef.v = 'Gold '; result = 3; }                     // 8900:0c08
      break;
    case 'P': coinNameRef.v = 'Platinum '; result = 4; break;           // 8900:0c22
    case 'E': coinNameRef.v = 'electrum '; result = 2; break;           // 8900:0c3f
    case 'S': coinNameRef.v = 'silver '; result = 1; break;             // 8900:0c5c
    case 'C': coinNameRef.v = 'Copper '; result = 0; break;             // 8900:0c79
    case 'J': coinNameRef.v = 'Jewelry '; result = 6; break;            // 8900:0c96
  }
  return result;                                                        // 8900:0cb1
}

// 8900:0CEB TakeMoney   (stub ov21 e4) — CH-09
export async function TakeMoney() {
  X.DrawTitledFrame(1, 1, 0x26, 0x16, 0, 0x0A, '');                     // 8900:0cf2
  const index = ref(0);                                                 // 8900:0d19
  let done;
  do {
    const redraw = ref(true);                                           // 8900:0d1e
    let list = null, prev = null;
    for (let k = 6; k >= 0; k--)                                        // 8900:0d33
      if (longint(tm()[k]) > 0) {                                       // 8900:0d3c
        // 8900:0d5c Inc(cnt): uninitialised local, never read
        if (list === null) list = { b: new Uint8Array(0x2E), next: null };          // 8900:0d67  GetMem(list, 46)
        else { prev = list; list = { b: new Uint8Array(0x2E), next: prev }; }       // 8900:0d85  prepend: copper first
        const s = String(longint(tm()[k]));                             // 8900:0db1
        setPstr(list.b, 0, coinName(k) + ' ' + s, 40);                  // 8900:0dd5
        list.b[0x29] = 0;                                               // 8900:0e14  isHeader
      }
    const item = ref(list); const head = list;                          // 8900:0e25
    dev.screenSoon('CH-09');
    const key = keyOf(await X.VerticalListMenu('Select type of coin', '', 0x0D, 0x0A, 0x0F,
      2, 2, 0x0F, 8, list, true, redraw, index, item));                 // 8900:0e3d
    if (item.v === null || key === '\0') done = true;                   // 8900:0e94  quirk: the list is not freed on exit
    else {
      done = false;                                                     // 8900:0eab
      const cn = ref('');
      const coin = CoinFromText(item.v, cn);                            // 8900:0eb0
      const s = 'How much ' + cn.v + 'will you take? ';                 // 8900:0ec2
      const amount = await InputNumber(word(tm()[coin]), s, 0x0A);      // 8900:0ef6  max = low word of the pool amount
      await TakeCoins(g.SelectedChar, amount, coin);                    // 8900:0f15
      X.FreeMenuList(ref(head));                                        // 8900:0f29
      g.PoolHasMoney = 0; done = true;                                  // 8900:0f33
      for (let k = 0; k <= 6; k++)                                      // 8900:0f3d
        if (longint(tm()[k]) > 0) { g.PoolHasMoney = 1; done = false; } // 8900:0f46
    }
  } while (!done);                                                      // 8900:0f70
}

// 8900:0F7E TreasurePoolStatus(var hasMoney, var hasItems)   (stub ov21 e9)
export function TreasurePoolStatus(hasMoney, hasItems) {
  hasMoney.v = false; hasItems.v = false;                               // 8900:0f84
  for (let k = 0; k <= 6; k++)                                          // 8900:0f92
    if (tm()[k] !== 0) hasMoney.v = true;                               // 8900:0f9b
  if (g.TreasureItems !== null && g.TreasureItems !== undefined) hasItems.v = true;   // 8900:0fbc
}

// 8900:0FD2 RollMagicPlus: Byte
export function RollMagicPlus() {
  const r = X.Roll(1, 20);                                              // 8900:0fd8
  if (r >= 1 && r <= 14) return 1;                                      // 8900:0fe9  70 %
  if (r >= 15 && r <= 19) return 2;                                     // 8900:0ff7  25 %
  return 3;                                                             // 8900:1005   5 %
}

const inRange = (v, lo, hi) => v >= lo && v <= hi;

// weight table of MakeTreasureItem 8900:1295 (case typ of)
function weaponWeight(it, typ) {
  const W = (w) => wrW(it.b, IT.weight, w);
  if ([1, 13, 14, 35].includes(typ)) W(75);
  else if ([2, 20, 29, 31, 32, 33, 39, 42, 44, 46, 59].includes(typ)) W(50);
  else if ([3, 24, 40].includes(typ)) W(125);
  else if ([4, 15, 23, 34, 43, 45, 51].includes(typ)) W(100);
  else if ([5, 12, 17, 19, 50].includes(typ)) W(150);
  else if (typ === 6) W(15);
  else if (typ === 7) W(30);
  else if (typ === 8 || typ === 77) W(10);
  else if (typ === 9) { W(25); it.b[IT.count] = 5; }                    // darts
  else if ([10, 26, 36].includes(typ)) W(60);
  else if ([11, 16, 25, 27, 41, 47].includes(typ)) W(80);
  else if (typ === 18) W(175);
  else if (typ === 21) W(20);
  else if (typ === 22 || typ === 30) W(40);
  else if (typ === 37) W(35);
  else if (typ === 38 || typ === 53) W(250);
  else if (typ === 52) W(200);
  else if (typ === 54 || typ === 56) W(400);
  else if (typ === 55) W(300);
  else if (typ === 57) W(350);
  else if (typ === 58) W(450);
  else if (typ === 93) W(1);                                            // 8900:147e
  else { W(40); it.b[IT.count] = 10; }                                  // 8900:1491  e.g. 28 quarrels, 73 arrows
}

// 8900:1010 MakeTreasureItem(typ, var it)   (stub ov21 e13; ECL TREASURE 2F00:1CCD)
// `it` is an item record { b, next } (filled in place); returns it for the VM host shape `h.makeTreasureItem(typ)`.
export function MakeTreasureItem(typ, it = newItem()) {
  typ = byte(typ);
  const b = it.b;
  b.fill(0, 0, 63);                                                     // 8900:1016
  let rec = 0;                                                          // 8900:1027
  b.fill(0, IT.power + 1, IT.power + 4); it.next = null;                // 8900:1034
  b[IT.readied] = 0; b[IT.hidden] = 6; b[IT.magic] = 0;                 // 8900:1056  hidden 6 = words 1 and 2 hidden
  b[IT.type] = typ;                                                     // 8900:106e
  b.fill(0, IT.word + 1, IT.word + 4);                                  // 8900:1078
  const plus = () => b[IT.plus];
  const wd = (k, v) => { b[IT.word + k] = byte(v); };
  if (inRange(typ, 1, 59) || typ === 73 || typ === 77 || typ === 93) {  // 8900:108d
    b[IT.plus] = RollMagicPlus();                                       // 8900:10ab
    switch (typ) {                                                      // 8900:10b6
      case 21:                                                          // javelin
        if (X.Roll(1, 5) === 5) rec = 0x90;                             // 8900:10c1  quirk: 90h is not a record start ("of Elvenkind", weight 88, value 25)
        wd(3, 0x15); wd(2, plus() + 0xA1);                              // 8900:10d9  "Javelin" "+n"
        break;
      case 28: wd(3, 0x1C); wd(2, plus() + 0xA1); break;                // 8900:10fa  "Quarrel +n"
      case 50: case 51: wd(3, typ); wd(2, 0x31); wd(1, plus() + 0xA1); b[IT.hidden] = 4; break;   // 8900:111f
      case 52: wd(3, typ); wd(2, 0x32); wd(1, plus() + 0xA1); b[IT.hidden] = 4; break;             // 8900:1156
      case 53: case 54: case 55: case 56: case 57: case 58:
        wd(3, typ); wd(2, 0x30); wd(1, plus() + 0xA1); b[IT.hidden] = 4; break;                    // 8900:1191
      case 73: wd(3, 0x3D); wd(2, plus() + 0xA1); break;                // 8900:11c8  "Arrow +n"
      case 77:                                                          // bracers
        wd(3, 0x4F); wd(2, 0xA7);                                       // 8900:11e9  "Bracers" "of"
        b[IT.plus] = byte(plus() * 2 + 2);                              // 8900:11f9  4, 6 or 8
        if (plus() === 4) wd(1, 0xDD);                                  // 8900:1213  "AC 6"
        else if (plus() === 6) wd(1, 0xDE);                             // 8900:1221  "AC 4"
        else if (plus() === 8) wd(1, 0xDC);                             // 8900:122f  "AC 2"
        break;
      case 93: wd(3, 0x42); wd(2, 0xE0); wd(1, plus() + 0xA1); break;   // 8900:1241  "Ring" "Of Protection" "+n"
      default: wd(3, typ); wd(2, plus() + 0xA1);                        // 8900:1265
    }
    b[IT.plus2] = 0; b[IT.count] = 0;                                   // 8900:1285
    weaponWeight(it, typ);                                              // 8900:1295
    const V = (v) => wrW(b, IT.value, word(v));
    if (typ === 59) V(plus() * 2500);                                   // 8900:14a2  shield
    else if (typ === 73 || typ === 28) V(plus() * 150);
    else if (typ === 53 || typ === 54) V(plus() * 3000);
    else if (typ === 55 || typ === 56) V(plus() * 3500);
    else if (typ === 57) V(plus() * 4000);
    else if (typ === 58) V(plus() * 5000);
    else if (typ === 77) V(plus() * 3000);                              // bracers: plus 4/6/8
    else V(plus() * 2000);                                              // 8900:156e
  } else if (typ === 61 || typ === 62) {                                // 8900:1585  scrolls
    const n = X.Roll(1, 3);                                             // 8900:1590
    wd(3, typ === 61 ? 0xD1 : 0xD0);                                    // 8900:159e  "Magic User Scroll" / "Clerical Scroll"
    wd(2, n + 0xD1);                                                    // 8900:15ba  "With n Spell(s)"
    wd(1, 0); b[IT.plus] = 1; wrW(b, IT.weight, 25);                    // 8900:15c9
    b[IT.count] = 0; wrW(b, IT.value, 0);                               // 8900:15e2
    for (let k = 1; k <= n; k++) {                                      // 8900:15f3
      const lvl = X.Roll(1, 3);                                         // 8900:160b
      let sp = 0;
      if (typ === 61) {
        if (lvl === 1) sp = X.Roll(1, 13) + 8;                          // 8900:162a  MU 9..21
        else if (lvl === 2) sp = X.Roll(1, 7) + 28;                     // 8900:1643  29..35
        else if (lvl === 3) sp = X.Roll(1, 11) + 44;                    // 8900:165c  45..55
      } else {
        if (lvl === 1) sp = X.Roll(1, 8);                               // 8900:1678  cleric 1..8
        else if (lvl === 2) sp = X.Roll(1, 7) + 21;                     // 8900:168c  22..28
        else if (lvl === 3) sp = X.Roll(1, 9) + 35;                     // 8900:16a5  36..44
      }
      b[IT.power + k] = byte(sp);                                       // 8900:16b8
      wrW(b, IT.value, word(rdW(b, IT.value) + lvl * 300));             // 8900:16c9
    }
  } else {
    switch (typ) {                                                      // 8900:16ef
      case 63: rec = 0x49; break;                                       // Gauntlets of Ogre Power
      case 67: rec = 0x91; break;                                       // 8900:16fa  Cloak of Elvenkind
      case 69: {                                                        // 8900:1709  rings
        const r = X.Roll(1, 10);
        if (r === 1) rec = 0x29;                                        // Feather Falling
        else if (inRange(r, 2, 6)) rec = 0x79;                          // Fire Resistance
        else if (inRange(r, 7, 10)) rec = 0x81;                         // Invisibility
        break;
      }
      case 78: {                                                        // 8900:1745  wands
        const r = X.Roll(1, 3) + 1;
        if (r === 1) rec = 0x31;                                        // quirk: unreachable (Wand of Lightning)
        else if (r === 2) rec = 0x41;                                   // Paralyzation
        else if (r === 3) rec = 0x71;                                   // Fireballs; quirk: r = 4 leaves rec 0
        break;
      }
      case 79: rec = 0x39; break;                                       // 8900:1778  Magic Missiles
      case 84: rec = 0x09; break;                                       // 8900:1783  Giant Strength
      case 92: rec = 0x61; break;                                       // 8900:178d  Cloak of Displacement
      case 71: {                                                        // 8900:1797  potions
        const r = X.Roll(1, 11);
        if (inRange(r, 1, 5)) rec = 0x11;                               // Healing
        else if (inRange(r, 6, 8)) rec = 0x01;                          // Extra Healing
        else if (r === 9) rec = 0x19;                                   // Speed
        else if (r === 10) rec = 0x51;                                  // Keoghtum's Ointment; quirk: r = 11 leaves rec 0
        break;
      }
      case 70: {                                                        // 8900:17dc
        const r = X.Roll(1, 10);
        if (inRange(r, 1, 7)) rec = 0x59;                               // Necklace of Missiles
        else if (inRange(r, 8, 10)) rec = 0x89;                         // Bag of Holding
        break;
      }
    }
  }
  if (rec !== 0) {                                                      // 8900:180b
    for (let k = 0; k <= 2; k++) wd(k + 1, magicItem(rec + k) & 0xFF);  // 8900:1814
    b[IT.plus] = 1; b[IT.plus2] = 1;                                    // 8900:1848
    if (rec === 0x61) { b[IT.plus] = 2; b[IT.plus2] = 2; }              // 8900:1858  cloak of displacement
    wrW(b, IT.weight, magicItem(rec + 3));                              // 8900:186e
    b[IT.count] = 0;                                                    // 8900:1885
    wrW(b, IT.value, magicItem(rec + 4));                               // 8900:188d
    for (let k = 1; k <= 3; k++) b[IT.power + k] = magicItem(rec + 4 + k) & 0xFF;   // 8900:18a4
  }
  return it;
}

// gem / jewel item construction of AppraiseGems (8900:1dd7 .. 1eaa / 212a .. 2211)
function keepAsItem(c, value, word3) {
  const it = newItem();                                                 // GetMem(it, 63); FillChar(it^, 63, 0)
  it.next = null; it.b[IT.readied] = 0;                                 // 8900:1dfa
  it.b[IT.word + 3] = word3; it.b[IT.word + 2] = 0; it.b[IT.word + 1] = 0;   // 8900:1e11  "Gem" (65h) / "Jewelry" (D6h)
  it.b[IT.type] = 70; wrW(it.b, IT.value, value); wrW(it.b, IT.weight, 1); it.b[IT.hidden] = 0;   // 8900:1e2c
  let p = c.items;                                                      // 8900:1e54
  if (p === null || p === undefined) p = it;                            // 8900:1e6a  quirk: only the local is set — the item is lost
  else {
    while (p.next) p = p.next;                                          // 8900:1e86
    p.next = it;                                                        // 8900:1eaa
  }
}

// 8900:19B2 AppraiseGems(var changed)   (stub ov21 e14) — CH-10
export async function AppraiseGems(changed) {
  changed.v = true;                                                     // 8900:19b9
  let c = g.SelectedChar;
  if (money(c, 5) === 0 && money(c, 6) === 0) {                         // 8900:19c0
    await X.ShowTimedBottomMessage('No Gems or Jewelry');               // 8900:19d8
    changed.v = false;                                                  // 8900:19ed
    return;
  }
  const room = ref(0), ext = ref(false);
  let done;
  do {
    c = g.SelectedChar;
    if (money(c, 5) === 0 && money(c, 6) === 0) done = true;            // 8900:19f7  leaves without RecalcCharacter
    else {
      done = false;                                                     // 8900:1a17
      let gemStr = String(money(c, 5));                                 // 8900:1a1c
      let jewStr = String(money(c, 6));                                 // 8900:1a3a
      if (money(c, 5) === 0) gemStr = '';                               // 8900:1a58
      else if (money(c, 5) === 1) gemStr = gemStr + ' Gem';             // 8900:1a71
      else gemStr = gemStr + ' Gems';                                   // 8900:1a9b
      if (money(c, 6) === 0) jewStr = '';                               // 8900:1ac3
      else if (money(c, 6) === 1) jewStr = jewStr + ' piece of Jewelry';   // 8900:1adc
      else jewStr = jewStr + ' pieces of Jewelry';                      // 8900:1b06
      X.ClearTextRectangle(1, 1, 0x26, 0x16);                           // 8900:1b2e
      await X.DrawCharacterName(c, 1, 1, false);                        // 8900:1b3f
      X.DrawText(1, 7, 0x0F, 'You have a fine collection of:');         // 8900:1b55
      X.DrawText(1, 9, 0x0F, gemStr);                                   // 8900:1b73
      X.DrawText(1, 0x0A, 0x0F, jewStr);                                // 8900:1b86
      let opts = '';                                                    // 8900:1b99
      if (money(c, 5) !== 0) opts = '  Gems';                           // 8900:1b9d
      if (money(c, 6) !== 0) opts = opts + '  Jewelry';                 // 8900:1bbc
      opts = opts + ' Exit';                                            // 8900:1bf0
      dev.screenSoon('CH-10');
      let key = keyOf(await X.HorizontalMenu('Appraise : ', opts, 0x0D, 0x0A, 0x0F, true, false, ext));   // 8900:1c18
      if (key === 'G') {                                                // 8900:1c4a
        if (money(c, 5) !== 0) {                                        // 8900:1c54
          setMoney(c, 5, word(money(c, 5) - 1));                        // 8900:1c63
          const r = X.Roll(1, 100);                                     // 8900:1c6c
          let value = 0;
          if (inRange(r, 1, 25)) value = 10;                            // 8900:1c7b
          else if (inRange(r, 26, 50)) value = 50;
          else if (inRange(r, 51, 70)) value = 100;
          else if (inRange(r, 71, 90)) value = 500;
          else if (inRange(r, 91, 99)) value = 1000;
          else if (r === 100) value = 5000;
          gemStr = 'The Gem is Valued at ' + String(value) + ' gp.';    // 8900:1cd9 / 1cf2
          X.DrawText(1, 0x0C, 0x0F, gemStr);                            // 8900:1d24
          let noKeep;
          if (WouldOverload(c, 1, room) || c.b[0xC7] >= 16) { opts = 'Sell'; noKeep = true; }   // 8900:1d37 / 1d5d
          else { opts = 'Sell Keep'; noKeep = false; }                  // 8900:1d78
          key = keyOf(await X.HorizontalMenu('You can : ', opts, 0x0D, 0x0A, 0x0F, true, false, ext));   // 8900:1d91
          if (key === 'K' && !noKeep) keepAsItem(c, value, 0x65);       // 8900:1dc4 .. 1eaa
          else {
            value = Math.trunc(value / 5);                              // 8900:1ec0  sold for platinum
            await AddPlatinumOrPool(value);                             // 8900:1ecf
          }
        }
      } else if (key === 'J') {                                         // 8900:1eda
        if (money(c, 6) !== 0) {                                        // 8900:1ee1
          setMoney(c, 6, word(money(c, 6) - 1));                        // 8900:1ef0
          const r = X.Roll(1, 100);                                     // 8900:1ef9
          let value = 0;
          if (inRange(r, 1, 10)) value = Random(900) + 100;             // 8900:1f08
          else if (inRange(r, 11, 20)) value = Random(1000) + 200;
          else if (inRange(r, 21, 40)) value = Random(1500) + 300;
          else if (inRange(r, 41, 50)) value = Random(2500) + 500;
          else if (inRange(r, 51, 70)) value = Random(5000) + 1000;
          else if (inRange(r, 71, 90)) value = Random(6000) + 2000;
          else if (inRange(r, 91, 100)) value = Random(10000) + 2000;
          value = word(value);
          gemStr = 'The Jewel is Valued at ' + String(value) + ' gp.';  // 8900:202c / 2045
          X.DrawText(1, 0x0C, 0x0F, gemStr);                            // 8900:2077
          let noKeep;
          if (WouldOverload(c, 1, room) || c.b[0xC7] >= 16) { opts = 'Sell'; noKeep = true; }   // 8900:208a / 20b0
          else { opts = 'Sell Keep'; noKeep = false; }                  // 8900:20cb
          key = keyOf(await X.HorizontalMenu('You can : ', opts, 0x0D, 0x0A, 0x0F, true, false, ext));   // 8900:20e4
          if (key === 'K' && !noKeep) keepAsItem(c, value, 0xD6);       // 8900:2117 .. 2211  "Jewelry"
          else {
            value = Math.trunc(value / 5);                              // 8900:2213
            await AddPlatinumOrPool(value);                             // 8900:2222
          }
        }
      } else if (key === 'E' || key === '\0') done = true;              // 8900:222c
      await X.RecalcCharacter(g.SelectedChar);                          // 8900:2239
    }
  } while (!done);                                                      // 8900:2246
}

// 8900:2256 ov21_init — empty unit initialiser
export function ov21_init() {}
