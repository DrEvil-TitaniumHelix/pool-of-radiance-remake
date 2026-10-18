// game/test/party/ov16a.test.mjs — node test of game/areas/party_ov16a.js (PARTY ov16 part A).
// Run: node game/test/party/ov16a.test.mjs
// Expected values are derived from decode/listings/ov16.lst and the DS table bytes of the image (decode/bin/START.unpacked.exe,
// DS 0C7C at image offset C7C0h), not from the JS. Addresses cited per case.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bindParty } from '../../areas/party_core.js';
import { setRandSeed, Random } from '../../engine/tp.js';
import { PartyCreationMenu, CreateCharacter, FreeCharacter } from '../../areas/party_ov16a.js';

const exe = readFileSync(fileURLToPath(new URL('../../../decode/bin/START.unpacked.exe', import.meta.url)));
const hdr = (exe[8] | (exe[9] << 8)) * 16;
const DS0 = Uint8Array.from(exe.subarray(hdr + 0xC7C0, hdr + 0xC7C0 + 0x8760));
const dsb = (o) => DS0[o], dsw = (o) => DS0[o] | (DS0[o + 1] << 8);
const pstr = (b, o) => { let s = ''; for (let i = 1; i <= b[o]; i++) s += String.fromCharCode(b[o + i]); return s; };

let fails = 0;
const eq = (name, got, want) => {
  const a = JSON.stringify(got), b = JSON.stringify(want);
  if (a !== b) { fails++; console.log(`FAIL ${name}: got ${a}, want ${b}`); } else console.log(`ok   ${name}`);
};

// ---- fake environment -----------------------------------------------------------------------------------------
let calls, g;
const rec = (name, ret) => (...a) => { calls.push([name, ...a.map((x) => (x && x.b ? 'char' : x && 'v' in Object(x) ? 'ref' : x))]); return typeof ret === 'function' ? ret(...a) : ret; };
const named = (n) => calls.filter((x) => x[0] === n);

// TMenuItem list as ov25 NewMenuList builds it: n nodes { text, isHeader, next }
function newMenuList(n, list) { let head = null; for (let i = 0; i < n; i++) head = { text: '', isHeader: 0, next: head }; list.v = head; }
function listItem(n, list) { let p = list; for (let i = 0; i < n && p; i++) p = p.next; return p; }
const listTexts = (head) => { const r = []; for (let p = head; p; p = p.next) r.push(p.text); return r; };

function setup({ picks = [], yesNo = [], names = [], hits = 10, con = 0, roll = (n, s) => n * s, menuKeys = [], sting = '', loadMode = 0, saveSets = 1 } = {}) {
  calls = [];
  g = { ds: Uint8Array.from(DS0), SelectedChar: null, PartyHead: null, game_Mode: 0, GameSaved: 0, StingMode: 0,
    ecl_Mem6B00: new Uint16Array(0x400) };
  const lists = [];
  let saves = 0;
  bindParty({
    g, ext: {
      NewMenuList: (n, list) => { newMenuList(n, list); calls.push(['NewMenuList', n]); },
      ListItem: listItem,
      FreeMenuList: (list) => { lists.push(listTexts(list.v)); list.v = null; },
      VerticalListMenu: (...a) => {
        calls.push(['VerticalListMenu', ...a.slice(0, 11)]);
        const pk = picks.shift();
        if (pk === undefined || pk === 0) return '\0';
        a[12].v = pk; return '\r';                                  // index (var) = pick, key #13
      },
      AddEffect: rec('AddEffect'), UpdateThiefSkills: rec('UpdateThiefSkills'), UpdateSaves: rec('UpdateSaves'),
      Roll: (n, s) => { calls.push(['Roll', n, s]); return roll(n, s); },
      DrawCharacterSheet: rec('DrawCharacterSheet'), DrawAbility: rec('DrawAbility'), WisdomBonusSpells: rec('WisdomBonusSpells'),
      RollHitDice: rec('RollHitDice', hits), ConHpBonus: rec('ConHpBonus', con & 0xFF),
      DrawCombatStats: rec('DrawCombatStats'), DrawMoney: rec('DrawMoney'),
      AskYesNo: rec('AskYesNo', () => yesNo.shift() ?? 'Y'),
      ReadBottomLine: rec('ReadBottomLine', () => names.shift() ?? 'X'),
      PortraitMenu: rec('PortraitMenu'), IconEditor: rec('IconEditor'),
      WriteCharacter: (c, n) => { calls.push(['WriteCharacter', c === g.SelectedChar ? 'selected' : 'char', n]); g.written = c; },
      // PartyCreationMenu callees
      DrawTitledFrame: rec('DrawTitledFrame'), DrawPartyRoster: rec('DrawPartyRoster'), DrawText: rec('DrawText'),
      ClearMenuLine: rec('ClearMenuLine'), CycleSelectedChar: rec('CycleSelectedChar'),
      HorizontalMenu: (...a) => { calls.push(['HorizontalMenu', ...a]); const k = menuKeys.shift(); if (!k) throw new Error('end'); return k; },
      DropCharacter: rec('DropCharacter'), ModifyCharacter: rec('ModifyCharacter'), TrainCharacter: rec('TrainCharacter'),
      ViewMenu: rec('ViewMenu'), AddCharacterMenu: rec('AddCharacterMenu'), RemoveFromParty: rec('RemoveFromParty'),
      LoadGame: () => { calls.push(['LoadGame']); g.game_Mode = loadMode; },
      SaveGame: () => { calls.push(['SaveGame']); if (++saves >= saveSets) g.GameSaved = 1; },
      ParamStr: () => sting, ShowTimedBottomMessage: rec('ShowTimedBottomMessage'),
      TerminateGame: () => { calls.push(['TerminateGame']); throw new Error('terminated'); },
    },
  });
  return lists;
}

