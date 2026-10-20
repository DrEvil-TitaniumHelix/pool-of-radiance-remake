// node --test game/test/combat/ov19.test.mjs — deterministic ov19 routines (lane por-build-combat).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { bindCombat, env } from '../../areas/combat_core.js';
import { newChar, newItem, setPstr, wrW, rdW } from '../../engine/ecl.js';
import * as ov19 from '../../areas/combat_ov19.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

// DS 0C7C image: file offset headerSize + 0xC7C0 of START.unpacked.exe, padded to 0x8760 (BSS zero).
function loadDs() {
  const exe = readFileSync(path.join(root, 'decode/bin/START.unpacked.exe'));
  const hdr = (exe[8] | (exe[9] << 8)) * 16;
  const ds = new Uint8Array(0x8760);
  ds.set(exe.subarray(hdr + 0xC7C0, hdr + 0xC7C0 + 0x8760));
  return ds;
}
const DS = loadDs();

// Fresh env per test: DrawText & co. captured, string helpers = Str.
function setup(gExtra = {}, extExtra = {}) {
  const calls = [];
  const cap = (name) => (...a) => { calls.push([name, ...a]); };
  const ext = {
    DrawText: cap('DrawText'), DrawAC: cap('DrawAC'), DrawHP: cap('DrawHP'), ClearRectangle: cap('ClearRectangle'),
    RecalcCharacter: () => {}, ByteToStr: (v) => String(v), WordToStr: (v) => String(v), LongToStr: (v) => String(v),
    HasEffect: async () => false, ShowTimedBottomMessage: async (s) => { calls.push(['msg', s]); },
    LoseItem: (c, it) => { let p = c.items, prev = null; while (p && p !== it) { prev = p; p = p.next; } if (p) { if (prev) prev.next = p.next; else c.items = p.next; } },
    StrWeightAllowance: () => 0,
    ...extExtra,
  };
  for (const k of Object.keys(env.ext)) delete env.ext[k];
  const g = { ds: DS, SelectedChar: null, PartyHead: null, game_Mode: 0, TreasureMoney: [0, 0, 0, 0, 0, 0, 0], ...gExtra };
  bindCombat({ g, ext });
  return { g, calls };
}

const setMoney = (c, arr) => arr.forEach((v, i) => wrW(c.b, 0x88 + 2 * i, v));

test('MoneyInGold: CoinValue table from the image, rounding half up', () => {
  setup();
  const c = newChar();
  setMoney(c, [0, 0, 0, 0, 0]); assert.equal(ov19.MoneyInGold(c), 0);              // (0+100) div 200
  setMoney(c, [99, 0, 0, 0, 0]); assert.equal(ov19.MoneyInGold(c), 0);             // 199 div 200
  setMoney(c, [100, 0, 0, 0, 0]); assert.equal(ov19.MoneyInGold(c), 1);            // 0.5 gp rounds up
  setMoney(c, [0, 0, 0, 10, 0]); assert.equal(ov19.MoneyInGold(c), 10);
  setMoney(c, [0, 0, 0, 0, 3]); assert.equal(ov19.MoneyInGold(c), 15);             // 1 pp = 5 gp
  setMoney(c, [1, 1, 1, 1, 1, 50, 50]); assert.equal(ov19.MoneyInGold(c), Math.trunc((1 + 10 + 100 + 200 + 1000 + 100) / 200));   // gems/jewels ignored
  setMoney(c, [0, 0, 0, 0, 65535]); assert.equal(ov19.MoneyInGold(c), Math.trunc((65535 * 1000 + 100) / 200));
});

