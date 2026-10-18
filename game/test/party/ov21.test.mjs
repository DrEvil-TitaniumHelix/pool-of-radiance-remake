// game/test/party/ov21.test.mjs — node test of game/areas/party_ov21.js (PARTY ov21, seg 8900).
// Run: node game/test/party/ov21.test.mjs
// Expected values come from the asm / image (decode/listings/ov21.lst, party_parts/ov21_notes.md MagicItemTable dump,
// DS image of decode/bin/START.unpacked.exe at file offset 8E0h + C7C0h), not from the JS.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bindParty } from '../../areas/party_core.js';
import { newChar, newItem, rdW, wrW, pstr, setPstr } from '../../engine/state.js';
import { setRandSeed } from '../../engine/tp.js';
import * as T from '../../areas/party_ov21.js';

let fails = 0;
const eq = (name, got, want) => {
  const a = JSON.stringify(got), b = JSON.stringify(want);
  if (a !== b) { fails++; console.log(`FAIL ${name}: got ${a}, want ${b}`); } else console.log(`ok   ${name}`);
};

// DS image
const exe = readFileSync(fileURLToPath(new URL('../../../decode/bin/START.unpacked.exe', import.meta.url)));
const ds = new Uint8Array(0x8760);
ds.set(exe.subarray(0x8E0 + 0xC7C0, Math.min(exe.length, 0x8E0 + 0xC7C0 + 0x8760)));

// fake environment
let rolls, keys, menuKeys, calls;
const g = { ds, TreasureMoney: [0, 0, 0, 0, 0, 0, 0], PartyHead: null, SelectedChar: null, TreasureItems: null, game_Mode: 0, PoolHasMoney: 0 };
const rec = (name, ret) => (...a) => { calls.push([name, ...a.map((x) => (x && x.b ? 'rec' : x && typeof x === 'object' && 'v' in x ? 'ref' : x))]); return typeof ret === 'function' ? ret(...a) : ret; };
function reset() {
  rolls = []; keys = []; menuKeys = []; calls = [];
  g.TreasureMoney = [0, 0, 0, 0, 0, 0, 0]; g.PartyHead = null; g.SelectedChar = null; g.TreasureItems = null; g.game_Mode = 0;
}
bindParty({
  g, ext: {
    Roll: (n, s) => { if (rolls.length) return rolls.shift(); throw new Error('roll queue empty'); },
    StrWeightAllowance: () => 0,                       // max carry = 1500
    ShowTimedBottomMessage: rec('ShowTimedBottomMessage'),
    ReadGameKey: async () => keys.shift(),
    ClearGlyphRun: rec('ClearGlyphRun'), DrawText: rec('DrawText'), ClearTextRectangle: rec('ClearTextRectangle'),
    DrawCharacterName: rec('DrawCharacterName'), RecalcCharacter: rec('RecalcCharacter'), DrawTitledFrame: rec('DrawTitledFrame'),
    HorizontalMenu: async (...a) => { calls.push(['HorizontalMenu', a[0], a[1]]); return { key: menuKeys.shift(), ext: false }; },
    VerticalListMenu: rec('VerticalListMenu'), FreeMenuList: rec('FreeMenuList'),
  },
});
const mkChar = (name, morale = 0) => { const c = newChar(); setPstr(c.b, 0, name, 15); c.b[0x84] = morale; return c; };
const money = (c) => [0, 1, 2, 3, 4, 5, 6].map((i) => rdW(c.b, 0x88 + 2 * i));
const itemView = (it) => ({
  type: it.b[0x2E], words: [it.b[0x2F], it.b[0x30], it.b[0x31]], plus: it.b[0x32], plus2: it.b[0x33], hidden: it.b[0x35],
  weight: rdW(it.b, 0x37), count: it.b[0x39], value: rdW(it.b, 0x3A), power: [it.b[0x3C], it.b[0x3D], it.b[0x3E]],
});

// ---- MakeTreasureItem (8900:1010) ----
reset(); rolls = [];
eq('gauntlets (63 -> rec 49h)', itemView(T.MakeTreasureItem(63)),
  { type: 63, words: [0xE2, 0xA7, 0x64], plus: 1, plus2: 1, hidden: 6, weight: 10, count: 0, value: 15000, power: [0, 0x26, 0x83] });
reset(); rolls = [1, 5];                              // RollMagicPlus d20 = 1 -> +1; javelin d5 = 5 -> rec 90h (quirk)
eq('javelin quirk (21, d5=5 -> rec 90h)', itemView(T.MakeTreasureItem(21)),
  { type: 21, words: [0x00, 0xE5, 0xA7], plus: 1, plus2: 1, hidden: 6, weight: 88, count: 0, value: 25, power: [0x70, 0x00, 0x48] });