// ================= CreateCharacter =================
// 1. Human male fighter, alignment pick 3; Roll returns the maximum (3d6 = 18, 1d4 = 4, 5d4 = 20); "No" once, then "Yes".
{
  const SEED = 12345;
  setRandSeed(SEED);
  const rAB = Random(256);                                          // 7000:0622 (first Random call of the routine)
  const lists = setup({ picks: [6, 1, 2, 3], yesNo: ['N', 'Y'], names: ['', 'Bob'], hits: 10, con: 4 });
  setRandSeed(SEED);
  await CreateCharacter();
  const c = g.written, b = c.b;
  // the second Random call is the exceptional STR of the accepted roll; each roll pass makes one (STR = 18, fighter)
  setRandSeed(SEED); Random(256); Random(100); const exc = Random(100) + 1;
  eq('race list (7000:0658..0702: items 1..5 + item 6 = Human, no Half-Orc)', lists[0],
    ['Pick Race', ...[1, 2, 3, 4, 5, 7].map((r) => '  ' + pstr(DS0, 0x0F03 + r * 10))]);
  eq('gender list (7000:094c)', lists[1], ['Pick Gender', '  ' + pstr(DS0, 0x0FEC), '  ' + pstr(DS0, 0x0FEC + 7)]);
  const hc = [...DS0.subarray(0x3E17 + 7 * 12 + 1, 0x3E17 + 7 * 12 + 1 + dsb(0x3E17 + 7 * 12))];
  eq('class list = RaceClasses[7] (7000:0a7a)', lists[2], ['Pick Class', ...hc.map((k) => '  ' + pstr(DS0, 0x0D38 + k * 27))]);
  eq('list menu call (7000:0747..0775 pushes)', named('VerticalListMenu')[0].slice(1, 9), ['', '', 0x0D, 0x0A, 0x0F, 1, 2, 0x26]);
  eq('race 7 (index 6 -> 7, 7000:078c)', b[0x2E], 7);
  eq('icon_size 2 human (7000:0910)', b[0xC0], 2);
  eq('no racial effects for humans', named('AddEffect').length, 0);
  eq('gender 0 (7000:0a29)', b[0x9E], 0);
  eq('class = RaceClasses[7*12+2] = fighter', b[0x2F], dsb(0x3E17 + 84 + 2));
  eq('level[2] = 1, level_main 1 (7000:0bc3 / 0ba2)', [b[0x98], b[0x73]], [1, 1]);
  eq('base_thac0 = BaseThac0[2*11+1] (7000:0d49)', b[0x2D], dsb(0x3C7C + 23));
  eq('class_mask = ClassMaskBit[2] (7000:0d53)', b[0xB0], dsb(0x05D6 + 2));
  eq('alignment = ClassAligns[2*10+3] (7000:0ecd)', b[0xA0], dsb(0x3FE7 + 23));
  const ageBase = dsw(0x3E5B + 7 * 28 + 2 * 4);
  eq('age = base + Roll(1,4) (7000:0f26)', b[0x30] | (b[0x31] << 8), ageBase + dsb(0x3E5B + 196 + 10) * dsb(0x3E5B + 196 + 11));
  eq('Roll(3,6) x 6 x 6 per pass, two passes (7000:122e)', named('Roll').filter((x) => x[1] === 3 && x[2] === 6).length, 72);
  // age 19 < AgeCategory[human][0] = 20 -> only WIS -1 (7000:1692); STR 18 + fighter -> exceptional
  const young = dsw(0x3F31 + 70) >= ageBase + 4;
  eq('abilities STR INT WIS DEX CON CHA', [...b.subarray(0x10, 0x16)], [18, 18, young ? 17 : 18, 18, 18, 18]);
  eq('str_exc = Random(100)+1 capped at RaceAbilityLimits[7][4] (7000:14f3 / 151b)', b[0x16], Math.min(exc, dsb(0x3DA3 + 7 * 16 + 4)));
  eq('unk_AB = Random(256) (7000:0622)', b[0xAB], rAB);
  eq('icon colours (7000:05ac)', [...b.subarray(0xC1, 0xC7)], [1, 2, 3, 4, 5, 6].map((k) => ((dsb(0x3CF5 + k) + 8) * 16 + dsb(0x3CF5 + k)) & 0xFF));
  eq('base_ac 32h, status 0, active 1, head/body 1, size 1 (7000:05e4..0619)', [b[0xA9], b[0x10C], b[0x10D], b[0xBB], b[0xBC], b[0x6C]], [0x32, 0, 1, 1, 1, 1]);
  eq('attacks 2, 1d2, unk_AA 1, move 12 (7000:1bfc..1c20)', [b[0xA1], b[0xA3], b[0xA5], b[0xAA], b[0x72]], [2, 1, 2, 1, 12]);
  const gd = [dsb(0x4263 + 4), dsb(0x4263 + 5)];
  eq('gold = Roll(StartGoldDice[2]) * 10 div 1 (7000:1d15..1d2c)', b[0x8E] | (b[0x8F] << 8), gd[0] * gd[1] * 10);
  eq('RollHitDice(c, FFh) (7000:1d3b)', named('RollHitDice')[0], ['RollHitDice', 'char', 0xFF]);
  eq('hp_max = hp = (10 + 4) div 1, hp_rolled 10 (7000:1dc6..1df0)', [b[0x32], b[0x11B], b[0xB1]], [14, 14, 10]);
  eq('Keep? asked twice (No -> 7000:1200)', named('AskYesNo').map((x) => x.slice(1)), [['Keep this character? ', 0x0D, 0x0A, 0x0F], ['Keep this character? ', 0x0D, 0x0A, 0x0F]]);
  eq('name asked until non-empty (7000:1e70)', named('ReadBottomLine').map((x) => x.slice(1)), [['Character name: ', 0x0D, 15], ['Character name: ', 0x0D, 15]]);
  eq('name', pstr(b, 0), 'Bob');
  eq('PortraitMenu, IconEditor, WriteCharacter(c, "") with SelectedChar = c (7000:1e83..1ead)',
    calls.filter((x) => ['PortraitMenu', 'IconEditor', 'WriteCharacter'].includes(x[0])), [['PortraitMenu'], ['IconEditor'], ['WriteCharacter', 'selected', '']]);
  eq('SelectedChar restored (7000:1eb2)', g.SelectedChar, null);
  eq('no thief skills / spells for a fighter', [named('UpdateThiefSkills').length, named('WisdomBonusSpells').length], [0, 0]);
}