test('ItemOverloads: >15 items, 16-bit weight sum vs allowance + 1500', () => {
  setup({}, { StrWeightAllowance: () => 0 });
  const c = newChar(); const it = newItem();
  c.b[0xC7] = 15; wrW(c.b, 0x102, 1000); wrW(it.b, 0x37, 500); it.b[0x39] = 0;
  assert.equal(ov19.ItemOverloads(c, it), false);                                  // 1500 = limit, not above
  wrW(it.b, 0x37, 501); assert.equal(ov19.ItemOverloads(c, it), true);
  wrW(it.b, 0x37, 50); it.b[0x39] = 10; assert.equal(ov19.ItemOverloads(c, it), false);   // 1000 + 500
  it.b[0x39] = 11; assert.equal(ov19.ItemOverloads(c, it), true);
  wrW(it.b, 0x37, 1); it.b[0x39] = 0; c.b[0xC7] = 16; assert.equal(ov19.ItemOverloads(c, it), true);
  // 16-bit wrap of encumbrance + weight
  c.b[0xC7] = 0; wrW(c.b, 0x102, 0xFFFF); wrW(it.b, 0x37, 2); assert.equal(ov19.ItemOverloads(c, it), false);   // (FFFF+2) and FFFF = 1
  // allowance + 1500 as a signed 16-bit integer: 32000+1500 wraps negative -> everything overloads
  setup({}, { StrWeightAllowance: () => 32000 });
  wrW(c.b, 0x102, 0); wrW(it.b, 0x37, 0); assert.equal(ov19.ItemOverloads(c, it), true);
});

test('DrawCombatStats: labels, THAC0 60-x, damage string, movement effects', async () => {
  const c = newChar();
  c.b[0x110] = 0x28;                       // 60 - THAC0 20 -> shows 20
  c.b[0x115] = 1; c.b[0x117] = 8; c.b[0x119] = 0xFE;   // 1d8-2
  wrW(c.b, 0x102, 1234); c.b[0x11C] = 12;
  const { calls } = setup({ SelectedChar: c }, { HasEffect: async (ch, id) => id === 0x2A });
  await ov19.DrawCombatStats();
  const texts = calls.filter((x) => x[0] === 'DrawText').map((x) => x.slice(1));
  assert.deepEqual(texts, [
    [1, 17, 0x0F, 'AC    '], [1, 18, 0x0F, 'HP    '],
    [9, 17, 0x0F, 'THAC0   '], [15, 17, 0x0A, '20'],
    [8, 18, 0x0F, 'Damage        '], [15, 18, 0x0A, '1d8-2'],
    [22, 17, 0x0F, 'Encumbrance      '], [34, 17, 0x0A, '1234'],
    [25, 18, 0x0F, 'Movement   '], [34, 18, 0x0A, '24'],
  ]);
  assert.deepEqual(calls.find((x) => x[0] === 'DrawAC').slice(2), [4, 17]);
  assert.deepEqual(calls.find((x) => x[0] === 'DrawHP').slice(2), [4, 18, 0]);
});

test('DrawCombatStats: positive bonus, THAC0 byte wrap, slow halves (byte double first)', async () => {
  const c = newChar();
  c.b[0x110] = 61; c.b[0x115] = 2; c.b[0x117] = 4; c.b[0x119] = 3; c.b[0x11C] = 200;
  const { calls } = setup({ SelectedChar: c }, { HasEffect: async () => true });
  await ov19.DrawCombatStats();
  const t = calls.filter((x) => x[0] === 'DrawText').map((x) => x[4]);
  assert.equal(t[3], '255');               // Byte(60 - 61)
  assert.equal(t[5], '2d4+3');
  assert.equal(t[9], String(((200 * 2) & 0xFF) >> 1));   // 72
});

test('DrawMoney: CoinName from the image, jewelry first, right-aligned', () => {
  const c = newChar(); setMoney(c, [5, 0, 0, 120, 0, 0, 2]);
  const { calls } = setup({ SelectedChar: c });
  ov19.DrawMoney();
  assert.deepEqual(calls.map((x) => x.slice(1)), [
    [12, 7, 26, 14],
    [13, 7, 0x0A, 'Jewelry'], [21, 7, 0x0A, '2'],
    [16, 8, 0x0A, 'Gold'], [21, 8, 0x0A, '120'],
    [14, 9, 0x0A, 'Copper'], [21, 9, 0x0A, '5'],
  ]);
});

