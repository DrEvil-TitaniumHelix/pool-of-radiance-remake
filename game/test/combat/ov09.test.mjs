// game/test/combat/ov09.test.mjs — deterministic pieces of COMBAT ov09 (4D00): AiWeaponScore, the
// ai_DirOffsets direction table in AiCanStep, the morale thresholds of AiMoraleCheck.
// Run: node --test game/test/combat/ov09.test.mjs
// The sibling units imported by combat_ov09.js (ov13/ov19/ov24/ov05) are replaced by stubs through a loader hook
// (they delegate to globalThis.__combatStubs), so the test is independent of their state.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const AREAS = path.join(ROOT, 'game/areas');

// ---- sibling stubs via loader hook --------------------------------------------------------------------
function siblingNames(files) {
  const names = {};
  for (const f of files) {
    const src = readFileSync(path.join(AREAS, f), 'utf8');
    for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*'\.\/combat_ov(\d\d)\.js'/g))
      (names[m[2]] ??= new Set()), m[1].split(',').map((s) => s.trim()).filter(Boolean).forEach((n) => names[m[2]].add(n));
  }
  return Object.fromEntries(Object.entries(names).map(([k, v]) => [k, [...v]]));
}
const HOOKS = `
let NAMES = {};
export function initialize(d) { NAMES = d.names; }
export async function resolve(spec, ctx, next) {
  const m = /combat_ov(\\d\\d)\\.js$/.exec(spec);
  if (m && NAMES[m[1]] && ctx.parentURL && /combat_ov(09|18)\\.js$/.test(ctx.parentURL))
    return { url: 'stubsibling:' + m[1], shortCircuit: true };
  return next(spec, ctx);
}
export async function load(url, ctx, next) {
  if (url.startsWith('stubsibling:')) {
    const src = NAMES[url.slice(12)].map((n) => 'export function ' + n + '(...a) { const f = globalThis.__combatStubs[' +
      JSON.stringify(n) + ']; if (!f) throw new Error("stub missing: ' + n + '"); return f(...a); }').join('\\n');
    return { format: 'module', source: src, shortCircuit: true };
  }
  return next(url, ctx);
}`;
register('data:text/javascript,' + encodeURIComponent(HOOKS), { data: { names: siblingNames(['combat_ov09.js', 'combat_ov18.js']) } });
globalThis.__combatStubs = {};

const core = await import(pathToFileURL(path.join(AREAS, 'combat_core.js')).href);
const ov09 = await import(pathToFileURL(path.join(AREAS, 'combat_ov09.js')).href);
const { newItem } = core;

// ---- DS image: DS 0C7C = file offset headerSize + 0xC7C0 of START.unpacked.exe ------------------------
function dsImage() {
  const exe = readFileSync(path.join(ROOT, 'decode/bin/START.unpacked.exe'));
  const header = exe.readUInt16LE(8) * 16;
  const ds = new Uint8Array(0x8760);
  const src = exe.subarray(header + 0xC7C0, header + 0xC7C0 + 0x8760);
  ds.set(src);
  return ds;
}
const DS = dsImage();

const newChar = () => ({ b: new Uint8Array(0x11D), next: null, items: null, effects: null,
  combat: { b: new Uint8Array(0x16), target: null }, readied: new Array(13).fill(null) });
function setItemType(ds, t, f) {                                        // ITEMS[t] at DS:5582 (BSS, from the ITEMS file)
  const o = 0x5582 + t * 16;
  for (const [j, v] of Object.entries(f)) ds[o + Number(j)] = v & 0xFF;
}
function bind(gExtra = {}, ext = {}, stubs = {}) {
  const ds = DS.slice();
  const g = { ds, MagicOn: 0, MoraleValue: 0, enemy_HpPercent: 0, ecl_Mem4900: new Uint16Array(0x400),
    ecl_Mem6B00: new Uint16Array(0x400), ai_LastStepDir: 8, ai_StuckCount: 0, ...gExtra };
  core.bindCombat({ g, ext });
  for (const k of Object.keys(core.env.ext)) if (!(k in ext)) delete core.env.ext[k];
  globalThis.__combatStubs = stubs;
  return g;
}

// ---- tests ------------------------------------------------------------------------------------------
test('DS image: ai_DirOffsets rows 1..6 (DS:02AE, index movePattern*5 + try)', () => {
  const row = (p) => Array.from({ length: 5 }, (_, k) => DS[0x2AE + p * 5 + 1 + k]);
  assert.deepEqual(row(1), [8, 7, 6, 1, 2]);
  assert.deepEqual(row(2), [8, 1, 2, 7, 6]);
  assert.deepEqual(row(3), [7, 1, 8, 6, 2]);
  assert.deepEqual(row(4), [1, 7, 8, 2, 6]);
  assert.deepEqual(row(5), [8, 7, 6, 5, 4]);
  assert.deepEqual(row(6), [8, 1, 2, 3, 4]);
});

