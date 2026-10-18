// game/test/party/ov12.test.mjs — node test of game/areas/party_ov12.js (PARTY ov12 effect handlers).
// Run: node game/test/party/ov12.test.mjs
// Expected values come from decode/pseudo/party_parts/ov12a/ov12b.pas.md (addresses cited per case), the ov24 type→handler
// table in decode/pseudo/combat_parts/ov24.pas.md and the DS image of decode/bin/START.unpacked.exe (file offset 8E0h + C7C0h),
// not from the JS.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bindParty, env } from '../../areas/party_core.js';
import { newChar, newItem, newEffect } from '../../engine/state.js';
import * as T from '../../areas/party_ov12.js';

let fails = 0;
const eq = (name, got, want) => {
  const a = JSON.stringify(got), b = JSON.stringify(want);
  if (a !== b) { fails++; console.log(`FAIL ${name}: got ${a}, want ${b}`); } else console.log(`ok   ${name}`);
};

const exe = readFileSync(fileURLToPath(new URL('../../../decode/bin/START.unpacked.exe', import.meta.url)));
const DS = new Uint8Array(0x8760);
DS.set(exe.subarray(0x8E0 + 0xC7C0, Math.min(exe.length, 0x8E0 + 0xC7C0 + 0x8760)));

// ---- fake environment -------------------------------------------------------------------------------------------
let calls, rolls, saves, effects;
const rec = (name, ret) => (...a) => {
  calls.push([name, ...a.map((x) => (x && x.b ? (x.tag ?? 'rec') : x))]);
  return typeof ret === 'function' ? ret(...a) : ret;
};
function mkChar(tag, name = '') {
  const c = newChar(); c.tag = tag;
  c.b[0] = name.length; for (let i = 0; i < name.length; i++) c.b[1 + i] = name.charCodeAt(i);
  c.combat = { b: new Uint8Array(0x16), target: null };
  c.b[0x10D] = 1;                                                  // active
  return c;
}
function setup(over = {}) {
  calls = []; rolls = []; saves = []; effects = new Map();
  const g = {
    ds: DS, MoraleValue: 0, AttackRollValue: 0, DamageAmount: 0, DamageType: 0, SaveRoll: 0, SaveType: 0, EffectToApply: 0,
    sp_Current: 0, SpellArea: 0, StatValue: 0, StatKind: 0, LastDiceCount: 0, cure_InProgress: 0, AttackBlocked: 0,
    game_Mode: 5, SelectedChar: null, HookOpponent: null, CombatRound: 1, SlotHits: [0, 0, 0], cb_Char: [], cm_Map: null,
    ...over,
  };
  bindParty({
    g, ext: {
      ShowCharacterMessage: rec('ShowCharacterMessage'), MessageDelay: rec('MessageDelay'), ClearCharacterMessage: rec('ClearCharacterMessage'),
      AddEffect: rec('AddEffect'), RemoveEffect: rec('RemoveEffect'), ApplyEffect: rec('ApplyEffect'),
      CallEffectHandler: rec('CallEffectHandler'), CallEffectHooks: rec('CallEffectHooks'),
      HasEffect: (c, t, ref) => { const e = effects.get(`${c.tag}:${t}`); if (ref) ref.v = e ?? null; return !!e; },
      SavingThrow: rec('SavingThrow', () => saves.shift()), Roll: rec('Roll', () => rolls.shift()), RollDice: rec('RollDice', () => rolls.shift()),
      DamageCharacter: rec('DamageCharacter'), RemoveCombatEffects: rec('RemoveCombatEffects'), RemoveCombatant: rec('RemoveCombatant'),
      DrawPartyRoster: rec('DrawPartyRoster'), RecalcCharacter: rec('RecalcCharacter'), UpdateLevelStats: rec('UpdateLevelStats'),
      DebugPrint: rec('DebugPrint'), ByteToStr: (n) => String(n), AppendItemCopy: rec('AppendItemCopy', (c, it) => { c.items = { b: it.b.slice(), next: c.items }; }),
      LoseItem: rec('LoseItem'), ShowCombatMessageAnimation: rec('ShowCombatMessageAnimation'), CountActiveSides: rec('CountActiveSides'),
      CombatantCol: (c) => c.col ?? 0, CombatantRow: (c) => c.row ?? 0, CombatantIndex: (c) => c.index ?? 0, CanAttack: () => true,
      TraceLine: rec('TraceLine', () => true), BuildFourAnimationFrames: rec('BuildFourAnimationFrames'), AnimateAlongPath: rec('AnimateAlongPath'),
      ClearCombatantActionFlags: rec('ClearCombatantActionFlags', () => true), SpellCasterLevel: () => 7,
      ReviveCombatant: rec('ReviveCombatant', () => true),
    },
  });
  return env.g;
}
const named = (n) => calls.filter((x) => x[0] === n);

