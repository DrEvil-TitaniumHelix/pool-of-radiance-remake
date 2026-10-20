// game/test/combat/ov05.test.mjs — node:test for game/areas/combat_ov05.js (COMBAT ov05, seg 3900).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newChar, newItem, wrW } from '../../engine/ecl.js';
import { bindCombat } from '../../areas/combat_core.js';
import * as ov05 from '../../areas/combat_ov05.js';

const rdL = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) | 0;
const wrL = (b, o, v) => { for (let i = 0; i < 4; i++) b[o + i] = (v >>> (8 * i)) & 0xFF; };

function setup(ext = {}) {
  const log = [];
  const g = {
    ds: new Uint8Array(0x8760), game_Mode: 5, PartyHead: null, SelectedChar: null, DuelActive: 0, NonSharing: 0,
    CombatXP: 0, PartyWon: 0, PartyFled: 0, PartyDead: 0, EnemiesFought: 0, TreasureMoney: [0, 0, 0, 0, 0, 0, 0],
    TreasureItems: null, g_5D9A: null, ecl_Mem6B00: new Uint16Array(0x400), text_Col: 0, text_Row: 0,
  };
  bindCombat({ g, ext: {
    BuildItemName: () => {}, DrawTitledFrame: (...a) => log.push(['frame', a[6]]),
    DrawWrappedText: (...a) => log.push(['wrap', a[6], a[1]]), DrawText: (c, r, col, s) => log.push(['text', s, r]),
    HorizontalMenu: async () => ({ key: '\r', ext: false }), ...ext } });
  return { g, log };
}
const party = (g, list) => { for (let i = 0; i < list.length; i++) list[i].next = list[i + 1] ?? null; g.PartyHead = list[0]; };
const mk = (f = {}, nonParty = 0) => {
  const c = newChar(); c.combat = { b: new Uint8Array(0x16) }; c.combat.b[0x13] = nonParty;
  c.b[0x10D] = 1; c.b[0x11B] = 10;
  for (const [o, v] of Object.entries(f)) c.b[Number(o)] = v;
  return c;
};
const W = (g, off, v) => { g.ecl_Mem6B00[off >> 1] = v; };

test('ComputeCombatXP: xp_value + hp_rolled*xp_per_hp, treasure, / sharing members', async () => {
  const { g } = setup();
  const m = mk({ 0x10E: 1, 0xB1: 10, 0xBA: 5 }, 1); wrW(m.b, 0xB8, 100); wrW(m.b, 0x88 + 2 * 3, 20);   // 20 gp
  const fled = mk({ 0x10E: 1, 0x10C: 3, 0xB1: 50, 0xBA: 50 }, 1); wrW(fled.b, 0xB8, 999);             // running: ignored
  party(g, [mk(), mk(), m, fled]);
  W(g, 0x5C6, 1); W(g, 0x67C, 2);
  g.TreasureMoney[0] = 450; g.TreasureMoney[5] = 1;                                // 450 cp -> 2, 1 gem -> 250
  const xp = { v: 0 };
  await ov05.ComputeCombatXP(xp);
  assert.equal(xp.v, Math.trunc((100 + 50 + 2 + 20 + 250) / 2));
  assert.equal(g.EnemiesFought, 1); assert.equal(g.TreasureMoney[3], 20);
  // quirk: hp_rolled * xp_per_hp = 40000 sign-extends to -25536
  const s2 = setup(); const m2 = mk({ 0x10E: 1, 0xB1: 200, 0xBA: 200 }, 1);
  party(s2.g, [mk(), m2]); W(s2.g, 0x5C6, 1); W(s2.g, 0x67C, 1);
  await ov05.ComputeCombatXP(xp); assert.equal(xp.v, 40000 - 65536);
  // duel: level_main * 100
  const s3 = setup(); s3.g.DuelActive = 1; W(s3.g, 0x5CC, 1); s3.g.SelectedChar = mk({ 0x73: 7 });
  await ov05.ComputeCombatXP(xp); assert.equal(xp.v, 700);
});