// 2. Elf female F/MU/T (race pick 2, class pick 6 = RaceClasses[2*12+6]); CON adjustment -2.
{
  setRandSeed(7);
  setup({ picks: [2, 2, 6, 1], hits: 12, con: -2, names: ['Ann'] });
  await CreateCharacter();
  const b = g.written.b;
  eq('elf effect 6Bh (7000:08e3)', named('AddEffect').map((x) => x.slice(1)), [['char', 0x6B, 0, 0xFF, 0]]);
  eq('class F/MU/T', b[0x2F], dsb(0x3E17 + 24 + 6));
  eq('levels F, MU, T = 1 (7000:0c85)', [b[0x98], b[0x9B], b[0x9C]], [1, 1, 1]);
  eq('UpdateThiefSkills (signed level[6] > 0, 7000:0cc1)', named('UpdateThiefSkills').length, 1);
  const a = 0x3E5B + 2 * 28 + 5 * 4;
  eq('age = MU entry base + dice*sides (7000:1143)', b[0x30] | (b[0x31] << 8), dsw(a) + dsb(a + 2) * dsb(a + 3));
  eq('MU spells 0Bh 12h 13h 15h + slot +B5h (7000:1c60, 1cec..1d07)', [b[0x3D], b[0x44], b[0x45], b[0x47], b[0xB5], b[0xB2]], [1, 1, 1, 1, 1, 0]);
  const gs = [2, 5, 6].map((k) => dsb(0x4263 + k * 2) * dsb(0x4263 + k * 2 + 1)).reduce((x, y) => x + y) & 0xFF;
  eq('gold = (sum of 3 class rolls)*10 div 3', b[0x8E] | (b[0x8F] << 8), Math.trunc(gs * 10 / 3));
  eq('hp_max = (12 - 2) div 3 since 12 > 2 + 3 (7000:1d87 / 1d9d)', [b[0x32], b[0x11B], b[0xB1]], [3, 3, 4]);
}

