// game/test/magic/spells.test.mjs — node:test for game/areas/magic_spells.js (MAGIC ov22 spell handlers 8E00:0F4F..323C).
// Run: node --test game/test/magic/spells.test.mjs
// The handlers run against the real ApplySpell/SpellDuration (magic_ov22.js) and the real DS image (SpellTable DS:31FA
// from decode/bin/START.unpacked.exe); everything outside MAGIC is a recording stub bound through bindMagic({ ext }).
// Expected values are derived from the asm (decode/listings/ov22.lst), cited per test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const { newChar } = await import('../../engine/ecl.js');
const tp = await import('../../engine/tp.js');
const { bindMagic } = await import('../../areas/magic_core.js');
const sp = await import('../../areas/magic_spells.js');

const exe = readFileSync(join(ROOT, 'decode', 'bin', 'START.unpacked.exe'));
const hdr = exe.readUInt16LE(8) * 16;
const ds = new Uint8Array(0x8760);
ds.set(exe.subarray(hdr + 0xC7C0, Math.min(exe.length, hdr + 0xC7C0 + 0x4430)));
const tbl = (id, k) => ds[0x31FA + id * 16 + k];

// TP Roll (ov24 9800:0DE3): sum of Random(sides) + 1, count times
const tpRoll = (n, s) => { let r = 0; for (let i = 0; i < n; i++) r = (r + tp.Random(s) + 1) & 0xFF; return r; };

function setup(ext = {}) {
  const calls = [];
  const rec = (name, ret) => async (...a) => { calls.push([name, ...a]); return typeof ret === 'function' ? ret(...a) : ret; };
  const g = { ds, game_Mode: 5, ItemCast: 0, SelectedChar: newChar(), PartyHead: null, SpellTargets: [], SpellTargetCount: 0,
    sp_Current: 0, SpellArea: 0, DamageType: 0, g_4844: 0, g_4845: 0, cure_InProgress: 0 };
  bindMagic({
    g, ext: {
      SpellCasterLevel: () => 5, Roll: tpRoll, RollDice: tpRoll,
      SavingThrow: rec('SavingThrow', false), DamageCharacter: rec('DamageCharacter'), ApplyEffect: rec('ApplyEffect'),
      RecalcCharacter: rec('RecalcCharacter'), CallEffectHooks: rec('CallEffectHooks'), AttackRoll: rec('AttackRoll', true),
      HasEffect: rec('HasEffect', false), HealCharacter: rec('HealCharacter', true), ShowHealingResult: rec('ShowHealingResult'),
      SetStrength: (c, s, x, old) => { calls.push(['SetStrength', c, s, x]); old.v = 0x42; return true; },
      AddEffect: (...a) => { calls.push(['AddEffect', ...a]); }, ShowCharacterMessage: rec('ShowCharacterMessage'),
      ...ext,
    },
  });
  return { g, calls };
}
const target = (g, k, f = {}) => { const c = newChar(); for (const [o, v] of Object.entries(f)) c.b[+o] = v; g.SpellTargets[k] = c; return c; };

test('SpellHandlers table: ids 1..67 bound, [0] left to InitSpellTable', () => {
  assert.equal(sp.SpellHandlers[0], undefined);
  for (let id = 1; id <= 67; id++) assert.equal(typeof sp.SpellHandlers[id], 'function', 'id ' + id);
  assert.equal(sp.SpellHandlers[6], sp.SpellHandlers[54]);              // both 8E00:1123 'is protected'
  assert.equal(sp.SpellHandlers[23], sp.SpellHandlers[49]);             // both 8E00:1658 Hold Person
});

test('Magic Missile (id 15, 8E00:1439): damage = RollDice(lvl shr 1, 4) + (lvl shr 1), type 8', async () => {
  const { g, calls } = setup();
  g.sp_Current = 15; g.SpellTargetCount = 1; const t = target(g, 1);
  tp.setRandSeed(1234); const exp = (tpRoll(2, 4) + 2) & 0xFF;           // level 5 -> n = 2
  tp.setRandSeed(1234); await sp.SpellHandlers[15]();
  const dc = calls.find((c) => c[0] === 'DamageCharacter');
  assert.ok(dc, 'DamageCharacter called');
  assert.equal(dc[1], t); assert.equal(dc[2], exp); assert.equal(dc[3], tbl(15, 8));
  assert.equal(g.DamageType, 0);                                         // ApplySpell resets it at the end
});

