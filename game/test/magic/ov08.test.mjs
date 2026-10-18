// node game/test/magic/ov08.test.mjs — MAGIC ov08 (4800) unit tests with a fake environment.
// Expected values are derived from the asm (decode/listings/ov08.lst), not from the JS.
import { bindMagic } from '../../areas/magic_core.js';
import { NextToAct, EndOfRound, SetQuick, AnyoneDying, CombatMenu, DoneMenu, GameSpeedMenu, TakeTurn } from '../../areas/magic_ov08.js';

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('FAIL ' + msg); } else console.log('ok   ' + msg); };

const mkChar = (name) => {
  const c = { b: new Uint8Array(0x11D), next: null, items: null, effects: null, combat: { b: new Uint8Array(0x16), target: null } };
  c.b[0] = name.length; for (let i = 0; i < name.length; i++) c.b[1 + i] = name.charCodeAt(i);
  c.b[0x10D] = 1;
  return c;
};
const link = (...cs) => { for (let i = 0; i + 1 < cs.length; i++) cs[i].next = cs[i + 1]; return cs[0]; };

const calls = [];
const g = { ecl_Mem4900: new Uint16Array(0x400), ecl_Mem6B00: new Uint16Array(0x400), cm_Map: { b: new Uint8Array(8) },
  side_ActiveCount: [1, 1], g_49F4: 0, g_6DE3: 0, GameSpeed: 3, SpellHandlers: [] };
let rolls = [];
let menuKeys = [];
const ext = {
  Roll: (n, s) => rolls.shift(),
  AdvanceClock: (a, b) => calls.push(['AdvanceClock', a, b]),
  CalcEnemyHpPct: () => calls.push(['CalcEnemyHpPct']),
  CallEffectHooks: (e, c) => calls.push(['CallEffectHooks', e]),
  StinkingCloudCheck: () => {},
  ShowTimedBottomMessage: (s) => calls.push(['msg', s]),
  CountActiveSides: () => {},
  FocusSquare: (x, y, a, b) => calls.push(['FocusSquare', x, y, a, b]),
  AskYesNo: async (p) => { calls.push(['AskYesNo', p]); return 'Y'; },
  ShowCharacterMessage: (c, s, col, w) => calls.push(['charmsg', s, col, w]),
  HorizontalMenu: async (p, o, c1, c2, c3, ae, an) => { calls.push(['menu', p, o, c1, c2, c3, ae, an]); return menuKeys.shift(); },
  ByteToStr: (n) => String(n),
  WeaponIsRanged: () => 0, FUN_00ba_2e46: () => 0,
  SetGuarding: () => 1, ClearCombatantActionFlags: () => 1,
  FocusCombatant: () => {}, RecalcCharacter: () => {}, DrawCharacterSummary: () => {},
  AiCombatTurn: (c) => calls.push(['AI']), RedrawSquare: (x, y) => calls.push(['RedrawSquare', x, y]),
  CombatantCol: () => 7, CombatantRow: () => 9,
};
bindMagic({ g, ext });

// --- NextToAct: highest signed initiative; ties by roll >= best roll; who nil if best = 0
{
  const a = mkChar('A'), b = mkChar('B'), c = mkChar('C');
  a.combat.b[3] = 5; b.combat.b[3] = 9; c.combat.b[3] = 9;
  g.PartyHead = link(a, b, c);
  rolls = [10, 20, 20];                 // c ties b, roll 20 >= 20 -> c wins (later member)
  const who = { v: null }; await NextToAct(who);
  ok(who.v === c, 'NextToAct: tie with equal roll goes to the later member');
  rolls = [10, 50, 20];
  await NextToAct(who); ok(who.v === b, 'NextToAct: tie with lower roll keeps the earlier member');
  a.combat.b[3] = 0xF0; b.combat.b[3] = 0; c.combat.b[3] = 0;   // -16 (signed) and zeros
  rolls = [1, 2, 3]; await NextToAct(who); ok(who.v === null, 'NextToAct: no positive initiative -> nil');
  a.combat.b[3] = 0xFF; b.combat.b[3] = 1; c.combat.b[3] = 0;
  rolls = [99, 1, 1]; await NextToAct(who); ok(who.v === b, 'NextToAct: initiative byte FFh is -1 (signed CBW)');
}

// --- EndOfRound: dying counter, death after the 10th round, continue question
{
  const a = mkChar('A'), b = mkChar('B');
  a.b[0x10C] = 5; a.combat.b[0x0E] = 9;           // dying, 9 turns -> 10 > 9 -> dead
  b.b[0x10C] = 5; b.combat.b[0x0E] = 2;
  g.PartyHead = link(a, b); g.cm_Map.b[2] = 0xFE; g.cm_Map.b[3] = 4;   // viewX = -2 (signed)
  g.side_ActiveCount = [2, 0]; g.g_6DE3 = 0xFF; calls.length = 0;
  const over = { v: 0 }; await EndOfRound(over);
  ok(a.b[0x10C] === 6 && a.combat.b[0x0E] === 10, 'EndOfRound: 10th dying turn -> Dead');
  ok(b.b[0x10C] === 5 && b.combat.b[0x0E] === 3, 'EndOfRound: dying counter increments');
  ok(g.g_6DE3 === 0, 'EndOfRound: round counter is a byte (FFh+1 = 0)');
  ok(calls.some((x) => x[0] === 'AdvanceClock' && x[1] === 1 && x[2] === 1), 'EndOfRound: AdvanceClock(1, 1)');
  ok(calls.some((x) => x[0] === 'msg' && x[1] === 'Your Teammate is Dying'), 'EndOfRound: dying message');
  ok(calls.some((x) => x[0] === 'FocusSquare' && x[1] === 1 && x[2] === 7 && x[3] === 0xFF && x[4] === 8), 'EndOfRound: FocusSquare(viewX+3, viewY+3, FFh, 8)');
  ok(over.v === 0, 'EndOfRound: enemies gone + Continue Battle Y -> not over');
  g.g_49F4 = 1; over.v = 0; await EndOfRound(over); ok(over.v === 1, 'EndOfRound: no question when g_49F4 <> 0');
  g.g_49F4 = 0;
}