// 3. hp_max <= |conAdj| + nCls -> hp_max := 1 (7000:1da8); cleric spells from SpellTable (7000:1cc1..1cdb)
{
  setup({ picks: [7 - 1, 1, 1, 1], hits: 3, con: -2 });                // Human, male, class 1 of the human list = cleric
  await CreateCharacter();
  const b = g.written.b;
  eq('class cleric', b[0x2F], dsb(0x3E17 + 84 + 1));
  eq('hp_max 1 (3 > 2+1 false)', b[0x32], 1);
  const want = [];
  for (let k = 1; k <= 0x38; k++) if (dsb(0x31FA + k * 16) === 0 && dsb(0x31FA + k * 16 + 1) === 1) want.push(k);
  const got = []; for (let k = 1; k <= 0x38; k++) if (b[0x32 + k]) got.push(k);
  eq('known spells = level-1 cleric spells', got, want);
  eq('cleric slot +B2h, WisdomBonusSpells', [b[0xB2], named('WisdomBonusSpells').length], [1, 1]);
  // WIS >= 13 rule only for classes 8..12 (set CS:0525); a single cleric keeps the rolled value
}

// 4. Abort at the first list (#0) -> nothing written (7000:077d)
{
  setup({ picks: [0] });
  g.written = null;
  await CreateCharacter();
  eq('abort: no WriteCharacter', g.written, null);
}

// ================= PartyCreationMenu =================
const k = (key, ext = false) => ({ key, ext });
const run = async () => { try { await PartyCreationMenu(); return 'returned'; } catch (e) { return e.message; } };

// 5. No party: entries Create, Add, Load, Exit drawn from row 12 (7000:022d..02c0); 'B' does nothing without a party
{
  setup({ menuKeys: [k('B')] });
  const r = await run();
  eq('no party: menu loop continues after B', r, 'end');
  const t = named('DrawText').map((x) => x.slice(1));
  const txt = (i) => pstr(DS0, 0x0619 + i * 42);
  eq('menu lines (first letter 0Fh at col 2, rest 0Ah at col 3)', t.slice(0, 8), [0, 5, 7, 10].flatMap((i, row) =>
    [[2, 12 + row, 0x0F, txt(i)[0]], [3, 12 + row, 0x0A, txt(i).slice(1)]]));
  eq('HorizontalMenu call (7000:02f8)', named('HorizontalMenu')[0].slice(1), ['Choose a function ', pstr(DS0, 0x05F0), 0x0D, 0, 0, true, false]);
  eq('DataSet := 3, frame (1,1)-(38,22) (7000:0168 / 01a9)', named('DrawTitledFrame')[0].slice(1), [1, 1, 0x26, 0x16, 0, 0, '']);
}

