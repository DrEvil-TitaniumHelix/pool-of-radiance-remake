// game/test/combat/ov24.test.mjs — node:test for game/areas/combat_ov24.js (COMBAT ov24, seg 9800).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { setRandSeed } from '../../engine/tp.js';
import { newChar, newEffect, wrW } from '../../engine/ecl.js';
import { bindCombat, env } from '../../areas/combat_core.js';
import * as ov24 from '../../areas/combat_ov24.js';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));

// DS 0C7C image: file offset headerSize + 0xC7C0, BSS zero-padded to 0x8760.
function loadDS() {
  const exe = readFileSync(ROOT + 'decode/bin/START.unpacked.exe');
  const hdr = (exe[8] | (exe[9] << 8)) * 16;
  const ds = new Uint8Array(0x8760);
  ds.set(exe.subarray(hdr + 0xC7C0, Math.min(exe.length, hdr + 0xC7C0 + 0x8760)));
  return ds;
}

// Independent TP 6.0 LCG (BigInt): RandSeed := RandSeed * 08088405h + 1; Random(n) = hi word mod n.
function lcg(seed) {
  let s = BigInt(seed >>> 0);
  return (n) => { s = (s * 0x08088405n + 1n) & 0xFFFFFFFFn; return n === 0 ? 0 : Number(s >> 16n) % n; };
}

function hasEffect(c, type, ref) {
  let e = c.effects;
  while (e && e.b[0] !== type) e = e.next;
  ref.v = e; return !!e;
}
const addEff = (c, type, dur = 0, p3 = 0, call = 0) => {
  const e = newEffect(); e.b[0] = type; wrW(e.b, 1, dur); e.b[3] = p3; e.b[4] = call;
  if (!c.effects) c.effects = e; else { let q = c.effects; while (q.next) q = q.next; q.next = e; }
  return e;
};
const types = (c) => { const r = []; for (let e = c.effects; e; e = e.next) r.push(e.b[0]); return r; };

function setup(extra = {}) {
  const log = [];
  const g = {
    ds: loadDS(), game_Mode: 0, PartyHead: null, SelectedChar: null, text_Row: 17,
    ecl_Mem6B00: new Uint16Array(0x400), EffectHandler: [], tg_List: [], tg_Count: 0, cb_Size: [],
    AttackRollValue: 0, SaveRoll: 0, SaveType: 0, DamageAmount: 0, DamageType: 0, EffectToApply: 0, LastDiceCount: 0,
  };
  const ext = {
    HasEffect: hasEffect,
    ShowCharacterMessage: (c, s, row, wait) => log.push(['msg', s, row, wait]),
    ShowCombatMessageAnimation: (c, flag, s) => log.push(['anim', s, flag]),
    ClearCharacterMessage: () => log.push(['clear']),
    MessageDelay: () => log.push(['delay']),
    ByteToStr: (b) => String(b),
    ApplyDamage: (c, n) => {                                       // simplified ENGINE 00BA:2228 for the test
      const hp = c.b[0x11B] - n;
      c.b[0x11B] = hp > 0 ? hp : 0;
      if (hp <= 0) { c.b[0x10D] = 0; c.b[0x10C] = hp === 0 ? 4 : hp > -10 ? 5 : 6; }
      log.push(['apply', n]);
    },
    RecalcCharacter: () => log.push(['recalc']),
    ...extra,
  };
  bindCombat({ g, ext });
  return { g, log };
}
const mkChar = (f = {}) => {
  const c = newChar(); c.combat = { b: new Uint8Array(0x16) };
  c.b[0x10C] = 0; c.b[0x10D] = 1; c.b[0x11B] = 20; c.b[0x32] = 20;
  [14, 15, 16, 17, 17].forEach((v, k) => { c.b[0x6D + k] = v; });
  for (const [o, v] of Object.entries(f)) c.b[Number(o)] = v;
  return c;
};