// --- SetQuick: control flag; own-side target dropped, enemy target kept
{
  const a = mkChar('A'), e = mkChar('E'), f = mkChar('F');
  e.b[0x10E] = 1; a.combat.target = f; await SetQuick(a);
  ok(a.b[0x10F] === 1 && a.combat.target === null, 'SetQuick: own-side target cleared');
  a.combat.target = e; await SetQuick(a); ok(a.combat.target === e, 'SetQuick: enemy target kept');
}

// --- AnyoneDying: side 0, not extra, status 5; bandage only the first
{
  const a = mkChar('A'), b = mkChar('B'), m = mkChar('M');
  a.b[0x10C] = 5; b.b[0x10C] = 5; m.b[0x10C] = 5; m.b[0x10E] = 1;
  g.PartyHead = link(m, a, b); calls.length = 0;
  ok(await AnyoneDying(0) === 1 && a.b[0x10C] === 5, 'AnyoneDying(false) reports without changing');
  ok(await AnyoneDying(1) === 1 && a.b[0x10C] === 4 && b.b[0x10C] === 5 && m.b[0x10C] === 5, 'AnyoneDying(true) bandages one party member');
  ok(calls.filter((x) => x[0] === 'charmsg' && x[1] === 'is bandaged' && x[2] === 0x0A && x[3] === 1).length === 1, 'AnyoneDying: one "is bandaged" (colour 0Ah, wait)');
}

// --- CombatMenu: option string, colours, ext filter and exit set
{
  const c = mkChar('C'); c.combat.b[6] = 4; c.b[0xC7] = 2; c.b[0x17 + 3] = 0x85; c.combat.b[1] = 1; c.b[0x96] = 1;
  calls.length = 0;
  menuKeys = [{ key: '\x48', ext: true }, { key: '\x13', ext: true }];   // up arrow discarded (#0, not an exit), Alt-R exits
  const key = { v: '' }; await CombatMenu(c, key);
  const m = calls.filter((x) => x[0] === 'menu');
  ok(m.length === 2 && m[0][2] === 'Move View Aim Use Cast Turn Quick Done', 'CombatMenu: option string (pending spell >= 80h counts for Cast)');
  ok(m[0][3] === 0x0D && m[0][4] === 0x0A && m[0][5] === 0x0F && m[0][6] === 1 && m[0][7] === 0, 'CombatMenu: HorizontalMenu colours 0Dh/0Ah/0Fh, ext on');
  ok(key.v === '\x13', 'CombatMenu: Alt-R is in the exit set CS:0646');
  g.ecl_Mem4900[0xE5] = 1; c.combat.b[0x11] = 1; c.combat.b[6] = 0; calls.length = 0; menuKeys = [{ key: 'Q', ext: false }];
  await CombatMenu(c, key);
  ok(calls.find((x) => x[0] === 'menu')[2] === 'View Aim Use Quick Done', 'CombatMenu: no Move/Cast/Turn when moveLeft=0, ECL 49E5<>0, turned');
  g.ecl_Mem4900[0xE5] = 0;
}

// --- DoneMenu / GameSpeedMenu
{
  const c = mkChar('C'); g.PartyHead = c; calls.length = 0;
  menuKeys = [{ key: 'D', ext: false }];
  const done = { v: 0 }; await DoneMenu(c, done);
  ok(calls.find((x) => x[0] === 'menu')[2] === 'Guard Delay Quit Speed Exit' && c.combat.b[3] === 1 && done.v === 1, 'DoneMenu: options, Delay sets initiative 1');
  g.GameSpeed = 9; calls.length = 0; menuKeys = [{ key: 'F', ext: false }, { key: 'E', ext: false }];
  await GameSpeedMenu();
  const gm = calls.filter((x) => x[0] === 'menu');
  ok(gm[0][1] === 'GameSpeed (9) :' && gm[0][2] === ' Faster Exit' && gm[1][2] === ' Slower Faster Exit' && g.GameSpeed === 8, 'GameSpeedMenu: prompt, leading blank, F decrements');
}

// --- TakeTurn: initiative 14h -> 13h, controlled -> AI
{
  const c = mkChar('C'); c.combat.b[3] = 0x14; c.b[0x10F] = 1; calls.length = 0;
  await TakeTurn(c);
  ok(c.combat.b[3] === 0x13 && calls.some((x) => x[0] === 'AI') && calls.some((x) => x[0] === 'RedrawSquare' && x[1] === 7 && x[2] === 9), 'TakeTurn: 14h -> 13h, AI turn, RedrawSquare(col, row)');
  ok(calls.filter((x) => x[0] === 'CallEffectHooks').map((x) => x[1]).join() === '7,15', 'TakeTurn: effect hooks 7 then 0Fh');
}

console.log(fails ? `${fails} FAILED` : 'all ov08 tests passed');
process.exit(fails ? 1 : 0);
