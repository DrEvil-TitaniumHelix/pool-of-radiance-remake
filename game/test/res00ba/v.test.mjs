// node --test game/test/res00ba/v.test.mjs — resident unit 00BA part V (game/areas/res_00ba_v.js).
// Expected values are derived from decode/listings/res_00BA.lst (00BA:1509..30A2), not from the JS.
// Engine modules (text/pictures/menus/timer) and part U's DrawPartyRoster are wrapped with a module hook so the
// test records the calls part V makes (res_00ba_core.js resolves engine exports before bindRes00ba ext stubs).
// Data: DS image from decode/bin/START.unpacked.exe, ITEMS table and shipped characters from POOLRAD.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath } from 'node:url';

const POOLRAD = '../re-targets/goldbox/por/POOLRAD/';
const ROOT = new URL('../../../', import.meta.url);

// ---- call recorder ---------------------------------------------------------------------------------------------
const log = [];
const over = {};                                     // name -> replacement implementation
const PASS = new Set(['AllocPicture', 'MirrorPicture', 'FreePicture']);   // run the real engine routine
globalThis.__res00baV = (name, real, args) => {
  log.push([name, ...args]);
  if (over[name]) return over[name](...args);
  if (PASS.has(name)) return real(...args);
  return undefined;
};
const WRAP = /\/game\/engine\/(text|pictures|menus|timer)\.js$|\/game\/areas\/res_00ba_u\.js$/;
registerHooks({
  load(url, context, next) {
    if (!WRAP.test(url)) return next(url, context);
    const src = fs.readFileSync(fileURLToPath(url), 'utf8');
    const real = url + '?real';
    const isU = url.endsWith('res_00ba_u.js');
    const names = isU ? ['DrawPartyRoster']
      : [...src.matchAll(/^export (?:async )?function (\w+)|^export const (\w+) = (?!\{|\[|new )/gm)].map((m) => m[1] ?? m[2]);
    let out = `import * as R from ${JSON.stringify(real)};\nexport * from ${JSON.stringify(real)};\n`;
    for (const n of new Set(names)) out += `export function ${n}(...a) { return globalThis.__res00baV(${JSON.stringify(n)}, R.${n}, a); }\n`;
    return { format: 'module', source: out, shortCircuit: true };
  },
});

const core = await import('../../areas/res_00ba_core.js');
const V = await import('../../areas/res_00ba_v.js');
const { bindRes00ba, newItem, newEffect } = core;

// ---- data -------------------------------------------------------------------------------------------------------
const exe = fs.readFileSync(new URL('decode/bin/START.unpacked.exe', ROOT));
const hdr = exe.readUInt16LE(8) * 16;
const ds = new Uint8Array(0x8760);
ds.set(exe.subarray(hdr + 0xC7C0, hdr + 0xC7C0 + 0x8760));
const ITEMS = fs.readFileSync(POOLRAD + 'ITEMS');
ds.set(ITEMS.subarray(2, 2 + 0x800), 0x5582);                     // ov11_002D: Seek(2), BlockRead -> DS:5582

function loadChar(k) {
  const S = POOLRAD + 'SAVE/CHRDATA' + k;
  const c = { b: new Uint8Array(fs.readFileSync(S + '.SAV')), next: null, items: null, effects: null,
    combat: { b: new Uint8Array(0x16) }, readied: new Array(13).fill(null) };
  const chainOf = (buf, size, mk) => {
    let head = null, last = null;
    for (let o = 0; o + size <= buf.length; o += size) {
      const r = mk(); r.b.set(buf.subarray(o, o + size));
      if (last) last.next = r; else head = r;
      last = r;
    }
    return head;
  };
  c.items = chainOf(fs.readFileSync(S + '.ITM'), 0x3F, newItem);
  c.effects = fs.existsSync(S + '.SPC') ? chainOf(fs.readFileSync(S + '.SPC'), 9, newEffect) : null;
  return c;
}
const party = [1, 2, 3, 4, 5, 6].map(loadChar);
for (let i = 0; i < 5; i++) party[i].next = party[i + 1];
const name = (c) => String.fromCharCode(...c.b.subarray(1, 1 + c.b[0]));

const g = {
  ds, game_Mode: 0, PartyHead: party[0], SelectedChar: party[0], party_MapX: 7, party_MapY: 11, party_Dir: 2,
  travel_Mode: 1, RestActive: 0, ItemCast: 0, GameSpeed: 3, side_ActiveCount: [0, 0],
  ecl_Mem4900: new Uint16Array(0x400), ecl_Mem6B00: new Uint16Array(0x400),
  cm_Map: { b: new Uint8Array(8) }, tg_List: [], tg_Count: 0, cb_Char: [], foe_List: [],
  pic_HeadId: 4, pic_BodyId: 9, enc_Anim: { count: 0 },
};
const ext = {};
for (const n of ['LoadPortrait', 'DrawPortrait', 'LoadAnimation', 'RefreshView', 'DrawExploreFrames', 'DrawOverlandParty',
  'PaletteFlashOn', 'FocusSquare', 'PlayOrStopSound', 'SetSoundTimerMode'])
  ext[n] = (...a) => { log.push([n, ...a]); };
bindRes00ba({ g, ext });
const reset = () => { log.length = 0; for (const k of Object.keys(over)) delete over[k]; };
const only = (...names) => log.filter((e) => names.includes(e[0]));

// ---- tests ------------------------------------------------------------------------------------------------------
test('HasEffect walks c^.effects (+7Fh) by type byte 0 and returns the node', () => {
  const c = party[0];                                              // THRENDER: effects 5Ah, 61h, 1Ah, 2Fh
  const e = { v: 'x' };
  assert.equal(V.HasEffect(c, 0x61, e), true);
  assert.equal(e.v, c.effects.next);
  assert.equal(V.HasEffect(c, 0x2F, e), true);
  assert.equal(e.v.b[0], 0x2F);
  assert.equal(V.HasEffect(c, 0x10, e), false);
  assert.equal(e.v, null);                                         // ran off the list
  assert.equal(V.HasEffect(party[4], 0x5A, e), false);             // DARKSTAR: no .SPC
});

test('ApplyDamage hp / status transitions (00ba:2228)', () => {
  const mk = (hp, status) => { const c = { b: new Uint8Array(0x11D), combat: { b: new Uint8Array(0x16) } };
    c.b[0x11B] = hp; c.b[0x10C] = status; c.b[0x10D] = 1; c.b[0x10E] = 1; c.combat.b[3] = 7; return c; };
  g.game_Mode = 0;
  let c = mk(10, 0); V.ApplyDamage(c, 4);
  assert.deepEqual([c.b[0x11B], c.b[0x10C], c.b[0x10D]], [6, 0, 1]);
  c = mk(10, 0); V.ApplyDamage(c, 10);                             // left 0 -> Unconscious
  assert.deepEqual([c.b[0x11B], c.b[0x10C], c.b[0x10D]], [0, 4, 0]);
  c = mk(10, 1); V.ApplyDamage(c, 10);                             // animated at 0 hp -> Dead
  assert.equal(c.b[0x10C], 6);
  c = mk(10, 0); V.ApplyDamage(c, 15);                             // over 5 -> Dying
  assert.deepEqual([c.b[0x11B], c.b[0x10C], c.combat.b[0x0E]], [0, 5, 0]);
  c = mk(10, 0); V.ApplyDamage(c, 20);                             // over 10 -> Dead
  assert.equal(c.b[0x10C], 6);
  c = mk(10, 0); V.ApplyDamage(c, 19);                             // over 9 -> Dying
  assert.equal(c.b[0x10C], 5);
  c = mk(10, 7); V.ApplyDamage(c, 2);                              // quirk: Stoned keeps status, loses hp/active
  assert.deepEqual([c.b[0x11B], c.b[0x10C], c.b[0x10D]], [0, 7, 0]);
  g.game_Mode = 5; g.side_ActiveCount = [3, 2];
  c = mk(10, 0); V.ApplyDamage(c, 13);                             // combat: bleeding counter, side 1 count, cb +3
  assert.deepEqual([c.b[0x10C], c.combat.b[0x0E], c.combat.b[3]], [5, 3, 0]);
  assert.deepEqual(g.side_ActiveCount, [3, 1]);
  c = mk(10, 0); V.ApplyDamage(c, 3);
  assert.deepEqual(g.side_ActiveCount, [3, 1]);
  assert.equal(c.combat.b[3], 7);
  g.game_Mode = 0;
});

test('IsSideZero / CountActiveSides', () => {
  assert.equal(V.IsSideZero(party[0]), true);
  party[2].b[0x10E] = 1; party[3].b[0x10D] = 0; party[5].b[0x10E] = 1;
  V.CountActiveSides();
  assert.deepEqual(g.side_ActiveCount.slice(0, 2), [3, 2]);
  assert.equal(g.g_6815, 2);
  assert.equal(V.IsSideZero(party[2]), false);
  party[2].b[0x10E] = 0; party[3].b[0x10D] = 1; party[5].b[0x10E] = 0;
});

test('DrawCharacterName colour rule (#verify-3) and possessive', () => {
  reset();
  const c = party[1];                                              // BAKSHI
  V.DrawCharacterName(c, 1, 2, false);
  c.b[0x10E] = 1; V.DrawCharacterName(c, 1, 2, true);
  c.b[0x10D] = 0; V.DrawCharacterName(c, 1, 2, false);             // inactive wins over side
  c.b[0x10D] = 1; c.b[0x10E] = 0;
  assert.deepEqual(only('DrawText'), [
    ['DrawText', 1, 2, 0x0B, 'BAKSHI'],
    ['DrawText', 1, 2, 0x0E, 'BAKSHI'], ['DrawText', 7, 2, 0x0E, "'s"],
    ['DrawText', 1, 2, 0x0C, 'BAKSHI']]);
});

const frame = (a, b, c, d, title = '', colour = 0x0F) => ['DrawTitledFrame', a, b, c, d, 0, colour, title];
test('RedrawCurrentMode per mode (#verify-5)', async () => {
  const std = [frame(1, 1, 0x26, 0x16), frame(1, 0x11, 0x26, 0x16), frame(1, 1, 0x0F, 0x0F)];
  const inner = frame(3, 3, 0x0D, 0x0D);
  const run = async (mode) => { reset(); g.game_Mode = mode; await V.RedrawCurrentMode();
    return log.filter((e) => e[0] !== 'ClearRectangle' && e[0] !== 'DrawText').map((e) => e.slice()); };
  assert.deepEqual(await run(0), [frame(1, 1, 0x26, 0x16)]);
  assert.deepEqual(await run(1), [...std, inner, ['LoadPortrait', 4, 9], ['DrawPortrait', 3, 3, true]]);
  assert.deepEqual(await run(2), [...std, inner, ['LoadAnimation', 'PIC', 0x1D, 0, g.enc_Anim], ['DrawPartyRoster', party[0]]]);
  assert.deepEqual(await run(3), [...std, ['RefreshView'], ['DrawPartyRoster', party[0]]]);
  assert.deepEqual(await run(4), [...std, inner, ['RefreshView'], ['DrawPartyRoster', party[0]]]);
  assert.deepEqual(await run(6), [...std, inner, ['LoadAnimation', 'PIC', 1, 0, g.enc_Anim], ['DrawPartyRoster', party[0]]]);
  assert.deepEqual(await run(5), []);
  assert.deepEqual(await run(7), []);
  reset(); g.game_Mode = 3; await V.RedrawCurrentMode();             // modes 2/3/4 end with the status line
  assert.deepEqual(log.at(-1)[0], 'DrawText');
  g.game_Mode = 0;
});

test('DrawLocationTimeStatus strings (00ba:290b)', async () => {
  const M = g.ecl_Mem4900;
  const status = async () => { reset(); await V.DrawLocationTimeStatus(); return only('ClearRectangle', 'DrawText'); };
  g.game_Mode = 3; g.travel_Mode = 1; g.party_MapX = 7; g.party_MapY = 11; g.party_Dir = 2;
  M[0xC9] = 9; M[0xC8] = 0; M[0xC7] = 5;                           // 09:05
  assert.deepEqual(await status(), [['ClearRectangle', 0x11, 0x0F, 0x26, 0x0F], ['DrawText', 0x11, 0x0F, 0x0A, '7,11 E 09:05']]);
  M[0xC9] = 23; M[0xC8] = 4; M[0xC7] = 7; g.party_Dir = 5;
  assert.equal((await status())[1][4], '7,11 SW 23:47');
  g.travel_Mode = 3; M[0xC3] = 0x0102; M[0xC4] = 6;                 // overland: low byte of ECL 49C3 + 0Dh
  assert.equal((await status())[1][4], '15,6 SW 23:47');
  g.travel_Mode = 4;
  assert.equal((await status())[1][4], '28,6 SW 23:47');
  M[0xFB] = 1; g.ecl_Mem6B00[0x594 >> 1] = 3;                       // coordinates hidden; search flag
  assert.equal((await status())[1][4], 'SW 23:47 search');
  g.game_Mode = 2;                                                 // camping wins over search
  assert.equal((await status())[1][4], 'SW 23:47 camping');
  M[0xC8] = 30; M[0xC7] = 0;                                       // 300 minutes -> string[2] keeps '30'
  assert.equal((await status())[1][4], 'SW 23:30 camping');
  M.fill(0); g.ecl_Mem6B00.fill(0); g.travel_Mode = 1; g.game_Mode = 0;
});

test('TargetDistance / CollectOppositeSideTargets', async () => {
  const [a, b, c, d] = party;
  g.cb_Char = [null, a, b, c, d];
  c.b[0x10E] = 1; d.b[0x10E] = 1;
  const list = [null, { who: 1, dist: 0, dir: 8 }, { who: 2, dist: 4, dir: 2 }, { who: 3, dist: 7, dir: 3 }, { who: 4, dist: 12, dir: 4 }];
  const built = [];
  bindRes00ba({ ext: {
    CombatantCol: () => 5, CombatantRow: () => 6, CombatantSize: () => 1,
    BuildTargetList: (col, row, range, ff, size, map) => { built.push([col, row, range, ff, size, map.b[6]]);
      g.tg_List = g.tg_List ?? []; for (let i = 1; i <= 4; i++) g.tg_List[i] = { ...list[i] }; g.tg_Count = 4; },
  } });
  g.tg_List = [null, { who: 9, dist: 99, dir: 0 }]; g.tg_Count = 1;
  assert.equal(await V.TargetDistance(a, d), 6);                    // 12 shr 1
  assert.deepEqual(built.at(-1), [5, 6, 0xFF, 0xFF, 1, 1]);          // cm_Map +6 set during the build
  assert.equal(g.cm_Map.b[6], 0);
  assert.deepEqual(g.tg_List[1], { who: 9, dist: 99, dir: 0 });      // list restored
  assert.equal(g.tg_Count, 4);                                      // quirk: tg_Count not restored
  assert.equal(await V.TargetDistance(a, party[5]), 6);             // not found: last entry
  assert.equal(await V.TargetDistance(a, b), 2);
  const n = await V.CollectOppositeSideTargets(a, 3);                // a is side 0 -> keep side 1 (Ord(true))
  assert.equal(n, 2);
  assert.deepEqual(built.at(-1), [5, 6, 3, 0xFF, 1, 0]);
  assert.equal(g.tg_Count, 2);
  assert.deepEqual([g.foe_List[1], g.foe_List[2]], [3, 4]);
  assert.deepEqual(g.tg_List[1], list[3]);
  c.b[0x10E] = 0; d.b[0x10E] = 0;
});

test('GetMissileAmmo / WeaponIsRanged / FUN_00BA_2E46 with ITEMS data', () => {
  const darkstar = party[4];                                       // darts (type 9: range 6, wflags2 10h = thrown)
  darkstar.readied[0] = darkstar.items;
  const r = { v: 'x' };
  assert.equal(V.WeaponIsRanged(darkstar), true);
  assert.equal(V.GetMissileAmmo(darkstar, r), true);
  assert.equal(r.v, darkstar.items);
  assert.equal(V.FUN_00BA_2E46(darkstar), false);                   // 10h & 14h <> 14h
  const phineas = party[5];                                        // type 8: range 1, wflags2 4
  phineas.readied[0] = phineas.items;
  assert.equal(V.WeaponIsRanged(phineas), false);
  assert.equal(V.GetMissileAmmo(phineas, r), false);
  assert.equal(r.v, null);
  // a launcher type from ITEMS with wflags2 bits 08h + 01h (arrows)
  const bowType = [...Array(128).keys()].find((t) => (ITEMS[2 + t * 16 + 14] & 0x89) === 0x09);
  assert.ok(bowType !== undefined);
  const bow = newItem(); bow.b[0x2E] = bowType;
  const ch = { b: new Uint8Array(0x11D), readied: new Array(13).fill(null) };
  ch.readied[0] = bow;
  const f = ITEMS[2 + bowType * 16 + 14];
  assert.equal(V.GetMissileAmmo(ch, r), f === 0x0A || (f & 0x10) !== 0);   // no arrows readied
  const arrows = newItem(); ch.readied[11] = arrows;
  assert.equal(V.GetMissileAmmo(ch, r), true);
  assert.equal(r.v, arrows);
  assert.equal(V.GetMissileAmmo({ b: new Uint8Array(0x11D), readied: new Array(13).fill(null) }, r), false);
});

test('LoseItem / AppendItemCopy list handling', async () => {
  const c = party[2];                                              // RHIANNON: 3 items
  const [i1, i2, i3] = [c.items, c.items.next, c.items.next.next];
  V.AppendItemCopy(c, i1);
  const i4 = i3.next;
  assert.ok(i4 && i4 !== i1 && i4.next === null);
  assert.deepEqual(Array.from(i4.b), Array.from(i1.b));
  reset();
  await V.LoseItem(c, i2);                                         // middle
  assert.deepEqual([c.items, i1.next, i2.next], [i1, i3, null]);
  await V.LoseItem(c, i1);                                         // head
  assert.deepEqual([c.items, i1.next], [i3, null]);
  assert.deepEqual(log, []);
  await V.LoseItem(c, i2);                                         // not in the list
  await V.LoseItem(c, null);
  assert.deepEqual(only('ShowBottomPromptAndReadKey'), [
    ['ShowBottomPromptAndReadKey', 0x0E, "Tried to Lose item & couldn't find it!"],
    ['ShowBottomPromptAndReadKey', 0x0E, 'Nil Item pointer...']]);
  const e = { b: new Uint8Array(0x11D), items: null };
  V.AppendItemCopy(e, i3);
  assert.ok(e.items && e.items !== i3 && e.items.next === null);
});

test('ShowCharacterMessage layouts, ShowHealingResult, SetGuarding', async () => {
  g.game_Mode = 0; g.RestActive = 0; reset();
  await V.ShowCharacterMessage(party[0], 'hello', 0x0A, true);
  assert.deepEqual(log.map((e) => e[0] === 'DrawWrappedText' ? e : e[0]), ['DrawFrame', 'ClearRectangle', 'DrawText',
    ['DrawWrappedText', 1, 0x13, 0x26, 0x16, 0x0A, 1, 'hello'], 'MessageDelay', 'ClearRectangle']);
  assert.deepEqual(log[0], ['DrawFrame', 1, 0x11, 0x26, 0x16, 0]);
  assert.deepEqual(log.at(-1), ['ClearRectangle', 1, 0x12, 0x26, 0x16]);
  g.RestActive = 1; reset();
  await V.ShowCharacterMessage(party[0], 'x', 0x0A, false);
  assert.deepEqual(log[0], ['ClearRectangle', 1, 0x12, 0x26, 0x16]);
  assert.deepEqual(log[1], ['DrawText', 1, 0x13, 0x0B, 'THRENDER GRONE']);
  g.RestActive = 0; g.game_Mode = 5; reset();
  await V.ShowCharacterMessage(party[0], 'x', 0x0C, false);
  assert.deepEqual(log, [['ClearRectangle', 0x17, 0x0C, 0x26, 0x15], ['DrawText', 0x17, 0x0C, 0x0B, 'THRENDER GRONE'],
    ['DrawWrappedText', 0x17, 0x0D, 0x26, 0x15, 0x0A, 1, 'x']]);
  reset(); await V.ShowHealingResult(party[0]);                     // hp 11 = max 11, combat: no roster
  assert.equal(only('DrawWrappedText')[0][7], 'is fully healed');
  assert.deepEqual(only('DrawPartyRoster'), []);
  g.game_Mode = 0; party[0].b[0x11B] = 3; reset(); await V.ShowHealingResult(party[0]);
  assert.equal(only('DrawWrappedText')[0][7], 'is partially healed');
  assert.deepEqual(only('DrawPartyRoster'), [['DrawPartyRoster', party[0]]]);
  party[0].b[0x11B] = 11;
  const c = party[1]; c.combat.b.fill(9); reset();
  assert.equal(await V.SetGuarding(c), true);
  assert.deepEqual([c.combat.b[0], c.combat.b[3], c.combat.b[6], c.combat.b[7], c.combat.b[1]], [0, 0, 0, 1, 9]);
  assert.deepEqual(only('DrawText'), [['DrawText', 0, 0x18, 0x0A, 'Guarding']]);
});

test('SelectPartyCharacter: End/Home cycle, Exit, Select', async () => {
  const keys = [{ key: 'O', ext: true }, { key: 'G', ext: true }, { key: 'G', ext: true }, { key: 'S', ext: false }];
  g.game_Mode = 2; reset();
  over.HorizontalMenu = () => keys.shift();
  const sel = { v: party[0] };
  await V.SelectPartyCharacter('Whom?', true, sel);
  assert.equal(sel.v, party[5]);                                    // 0 -> 1 -> 0 -> wrap to last
  const menus = only('HorizontalMenu');
  assert.deepEqual(menus[0], ['HorizontalMenu', 'Whom? ', 'Select Exit', 0x0D, 0x0A, 0x0F, true, true]);
  assert.deepEqual(only('DrawPartyRoster').map((e) => name(e[1])), ['THRENDER GRONE', 'BAKSHI', 'THRENDER GRONE', 'PHINEAS']);
  keys.push({ key: 'O', ext: true }, { key: 'E', ext: false });
  g.game_Mode = 3; reset();
  over.HorizontalMenu = () => keys.shift();
  await V.SelectPartyCharacter('Whom?', false, sel);
  assert.equal(sel.v, null);
  assert.equal(only('HorizontalMenu')[0][2], 'Select');
  assert.equal(only('HorizontalMenu')[0][7], false);
});

test('SpellCasterLevel / RacialLevelLimitReached / ClearCombatantActionFlags / UnitInit', () => {
  const sc = party[1];                                              // BAKSHI: cleric 1, MU 1
  g.SelectedChar = sc; sc.b[0x96] = 4; sc.b[0x9B] = 7;
  const spellOf = (cls) => [...Array(0x40).keys()].find((s) => ds[0x31FA + s * 16] === cls);
  assert.equal(V.SpellCasterLevel(spellOf(0)), 4);
  assert.equal(V.SpellCasterLevel(spellOf(1)), 7);
  g.ItemCast = 1;
  assert.equal(V.SpellCasterLevel(spellOf(1)), 6);
  g.ItemCast = 0; sc.b[0x96] = 1; sc.b[0x9B] = 1; g.SelectedChar = party[0];
  const c = { b: new Uint8Array(0x11D) };
  const rl = (race, cls, lvl, str) => { c.b[0x2E] = race; c.b[0x96 + cls] = lvl; c.b[0x10] = str; const r = V.RacialLevelLimitReached(c, cls); c.b[0x96 + cls] = 0; return r; };
  assert.equal(rl(1, 2, 8, 17), true); assert.equal(rl(1, 2, 7, 16), true); assert.equal(rl(1, 2, 9, 18), false);
  assert.equal(rl(2, 2, 7, 18), true); assert.equal(rl(2, 2, 6, 16), false);
  assert.equal(rl(3, 2, 5, 17), true); assert.equal(rl(4, 0, 5, 3), true); assert.equal(rl(4, 2, 6, 16), true);
  assert.equal(rl(5, 2, 4, 16), true); assert.equal(rl(5, 0, 6, 16), false); assert.equal(rl(0, 2, 9, 9), false);
  const t = { combat: { b: new Uint8Array(0x16).fill(5) } };
  assert.equal(V.ClearCombatantActionFlags(t), true);
  assert.deepEqual(Array.from(t.combat.b.subarray(0, 8)), [0, 5, 5, 0, 5, 5, 0, 0]);
  assert.equal(V.UnitInit_00BA(), undefined);
});

test('ShowCombatMessageAnimation + AnimateAlongPath call sequences', async () => {
  g.game_Mode = 5; g.cb_ScrCol = [0, 2]; g.cb_ScrRow = [0, 4]; g.g_261C = 'snd1C'; g.g_261A = 'snd1A';
  g.g_6E36 = { height: 0x18, width8: 3, px: new Uint8Array(4 * 0x18 * 24), mask: new Uint8Array(4 * 0x18 * 24) };
  const icon = (v) => ({ height: 0x18, width8: 3, count: 1, cgaMap: new Uint8Array(8), px: new Uint8Array(0x18 * 24).fill(v), mask: new Uint8Array(0x18 * 24) });
  g.CombatIcons = []; g.CombatIcons[0x16] = [icon(1), icon(2)]; g.CombatIcons[0x17] = [icon(3), icon(4)];
  bindRes00ba({ ext: { IsVisible: () => false, CombatantIndex: () => 1, InWindow: (x, y) => x >= 0 && x <= 6 && y >= 0 && y <= 6,
    Sign: (v) => Math.sign(v),
    LineInit: (L) => { L.x = L.x0; L.y = L.y0; },
    LineStep: (L) => { if (L.x === L.x1) return false; L.x += 1; L.dir = 2; return true; } } });
  reset();
  await V.ShowCombatMessageAnimation(party[0], true, 'is hit');
  const pics = only('DrawPicture');
  assert.equal(pics.length, 4 * 4 * 2);                              // reps = GameSpeed 3 -> 4 rounds of 4 frames, draw + restore
  assert.deepEqual(pics[0].slice(0, 5), ['DrawPicture', 6, 12, 0, 5]);
  assert.deepEqual(pics[1].slice(0, 5), ['DrawPicture', 6, 12, 0, 0]);
  assert.deepEqual(only('MessageDelay'), []);                        // #verify-4
  assert.deepEqual(only('PlayOrStopSound'), [['PlayOrStopSound', 'snd1C']]);
  assert.deepEqual(only('FocusSquare'), [['FocusSquare', 5, 6, 3, 8]]);
  assert.equal(g.g_6E36.px[0x18 * 24 * 2], 2);                       // frame 2 = part 1
  reset();
  await V.ShowCombatMessageAnimation(party[0], false, 'x');
  assert.equal(only('DrawPicture').length, 4 * 2);
  assert.deepEqual(only('MessageDelay'), [['MessageDelay']]);
  assert.equal(g.g_6E36.px[0], 3);
  // AnimateAlongPath (0,0) -> (2,0), window at 0,0, delay 0: draws only on whole thirds, final frame not restored
  g.cm_Map.b[2] = 0; g.cm_Map.b[3] = 0; reset();
  await V.AnimateAlongPath(0, 0, 2, 0, 4, 0);
  assert.deepEqual(only('FocusSquare'), [['FocusSquare', 3, 3, 0xFF, 8]]);
  const d = only('DrawPicture').map((e) => e.slice(1, 5));
  assert.deepEqual(d.at(-1), [6, 0, d.at(-1)[2], 5]);
  assert.equal(log.at(-1)[0], 'FlushViewDirtyLines');
  g.game_Mode = 0;
});