// ---- 1. InstallEffectHandlers vs the ov24 table (combat_parts/ov24.pas.md, "Type → handler") ----------------------
{
  const md = readFileSync(fileURLToPath(new URL('../../../decode/pseudo/combat_parts/ov24.pas.md', import.meta.url)), 'utf8');
  const block = md.slice(md.indexOf('Type → handler'));
  const body = block.slice(block.indexOf('```') + 3, block.indexOf('```', block.indexOf('```') + 3));
  const want = {};
  for (const m of body.matchAll(/\b([0-9A-F]{2}) (\S+)/g)) want[parseInt(m[1], 16)] = m[2];
  const alias = { nop: 'EffNop', ov13_3A86: 'EffHold' };
  const g = setup();
  g.EffectHandler = new Array(0x8C).fill(null);
  g.EffectHandler[0x58] = 'magic';                                 // MAGIC ov22 writes 58h itself; ov12 must not touch it
  T.InstallEffectHandlers(g);
  let bad = [];
  for (let t = 1; t <= 0x8B; t++) {
    if (t === 0x58) continue;
    const w = alias[want[t]] ?? want[t];
    const h = g.EffectHandler[t];
    const name = t === 0x49 || t === 0x4A ? (t === 0x49 ? 'EffRake' : 'EffHold') : (h && h.name);
    const wname = w === 'EffShield' && t === 0x5B ? 'EffShield5B' : w;   // 5B: same published name as 11h (exported EffShield5B)
    if (!h || name !== wname) bad.push(`${t.toString(16)}:${name}!=${wname}`);
  }
  eq('table: 138 entries match ov24 table', bad, []);
  eq('table: 58h untouched', g.EffectHandler[0x58], 'magic');
  eq('table: ov24 table has 138 typed entries', Object.keys(want).length, 139);   // incl. "58 (not set!)"
}

// ---- 2. EffBless / EffCurse (5c00:0110 / 0120) ---------------------------------------------------------------------
{
  const g = setup({ MoraleValue: 3, AttackRollValue: 0 });
  await T.EffCurse(mkChar('a'), null, 0);
  eq('Curse: morale <5 -> 0, roll -1 (byte)', [g.MoraleValue, g.AttackRollValue], [0, 0xFF]);
  await T.EffBless(mkChar('a'), null, 0);
  eq('Bless: morale +5, roll +1', [g.MoraleValue, g.AttackRollValue], [5, 0]);
}

// ---- 3. EffHardier (5c00:0233): CON 15 fighter 4 + MU 4: perLvl = 4*0 + 4*1 = 4, old = (40-24) div 4 = 4 -----------
{
  setup();
  const c = mkChar('c'); c.b[0x14] = 15; c.b[0x32] = 40; c.b[0x11B] = 30; c.b[0xB1] = 24;
  c.b[0x96 + 2] = 4; c.b[0x96 + 5] = 4;
  await T.EffHardier(c, null, 0);
  // CON becomes 16 (> 15): fighter 4*(16-15)=4, MU 4*2=8 -> perLvl 12; old = 16 div 12 = 1
  eq('Hardier: CON+1, hp_max/hp +1', [c.b[0x14], c.b[0x32], c.b[0x11B]], [16, 41, 31]);
  eq('Hardier: message', named('ShowCharacterMessage')[0], ['ShowCharacterMessage', 'c', 'is hardier', 10, true]);
  // CON 19 -> 20: effect 3Eh, duration 3Ch (5c00:027d)
  setup(); const d = mkChar('d'); d.b[0x14] = 19;
  await T.EffHardier(d, null, 0);
  eq('Hardier: CON 20 -> AddEffect 3Eh', named('AddEffect')[0], ['AddEffect', 'd', 0x3E, 0x3C, 0xFF, 1]);
  // unsigned division (xor ah at 0338/033F): old bonus 200 / perLvl 1 = 200
  setup(); const u = mkChar('u'); u.b[0x14] = 15; u.b[0x32] = 210; u.b[0xB1] = 10; u.b[0x11B] = 0; u.b[0x96 + 2] = 1;
  await T.EffHardier(u, null, 0);      // CON 16: perLvl = 1*(16-15) = 1 -> +200
  eq('Hardier: unsigned IDIV (200)', u.b[0x32], (210 + 200) & 0xFF);
}