test('Roll: sum of count x (Random(sides)+1), hand-computed LCG', () => {
  setup();
  setRandSeed(0);
  // seed 0 -> 1 (hi 0 -> 0+1); -> 08088406h (hi 0808h = 2056, 2056 mod 6 = 4 -> 5)
  assert.equal(ov24.Roll(2, 6), 6);
  for (const seed of [1, 0x1234, 0xDEADBEEF, 987654321]) {
    for (const [n, s] of [[1, 20], [3, 6], [10, 10], [1, 100], [4, 4]]) {
      setRandSeed(seed);
      const r = lcg(seed);
      let exp = 0; for (let i = 0; i < n; i++) exp = (exp + r(s) + 1) & 0xFF;
      assert.equal(ov24.Roll(n, s), exp, `seed ${seed} ${n}d${s}`);
    }
  }
  setRandSeed(5); assert.equal(ov24.Roll(0, 6), 0);                 // count 0 -> 0
  setRandSeed(5); assert.equal(ov24.Roll(3, 0), 3);                 // sides 0 -> Random(0) = 0
  setRandSeed(5); const r = lcg(5); let e = 0; for (let i = 0; i < 60; i++) e = (e + r(10) + 1) & 0xFF;
  setRandSeed(5); assert.equal(ov24.Roll(60, 10), e);              // byte wrap
  setRandSeed(7); ov24.RollDice(3, 8); assert.equal(env.g.LastDiceCount, 3);
});

test('SavingThrow: reads save[type], natural 1/20, item bonus + bonus as byte', async () => {
  for (let seed = 1; seed <= 200; seed++) {
    setup();
    const c = mkChar({ 0x101: 0xFE });                              // ac_item_bonus -2 (signed)
    const type = seed % 5, bonus = (seed % 3) - 1;
    setRandSeed(seed);
    const d20 = lcg(seed)(20) + 1;
    const exp = d20 === 1 ? false : d20 === 20 ? true : c.b[0x6D + type] <= ((d20 - 2 + bonus) & 0xFF);
    assert.equal(await ov24.SavingThrow(c, type, bonus), exp, `seed ${seed} d20 ${d20}`);
    if (d20 !== 1 && d20 !== 20) assert.equal(env.g.SaveType, type);
  }
});

test('SavingThrow: event 0Ch hook (effect 0Ah handler) changes SaveRoll', async () => {
  // seed with d20 = 10 vs save 14: fails without hook, succeeds with +5
  let seed = 1; while (lcg(seed)(20) + 1 !== 10) seed++;
  const { g } = setup();
  const c = mkChar();
  setRandSeed(seed); assert.equal(await ov24.SavingThrow(c, 0, 0), false);
  addEff(c, 0x0A);
  g.EffectHandler[0x0A] = async (cc, e, mode) => { assert.equal(mode, 0); g.SaveRoll = (g.SaveRoll + 5) & 0xFF; };
  setRandSeed(seed); assert.equal(await ov24.SavingThrow(c, 0, 0), true);
});

test('AttackRoll: d20 + thac0 + side bonus >= AC, 1 misses, 20 -> 100, effect 19h removed', async () => {
  for (let seed = 1; seed <= 150; seed++) {
    const { g } = setup();
    g.ecl_Mem6B00[0x6E2 >> 1] = 0xFE;                               // party side: -2 (byte 6E2h)
    g.ecl_Mem6B00[0x6E0 >> 1] = 0x03;                               // monster side: +3
    const side = seed & 1;
    const a = mkChar({ 0x110: 40, 0x10E: side }), t = mkChar({ 0x111: 55 });
    addEff(a, 0x19); addEff(a, 0x19);
    setRandSeed(seed);
    let d = lcg(seed)(20) + 1; const nat1 = d <= 1; if (d === 20) d = 100;
    const exp = !nat1 && d + 40 + (side === 0 ? -2 : 3) >= 55;
    assert.equal(await ov24.AttackRoll(a, t, t.b[0x111]), exp, `seed ${seed}`);
    assert.deepEqual(types(a), []);
  }
});