test('DrawAbility: exceptional strength', () => {
  const c = newChar(); c.b[0x10] = 18; c.b[0x16] = 100; c.b[0x11] = 9;
  const { calls } = setup({ SelectedChar: c });
  ov19.DrawAbility(0, false);
  ov19.DrawAbility(1, true);
  const t = calls.filter((x) => x[0] === 'DrawText').map((x) => x.slice(1));
  assert.deepEqual(t, [[5, 7, 0x0A, '18'], [7, 7, 0x0A, '(00)'], [6, 8, 0x0D, '9']]);
  c.b[0x16] = 7; calls.length = 0; ov19.DrawAbility(0, false);
  assert.deepEqual(calls.filter((x) => x[0] === 'DrawText')[1].slice(1), [7, 7, 0x0A, '(07)']);
});

test('CycleSelectedChar: G = previous (wrap), O = next (wrap), other = first', () => {
  const a = newChar(), b = newChar(), d = newChar(); a.next = b; b.next = d;
  const { g } = setup({ PartyHead: a, SelectedChar: a });
  ov19.CycleSelectedChar('G'); assert.equal(g.SelectedChar, d);
  ov19.CycleSelectedChar('G'); assert.equal(g.SelectedChar, b);
  ov19.CycleSelectedChar('O'); assert.equal(g.SelectedChar, d);
  ov19.CycleSelectedChar('O'); assert.equal(g.SelectedChar, a);
  g.SelectedChar = d; ov19.CycleSelectedChar('X'); assert.equal(g.SelectedChar, a);
});

test('JoinItems: merges up to 255, power[2..3] compared with themselves (quirk)', () => {
  const c = newChar();
  const mk = (n, p2) => { const it = newItem(); it.b[0x2E] = 0x49; it.b[0x39] = n; it.b[0x3D] = p2; return it; };
  const i1 = mk(200, 1), i2 = mk(40, 9), i3 = mk(30, 0);
  c.items = i1; i1.next = i2; i2.next = i3;
  setup({ SelectedChar: c });
  ov19.JoinItems(i1);
  assert.equal(i1.b[0x39], 255);           // 200 + 40 = 240, then 240 + 30 > 255 -> 255, rest 15 in i3
  assert.equal(i3.b[0x39], 15);
  assert.equal(c.items, i1); assert.equal(i1.next, i3);   // i2 lost
});

test('HalveItem: copy inserted after, unreadied; single -> message', async () => {
  const it = newItem(); it.b[0x39] = 7; it.b[0x34] = 1; setPstr(it.b, 0, 'Arrows', 40);
  const { calls } = setup();
  await ov19.HalveItem(it);
  assert.equal(it.b[0x39], 4); assert.equal(it.next.b[0x39], 3); assert.equal(it.next.b[0x34], 0);
  const one = newItem(); one.b[0x39] = 1;
  await ov19.HalveItem(one);
  assert.deepEqual(calls.at(-1), ['msg', "Can't halve that"]);
});

test('SellItem: price quirk (count*price div 20 for every type), pp/gp payout', async () => {
  const c = newChar(); const it = newItem();
  wrW(it.b, 0x3A, 30); it.b[0x39] = 20; it.b[0x2E] = 0x49; c.items = it;
  let shown = '';
  setup({ SelectedChar: c, ViewChar: c }, {
    BuildItemName: () => {}, DrawWrappedText: async (...a) => { shown = a[6]; }, AskYesNo: async () => 'Y',
    WouldOverload: async () => false,
  });
  await ov19.SellItem(it);
  assert.equal(shown.startsWith("I'll give you 15 gold pieces for your "), true);   // 20*15 div 20
  assert.equal(rdW(c.b, 0x90), 3); assert.equal(rdW(c.b, 0x8E), 0);
  assert.equal(c.items, null);
});
