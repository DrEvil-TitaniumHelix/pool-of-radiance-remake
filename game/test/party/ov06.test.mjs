// game/test/party/ov06.test.mjs — node test of game/areas/party_ov06.js (PARTY ov06, seg 3E00: the shop).
// Run: node game/test/party/ov06.test.mjs
// Expected values are derived from decode/listings/ov06.lst / party_parts/ov06.pas.md (addresses per case), not from the JS.
import { bindParty } from '../../areas/party_core.js';
import { newChar, newItem, rdW, wrW, pstr, setPstr } from '../../engine/state.js';
import * as T from '../../areas/party_ov06.js';

let fails = 0;
const eq = (name, got, want) => {
  const a = JSON.stringify(got), b = JSON.stringify(want);
  if (a !== b) { fails++; console.log(`FAIL ${name}: got ${a}, want ${b}`); } else console.log(`ok   ${name}`);
};

let calls, listKeys, menuKeys, gold, pool, overloads, selectAnswer;
const g = {};
const rec = (name, ret) => (...a) => { calls.push([name, ...a.map((x) => (x && x.b ? 'rec' : x && typeof x === 'object' && 'v' in x ? 'ref' : x))]); return typeof ret === 'function' ? ret(...a) : ret; };
function reset() {
  calls = []; listKeys = []; menuKeys = []; gold = 0; pool = 0; overloads = false; selectAnswer = [];
  for (const k of Object.keys(g)) delete g[k];
  Object.assign(g, { game_Mode: 0, PartyHead: null, SelectedChar: null, TreasureItems: null, TreasureMoney: [5, 0, 0, 0, 0, 0, 0] });
}
let shownTexts;
bindParty({
  g, ext: {
    DrawTitledFrame: rec('DrawTitledFrame'),
    VerticalListMenu: async (prompt, opts, c1, c2, c3, l, t, r, b, list, showExit, redraw, index, item) => {
      shownTexts = []; for (let n = list; n; n = n.next) shownTexts.push(n.text);
      calls.push(['VerticalListMenu', prompt, opts, c1, c2, c3, l, t, r, b, showExit]);
      const [key, n] = listKeys.shift();
      let node = list; for (let i = 0; i < n && node; i++) node = node.next;
      item.v = key === '\0' ? null : node; index.v = n;
      return key;
    },
    BuildItemName: (c, item) => { calls.push(['BuildItemName']); setPstr(item.b, 0, item.realName, 40); },
    ItemOverloads: () => overloads,
    ShowTimedBottomMessage: rec('ShowTimedBottomMessage'),
    RecalcCharacter: rec('RecalcCharacter'),
    MoneyInGold: () => gold,
    SetCharMoneyGold: rec('SetCharMoneyGold'),
    MoneyValueInGold: () => pool,
    SetPoolMoneyGold: rec('SetPoolMoneyGold'),
    RedrawCurrentMode: rec('RedrawCurrentMode'), DrawPartyRoster: rec('DrawPartyRoster'),
    TreasurePoolStatus: (m, it) => { m.v = pool > 0; it.v = false; },
    HorizontalMenu: async (...a) => { calls.push(['HorizontalMenu', a[0], a[1], a[2], a[3], a[4], a[5], a[6]]); return menuKeys.shift(); },
    ViewMenu: rec('ViewMenu'), TakeMoney: rec('TakeMoney'), PoolMoney: rec('PoolMoney'), ShareMoney: rec('ShareMoney'),
    AppraiseGems: async (r) => { calls.push(['AppraiseGems']); r.v = true; },
    DrawWrappedText: rec('DrawWrappedText'), ClearTextRectangle: rec('ClearTextRectangle'),
    MenuSelect: async (...a) => { calls.push(['MenuSelect', ...a]); return selectAnswer.shift(); },
    CycleSelectedChar: rec('CycleSelectedChar'),
  },
});
const ware = (name, value) => { const it = newItem(); it.realName = name; setPstr(it.b, 0, name, 40); wrW(it.b, 0x3A, value); return it; };
const chainOf = (...a) => { for (let i = 0; i + 1 < a.length; i++) a[i].next = a[i + 1]; return a[0] ?? null; };
const named = (n) => calls.filter((x) => x[0] === n);

// 1. ShopItemsMenu (3E00:0030): 30-char lines, price right-aligned to column 30; free ware gets value 1 written (quirk);
//    frame 'Shop' (1,1,38,22, style 0, colour 0Fh); list 'Items: ' / 'Buy' 0D/0A/0F at (1,4)-(38,22) with Exit; names restored
reset();
{ const a = ware('Long Sword', 15), b = ware('Rope', 0); g.TreasureItems = chainOf(a, b);
  listKeys = [['B', 1]];
  const key = { v: '\0' }, chosen = { v: null }, cur = { v: a }, index = { v: 1 };
  await T.ShopItemsMenu(key, chosen, cur, index);
  eq('menu lines', shownTexts, ['Long Sword' + ' '.repeat(18) + '15', 'Rope' + ' '.repeat(25) + '1']);
  eq('free ware value 1 (3e00:0068)', rdW(b.b, 0x3A), 1);
  eq('frame (3e00:0167)', named('DrawTitledFrame')[0], ['DrawTitledFrame', 1, 1, 38, 22, 0, 15, 'Shop']);
  eq('list call (3e00:01c4)', named('VerticalListMenu')[0], ['VerticalListMenu', 'Items: ', 'Buy', 0x0D, 0x0A, 0x0F, 1, 4, 38, 22, true]);
  eq('key/chosen', [key.v, chosen.v === b, cur.v === b], ['B', true, true]);
  eq('names restored (3e00:0210)', [named('BuildItemName').length, pstr(a.b, 0)], [2, 'Long Sword']); }

