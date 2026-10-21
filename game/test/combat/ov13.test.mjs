// game/test/combat/ov13.test.mjs — node --test: deterministic routines of combat_ov13.js (COMBAT ov13, seg 6100).
// Sibling combat parts that do not exist yet (combat_ov24.js, combat_ov19.js) are replaced by stub modules through a
// module resolve/load hook; when a real file exists it is used. The ov24 stub implements Roll/RollDice per
// COMBAT.pas.md 9800:0DE3/0E2E (Σ Random(s)+1, byte) so damage rolls are reproducible with tp.setRandSeed.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const AREAS = path.join(ROOT, 'game/areas');

const STUBS = {
  'combat_ov24.js': `
    import { Random, byte } from '../engine/tp.js';
    import { env } from './combat_core.js';
    export function Roll(n, s) { let r = 0; for (let i = 0; i < n; i++) r = byte(r + Random(s) + 1); return r; }
    export function RollDice(n, s) { env.g.LastDiceCount = n; return Roll(n, s); }
    export async function CallEffectHooks(ev, c) {}
    export async function AttackRoll(a, t, ac) { return false; }
    export async function RemoveEffect() {}
    export async function ov24_0FD2() {}
    export async function RemoveCombatEffects() {}
    export async function RemoveFromCombat() {}`,
  'combat_ov19.js': 'export async function SpellList() { return 0; }',
};
const stubbed = [];
registerHooks({
  resolve(spec, ctx, next) {
    const base = path.basename(spec);
    if (STUBS[base] && spec.startsWith('./') && !existsSync(path.join(AREAS, base))) {
      if (!stubbed.includes(base)) stubbed.push(base);
      return { url: new URL(base, 'file:///' + AREAS.replace(/\\/g, '/') + '/').href + '?stub', shortCircuit: true };
    }
    return next(spec, ctx);
  },
  load(url, ctx, next) {
    if (url.endsWith('?stub')) {
      const base = path.basename(new URL(url).pathname);
      return { format: 'module', source: STUBS[base], shortCircuit: true };
    }
    return next(url, ctx);
  },
});

const { bindCombat } = await import('../../areas/combat_core.js');
const ov13 = await import('../../areas/combat_ov13.js');
const { setRandSeed, Random } = await import('../../engine/tp.js');
const { Roll } = await import('../../areas/combat_ov24.js');

// DS image: MZ header size (paragraphs at +8) + DS 0C7C of the load module
function loadDs() {
  const exe = readFileSync(path.join(ROOT, 'decode/bin/START.unpacked.exe'));
  const hdr = exe.readUInt16LE(8) * 16;
  const ds = new Uint8Array(0x8760);
  const src = exe.subarray(hdr + 0xC7C0, hdr + 0xC7C0 + 0x8760);
  ds.set(src);
  return ds;
}

// ---- stub world: combatants on a grid, InFrontArc = the 8 sectors around (x1,y1) ----------------------------
function sector(x1, y1, x2, y2) {
  const dx = Math.sign(x2 - x1), dy = Math.sign(y2 - y1);
  if (dx === 0 && dy === 0) return 8;
  const dirs = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
  return dirs.findIndex(([a, b]) => a === dx && b === dy);
}
const pos = new Map();
function mkChar(x, y) {
  const c = { b: new Uint8Array(0x11D), next: null, items: null, effects: null, combat: { b: new Uint8Array(0x16), target: null }, readied: new Array(13).fill(null) };
  pos.set(c, [x, y]);
  return c;
}
const mkItem = (type) => ({ b: Object.assign(new Uint8Array(0x3F), { [0x2E]: type }), next: null });

function bind(extra = {}) {
  const g = {
    ds: loadDs(), CombatRound: 0, StatValue: 0, StatKind: 0, DamageAmount: 0, DamageType: 0, LastDiceCount: 0,
    ecl_Mem6B00: new Uint16Array(0x400), EffectHandler: [], game_Mode: 5, PartyHead: null, SlotHits: [0, 0, 0], SlotSwings: [0, 0, 0], ...extra,
  };
  bindCombat({
    g,
    ext: {
      CombatantCol: (c) => pos.get(c)[0],
      CombatantRow: (c) => pos.get(c)[1],
      InFrontArc: (x1, y1, x2, y2, d) => d === 8 || sector(x1, y1, x2, y2) === d,
      DexMissileAdj: () => 0,
      WeaponIsRanged: () => false,
      GetMissileAmmo: () => false,
      HasEffect: async () => false,           // no effects: ov24 hooks find nothing
    },
  });
  return g;
}

test('stubbed sibling modules (info)', () => {
  // listed so the run log shows which siblings were not real yet
  assert.ok(Array.isArray(stubbed));
  if (stubbed.length) console.log('# stubbed sibling modules:', stubbed.join(', '));
});

test('HalfRound 6100:0E52: (v + Odd(CombatRound)) shr 1', () => {
  const g = bind();
  g.CombatRound = 0;
  assert.equal(ov13.HalfRound(3), 1);
  assert.equal(ov13.HalfRound(2), 1);
  g.CombatRound = 1;
  assert.equal(ov13.HalfRound(3), 2);
  assert.equal(ov13.HalfRound(2), 1);
  assert.equal(ov13.HalfRound(0xFF), 0);            // byte wrap of the local
});