// 6. Party: T is ignored without w[550h] / STING; B begins with game_Mode 4 (7000:0450)
{
  setup({ menuKeys: [k('T'), k('B')] });
  g.SelectedChar = { b: new Uint8Array(0x11D) }; g.PartyHead = g.SelectedChar;
  const r = await run();
  eq('B returns', r, 'returned');
  eq('game_Mode 4', g.game_Mode, 4);
  eq('Train not offered (g_06C0 = 0)', named('TrainCharacter').length, 0);
  eq('roster drawn (7000:01bf)', named('DrawPartyRoster').length, 2);
}

// 7. J under STING -> StingMode 1, message; then Train is offered and called (7000:01da / 04cc / 038e)
{
  setup({ menuKeys: [k('J'), k('T'), k('B')], sting: 'STING' });
  g.SelectedChar = { b: new Uint8Array(0x11D) }; g.PartyHead = g.SelectedChar;
  await run();
  eq('I Understand, master...', named('ShowTimedBottomMessage').map((x) => x[1]), ['I Understand, master...']);
  eq('Train called', named('TrainCharacter').length, 1);
}

// 8. w[550h] <> 0 enables Train (7000:01d2 cmp word es:[di+550h])
{
  setup({ menuKeys: [k('T'), k('B')] });
  g.ecl_Mem6B00[0x550 >> 1] = 1;
  g.SelectedChar = { b: new Uint8Array(0x11D) }; g.PartyHead = g.SelectedChar;
  await run();
  eq('Train via ECL word 550h', named('TrainCharacter').length, 1);
}

// 9. Ext Home -> CycleSelectedChar + roster, no redraw (7000:0314..0331); L with a loaded game -> g_49F8 = 1, return
{
  setup({ menuKeys: [k('G', true), k('L')], loadMode: 1 });
  const r = await run();
  eq('L: returns after a load', r, 'returned');
  eq('CycleSelectedChar(G)', named('CycleSelectedChar').map((x) => x[1]), ['G']);
  eq('no redraw after the ext key (frame drawn once)', named('DrawTitledFrame').length, 1);
  eq('g_49F8 := 1 (7000:040b)', g.g_49F8, 1);
}

// 10. E -> Yes with an unsaved party: SaveGame until GameSaved, then TerminateGame (7000:048f / 04a6)
{
  setup({ menuKeys: [k('E')], yesNo: ['Y'], saveSets: 2 });
  g.SelectedChar = { b: new Uint8Array(0x11D) }; g.PartyHead = g.SelectedChar; g.GameSaved = 1;
  const r = await run();
  eq('terminated', r, 'terminated');
  eq('GameSaved = 1 and not cleared by E (7000:033d): no SaveGame', named('SaveGame').length, 0);
  eq('Quit prompt colours', named('AskYesNo')[0].slice(1), ['Quit to DOS ', 0x0E, 0x0A, 0x0F]);
}
{
  setup({ menuKeys: [k('C', false), k('E')], yesNo: [], saveSets: 2, picks: [0] });   // C (aborted) clears GameSaved
  g.SelectedChar = { b: new Uint8Array(0x11D) }; g.PartyHead = g.SelectedChar; g.GameSaved = 1;
  bindParty({ ext: { AskYesNo: (...a) => { calls.push(['AskYesNo', ...a]); return 'Y'; } } });
  const r = await run();
  eq('C clears GameSaved -> SaveGame called until saved (2 calls)', [r, named('SaveGame').length], ['terminated', 2]);
}

// 11. FreeCharacter(var c) -> nil (7000:00d4)
{ const c = { v: { b: new Uint8Array(0x11D) } }; FreeCharacter(c); eq('FreeCharacter nil', c.v, null); }

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