reset(); rolls = [1, 4];
eq('javelin normal (21, d5=4)', itemView(T.MakeTreasureItem(21)),
  { type: 21, words: [0, 0xA2, 0x15], plus: 1, plus2: 0, hidden: 6, weight: 20, count: 0, value: 2000, power: [0, 0, 0] });
reset(); rolls = [15];                                // +2
eq('ring mail +2 (54)', itemView(T.MakeTreasureItem(54)),
  { type: 54, words: [0xA3, 0x30, 54], plus: 2, plus2: 0, hidden: 4, weight: 400, count: 0, value: 6000, power: [0, 0, 0] });
reset(); rolls = [20];                                // +3 -> bracers plus 8 "AC 2"
eq('bracers AC 2 (77)', itemView(T.MakeTreasureItem(77)),
  { type: 77, words: [0xDC, 0xA7, 0x4F], plus: 8, plus2: 0, hidden: 6, weight: 10, count: 0, value: 24000, power: [0, 0, 0] });
reset(); rolls = [1];
eq('arrows +1 (73) count 10', itemView(T.MakeTreasureItem(73)),
  { type: 73, words: [0, 0xA2, 0x3D], plus: 1, plus2: 0, hidden: 6, weight: 40, count: 10, value: 150, power: [0, 0, 0] });
reset(); rolls = [3];                                 // wand d3 = 3 -> r = 4 -> rec 0 (quirk: empty item)
eq('wand r=4 empty (78)', itemView(T.MakeTreasureItem(78)),
  { type: 78, words: [0, 0, 0], plus: 0, plus2: 0, hidden: 6, weight: 0, count: 0, value: 0, power: [0, 0, 0] });
reset(); rolls = [2, 1, 5, 3, 11];                    // MU scroll: 2 spells: lvl1 d13=5 -> 13; lvl3 d11=11 -> 55
eq('MU scroll (61)', itemView(T.MakeTreasureItem(61)),
  { type: 61, words: [0, 0xD3, 0xD1], plus: 1, plus2: 0, hidden: 6, weight: 25, count: 0, value: 1200, power: [13, 55, 0] });
reset(); rolls = [4];                                 // ring d10 = 4 -> Fire Resistance (79h)
eq('ring of fire resistance (69)', itemView(T.MakeTreasureItem(69)),
  { type: 69, words: [0xCD, 0xA7, 0x42], plus: 1, plus2: 1, hidden: 6, weight: 1, count: 0, value: 5000, power: [0, 0x3D, 0x81] });
reset(); rolls = [];
eq('cloak of displacement +2 (92)', itemView(T.MakeTreasureItem(92)),
  { type: 92, words: [0xAA, 0xA7, 0x58], plus: 2, plus2: 2, hidden: 6, weight: 25, count: 0, value: 17500, power: [0, 0x59, 0x85] });
// seeded run through the real dice for every type: must not throw, type preserved
{
  const { Roll } = await import('../../areas/combat_ov24.js').catch(() => ({}));
  if (Roll) {
    bindParty({ ext: { Roll } }); setRandSeed(12345); let ok = true;
    for (let t = 0; t < 128; t++) { const it = T.MakeTreasureItem(t); if (it.b[0x2E] !== t) ok = false; }
    eq('seeded MakeTreasureItem 0..127', ok, true);
    bindParty({ ext: { Roll: (n, s) => { if (rolls.length) return rolls.shift(); throw new Error('roll queue empty'); } } });
  }
}

// ---- money conversions ----
eq('MoneyValueInGold 10 gold + 1 plat', T.MoneyValueInGold([0, 0, 0, 10, 1, 0, 0]), 15);   // (2000+1000+100) div 200
eq('MoneyValueInGold 150 copper rounds', T.MoneyValueInGold([150, 0, 0, 0, 0, 9, 9]), 1);  // (150+100) div 200, gems ignored
reset(); g.SelectedChar = mkChar('A'); wrW(g.SelectedChar.b, 0x88, 77);
T.SetCharMoneyGold(23);
eq('SetCharMoneyGold 23 -> 4 plat 3 gold', money(g.SelectedChar), [0, 0, 0, 3, 4, 0, 0]);
reset(); g.TreasureMoney = [5, 5, 5, 5, 5, 7, 8]; T.SetPoolMoneyGold(12);
eq('SetPoolMoneyGold 12', g.TreasureMoney, [0, 0, 0, 2, 2, 7, 8]);

// ---- overload ----
reset(); { const c = mkChar('B'); wrW(c.b, 0x102, 1400); const room = { v: -1 };
  eq('WouldOverload 1400+200 > 1500', [T.WouldOverload(c, 200, room), room.v], [true, 100]);
  eq('WouldOverload 1400+100', [T.WouldOverload(c, 100, room), room.v], [false, 0]); }