test('CalcAttacks 6100:0D23: melee half-attacks, attacked-this-round rule', async () => {
  const g = bind();
  const c = mkChar(5, 5);
  c.b[0xA1] = 3;                                    // attacks (half-attacks)
  g.CombatRound = 1;
  await ov13.CalcAttacks(c);
  assert.equal(c.b[0x113], 2);
  g.CombatRound = 2;
  await ov13.CalcAttacks(c);
  assert.equal(c.b[0x113], 1);
  // already attacked: old = 1, new n = 2 is not < old but < 2*old? no (2 < 2 false) -> unchanged attacks (= A1h)
  c.combat.b[8] = 1; c.b[0x113] = 1; g.CombatRound = 1;
  await ov13.CalcAttacks(c);
  assert.equal(c.b[0x113], 3);                      // +113h keeps the raw +A1h copy (no assignment of n)
});

test('CalcMove 6100:0123: clamp 1..96, x2, ECL bonus for side 0', async () => {
  const g = bind();
  const c = mkChar(0, 0);
  c.b[0x11C] = 12;
  assert.equal(await ov13.CalcMove(c), 24);
  c.b[0x11C] = 0;
  assert.equal(await ov13.CalcMove(c), 2);
  c.b[0x11C] = 0x61;
  assert.equal(await ov13.CalcMove(c), 2);
  c.b[0x11C] = 10; g.ecl_Mem6B00[0x6E72 - 0x6B00] = 2;
  assert.equal(await ov13.CalcMove(c), 24);
  c.b[0x10E] = 1;
  assert.equal(await ov13.CalcMove(c), 20);
  assert.equal(g.StatKind, 0);
});

test('StartCombatRound 6100:0000: initiative 1d6 + DEX adj, surprise -6, clamp', async () => {
  const g = bind();
  const c = mkChar(0, 0);
  c.b[0x10D] = 1; c.b[0x11C] = 12;
  setRandSeed(1234);
  const expect = Random(6) + 1;
  setRandSeed(1234);
  await ov13.StartCombatRound(c);
  assert.equal(c.combat.b[3], expect);
  assert.equal(c.combat.b[6], 24);
  assert.equal(c.combat.b[4], 2);
  // surprised party (ECL 6DCBh bit 0, side 0): 1..6 - 6 -> <= 0 -> 0 (negative) or 0
  g.ecl_Mem6B00[0x6DCB - 0x6B00] = 1;
  for (let s = 0; s < 20; s++) {
    setRandSeed(s);
    await ov13.StartCombatRound(c);
    assert.equal(c.combat.b[3], 0);
  }
  // inactive combatant: 0
  g.ecl_Mem6B00[0x6DCB - 0x6B00] = 0; c.b[0x10D] = 0;
  await ov13.StartCombatRound(c);
  assert.equal(c.combat.b[3], 0);
});

test('CanBackstab 6100:2574: thief, armour/weapon rules, behind an engaged target', async () => {
  bind();
  const att = mkChar(5, 6), tgt = mkChar(5, 5);   // attacker south of the target: DirectionTo(att,tgt) = 0 (north)
  att.b[0x9C] = 3;                                 // thief level
  tgt.combat.b[0x0F] = 2;                          // timesAttacked
  tgt.combat.b[9] = 0;                             // target faces north = same direction as att->tgt
  assert.equal(await ov13.CanBackstab(att, tgt), true);
  att.readied[2] = mkItem(0x32);                   // leather
  att.readied[0] = mkItem(0x24);                   // long sword
  assert.equal(await ov13.CanBackstab(att, tgt), true);
  att.readied[0] = mkItem(0x26);
  assert.equal(await ov13.CanBackstab(att, tgt), false);
  att.readied[0] = mkItem(8);
  att.readied[2] = mkItem(0x33);
  assert.equal(await ov13.CanBackstab(att, tgt), false);
  att.readied[2] = null;
  tgt.combat.b[0x0F] = 1;
  assert.equal(await ov13.CanBackstab(att, tgt), false);
  tgt.combat.b[0x0F] = 2; tgt.combat.b[9] = 4;
  assert.equal(await ov13.CanBackstab(att, tgt), false);
  tgt.combat.b[9] = 0; att.b[0x9C] = 0;
  assert.equal(await ov13.CanBackstab(att, tgt), false);
});

test('DirectionTo 6100:263D / FaceAttacker 6100:17F6', async () => {
  bind();
  const a = mkChar(5, 5), b = mkChar(7, 3), d = mkChar(5, 5);
  assert.equal(await ov13.DirectionTo(a, b), 1);
  assert.equal(await ov13.DirectionTo(a, d), 8);
  // defender b faces 1 (towards a? no: a is at dir 5 from b); attacker a at 5 -> diff 4
  b.combat.b[9] = 1;
  await ov13.FaceAttacker(a, b);
  assert.equal(b.combat.b[0x0F], 1);
  assert.equal(b.combat.b[0x12], 4);
  await ov13.FaceAttacker(a, b);
  assert.equal(b.combat.b[0x12], 0);                // (4 + 4) mod 8
});