test('AiWeaponScore: dice*sides, plus*8, dmg_bonus*2, one-hand +3, hands, cursed, alignment lock, 53h', () => {
  const g = bind();
  const c = newChar();
  setItemType(g.ds, 0x10, { 1: 1, 9: 1, 10: 8, 11: 0, 14: 0 });          // one-handed 1d8
  const it = newItem(); it.b[0x2E] = 0x10;
  assert.equal(ov09.AiWeaponScore(c, it), 8 + 3);
  it.b[0x32] = 2;                                                        // +2
  assert.equal(ov09.AiWeaponScore(c, it), 8 + 16 + 3);
  it.b[0x32] = 0xFF;                                                     // -1: not added
  assert.equal(ov09.AiWeaponScore(c, it), 8 + 3);
  it.b[0x32] = 0;
  setItemType(g.ds, 0x10, { 11: 2 });                                    // dmg_bonus +2
  assert.equal(ov09.AiWeaponScore(c, it), 8 + 4 + 3);
  setItemType(g.ds, 0x11, { 1: 2, 9: 2, 10: 4, 14: 8, 5: 4 });          // two-handed launcher, rof 4
  const bow = newItem(); bow.b[0x2E] = 0x11;
  assert.equal(ov09.AiWeaponScore(c, bow), 8 + (4 - 1) * 2);
  c.b[0x100] = 2;                                                        // hands_used 2 + 2 > 3
  assert.equal(ov09.AiWeaponScore(c, bow), 0);
  c.b[0x100] = 0;
  it.b[0x36] = 1;                                                        // cursed
  assert.equal(ov09.AiWeaponScore(c, it), 0);
  it.b[0x36] = 0;
  it.b[0x3E] = 0x84; it.b[0x3D] = 0x03; c.b[0xA0] = 4;                   // alignment-locked, wrong alignment
  assert.equal(ov09.AiWeaponScore(c, it), 0);
  c.b[0xA0] = 3;
  assert.equal(ov09.AiWeaponScore(c, it), 8 + 4 + 3);
  it.b[0x3E] = 0; it.b[0x3D] = 0x53;
  assert.equal(ov09.AiWeaponScore(c, it), 0);
});

test('AiWeaponScore: Holy Water (type 55h) vs undead target scores 8 (+3 one-handed); byte wrap', () => {
  const g = bind();
  const c = newChar(), u = newChar();
  setItemType(g.ds, 0x55, { 1: 1, 9: 2, 10: 4 });
  const hw = newItem(); hw.b[0x2E] = 0x55;
  assert.equal(ov09.AiWeaponScore(c, hw), 8 + 3);                        // no target: 2*4 + 3
  c.combat.target = u; u.b[0x76] = 2;
  assert.equal(ov09.AiWeaponScore(c, hw), 8 + 3);
  setItemType(g.ds, 0x20, { 1: 1, 9: 20, 10: 13 });                      // 260 -> Byte = 4
  const big = newItem(); big.b[0x2E] = 0x20;
  assert.equal(ov09.AiWeaponScore(c, big), (260 & 0xFF) + 3);
});

test('AiCanStep: direction = (ai_DirOffsets[pattern*5 + try] + baseDir) mod 8; costs 2/3 x terrain', async () => {
  const dirs = [];
  let terrain = 5;                                                       // CombatTerrain[5].cost = 1 (DS:2758)
  const g = bind({}, {
    ProbeMove: (c, dir, occ, ter) => { dirs.push(dir); occ.v = 0; ter.v = terrain; },
    HasEffect: () => false,
  });
  assert.equal(g.ds[0x2744 + 5 * 4], 1);
  const c = newChar(); const cb = c.combat.b;
  cb[0x15] = 1; cb[0x06] = 4;                                            // pattern 1, moveLeft 4
  const blocked = { v: true };
  for (let t = 1; t <= 5; t++) assert.equal(await ov09.AiCanStep(c, t, 2, blocked), true);
  assert.deepEqual(dirs, [2, 1, 0, 3, 4]);                               // (8,7,6,1,2) + 2 mod 8
  assert.equal(blocked.v, false);
  cb[0x06] = 2;                                                          // moveLeft 2: orthogonal ok, diagonal (3) not
  assert.equal(await ov09.AiCanStep(c, 1, 2, blocked), true);            // dir 2
  assert.equal(await ov09.AiCanStep(c, 2, 2, blocked), false);           // dir 1
  terrain = 0;                                                           // off map
  assert.equal(await ov09.AiCanStep(c, 1, 2, blocked), false);
  assert.equal(blocked.v, true);
  terrain = 0x1E; cb[0x06] = 0x40;                                       // terrain 1Eh needs an effect
  const cost1E = g.ds[0x2744 + 0x1E * 4];
  if (cost1E < 0x40) {
    assert.equal(await ov09.AiCanStep(c, 1, 2, blocked), false);         // cost := moveLeft + 1
    cb[0x06] = 0xFF;                                                     // quirk: Byte(FFh + 1) = 0 -> passable
    assert.equal(await ov09.AiCanStep(c, 1, 2, blocked), true);
  }
});