// TransferCoins quirk: dst encumbrance not raised, src back to its old value
reset(); { const a = mkChar('A'), b = mkChar('B'); wrW(a.b, 0x88 + 6, 50); wrW(a.b, 0x102, 50); wrW(b.b, 0x102, 10);
  await T.TransferCoins({ v: a }, { v: b }, 20, 3);
  eq('TransferCoins money', [money(a)[3], money(b)[3]], [30, 20]);
  eq('TransferCoins quirk encumbrance', [rdW(a.b, 0x102), rdW(b.b, 0x102)], [50, 10]); }

// ShareMoney: 2 PCs, pool 5 gold -> 2 each, the rest (1) to the first
reset(); { const a = mkChar('A'), b = mkChar('B'); a.next = b; g.PartyHead = a; g.TreasureMoney = [0, 0, 0, 5, 0, 0, 0];
  T.ShareMoney();
  eq('ShareMoney gold', [money(a)[3], money(b)[3], g.TreasureMoney[3], g.PoolHasMoney], [3, 2, 0, 0]); }
// ShareMoney with only NPCs: runtime error 200
reset(); { const a = mkChar('N', 5); g.PartyHead = a; g.TreasureMoney = [1, 0, 0, 0, 0, 0, 0];
  let err = ''; try { T.ShareMoney(); } catch (e) { err = String(e.message).slice(0, 17); }
  eq('ShareMoney all NPC -> runtime error 200', err, 'Runtime error 200'); }
// PoolMoney: NPC keeps money
reset(); { const a = mkChar('A'), n = mkChar('N', 5); a.next = n; g.PartyHead = a; wrW(a.b, 0x88, 9); wrW(a.b, 0x102, 9); wrW(n.b, 0x88, 4);
  T.PoolMoney();
  eq('PoolMoney', [g.TreasureMoney[0], money(a)[0], money(n)[0], rdW(a.b, 0x102)], [9, 0, 4, 0]); }

// CoinFromText
{ const r = { v: '' }; eq('CoinFromText gems', [T.CoinFromText('  Gems 3', r), r.v], [5, 'Gems ']);
  eq('CoinFromText gold', [T.CoinFromText('Gold 12', r), r.v], [3, 'Gold ']);
  const node = { b: new Uint8Array(0x2E) }; setPstr(node.b, 0, '  Electrum 4', 40);
  eq('CoinFromText node', [T.CoinFromText(node, r), r.v], [2, 'electrum ']); }

// InputNumber (8900:0294)
reset(); keys = ['1', '2', '\r']; eq('InputNumber 12', await T.InputNumber(50, 'How much? ', 0x0A), 12);
reset(); keys = ['9', '9', '\r']; eq('InputNumber clamp to 50', await T.InputNumber(50, 'x', 0x0A), 50);
reset(); keys = ['7', '\x1B']; eq('InputNumber Esc -> 0', await T.InputNumber(50, 'x', 0x0A), 0);

// AppraiseGems: 1 gem, roll 30 -> 50 gp, Sell -> 10 platinum
reset(); { const c = mkChar('A'); wrW(c.b, 0x88 + 10, 1); g.SelectedChar = c; rolls = [30]; menuKeys = ['G', 'S'];
  const ch = { v: false }; await T.AppraiseGems(ch);
  eq('Appraise gem sold', [money(c)[5], money(c)[4], rdW(c.b, 0x102), ch.v], [0, 10, 10, true]);
  eq('Appraise text', calls.filter((x) => x[0] === 'DrawText' && x[2] === 0x0C).map((x) => x[4]), ['The Gem is Valued at 50 gp.']); }
// Keep with no items: quirk, the gem is lost
reset(); { const c = mkChar('A'); wrW(c.b, 0x88 + 10, 1); g.SelectedChar = c; rolls = [100]; menuKeys = ['G', 'K'];
  await T.AppraiseGems({ v: false });
  eq('Appraise keep, no items -> lost', [money(c)[5], c.items], [0, null]); }
// Keep with an item: appended
reset(); { const c = mkChar('A'); c.items = newItem(); wrW(c.b, 0x88 + 12, 1); g.SelectedChar = c; rolls = [5]; menuKeys = ['J', 'K'];
  setRandSeed(1); await T.AppraiseGems({ v: false });
  const it = c.items.next; eq('Appraise keep jewel', [it.b[0x31], it.b[0x2E], rdW(it.b, 0x37) > 0], [0xD6, 70, true]); }
// no gems
reset(); { g.SelectedChar = mkChar('A'); const ch = { v: true }; await T.AppraiseGems(ch);
  eq('Appraise none', [ch.v, calls[0]], [false, ['ShowTimedBottomMessage', 'No Gems or Jewelry']]); }

console.log(fails ? `${fails} FAILED` : 'all ov21 tests passed');
process.exit(fails ? 1 : 0);