test('AttackRollVsAC: roll + toHit > target.ac, hook may make it negative (miss)', async () => {
  for (let seed = 1; seed <= 100; seed++) {
    setup();
    const t = mkChar({ 0x111: 50 });
    setRandSeed(seed);
    let d = lcg(seed)(20) + 1; const nat1 = d <= 1; if (d === 20) d = 100;
    assert.equal(await ov24.AttackRollVsAC(t, 35), !nat1 && d + 35 > 50, `seed ${seed}`);
  }
  const { g } = setup();
  const t = mkChar({ 0x111: 0 }); addEff(t, 0x19);
  g.EffectHandler[0x19] = async () => { g.AttackRollValue = 0xF6; };   // -10
  let seed = 1; while (lcg(seed)(20) + 1 < 2) seed++;
  setRandSeed(seed); assert.equal(await ov24.AttackRollVsAC(t, 200), false);
});

test('DamageCharacter: texts, save halves, from Magic for type 0, Goes Down', async () => {
  let { g, log } = setup();
  let c = mkChar();
  g.DamageType = 1;
  await ov24.DamageCharacter(c, 7, 2, true);
  assert.deepEqual(log[0], ['anim', 'takes 3 points of damage from Fire', 0]);
  assert.equal(c.b[0x11B], 17);

  ({ g, log } = setup()); c = mkChar(); g.DamageType = 0;
  await ov24.DamageCharacter(c, 1, 0, false);
  assert.deepEqual(log[0], ['anim', 'takes 1 point of damage from Magic', 0]);   // quirk: type 0 -> from Magic

  ({ g, log } = setup()); c = mkChar(); g.DamageType = 9;
  await ov24.DamageCharacter(c, 2, 0, false);
  assert.equal(log[0][1], 'takes 2 points of damage from Fire');

  ({ g, log } = setup()); c = mkChar(); g.DamageType = 0x10;
  await ov24.DamageCharacter(c, 9, 1, true);                       // saved, no damage: nothing at all
  assert.deepEqual(log, []); assert.equal(c.b[0x11B], 20);

  ({ g, log } = setup()); c = mkChar({ 0x11B: 5 }); g.DamageType = 2;
  await ov24.DamageCharacter(c, 8, 0, false);                      // hp 5 - 8 -> dying (stub ApplyDamage)
  assert.equal(c.b[0x10C], 5); assert.equal(c.b[0x10D], 0);
  assert.deepEqual(log.slice(1).map((x) => x[0] === 'msg' ? x.slice(0, 3) : x[0]),
    ['apply', ['msg', 'Goes Down, and is Dying', 18], 'delay', 'clear']);

  ({ g, log } = setup()); c = mkChar({ 0x11B: 5 }); g.DamageType = 4;
  await ov24.DamageCharacter(c, 40, 0, false);
  assert.equal(log.find((x) => x[0] === 'msg')[1], 'is killed');

  // hook event 06 (effect 0Ah, e.g. resist cold) halves DamageAmount
  ({ g, log } = setup()); c = mkChar(); addEff(c, 0x0A); g.DamageType = 2;
  g.EffectHandler[0x0A] = async () => { g.DamageAmount >>= 1; };
  await ov24.DamageCharacter(c, 10, 0, false);
  assert.equal(log[0][1], 'takes 5 points of damage from Cold');
});