test('Sleep (id 21, 8E00:151B): cost by signed +73h, budget Roll(4,4), drops (fix #verify-2)', async () => {
  const { g } = setup({ Roll: (n, s) => n * s });                        // budget 16
  g.sp_Current = 21;
  const L = 0x73, RACE = 0x2E, STATUS = 0x10C;
  const t1 = target(g, 1, { [L]: 0 });                                   // cost 1 -> 15
  target(g, 2, { [L]: 0xFF });                                           // -1: cost 20 > 15 -> dropped
  const t3 = target(g, 3, { [L]: 1 });                                   // cost 1 -> 14
  const t4 = target(g, 4, { [L]: 5, [RACE]: 0 });                        // race 0: cost 10 -> 4
  const t5 = target(g, 5, { [L]: 3 });                                   // cost 4 -> 0
  target(g, 6, { [L]: 2 });                                              // cost 2 > 0 -> dropped
  target(g, 7, { [L]: 0, [STATUS]: 1 });                                 // Animated -> dropped
  g.SpellTargetCount = 7;
  await sp.SpellHandlers[21]();
  assert.deepEqual(g.SpellTargets.slice(1, 8).map((c) => !!c), [true, false, true, true, true, false, false]);
  assert.equal(g.SpellTargets[1], t1); assert.equal(g.SpellTargets[3], t3); assert.equal(g.SpellTargets[4], t4); assert.equal(g.SpellTargets[5], t5);
  assert.equal(g.g_4844, 0); assert.equal(g.SpellArea, 1);
});

test('Cure Light Wounds (id 3, 8E00:106B): HealCharacter(t, Roll(1,8), 0) then ShowHealingResult', async () => {
  const { g, calls } = setup({ Roll: (n, s) => n * s });
  g.sp_Current = 3; g.SpellTargetCount = 1; const t = target(g, 1);
  await sp.SpellHandlers[3]();
  const h = calls.find((c) => c[0] === 'HealCharacter');
  assert.deepEqual(h.slice(1), [t, 8, 0]);
  assert.ok(calls.some((c) => c[0] === 'ShowHealingResult' && c[1] === t));
  g.SpellTargetCount = 0; calls.length = 0; await sp.SpellHandlers[3]();
  assert.equal(calls.length, 0);                                          // count = 0: nothing
});

test('Potion of healing (id 62, 8E00:2FD0): HealCharacter(t, Roll(2,4)+2, 0)', async () => {
  const { g, calls } = setup({ Roll: (n, s) => n * s, ShowCombatMessageAnimation: async () => {} });
  g.sp_Current = 62; g.SpellTargetCount = 1; const t = target(g, 1);
  await sp.SpellHandlers[62]();
  assert.deepEqual(calls.find((c) => c[0] === 'HealCharacter').slice(1), [t, 10, 0]);
});

test('Hold Person (id 23, 8E00:1658): one target, cleric bonus -2, save type tbl+9, ApplyEffect args', async () => {
  const { g, calls } = setup();
  g.sp_Current = 0x17; g.SpellTargetCount = 1; const t = target(g, 1);
  await sp.SpellHandlers[23]();
  const s = calls.find((c) => c[0] === 'SavingThrow');
  assert.deepEqual(s.slice(1), [t, tbl(0x17, 9), -2]);
  const a = calls.find((c) => c[0] === 'ApplyEffect');
  assert.equal(a[1], t); assert.equal(a[2], tbl(0x17, 0x0A)); assert.equal(a[4], 5); assert.equal(a[5], 0);
  assert.equal(a[6], tbl(0x17, 8)); assert.equal(a[7], 0); assert.equal(a[8], 'is held');
});

test('Strength (id 35, 8E00:1F41): fighter over 18 gets exceptional strength (s-18)*10, max 100', async () => {
  const { g, calls } = setup({ Roll: (n, s) => n * s });                 // fighter roll 1d8 -> 8
  g.sp_Current = 35; g.SpellTargetCount = 1;
  const t = target(g, 1, { 0x10: 17, 0x98: 3 });                          // STR 17, fighter level 3
  await sp.SpellHandlers[35]();
  assert.deepEqual(calls.find((c) => c[0] === 'SetStrength').slice(1), [t, 18, 70]);   // 17+8 = 25 -> 18/70
  const ae = calls.find((c) => c[0] === 'AddEffect');
  assert.equal(ae[1], t); assert.equal(ae[2], 0x26); assert.equal(ae[4], 0x42); assert.equal(ae[5], 1);
});

test('Dispel Magic (id 41, 8E00:2385): chance 50 + 5*(lvl-el), always works on SpellTargets[1]', async () => {
  const removed = [];
  const { g } = setup({ Roll: () => 75, RemoveEffect: async (c, ty, e) => { removed.push(ty); }, ShowCombatMessageAnimation: async () => {} });
  g.sp_Current = 41; g.SpellTargetCount = 1; const t = target(g, 1);
  const mk = (type, p3) => ({ b: Uint8Array.from([type, 0, 0, p3, 0, 0, 0, 0, 0]), next: null });
  const e1 = mk(0x10, 0x00), e2 = mk(0x11, 0x0A), e3 = mk(0x12, 0xFF);    // el 0: 75 <= 75 removed; el 10: 40 -> kept; FFh skipped
  e1.next = e2; e2.next = e3; t.effects = e1;
  await sp.SpellHandlers[41]();
  assert.deepEqual(removed, [0x10]);
});