// ---- 4. DrainClass / DrainLevels (5c00:2002 / 2122), XpForLevel DS:409B --------------------------------------------
{
  const xp = (cls, lvl) => { const o = 0x409B + cls * 0x38 + lvl * 4; return (DS[o] | (DS[o + 1] << 8) | (DS[o + 2] << 16) | (DS[o + 3] << 24)) | 0; };
  eq('XpForLevel fighter 2/3 (image)', [xp(2, 2), xp(2, 3)], [2001, 4001]);
  setup();
  const c = mkChar('c'); c.b[0x96 + 2] = 3; c.b[0x73] = 3; c.b[0x32] = 30; c.b[0x11B] = 20; c.b[0xB1] = 30;
  eq('DrainClass picks the fighter', T.DrainClass(c), { cls: 2, xpBest: xp(2, 3) });
  await T.DrainLevels(c, 1);
  // sum 3 -> hpLoss 30 div 3 = 10; level 3 -> 2; level_main := 2; xp := XpForLevel[2,2] (DrainClass after the Dec)
  eq('Drain 1: hp_max/hp/hp_rolled/hp_drained', [c.b[0x32], c.b[0x11B], c.b[0xB1], c.b[0x75]], [20, 10, 20, 10]);
  eq('Drain 1: level/level_main/levels_drained', [c.b[0x96 + 2], c.b[0x73], c.b[0x74]], [2, 2, 1]);
  eq('Drain 1: xp = threshold of new level', c.b[0xAC] | (c.b[0xAD] << 8), 2001);
  eq('Drain 1: message', named('ShowCharacterMessage')[0], ['ShowCharacterMessage', 'c', 'is drained a level', 10, true]);
  // level_main 1 -> dead forever (5c00:22b7 / 22c1)
  setup(); const d = mkChar('d'); d.b[0x96 + 2] = 1; d.b[0x73] = 1; d.b[0x32] = 8; d.b[0x11B] = 8;
  await T.DrainLevels(d, 2);
  eq('Drain level 1: status 8, hp_max 0', [d.b[0x10C], d.b[0x32]], [8, 0]);
  eq('Drain 2 levels: message text', named('ShowCharacterMessage')[0][2], 'is drained 2 levels');
}

// ---- 5. EffMirrorImage (5c00:09d4): only non-area spells absorbed ---------------------------------------------------
{
  const g = setup({ sp_Current: 0x0F, SpellArea: 0, DamageAmount: 7, EffectToApply: 0 });
  const c = mkChar('c'), e = newEffect(); e.b[3] = 1;
  rolls = [2];
  await T.EffMirrorImage(c, e, 0);
  eq('MirrorImage: Roll(1, p3+1)', named('Roll')[0], ['Roll', 1, 2]);
  eq('MirrorImage: image lost, damage 0, effect removed', [e.b[3], g.DamageAmount, named('RemoveEffect').length], [0, 0, 1]);
  setup({ sp_Current: 0, DamageAmount: 7 }); rolls = [2]; e.b[3] = 3;
  await T.EffMirrorImage(c, e, 0);
  eq('MirrorImage: weapon hit (sp_Current 0) not absorbed', [e.b[3], env.g.DamageAmount], [3, 7]);
}

