// game/test/party/ov16b.test.mjs — node test of game/areas/party_ov16b.js (PARTY ov16 part B).
// Run: node game/test/party/ov16b.test.mjs
// Expected values derived from decode/listings/ov16.lst (addresses cited) and the DS table bytes of the image
// (decode/bin/START.unpacked.exe, DS 0C7C at image offset C7C0h), not from the JS.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bindParty } from '../../areas/party_core.js';
import * as P from '../../areas/party_ov16b.js';

const exe = readFileSync(fileURLToPath(new URL('../../../decode/bin/START.unpacked.exe', import.meta.url)));
const hdr = (exe[8] | (exe[9] << 8)) * 16;
const DS0 = Uint8Array.from(exe.subarray(hdr + 0xC7C0, hdr + 0xC7C0 + 0x8760));

let fails = 0;
const eq = (name, got, want) => {
  const a = JSON.stringify(got), b = JSON.stringify(want);
  if (a !== b) { fails++; console.log(`FAIL ${name}: got ${a}, want ${b}`); } else console.log(`ok   ${name}`);
};

let calls, g, menuKeys, yesNo, rolls, gold;
const named = (n) => calls.filter((x) => x[0] === n);
const rec = (name, ret) => (...a) => { calls.push([name, ...a.map((x) => (x && x.b ? 'char' : x))]); return typeof ret === 'function' ? ret(...a) : ret; };

function mkChar(name, fields = {}) {
  const c = { b: new Uint8Array(0x11D), next: null, items: null, effects: null, combat: null };
  c.b[0] = name.length; for (let i = 0; i < name.length; i++) c.b[1 + i] = name.charCodeAt(i);
  c.b[0x10D] = 1;
  for (const [o, v] of Object.entries(fields)) c.b[+o] = v;
  return c;
}
const setXp = (c, v) => { c.b[0xAC] = v & 0xFF; c.b[0xAD] = (v >> 8) & 0xFF; c.b[0xAE] = (v >> 16) & 0xFF; c.b[0xAF] = (v >>> 24) & 0xFF; };
const xp = (c) => (c.b[0xAC] | (c.b[0xAD] << 8) | (c.b[0xAE] << 16) | (c.b[0xAF] << 24));
const money = (c, i) => c.b[0x88 + 2 * i] | (c.b[0x89 + 2 * i] << 8);
const setMoney = (c, i, v) => { c.b[0x88 + 2 * i] = v & 0xFF; c.b[0x89 + 2 * i] = v >> 8; };

function setup(sel, extra = {}) {
  calls = []; menuKeys = []; yesNo = []; rolls = []; gold = 0;
  g = { ds: Uint8Array.from(DS0), SelectedChar: sel, PartyHead: sel, StingMode: 0, ecl_Mem6B00: new Uint16Array(0x400),
    CombatIcons: [], travel_Mode: 1, VideoMode: 1, ...extra };
  bindParty({
    g, ext: {
      AskYesNo: rec('AskYesNo', () => yesNo.shift()),
      HorizontalMenu: rec('HorizontalMenu', () => menuKeys.shift()),
      ShowTimedBottomMessage: rec('ShowTimedBottomMessage'), ShowTimedBottomPrompt: rec('ShowTimedBottomPrompt'),
      FreeCombatIcon: rec('FreeCombatIcon'), FreeCharacter: rec('FreeCharacter', (r) => { r.v = null; }),
      MoneyInGold: () => gold, ClearRectangle: rec('ClearRectangle'), DrawCharacterName: rec('DrawCharacterName'),
      DrawText: rec('DrawText'), ByteToStr: (v) => String(v & 0xFF), UpdateLevelStats: rec('UpdateLevelStats'),
      SpellList: rec('SpellList', (m, f, idx, cnt) => { cnt.v = 0; return 0; }),
      Roll: (n, s) => (rolls.length ? rolls.shift() : n),
      DrawCharacterSheet: rec('DrawCharacterSheet'), DrawAbility: rec('DrawAbility'), DrawHP: rec('DrawHP'),
      RecalcCharacter: rec('RecalcCharacter'), DrawCombatStats: rec('DrawCombatStats'), WisdomBonusSpells: rec('WisdomBonusSpells'),
      ShowPortrait: rec('ShowPortrait'), ClearMenuLine: rec('ClearMenuLine'),
      ...extra.ext,
    },
  });
}
const K = (key, ext = false) => ({ key, ext });