test('HealCharacter: byte wrap, cap, effect 32h, Dying -> Unconscious', async () => {
  const { g } = setup();
  let c = mkChar({ 0x11B: 250, 0x32: 255 });
  assert.equal(await ov24.HealCharacter(c, 10, true), true);
  assert.equal(c.b[0x11B], 4);                                      // quirk: 250 + 10 wraps to 4
  c = mkChar({ 0x11B: 15 }); assert.equal(await ov24.HealCharacter(c, 10, true), true); assert.equal(c.b[0x11B], 20);
  c = mkChar(); assert.equal(await ov24.HealCharacter(c, 3, true), false);   // not hurt, onlyIfHurt
  c = mkChar(); assert.equal(await ov24.HealCharacter(c, 3, false), true);   // "heals" at full hp
  c = mkChar(); addEff(c, 0x32); assert.equal(await ov24.HealCharacter(c, 3, false), false);
  c = mkChar({ 0x10C: 6, 0x11B: 0 }); assert.equal(await ov24.HealCharacter(c, 3, false), false);   // dead
  c = mkChar({ 0x10C: 5, 0x10D: 0, 0x11B: 0 }); g.game_Mode = 5;
  assert.equal(await ov24.HealCharacter(c, 3, true), true); assert.equal(c.b[0x10C], 4); assert.equal(c.b[0x11B], 3);
  let called = 0; g.EffectHandler[0x4E] = async (cc, e, mode) => { called = mode; };
  g.game_Mode = 0; c = mkChar({ 0x10C: 4, 0x10D: 0, 0x11B: 0 });
  await ov24.HealCharacter(c, 1, true); assert.equal(called, 1);
});

test('effects: AddEffect/RemoveEffect/ApplyEffect/RemoveCombatEffects (DS:0C14 table)', async () => {
  const { g, log } = setup();
  const c = mkChar();
  ov24.AddEffect(c, 0x07, 5, 0xFF, 0); ov24.AddEffect(c, 0x0B, 0, 1, 1); ov24.AddEffect(c, 0x50, 3, 0, 0);
  assert.deepEqual(types(c), [0x07, 0x0B, 0x50]);
  let removed = 0; g.EffectHandler[0x0B] = async (cc, e, mode) => { if (mode === 1) removed++; };
  await ov24.RemoveCombatEffects(c);
  assert.deepEqual(types(c), [0x50]); assert.equal(removed, 1);
  // ApplyEffect: longer duration replaces, shorter adds
  await ov24.ApplyEffect(c, 0x50, 9, 0, 0, 0, false, 'is held');
  assert.deepEqual(types(c), [0x50]);
  await ov24.ApplyEffect(c, 0x50, 2, 0, 0, 0, false, '');
  assert.deepEqual(types(c), [0x50, 0x50]);
  assert.deepEqual(log.filter((x) => x[0] === 'anim'), [['anim', 'is held', 1]]);
  await ov24.ApplyEffect(c, 0x51, 2, 0, 0, 1, true, 'x');
  assert.deepEqual(log.at(-1), ['msg', 'is Unaffected', 10, 1]);
  assert.equal(await ov24.CureEffect(c, 0x50), true); assert.deepEqual(types(c), [0x50]);
  assert.equal(await ov24.CureEffect(c, 0x33), false);
});

test('StrengthCode / DecodeStrength / SetStrength', () => {
  setup();
  assert.equal(ov24.StrengthCode(18, 50), 51); assert.equal(ov24.StrengthCode(17, 0), 117);
  const s = { v: 0 }, x = { v: 0 }, e = newEffect();
  e.b[3] = 0x80 | 51; ov24.DecodeStrength(e, s, x); assert.deepEqual([s.v, x.v], [18, 50]);
  e.b[3] = 117; ov24.DecodeStrength(e, s, x); assert.deepEqual([s.v, x.v], [17, 0]);
  const c = mkChar({ 0x10: 16 }); const old = { v: 0 };
  assert.equal(ov24.SetStrength(c, 18, 76, old), true); assert.equal(old.v, 116);
  assert.deepEqual([c.b[0x10], c.b[0x16]], [18, 76]);
  assert.equal(ov24.SetStrength(c, 17, 0, old), false); assert.equal(old.v, (117 + 0x80) & 0xFF);
});