test('AiMoraleCheck: turned, morale thresholds, flee vs surrender', async () => {
  const log = [];
  const mk = (hp, hpMax, morale, int = 10) => {
    const c = newChar(); c.b[0x11B] = hp; c.b[0x32] = hpMax; c.b[0x84] = morale; c.b[0x11] = int; c.b[0x10E] = 1;
    return c;
  };
  let maxEnemy = 6, calcMove = 12;
  const stubs = {
    ov24_1041: () => log.push('1041'), CallEffectHooks: (ev) => log.push('hook' + ev.toString(16)),
    MaxEnemyMove: () => maxEnemy, CalcMove: () => calcMove,
    RemoveEffect: (c, id) => log.push('rm' + id.toString(16)),
    RemoveFromCombat: (c, st, msg) => log.push(`rfc${st}:${msg}`),
  };
  const ext = { ShowCharacterMessage: (c, s, row, wait) => log.push(`msg:${s}:${row}:${wait}`),
    ClearCombatantActionFlags: () => 1 };
  const g = bind({ enemy_HpPercent: 50 }, ext, stubs);

  let c = mk(30, 100, 0x80); c.combat.b[0x10] = 1;                       // turned
  assert.equal(await ov09.AiMoraleCheck(c), false);
  assert.equal(c.combat.b[0x14], 1);
  assert.ok(log.includes('msg:is forced to flee:10:true'));

  log.length = 0;
  c = mk(30, 100, 0x05);                                                 // not an NPC/monster: no morale test
  assert.equal(await ov09.AiMoraleCheck(c), false);
  assert.deepEqual(log, ['1041']);

  log.length = 0;
  c = mk(50, 100, 0x80 | 0x20);                                          // morale 64 >= 100 - 50 -> holds
  assert.equal(await ov09.AiMoraleCheck(c), false);
  assert.equal(g.MoraleValue, 64);
  assert.equal(c.combat.b[0x14], 0);

  log.length = 0;
  c = mk(30, 100, 0x80 | 0x20);                                          // 64 < 70; enemy 50 < 100 - 0 -> flee test
  assert.equal(await ov09.AiMoraleCheck(c), false);
  assert.equal(c.combat.b[0x14], 1);                                     // MaxEnemyMove 6 <= 12 shr 1
  assert.deepEqual(log.filter((s) => s.startsWith('rm')), ['rm4a', 'rm4b']);

  log.length = 0;
  g.ecl_Mem6B00[0x58C >> 1] = 60;                                        // ECL 6DC6h: enemy 50 >= 100 - 60 -> holds
  c = mk(30, 100, 0x80 | 0x20);
  assert.equal(await ov09.AiMoraleCheck(c), false);
  assert.equal(c.combat.b[0x14], 0);
  g.ecl_Mem6B00[0x58C >> 1] = 0;

  log.length = 0;
  maxEnemy = 9;                                                          // cannot outrun: surrender (INT > 5)
  c = mk(30, 100, 0x80 | 0x20);
  assert.equal(await ov09.AiMoraleCheck(c), true);
  assert.ok(log.includes('rfc4:Surrenders'));

  log.length = 0;
  c = mk(30, 100, 0x80 | 0x40);                                          // 0x80 > 66h -> morale 0: always tested
  assert.equal(await ov09.AiMoraleCheck(c), true);                       // HP test skipped (value 0) -> surrender
  assert.equal(g.MoraleValue, 50);                                       // replaced by enemy_HpPercent
  c = mk(30, 100, 0x80 | 0x40, 5);                                       // INT 5: neither flees nor surrenders
  log.length = 0;
  assert.equal(await ov09.AiMoraleCheck(c), false);
  assert.ok(!log.some((s) => s.startsWith('rfc')));
});

test('CheckCombatHotkeys: 32h toggles MagicOn; space hands Quick combatants back', async () => {
  const keys = [];
  const msgs = [];
  const g = bind({ PartyHead: null }, {
    KeyPressed: () => keys.length > 0, ReadGameKey: async () => keys.shift(),
    ShowTimedBottomMessage: (s) => msgs.push(s), FUN_0899_0104: () => {},
  });
  const c = newChar(); c.b[0x10F] = 1;
  keys.push('2');
  assert.equal(await ov09.CheckCombatHotkeys(c), false);
  assert.equal(g.MagicOn, 1);
  keys.push('\0', String.fromCharCode(0x32));                            // Alt-M: scan code 32h after #0
  await ov09.CheckCombatHotkeys(c);
  assert.equal(g.MagicOn, 0);
  assert.deepEqual(msgs, ['Magic On', 'Magic Off']);
  const npc = newChar(); npc.b[0x84] = 0x80; npc.b[0x10F] = 1;
  c.next = npc; g.PartyHead = c;
  keys.push(' ');
  assert.equal(await ov09.CheckCombatHotkeys(c), true);
  assert.equal(c.b[0x10F], 0);
  assert.equal(npc.b[0x10F], 1);                                         // NPCs stay computer-controlled
  assert.equal(c.combat.b[0x03], 0x14);
});