// ---- 6. EffCharmGaze (5c00:1e77) ------------------------------------------------------------------------------------
{
  const g = setup();
  const c = mkChar('c'), t = mkChar('t'); c.combat.target = t; c.b[0x10E] = 1;
  saves = [false];
  await T.EffCharmGaze(c, null, 0);
  eq('CharmGaze: sp_Current := 0Ah', g.sp_Current, 0x0A);
  eq('CharmGaze: save of target (4, -2)', named('SavingThrow')[0], ['SavingThrow', 't', 4, -2]);
  eq('CharmGaze: ApplyEffect args', named('ApplyEffect')[0], ['ApplyEffect', 't', 0x0B, 0, 0x8C, 1, 1, false, 'is charmed']);
  eq('CharmGaze: messages', named('ShowCharacterMessage').map((x) => x[2]), ['Gazes...']);
}

// ---- 7. EffSpiritualHammer (5c00:07e0) ------------------------------------------------------------------------------
{
  setup();
  const c = mkChar('c');
  await T.EffSpiritualHammer(c, null, 0);
  const it = c.items;
  eq('Hammer: item bytes', [it.b[0x2E], it.b[0x30], it.b[0x31], it.b[0x32], it.b[0x3D], it.b[0x3E]], [0x14, 0x14, 0xF3, 1, 0x17, 0x89]);
  eq('Hammer: message + recalc', [named('ShowCharacterMessage')[0][2], named('RecalcCharacter').length], ['Gains an item', 1]);
  setup(); c.b[0xC7] = 1;
  await T.EffSpiritualHammer(c, null, 1);
  eq('Hammer removed: LoseItem', named('LoseItem').length, 1);
}

// ---- 8. Poison / paralysis touches (5c00:1545 / 15eb / 16bb) -------------------------------------------------------
{
  setup(); const c = mkChar('c'), t = mkChar('t'); c.combat.target = t;
  saves = [false];
  await T.EffPoisonHitP4(c, null, 0);
  eq('PoisonP4: save (0, 4)', named('SavingThrow')[0], ['SavingThrow', 't', 0, 4]);
  eq('PoisonP4: effect 37h + killed', [named('AddEffect')[0], t.b[0x10C], t.b[0x11B]], [['AddEffect', 't', 0x37, 0, 0xFF, 0], 6, 0]);
  setup(); saves = [false]; rolls = [5];
  await T.EffParalyzeHitLong(c, null, 0);
  eq('ParalyzeLong: Roll(1,9)+10, bonus unused', [named('Roll')[0], named('SavingThrow')[0], named('AddEffect')[0]],
    [['Roll', 1, 9], ['SavingThrow', 't', 0, 0], ['AddEffect', 't', 0x34, 15, 0x0C, 0]]);
  setup(); t.b[0x2E] = 2;
  await T.EffGhoulParalysis(c, null, 0);
  eq('Ghoul: elf immune', named('SavingThrow').length, 0);
  setup(); t.b[0x2E] = 7; saves = [false];
  await T.EffGhoulParalysis(c, null, 0);
  eq('Ghoul: human paralysed 3Fh', named('AddEffect')[0], ['AddEffect', 't', 0x34, 0x3F, 0x0C, 0]);
}

// ---- 9. damage filters --------------------------------------------------------------------------------------------
{
  let g = setup({ DamageType: 2, DamageAmount: 9, SaveRoll: 0 });
  await T.EffResistCold(mkChar('c'), null, 0);
  eq('ResistCold: halve + save 3', [g.DamageAmount, g.SaveRoll], [4, 3]);
  g = setup({ sp_Current: 0x0F, DamageAmount: 9, EffectToApply: 5 });
  await T.EffShield5B(mkChar('c'), null, 0);
  eq('Shield 5Bh vs Magic Missile', [g.DamageAmount, g.EffectToApply, named('ShowCharacterMessage')[0][2]], [0, 0, 'is unaffected']);
  g = setup({ sp_Current: 3, DamageType: 4, DamageAmount: 9 });
  await T.EffShield5B(mkChar('c'), null, 0);
  eq('Shield 5Bh vs electricity', g.DamageAmount, 0);
  g = setup({ DamageType: 1, DamageAmount: 10, LastDiceCount: 3, EffectToApply: 0 });
  await T.EffFireResistance(mkChar('c'), null, 0);
  eq('FireResistance: -2/die min dice, non-magic fire cancelled', [g.DamageAmount, g.SaveRoll], [0, 4]);
}