test('RollDamage 6100:0191: dice + bonus (seeded), negative wrap quirk, backstab multiplier', async () => {
  const g = bind();
  const att = mkChar(5, 6), tgt = mkChar(5, 5);
  att.b[0x115] = 2; att.b[0x117] = 6; att.b[0x119] = 1;     // 2d6+1, slot 1
  setRandSeed(42);
  const want = Roll(2, 6) + 1;
  setRandSeed(42);
  await ov13.RollDamage(att, tgt, 1);
  assert.equal(g.DamageAmount, want);
  // quirk: 1d2 - 5 -> negative stays as 256 + sum
  att.b[0x115] = 1; att.b[0x117] = 2; att.b[0x119] = 0xFB;
  setRandSeed(7);
  const r = Roll(1, 2);
  setRandSeed(7);
  await ov13.RollDamage(att, tgt, 1);
  assert.equal(g.DamageAmount, (r - 5) & 0xFF);
  assert.ok(g.DamageAmount > 200);
  // backstab: thief level 5 -> x (5 shr 2 + 2) = x3
  att.b[0x119] = 0; att.b[0x9C] = 5; tgt.combat.b[0x0F] = 2; tgt.combat.b[9] = 0;
  setRandSeed(9);
  const r2 = Roll(1, 2);
  setRandSeed(9);
  await ov13.RollDamage(att, tgt, 1);
  assert.equal(g.DamageAmount, r2 * 3);
});

test('TurnUndead table DS:0447 (TurnValue/TurnColumn)', () => {
  bind();
  const rows = [
    [10, 7, 4, 1, 1, 0, 0, -1, -1, -1],
    [13, 10, 7, 1, 1, 0, 0, 0, -1, -1],
    [16, 13, 10, 4, 1, 1, 0, 0, 0, -1],
    [19, 16, 13, 7, 4, 1, 1, 0, 0, -1],
    [20, 19, 16, 10, 7, 4, 1, 1, 0, 0],
    [99, 20, 19, 13, 10, 7, 4, 1, 1, 0],
    [99, 99, 20, 16, 13, 10, 7, 4, 1, 0],
    [99, 99, 99, 20, 16, 13, 10, 7, 4, 1],
    [99, 99, 99, 99, 20, 16, 13, 10, 7, 1],
    [99, 99, 99, 99, 99, 20, 16, 13, 10, 4],
  ];
  for (let t = 1; t <= 10; t++)
    for (let col = 1; col <= 10; col++)
      assert.equal(ov13.TurnValue(t, col), rows[t - 1][col - 1], `type ${t} col ${col}`);
  const c = mkChar(0, 0);
  for (const [lvl, col] of [[1, 1], [8, 8], [9, 9], [13, 9], [14, 10], [0, 10], [0xFF, 10]]) {
    c.b[0x96] = lvl;
    assert.equal(ov13.TurnColumn(c), col);
  }
});

test('CalcEnemyHpPct 6100:2879: side-1 hp percentage in steps of 5', () => {
  const g = bind();
  const a = mkChar(0, 0), b = mkChar(0, 0), p = mkChar(0, 0);
  a.b[0x10E] = 1; a.b[0x10D] = 1; a.b[0x11B] = 7; a.b[0x32] = 10;
  b.b[0x10E] = 1; b.b[0x10D] = 0; b.b[0x11B] = 5; b.b[0x32] = 10;
  p.b[0x10E] = 0; p.b[0x10D] = 1; p.b[0x11B] = 9; p.b[0x32] = 9;
  a.next = b; b.next = p; g.PartyHead = a; g.enemy_HpPercent = 77;
  ov13.CalcEnemyHpPct();
  assert.equal(g.enemy_HpPercent, 35);              // 20*7 div 20 = 7 -> 35
  g.PartyHead = p;
  ov13.CalcEnemyHpPct();
  assert.equal(g.enemy_HpPercent, 35);              // unchanged without side-1 hp_max
});

test('BeginCast 6100:2414: casting-time initiative delay (auto, no UI)', async () => {
  const g = bind();
  const c = mkChar(0, 0);
  g.SelectedChar = c;
  // spell 1 in the image: give it combat-usable + casting time via the DS copy
  const sp = 1, base = 0x31FA + sp * 16;
  g.ds[base + 0x0B] = 1; g.ds[base + 0x0C] = 6;
  bindCombat({ g, ext: { ShowCharacterMessage: async () => {} } });
  c.combat.b[3] = 5;
  const done = { v: 0 };
  await ov13.BeginCast(sp, 1, done);
  assert.equal(done.v, 1);
  assert.equal(c.combat.b[0], 1);
  assert.equal(c.combat.b[3], 3);
  c.combat.b[3] = 2;
  await ov13.BeginCast(sp, 1, done);
  assert.equal(c.combat.b[3], 1);
});