test('ComputeCombatXP: valued items looted (readied cleared, pushed at head), +400 per plus', async () => {
  const { g } = setup();
  const m = mk({ 0x10E: 1 }, 1);
  const a = newItem(); wrW(a.b, 0x3A, 50); a.b[0x32] = 2; a.b[0x34] = 1;
  const b = newItem(); wrW(b.b, 0x3A, 10); b.b[0x32] = 0xFF;              // plus -1: no XP
  a.next = b; m.items = a;
  party(g, [mk(), m]); W(g, 0x67C, 1);
  const xp = { v: 0 };
  await ov05.ComputeCombatXP(xp);
  assert.equal(xp.v, 800);
  assert.equal(g.TreasureItems.b[0x32], 0xFF); assert.equal(g.TreasureItems.next.b[0x34], 0);
  assert.notEqual(g.TreasureItems.next, a);
  W(g, 0x67C, 0); await assert.rejects(ov05.ComputeCombatXP(xp), /Runtime error 200/);
});

test('AwardXP: prime requisite +10 %, multi-class split, inactive/animated skipped', () => {
  const { g } = setup();
  const fighter = mk({ 0x2F: 2, 0x10: 16 }), mu = mk({ 0x2F: 5, 0x11: 15 }), cf = mk({ 0x2F: 8 }),
    cfm = mk({ 0x2F: 9 }), pal = mk({ 0x2F: 3, 0x10: 18 }), thief = mk({ 0x2F: 6, 0x13: 17 }),
    cler = mk({ 0x2F: 0, 0x12: 16 }), down = mk({ 0x2F: 2, 0x10: 18, 0x10D: 0 }), anim = mk({ 0x10C: 1 });
  wrL(fighter.b, 0xAC, 1000);
  party(g, [fighter, mu, cf, cfm, pal, thief, cler, down, anim]);
  ov05.AwardXP(305);
  assert.deepEqual([fighter, mu, cf, cfm, pal, thief, cler, down, anim].map((c) => rdL(c.b, 0xAC)),
    [1000 + 335, 305, 152, 101, 305, 335, 335, 0, 0]);
});

test('ResolveCombatOutcome: fled party keeps runners, members left behind are removed', async () => {
  const removed = [];
  const { g } = setup({ RemoveFromParty: (keep, icon) => removed.push([g.SelectedChar, keep, icon]) });
  const run = mk({ 0x10C: 3, 0x10D: 0 }), unc = mk({ 0x10C: 4, 0x10D: 0 }), mon = mk({ 0x10E: 1, 0x10C: 6 }, 1);
  party(g, [run, unc, mon]); W(g, 0x67C, 2);
  await ov05.ResolveCombatOutcome();
  assert.deepEqual([g.PartyFled, g.PartyWon, g.PartyDead, g.NonSharing], [1, 0, 0, 2]);
  assert.deepEqual([run.b[0x10C], run.b[0x10D]], [0, 1]);
  assert.deepEqual(removed, [[unc, 0, 1]]);
  assert.equal(g.ecl_Mem6B00[0x58E >> 1], 0x81);
});

test('NpcTakesShare: quotient truncated to a byte', async () => {
  const { g, log } = setup();
  const npc = mk({ 0x84: 0x80, 0x85: 2 }); npc.b[0] = 3; npc.b.set([0x42, 0x6F, 0x62], 1);   // "Bob"
  party(g, [mk(), mk(), npc]);
  g.TreasureMoney[3] = 1000; g.TreasureMoney[1] = 3000;
  await ov05.NpcTakesShare();
  assert.equal(g.TreasureMoney[3], 1000 - 250 * 2);
  assert.equal(g.TreasureMoney[1], 3000 - (750 & 0xFF) * 2);       // quirk: per = Byte(750) = 238
  assert.deepEqual(log.find((x) => x[0] === 'wrap'), ['wrap', 'Bob takes and hides his share.', 5]);
});

test('AfterCombat: party destroyed -> The END!, ECL words cleared', async () => {
  const { g, log } = setup({ RemoveFromParty: () => {}, ShowBottomPromptAndReadKey: (c, s) => log.push(['prompt', s]) });
  const dead = mk({ 0x10C: 6, 0x10D: 0 });
  party(g, [dead]); W(g, 0x67C, 1); W(g, 0x6E0, 5); W(g, 0x5CC, 0);
  await ov05.AfterCombat();
  assert.equal(g.game_Mode, 6); assert.equal(g.PartyDead, 1);
  assert.equal(g.ecl_Mem6B00[0x58E >> 1], 0x80); assert.equal(g.ecl_Mem6B00[0x6E0 >> 1], 0);
  assert.equal(g.ecl_Mem6B00[0x67C >> 1], 0); assert.equal(g.TextOutputActive, 1);
  assert.deepEqual(log.filter((x) => x[0] === 'frame' || x[0] === 'prompt'),
    [['frame', 'The END!'], ['prompt', 'Press any key to continue']]);
});