// ---- 10. MagicResistance byte wrap (5c00:2927): pct 15, caster level 7 -> 15 - 20 = F BH -> always resists -----------
{
  const g = setup({ EffectToApply: 0x0B, DamageAmount: 5 }); rolls = [100];
  await T.EffMagicRes15(mkChar('c'), null, 0);
  eq('MagicRes15 vs level 7: wraps, resists on 100', [g.EffectToApply, g.DamageAmount], [0, 0]);
}

// ---- 11. CON save bonus (5c00:24d9) / displacement (2490) / haste (0c4b) -------------------------------------------
{
  let g = setup({ SaveType: 0, SaveRoll: 0 }); const c = mkChar('c'); c.b[0x14] = 18;
  await T.EffConSaveBonusPoison(c, null, 0);
  eq('ConSaveBonus CON 18 -> +5', g.SaveRoll, 5);
  g = setup({ CombatRound: 2, AttackRollValue: 12 }); const e = newEffect();
  await T.EffDisplacement(c, e, 0);
  eq('Displacement: first attack misses', [g.AttackRollValue, e.b[3]], [0xFF, 0x10]);
  g.AttackRollValue = 12; await T.EffDisplacement(c, e, 0);
  eq('Displacement: second attack hits', g.AttackRollValue, 12);
  g = setup({ StatValue: 3 }); const h = newEffect(); c.b[0x30] = 0xFF; c.b[0x31] = 0;
  await T.EffHaste(c, h, 0);
  eq('Haste: ages (word), doubles', [c.b[0x30] | (c.b[0x31] << 8), g.StatValue, h.b[3]], [0x100, 6, 0x10]);
}

// ---- 12. EffBloodDrain (5c00:176f) -----------------------------------------------------------------------------------
{
  const v = mkChar('v');
  const g = setup({ cb_Char: [null, v] });
  const c = mkChar('c'), e = newEffect(); e.b[3] = 1; e.b[1] = 0xCF; e.b[2] = 0;   // wants 0CFh shr 4 = 12
  rolls = [3];
  await T.EffBloodDrain(c, e, 0);
  eq('BloodDrain: 1d4 damage to victim', named('DamageCharacter')[0], ['DamageCharacter', 'v', 3, 0, false]);
  eq('BloodDrain: duration -= dmg shl 4', e.b[1] | (e.b[2] << 8), 0xCF - 0x30);
}

// ---- 13. Gnome attack bonus vs DS:0332 names (5c00:0679) -------------------------------------------------------------
{
  const name = (i) => { const o = 0x0332 + i * 16; let s = ''; for (let k = 1; k <= DS[o]; k++) s += String.fromCharCode(DS[o + k]); return s; };
  eq('GnomeFoeNames[1..4] (image)', [1, 2, 3, 4].map(name), ['KOBOLD', 'KOBOLD LEADER', 'GOBLIN', 'GOBLIN LEADER']);
  const g = setup({ AttackRollValue: 0 });
  const c = mkChar('c'), t = mkChar('t', 'GOBLIN'); t.b[0x9F] = 1; t.b[0x6C] = 1; c.combat.target = t;
  await T.EffGnomeAttackBonus(c, null, 0);
  eq('GnomeAttackBonus vs GOBLIN', g.AttackRollValue, 1);
}

// ---- 14. ItemGiantStrength apply (5c00:3015 .. 3087) ----------------------------------------------------------------
{
  const g = setup({ game_Mode: 5 });
  env.ext.SetStrength = (c, s, x, old) => { old.v = 0x42; return true; };
  const c = mkChar('c');
  await T.ItemGiantStrength(c, newItem(), 0);
  eq('GiantStrength: message, effect 26h with old code', [named('ShowCharacterMessage')[0][2], named('AddEffect')[0], g.ItemsChanged, g.game_Mode],
    ['is stronger', ['AddEffect', 'c', 0x26, 0, 0x42, 1], 1, 5]);
}

if (fails) { console.log(`${fails} FAILED`); process.exit(1); }
console.log('all ov12 tests passed');