// 2. AddItemToChar (3E00:0239): copy appended at the end of SelectedChar's items; RecalcCharacter
reset();
{ const c = newChar(); g.SelectedChar = c; const old = newItem(); c.items = old;
  const w = ware('Shield', 7); const failed = { v: true };
  await T.AddItemToChar(w, failed);
  eq('append copy', [failed.v, c.items === old, old.next !== w && rdW(old.next.b, 0x3A) === 7, old.next.next], [false, true, true, null]);
  eq('recalc (3e00:0344)', named('RecalcCharacter').length, 1);
  overloads = true; calls = [];
  await T.AddItemToChar(w, failed);
  eq('overloaded (3e00:0265)', [failed.v, named('ShowTimedBottomMessage')[0], named('RecalcCharacter').length], [true, ['ShowTimedBottomMessage', 'OverLoaded'], 0]); }

// 3. ShopBuy (3E00:0361): own coins pay (low word of MoneyInGold, quirk), else the pool, else 'Not enough Money.'
reset();
{ const c = newChar(); g.SelectedChar = c; const w = ware('Mace', 8); g.TreasureItems = w;
  gold = 0x10005;                                    // 65541 gp: only the low word 5 counts -> cannot pay with own coins
  pool = 20;
  listKeys = [['B', 0], ['\0', 0]];
  await T.ShopBuy();
  eq('low word: pool pays 20-8', [named('SetCharMoneyGold'), named('SetPoolMoneyGold')], [[], [['SetPoolMoneyGold', 12]]]);
  reset(); const c2 = newChar(); g.SelectedChar = c2; g.TreasureItems = ware('Mace', 8);
  gold = 10; listKeys = [['\r', 0], ['E', 0]];     // Enter = Buy (3e00:039f)
  await T.ShopBuy();
  eq('own coins pay 10-8', named('SetCharMoneyGold'), [['SetCharMoneyGold', 2]]);
  reset(); g.SelectedChar = newChar(); g.TreasureItems = ware('Mace', 8);
  gold = 3; pool = 7; listKeys = [['B', 0], ['\0', 0]];
  await T.ShopBuy();
  eq('not enough (3e00:0462)', named('ShowTimedBottomMessage'), [['ShowTimedBottomMessage', 'Not enough Money.']]);
  reset(); g.SelectedChar = newChar(); g.TreasureItems = ware('Mace', 8);
  gold = 30; overloads = true; listKeys = [['B', 0], ['\0', 0]];
  await T.ShopBuy();
  eq('overloaded: no payment', [named('SetCharMoneyGold').length, named('ShowTimedBottomMessage')[0]], [0, ['ShowTimedBottomMessage', 'OverLoaded']]); }

// 4. Shop (3E00:053E): game_Mode 1, pool cleared; menu text by pool status; P only without ext; ext 'S' (Del) = Share
//    (quirk); E with money -> warning + MenuSelect, 1 (No) leaves
reset();
{ const c = newChar(); g.SelectedChar = c; g.PartyHead = c; g.TreasureItems = null;
  pool = 0;
  menuKeys = [{ key: 'P', ext: true }, { key: 'P', ext: false }, { key: 'S', ext: true }, { key: 'A', ext: false }, { key: 'E', ext: false }];
  await T.Shop();
  eq('mode 1, pool cleared (3e00:0545 / 0568)', [g.game_Mode, g.TreasureMoney], [1, [0, 0, 0, 0, 0, 0, 0]]);
  eq('menu without money (3e00:05f7)', named('HorizontalMenu')[0], ['HorizontalMenu', '', 'Buy View Pool Appraise Exit', 0x0D, 0x0A, 0x0F, true, false]);
  eq('P ext ignored, P plain pools (3e00:0651)', named('PoolMoney').length, 1);
  eq('ext S = Share (quirk)', named('ShareMoney').length, 1);
  eq('A: Appraise + redraw (3e00:0779)', [named('AppraiseGems').length, named('RedrawCurrentMode').length], [1, 2]);
  reset(); const c2 = newChar(); g.SelectedChar = c2; g.PartyHead = c2;
  pool = 50;
  menuKeys = [{ key: 'E', ext: false }, { key: 'E', ext: false }];
  selectAnswer = [0, 1];
  await T.Shop();
  eq('menu with money (3e00:05e2)', named('HorizontalMenu')[0][2], 'Buy View Take Pool Share Appraise Exit');
  eq('leave warning text (3e00:06d0)', named('DrawWrappedText')[0],
    ['DrawWrappedText', 1, 17, 38, 22, 10, true, 'As you Leave the Shopkeeper says, "Excuse me but you have Left Some Money here."  ']);
  eq('MenuSelect ~Yes ~No (3e00:0714)', named('MenuSelect')[0], ['MenuSelect', '', '~Yes ~No', 0x0D, 0x0A, 0x0F, false, 0]);
  eq('Yes (0) clears the window and stays, No (1) leaves', [named('ClearTextRectangle').length, named('MenuSelect').length], [1, 2]); }

if (fails) { console.log(`${fails} FAILED`); process.exit(1); }
console.log('all ov06 tests passed');