// ---- ConHpBonus 7000:3F31 (ConHpAdj DS:408E: CON 16 -> +2, 3 -> -2; fighter +1 at >16, +1 at >17) ----
{
  const f = mkChar('F', { 0x2F: 2, 0x98: 1, 0x14: 18 }); setup(f);
  eq('ConHpBonus fighter CON18 = 2+1+1', P.ConHpBonus(f), 4);
  const p = mkChar('P', { 0x2F: 3, 0x99: 1, 0x14: 18 }); setup(p);
  eq('ConHpBonus paladin CON18 = 2 (quirk: class 2 only)', P.ConHpBonus(p), 2);
  const m = mkChar('M', { 0x2F: 8, 0x96: 1, 0x98: 1, 0x14: 16 }); setup(m);
  eq('ConHpBonus C/F CON16 = 2 per class', P.ConHpBonus(m), 4);
  const w = mkChar('W', { 0x2F: 5, 0x9B: 1, 0x14: 3 }); setup(w);
  eq('ConHpBonus MU CON3 = -2', P.ConHpBonus(w), -2);
}
// ---- Max/MinHitPoints 7000:408C / 3FB3 ----
{
  const f = mkChar('F', { 0x2F: 2, 0x98: 1, 0x14: 18 }); setup(f);
  eq('MaxHitPoints fighter L1 CON18 = 10+4', P.MaxHitPoints(f), 14);
  const w = mkChar('W', { 0x2F: 5, 0x9B: 1, 0x14: 3 }); setup(w);
  eq('MaxHitPoints MU L1 CON3: 4 > 1+2 -> (4-2) div 1', P.MaxHitPoints(w), 2);
  eq('MinHitPoints MU L1 CON3: 1 > 3 false -> 1', P.MinHitPoints(w), 1);
  const r = mkChar('R', { 0x2F: 4, 0x9A: 1, 0x14: 10 }); setup(r);
  eq('MinHitPoints ranger L1 = 1+1 (2 HD)', P.MinHitPoints(r), 2);
  // quirk 7000:41c1: MaxHitPoints takes the CON adjustment of SelectedChar
  setup(f); eq('MaxHitPoints(w) with SelectedChar = fighter CON18: 4+4', P.MaxHitPoints(w), 8);
}
// ---- RollHitDice 7000:4235: level-1 floor = sides*2 div 3 ----
{
  const f = mkChar('F', { 0x2F: 2, 0x98: 1 }); setup(f); rolls = [1];
  eq('RollHitDice fighter L1 roll 1 -> floor 6', P.RollHitDice(f, 0xFF), 6);
  f.b[0x98] = 2; rolls = [1];
  eq('RollHitDice fighter L2 roll 1 -> 1', P.RollHitDice(f, 0xFF), 1);
  rolls = [5];
  eq('RollHitDice bits without fighter (MU bit 1) -> 0', P.RollHitDice(f, 0x01), 0);
}
// ---- PayGold 7000:42ED ----
{
  const c = mkChar('C'); setup(c); setMoney(c, 3, 1000);
  P.PayGold(1000, c);
  eq('PayGold 1000 gold from 1000 gold', [money(c, 0), money(c, 3), money(c, 4)], [0, 0, 0]);
  const d = mkChar('D'); setup(d); setMoney(d, 4, 300);
  P.PayGold(1000, d);   // 4342: n = 200000 div 1000 + 1 = 201 plat, due -1000 -> change 1 plat
  eq('PayGold 1000 from 300 platinum -> 100 platinum', [money(d, 3), money(d, 4)], [0, 100]);
}
// ---- TrainCharacter 7000:29AE ----
{
  const f = mkChar('Fred', { 0x2F: 2, 0x98: 1, 0x10C: 4 }); setup(f); gold = 2000;
  await P.TrainCharacter();
  eq('Train unconscious (29b5)', named('ShowTimedBottomPrompt')[0], ['ShowTimedBottomPrompt', 'we only train conscious people', 0x0E]);

  const f2 = mkChar('Fred', { 0x2F: 2, 0x98: 1 }); setup(f2); gold = 999;
  await P.TrainCharacter();
  eq('Train poor (29ea)', named('ShowTimedBottomPrompt')[0], ['ShowTimedBottomPrompt', 'Training costs 1000 gp.', 0x0E]);

  // quirk 2c86: xp capped before the hall check: fighter L1 xp 5000 -> L3 needs 4001 -> xp 4000, then refused
  const f3 = mkChar('Fred', { 0x2F: 2, 0x98: 1 }); setXp(f3, 5000); setup(f3); gold = 2000;
  g.ecl_Mem6B00[0x550 >> 1] = 0x02;          // cleric-only hall
  await P.TrainCharacter();
  eq('Train wrong hall (2cae)', named('ShowTimedBottomPrompt')[0], ['ShowTimedBottomPrompt', "We don't train that class here", 0x0E]);
  eq('Train wrong hall keeps the XP cap quirk', xp(f3), 4000);

  const f4 = mkChar('Fred', { 0x2F: 2, 0x98: 1 }); setXp(f4, 100); setup(f4); gold = 2000;
  g.ecl_Mem6B00[0x550 >> 1] = 0x08;
  await P.TrainCharacter();
  eq('Train not enough XP (2cdc)', named('ShowTimedBottomPrompt')[0], ['ShowTimedBottomPrompt', 'Not Enough Experience', 0x0E]);

  // success: fighter L1, xp 2500 (L2 2001), CON 10 (adj 0), hp 8/10, roll 7, 1000 gold
  const f5 = mkChar('Fred', { 0x2F: 2, 0x98: 1, 0x14: 10, 0x32: 10, 0x11B: 8 }); setXp(f5, 2500); setMoney(f5, 3, 1000);
  setup(f5); gold = 1000; yesNo = ['Y']; rolls = [7];
  g.ecl_Mem6B00[0x550 >> 1] = 0x08;
  await P.TrainCharacter();
  eq('Train shows "    a level 2 Fighter" (2e10)', named('DrawText')[1], ['DrawText', 6, 5, 0x0A, '    a level 2 Fighter']);
  eq('Train will become (2d76)', named('DrawText')[0], ['DrawText', 8, 4, 0x0A, ' will become:']);
  eq('Train level 2', f5.b[0x98], 2);
  eq('Train hp_rolled += 7', f5.b[0xB1], 7);
  eq('Train hp_max 17, hp 15 (wounds kept)', [f5.b[0x32], f5.b[0x11B]], [17, 15]);
  eq('Train paid 1000 gold', money(f5, 3), 0);
  eq('Train UpdateLevelStats', named('UpdateLevelStats').length, 1);

  // quirk 2f95: MU levels up, no learnable spell (count 0) -> byte +32h (hp_max) := 1, then HP gain
  const m = mkChar('Mia', { 0x2F: 5, 0x9B: 1, 0x14: 10, 0x32: 4, 0x11B: 4 }); setXp(m, 2600);
  setup(m); g.StingMode = 0; gold = 1000; yesNo = ['Y']; rolls = [3]; g.ecl_Mem6B00[0x550 >> 1] = 0x01;
  await P.TrainCharacter();
  eq('Train MU learn none -> SpellList(4,4,..) called', named('SpellList')[0].slice(1, 3), [4, 4]);
  eq('Train MU quirk: hp_max := 1, wounds = byte(1-4) = 253, hp_max 1+3, hp = byte(4-253)', [m.b[0x32], m.b[0x11B]], [4, 7]);
}
// ---- DropCharacter 7000:1F37 / RemoveFromParty 7000:3291 ----
{
  const a = mkChar('Ann'), b = mkChar('Bob', { 0xBF: 2 }); a.next = b;
  setup(b, { PartyHead: a }); g.PartyHead = a; g.ecl_Mem6B00[0x67C >> 1] = 2; yesNo = ['Y', 'Y'];
  await P.DropCharacter();
  eq('Drop message (1fff)', named('ShowTimedBottomMessage')[0], ['ShowTimedBottomMessage', 'Bob bids you farewell.']);
  eq('Drop removed: Ann selected, list = Ann', [g.SelectedChar === a, a.next], [true, null]);
  eq('Drop freed icon slot 2, count 1', [named('FreeCombatIcon')[0], g.ecl_Mem6B00[0x67C >> 1]], [['FreeCombatIcon', 2], 1]);

  const c = mkChar('Cid', { 0x10D: 0 }); setup(c); yesNo = ['Y', 'N'];
  await P.DropCharacter();
  eq('Drop "no" on second question -> sigh (202a)', named('ShowTimedBottomMessage')[0], ['ShowTimedBottomMessage', 'Cid breathes a sigh of relief.']);
  eq('Drop "no" keeps the party', g.PartyHead === c, true);

  const h = mkChar('Hal'), i = mkChar('Ivy'); h.next = i;
  setup(h, { PartyHead: h }); g.PartyHead = h; g.ecl_Mem6B00[0x67C >> 1] = 2;
  await P.RemoveFromParty(1, 0);
  eq('RemoveFromParty head: head = Ivy, selected Ivy, keepCount', [g.PartyHead === i, g.SelectedChar === i, g.ecl_Mem6B00[0x67C >> 1]], [true, true, 2]);
}
// ---- ModifyCharacter 7000:209F ----
{
  const c = mkChar('Old'); setXp(c, 1); setup(c);
  await P.ModifyCharacter();
  eq("Modify xp > 0 (20da)", named('ShowTimedBottomPrompt')[0], ['ShowTimedBottomPrompt', "Old can't be modified.", 0x0E]);

  // human (race 7) cleric WIS 9: decrease -> 8 < class min 9 -> race min 3 (quirk)
  const k = mkChar('Kay', { 0x2E: 7, 0x2F: 0, 0x96: 1, 0x10: 10, 0x11: 10, 0x12: 9, 0x13: 10, 0x14: 10, 0x15: 10, 0xB2: 2 });
  setup(k);
  menuKeys = [K('P', true), K('P', true), K('K', true), K('K')];
  await P.ModifyCharacter();
  eq('Modify cleric WIS 9 -> 8 -> race min 3 (2354)', k.b[0x12], 3);
  eq('Modify WIS change: spell_slots[0] := 1 (2365)', k.b[0xB2], 1);
  eq('Modify Keep -> unk_85 = 1 (28e0)', k.b[0x85], 1);
  eq('Modify menu call (2169)', named('HorizontalMenu')[0], ['HorizontalMenu', 'Modify character: ', 'Keep Exit', 0x0D, 0x0A, 0x0F, true, false]);

  // Exit undoes: STR up then E
  const e = mkChar('Eve', { 0x2E: 7, 0x2F: 2, 0x98: 1, 0x10: 16, 0x32: 8, 0x11B: 8 }); setup(e);
  menuKeys = [K('M', true), K('E')];
  await P.ModifyCharacter();
  eq('Modify Exit restores STR 16', e.b[0x10], 16);
}
// ---- PortraitMenu 7000:33E7 ----
{
  const c = mkChar('Pic', { 0xBB: 14, 0xBC: 3 }); setup(c);
  menuKeys = [K('H'), K('B'), K('\0'), K('K')];
  await P.PortraitMenu();
  eq('Portrait H wraps 14 -> 1, B 3 -> 4, Esc loops, K keeps', [c.b[0xBB], c.b[0xBC]], [1, 4]);
  eq('Portrait menu colours (3444)', named('HorizontalMenu')[0], ['HorizontalMenu', '', 'Head Body Keep', 0, 0x0F, 0x0A, false, false]);
}
// ---- AddCharacterMenu 7000:306D ----
{
  setup(null); g.PartyHead = null;
  const n2 = { text: 'Zed', isHeader: 0, next: null }, n1 = { text: 'Yan', isHeader: 0, next: n2 };
  let vlm = 0;
  const added = [];
  bindParty({ g, ext: {
    ReadCharList: () => n1, WriteCharList: rec('WriteCharList'), FreeMenuList: rec('FreeMenuList'),
    VerticalListMenu: (...a) => { calls.push(['VerticalListMenu', ...a.slice(0, 11)]); vlm++; const item = a[13]; if (vlm === 1) { item.v = n1; return 'A'; } item.v = null; return 'E'; },
    ReadCharacter: (name, c) => { c.b[0] = name.length; for (let i = 0; i < name.length; i++) c.b[1 + i] = name.charCodeAt(i); },
    AddToParty: (c) => { added.push(c); g.PartyHead = c; g.SelectedChar = c; g.ecl_Mem6B00[0x67C >> 1]++; },
    LoadCharacterIcon: rec('LoadCharacterIcon'),
  } });
  await P.AddCharacterMenu();
  eq('Add: VerticalListMenu args (30fb)', calls.find((x) => x[0] === 'VerticalListMenu').slice(1, 10), ['Add a character: ', 'Add Exit', 0x0D, 0x0A, 0x0F, 1, 2, 0x26, 0x16]);
  eq('Add: one added, marked "* Yan", count 1', [added.length, n1.text, g.ecl_Mem6B00[0x67C >> 1]], [1, '* Yan', 1]);
  eq('Add: icon recoloured (3192)', named('LoadCharacterIcon')[0], ['LoadCharacterIcon', 1]);
  eq('Add: roster written back', named('WriteCharList').length, 1);
}

if (fails) { console.log(`${fails} FAILED`); process.exit(1); }
console.log('all ov16b tests passed');
