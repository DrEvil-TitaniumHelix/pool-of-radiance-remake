// game/areas/magic_spells.js — MAGIC ov22 (seg 8E00) spell handlers 8E00:0F4F..323C. Lane por-build-magic.
// por-only: Pool spell ids, tables, dispatch, class limits and magic rules (whole module) (profile: engine.areaModules / pediaSources.spells; game/profiles/PORONLY.md)
// Source: decode/pseudo/MAGIC.pas.md "Spell handlers (SpellHandlers[id])" + the handler sections; every handler re-read
// on decode/listings/ov22.lst (`decode/ecl/hdis.py ov22 0f4f 323d`): rolls, effect ids, save types, messages (CS
// literal addresses cited) and every call's argument order taken from the PUSH sequence (first pushed = first Pascal
// argument) and checked against the callee declaration in COMBAT.pas.md / ENGINE.pas.md / VIEW.pas.md.
// Conventions: magic_core.js header, plus (as the COMBAT build, game/areas/combat_ov13.js / combat_ov24.js):
// - Pascal `var` parameters are ref objects `{ v }`.
// - Combat tables are JS arrays: SpellTargets[1..SpellTargetCount] (DS:6C91 + 4k), cb_Char[i] (DS:65B9 + 4i),
//   tg_List[i].who (DS:6718 + 3i), tg_Count (DS:671A), BodyList[k] = { char, x, y, ground } (DS:66D6 + 7k), BodyCount.
// - cm_Map (g_6716) = { b: Uint8Array }: battlefield grid byte (x, y) at b[7 + y*50 + x] (asm 8e00:1e9c..1ea9).
// - TLine (VIEW B600 LineInit/LineStep) = JS object { x0, y0, x1, y1, err, adx, ady, incDiag, incStraight, sx, sy,
//   x, y, dist, dir } (record offsets in VIEW.pas.md); newLine() = FillChar(L, 1Ah, 0).
// - Stinking-cloud record (19 bytes, sc_List g_6DBB): { caster, next, b: Uint8Array(0x13) } with b[7+k] saved ground
//   tile of square k (k = 1..4), b[0x0B+k] "placed" flag, b[0x10] col, b[0x11] row, b[0x12] index (+0 caster and
//   +4 next far pointers are the JS references).
// - SpellHandlers[0] is the target selector: InitSpellTable (magic_ov22.js, 8E00:3413) sets it to SelectTargetsCamp
//   and the combat lane replaces it with its aiming routine (ov13 stub e14); it stays undefined in this file.

import { g, X, ds, byte, word, shortint, integer, S8, inSet } from './magic_core.js';
import { ApplySpell, SpellDuration } from './magic_ov22.js';

// ---- record fields (SAVES.md §3 TChar, §5 effect) ----------------------------------------------------------------
const STR = 0x10, CHA = 0x15, STR_EXC = 0x16, MEM_SPELL = 0x17, HP_MAX = 0x32, FIGHTER_LVL_EFF = 0x6B, SIZE = 0x6C,
  BASE_MOVE = 0x72, LVL_MAIN = 0x73, DRAIN_LEVELS = 0x74, DRAIN_HP = 0x75, TURN_CLASS = 0x76, NPC_FLAGS = 0x84,
  LEVEL = 0x96, CREATURE_TYPE = 0x9F, XP = 0xAC, HP_ROLLED = 0xB1, STATUS = 0x10C, SIDE = 0x10E, QUICK = 0x10F, HP = 0x11B;
const E_TYPE = 0, E_P3 = 3;
const RACE = 0x2E;                                     // TChar +2Eh race (0 = monster)

// ---- local helpers -----------------------------------------------------------------------------------------------
const ref = (v) => ({ v });
const b01 = (f) => (f ? 1 : 0);
const tbl = (id, k) => ds(0x31FA + id * 16 + k);        // SpellTable{g_31FA}[id*16 + k]
const T1 = () => g.SpellTargets[1];                     // SpellTargets[1] (DS:6C95)
const terrainFrame = (tile) => ds(0x2744 + tile * 4);   // CombatTerrain{g_2744}[tile].frame (+0)
const rdLong = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24));        // signed 32
const wrLong = (b, o, v) => { b[o] = v & 0xFF; b[o + 1] = (v >> 8) & 0xFF; b[o + 2] = (v >> 16) & 0xFF; b[o + 3] = (v >> 24) & 0xFF; };
const dsLong = (o) => (ds(o) | (ds(o + 1) << 8) | (ds(o + 2) << 16) | (ds(o + 3) << 24));
const newLine = () => ({ x0: 0, y0: 0, x1: 0, y1: 0, err: 0, adx: 0, ady: 0, incDiag: 0, incStraight: 0, sx: 0, sy: 0, x: 0, y: 0, dist: 0, dir: 0 });

export const SpellHandlers = [];                        // SpellHandlers{g_6B84}[0..67]; [0] set by InitSpellTable

// 8E00:0F4F ApplyToSide(side, msg) — keep only the targets of `side`; Bless in combat also drops targets that have an
// enemy within 1 square. RETF 6.
export async function ApplyToSide(side, msg) {
  msg = msg.slice(0, 40);                                                   // 8e00:0f63  StrAssign(40)
  g.SpellArea = 1;                                                          // 8e00:0f68
  const n = g.SpellTargetCount;                                             // 8e00:0f6d
  for (let k = 1; k <= n; k++) {
    const t = g.SpellTargets[k];                                            // 8e00:0f8d  (nil not tested: the original dereferences)
    if (t.b[SIDE] === byte(side)) {                                         // 8e00:0f96
      if (g.sp_Current === 1 && g.game_Mode === 5 &&                         // 8e00:0f9b / 0fa2  Bless in combat
          (await X.CollectOppositeSideTargets(t, 1)) > 0) g.SpellTargets[k] = null;   // 8e00:0fbf
    } else g.SpellTargets[k] = null;                                        // 8e00:0fc8
  }
  await ApplySpell(g.sp_Current, 0, 0, 0, 0, msg);                          // 8e00:0ffb
}

// 8E00:100F Bless (id 1)
async function Spell_Bless() { await ApplyToSide(g.SelectedChar.b[SIDE], 'is Blessed'); }        // 8e00:102f  CS:1004

// 8E00:1040 Curse (id 2) — the other side: IsSideZero(caster) as a byte
async function Spell_Curse() { await ApplyToSide(b01(await X.IsSideZero(g.SelectedChar)), 'is Cursed'); }   // 8e00:104e / 1064  CS:1036

// 8E00:106B Cure Light Wounds (id 3)
async function Spell_CureLightWounds() {
  if (g.SpellTargetCount === 0) return;                                     // 8e00:106e
  if (await X.HealCharacter(T1(), byte(X.Roll(1, 8)), 0)) await X.ShowHealingResult(T1());   // 8e00:1085 / 108e / 109f
}

// 8E00:10A7 Cause Light Wounds (id 4) — touch spell: ApplySpell makes the attack roll
async function Spell_CauseLightWounds() {
  await ApplySpell(g.sp_Current, 0, 0, byte(X.RollDice(1, 8)), 8, '');     // 8e00:10bd / 10d6  CS:10A6 ''
}

// 8E00:10E9 'is affected' (ids 5, 11, 18, 22, 29: Detect Magic x2, Read Magic, Find Traps, Detect Invisibility)
async function Spell_Affected() { await ApplySpell(g.sp_Current, 0, 0, 0, 0, 'is affected'); }   // 8e00:110f  CS:10DD

// 8E00:1123 'is protected' (ids 6, 7, 16, 17, 52, 53, 54)
async function Spell_Protected() { await ApplySpell(g.sp_Current, 0, 0, 0, 0, 'is protected'); } // 8e00:1149  CS:1116

// 8E00:1162 Resist Cold (id 8)
async function Spell_ResistCold() { await ApplySpell(g.sp_Current, 0, 0, 0, 0, 'is cold-resistant'); }  // 8e00:1188  CS:1150

// 8E00:1190 Burning Hands (id 9) — damage = caster level, type 9 (fire + magic)
async function Spell_BurningHands() {
  await ApplySpell(g.sp_Current, 0, 0, byte(await X.SpellCasterLevel(g.sp_Current)), 9, '');   // 8e00:11a4 / 11bd
}

// 8E00:11DD Charm Person (id 10)
async function Spell_CharmPerson() {
  const t = T1();                                                           // 8e00:11e3
  if (t.b[CREATURE_TYPE] > 1 || t.b[SIZE] > 1) {                            // 8e00:11f3 / 11fe  unsigned
    await X.ShowCharacterMessage(t, 'is unaffected', 0x0A, 1);              // 8e00:1220  CS:11C4
    return;
  }
  const lvl = await X.SpellCasterLevel(g.sp_Current);                       // 8e00:122f
  const p3 = byte((shortint(g.SelectedChar.b[SIDE]) << 7) + byte(lvl));     // 8e00:1238..1246  CBW, shl 7
  await ApplySpell(g.sp_Current, p3, 1, 0, 0, 'is charmed');                // 8e00:1262  CS:11D2
  const e = ref(null);
  if (await X.HasEffect(t, 0x0B, e)) await X.CallEffectHandler(0x0B, T1(), e.v, 0);   // 8e00:1273 / 1290  side switch now
}

// 8E00:12A5 Enlarge (id 12) — strength 18/exc, exc by caster level 1..6
async function Spell_Enlarge() {
  g.g_4844 = 0x12;                                                          // 8e00:12ab  new STR 18
  switch (await X.SpellCasterLevel(g.sp_Current)) {                         // 8e00:12b4
    case 1: g.g_4845 = 0; break;
    case 2: g.g_4845 = 1; break;
    case 3: g.g_4845 = 0x33; break;
    case 4: g.g_4845 = 0x4C; break;
    case 5: g.g_4845 = 0x5B; break;
    case 6: g.g_4845 = 0x64; break;
    default: break;                                                         // quirk: other levels keep the stale g_4845
  }
  const t = T1();
  const old = ref(0);
  if (X.SetStrength(t, g.g_4844, g.g_4845, old))                           // 8e00:130e
    await X.ShowCharacterMessage(t, 'is stronger', 0x0A, 1);                // 8e00:1334  CS:1299
  X.AddEffect(t, 0x0C, await SpellDuration(g.sp_Current), old.v, 1);       // 8e00:1349 / 1354  also when SetStrength failed
}

// 8E00:136E Reduce (id 13) — only undoes Enlarge
async function Spell_Reduce() {
  if (g.SpellTargetCount === 0) return;                                     // 8e00:1374
  if (await X.SavingThrow(T1(), 4, 0)) return;                              // 8e00:1389
  if (await X.CureEffect(T1(), 0x0C))                                       // 8e00:139d
    await X.ShowCharacterMessage(T1(), 'has been reduced', 0x0A, 1);        // 8e00:13c3  CS:135D
}

// 8E00:13D8 Friends (id 14) — CHA + 2d4 (max 25); p3 = old CHA for the undo
async function Spell_Friends() {
  const t = T1();
  const old = t.b[CHA];                                                     // 8e00:13e2
  t.b[CHA] = byte(t.b[CHA] + X.Roll(2, 4));                                // 8e00:13ef / 13f8
  if (t.b[CHA] > 0x19) t.b[CHA] = 0x19;                                     // 8e00:1400  unsigned
  await ApplySpell(g.sp_Current, old, 1, 0, 0, 'is friendly');             // 8e00:1431  CS:13CC
}

// 8E00:1439 Magic Missile (id 15) — n := level shr 1; damage RollDice(n, 4) + n, type 8 (magic)
async function Spell_MagicMissile() {
  const lvl = byte(await X.SpellCasterLevel(g.sp_Current));                 // 8e00:1443
  const n = lvl >>> 1;
  await ApplySpell(g.sp_Current, 0, 0, byte(byte(X.RollDice(n, 4)) + n), 8, '');   // 8e00:1460 / 1486  CS:1438 ''
}

// 8E00:1499 Shield (id 19)
async function Spell_Shield() { await ApplySpell(g.sp_Current, 0, 0, 0, 0, 'is shielded'); }    // 8e00:14bf  CS:148D

// 8E00:14C7 Shocking Grasp (id 20) — damage RollDice(1,8) + level, type 0Ch (electricity + magic), touch
async function Spell_ShockingGrasp() {
  const lvl = byte(await X.SpellCasterLevel(g.sp_Current));                 // 8e00:14db
  await ApplySpell(g.sp_Current, 0, 0, byte(byte(X.RollDice(1, 8)) + lvl), 0x0C, '');   // 8e00:14e9 / 1507  CS:14C6 ''
}

// 8E00:151B Sleep (id 21) — budget 4d4 hit dice; cost by the signed byte +73h (fix #verify-2)
async function Spell_Sleep() {
  g.SpellArea = 1;                                                          // 8e00:1521
  g.g_4844 = byte(X.Roll(4, 4));                                            // 8e00:152c / 1531
  const n = g.SpellTargetCount;                                             // 8e00:1534
  for (let k = 1; k <= n; k++) {
    const t = g.SpellTargets[k];                                            // 8e00:1557
    const lv = S8(t.b, LVL_MAIN);                                           // 8e00:155b
    if (lv >= 0 && lv <= 1) g.g_4845 = 1;                                   // 8e00:1561 / 1565  JL / JG
    else if (lv === 2) g.g_4845 = 2;
    else if (lv === 3) g.g_4845 = 4;
    else if (lv === 4) g.g_4845 = 6;
    else if (lv === 5) g.g_4845 = t.b[RACE] === 0 ? 0x0A : 0x14;           // 8e00:15a2  race 0 (monster) 10, else 20
    else g.g_4845 = 0x14;                                                   // 8e00:15b7  incl. negative values
    const e = ref(null);
    if (t.b[STATUS] !== 1 &&                                                // 8e00:15cb  not Animated
        !(await X.HasEffect(t, 0x35, e)) &&                                 // 8e00:15ee
        g.g_4844 >= g.g_4845) {                                             // 8e00:15fa  unsigned
      g.g_4844 = byte(g.g_4844 - g.g_4845);                                 // 8e00:1603
    } else g.SpellTargets[k] = null;                                        // 8e00:1614
  }
  await ApplySpell(g.sp_Current, 0, 0, 0, 0, 'falls asleep');               // 8e00:1649  CS:150E
}

// 8E00:1658 Hold Person (ids 23 cleric, 49 magic-user)
async function Spell_HoldPerson() {
  let bonus;                                                                // [bp-7]
  const cnt = g.SpellTargetCount;                                           // 8e00:165e
  if (cnt === 1) bonus = g.sp_Current === 0x17 ? -2 : -3;                   // 8e00:1665  FEh / FDh
  else if (cnt === 2) bonus = -1;                                           // 8e00:167c
  else if (cnt === 3 || cnt === 4) bonus = 0;                               // 8e00:168a
  else bonus = 0;                                                           // TODO(decode): garbage — [bp-7] is uninitialised for count 0 or >= 5
  if (cnt < 1) return;                                                      // 8e00:1691
  for (let k = cnt; k >= 1; k--) {                                          // 8e00:1698 .. 17ca  downto 1
    const t = g.SpellTargets[k];
    if (!t) continue;                                                       // 8e00:16ab
    if (k < g.SpellTargetCount) {                                           // 8e00:16d4  every target but the first processed
      await X.SetSoundTimerMode(0);                                         // 8e00:16dd
      await X.PlayOrStopSound(g.g_2618);                                    // 8e00:16e6
      await X.BuildFourAnimationFrames(0x12);                               // 8e00:16ee
      await X.AnimateAlongPath(await X.CombatantCol(g.SelectedChar), await X.CombatantRow(g.SelectedChar),
        await X.CombatantCol(t), await X.CombatantRow(t), 4, 0x1E);        // 8e00:16fb .. 172d
      await X.SetSoundTimerMode(10);                                        // 8e00:1736
    }
    let saved = b01(await X.SavingThrow(t, tbl(g.sp_Current, 9), bonus));   // 8e00:1755  saveType = tbl +9
    if (t.b[CREATURE_TYPE] > 1 || t.b[SIZE] > 1) saved = 1;                 // 8e00:1760 / 176b  immune
    await X.ApplyEffect(t, tbl(g.sp_Current, 0x0A), await SpellDuration(g.sp_Current),
      byte(await X.SpellCasterLevel(g.sp_Current)), 0, tbl(g.sp_Current, 8), saved, 'is held');   // 8e00:1791 / 1799 / 17c5  CS:1650
  }
}

// 8E00:17E9 Resist Fire (id 24)
async function Spell_ResistFire() { await ApplySpell(g.sp_Current, 0, 0, 0, 0, 'is fire resistant'); }   // 8e00:180f  CS:17D7

// 8E00:1822 Silence 15' Radius (id 25)
async function Spell_Silence() { await ApplySpell(g.sp_Current, 0, 0, 0, 0, 'is silenced'); }   // 8e00:1848  CS:1816

// 8E00:185B Slow Poison (id 26)
async function Spell_SlowPoison() {
  const t = T1();                                                           // 8e00:1861
  if (t.b[STATUS] === 1) { g.SpellTargets[1] = null; return; }             // 8e00:1871  Animated: nothing
  const e = ref(null);
  if (!(await X.HasEffect(t, 0x37, e))) return;                             // 8e00:1891  not poisoned
  if (t.b[HP] === 0) t.b[HP] = 1;                                           // 8e00:189d
  await ApplySpell(g.sp_Current, 0xFF, 1, 0, 0, 'is affected');             // 8e00:18ce  CS:184F
  await X.CallEffectHandler(0x4E, t, null, 1);                              // 8e00:18e3
  X.AddEffect(t, 0x0F, 10, 0xFF, 1);                                        // 8e00:18fb
}

// 8E00:190F Snake Charm (id 27) — snakes (creature type 0Eh) up to the caster's hit points
async function Spell_SnakeCharm() {
  g.g_4844 = g.SelectedChar.b[HP];                                          // 8e00:1919
  g.SpellTargetCount = 0;                                                   // 8e00:1921
  for (let c = g.PartyHead; c; c = c.next) {                                // 8e00:1926 .. 1999  (monsters are in the list)
    if (c.b[CREATURE_TYPE] === 0x0E && g.g_4844 >= c.b[HP]) {               // 8e00:193e / 194c
      g.g_4844 = byte(g.g_4844 - c.b[HP]);                                  // 8e00:1964
      g.SpellTargetCount = byte(g.SpellTargetCount + 1);                    // 8e00:1969
      g.SpellTargets[g.SpellTargetCount] = c;                               // 8e00:197e
    }
  }
  await ApplySpell(g.sp_Current, 0, 0, 0, 0, 'is charmed');                 // 8e00:19bb  CS:1904
}

// 8E00:19C3 Spiritual Hammer (id 28)
async function Spell_SpiritualHammer() {
  await ApplySpell(g.sp_Current, 0, 1, 0, 0, '');                           // 8e00:19e9  CS:19C2 ''
  await X.CallEffectHandler(0x17, T1(), null, 0);                           // 8e00:1a00  creates the hammer (COMBAT)
}

// 8E00:1A16 Invisibility (ids 30, 50)
async function Spell_Invisibility() { await ApplySpell(g.sp_Current, 0, 0, 0, 0, 'is invisible'); }   // 8e00:1a3c  CS:1A09

// 8E00:1A4F Knock (id 31)
async function Spell_Knock() { await ApplySpell(g.sp_Current, 0, 0, 0, 0, 'Knock-Knock'); }     // 8e00:1a75  CS:1A43

// 8E00:1A8A Mirror Image (id 32) — p3 = number of images 1d4
async function Spell_MirrorImage() {
  await ApplySpell(g.sp_Current, byte(X.Roll(1, 4)), 0, 0, 0, 'is duplicated');   // 8e00:1a9a / 1ab9  CS:1A7C
}

// 8E00:1ACC Ray of Enfeeblement (id 33)
async function Spell_RayOfEnfeeblement() { await ApplySpell(g.sp_Current, 0, 0, 0, 0, 'is weakened'); }   // 8e00:1af2  CS:1AC0

// 8E00:1B11 Spell_StinkingCloud (id 34) — 2x2 cloud squares around the aim square
export async function Spell_StinkingCloud() {
  g.SpellArea = 1;                                                          // 8e00:1b17
  const lvl = byte(await X.SpellCasterLevel(g.sp_Current));                 // 8e00:1b20
  let n = 0;                                                                // [bp-0Eh] clouds of this caster
  const newRec = () => ({ caster: null, next: null, b: new Uint8Array(0x13) });
  let r = g.sc_List;                                                        // 8e00:1b2c
  if (!r) { g.sc_List = newRec(); r = g.sc_List; }                          // 8e00:1b39 / 1b46
  else {
    while (r.next) {                                                        // 8e00:1b61  quirk: the last record is never counted
      if (r.caster === g.SelectedChar) n = byte(n + 1);                     // 8e00:1b71 / 1b84
      r = r.next;
    }
    r.next = newRec(); r = r.next;                                          // 8e00:1b9e
  }
  r.caster = null; r.next = null; r.b.fill(0);                              // 8e00:1bcb  FillChar(r^, 13h, 0)
  X.AddEffect(g.SelectedChar, 0x28, lvl, byte(lvl + n * 16), 1);            // 8e00:1bf7  removing it removes the cloud
  r.caster = g.SelectedChar;                                                // 8e00:1c06
  r.b[0x12] = n;                                                            // 8e00:1c13
  r.b[0x10] = g.SpellX;  r.b[0x11] = g.SpellY;                              // 8e00:1c1d / 1c27
  const occ = [0, 0, 0, 0, 0];                                              // [bp-0Dh + k]
  const dX = (d) => shortint(ds(0x2736 + d)), dY = (d) => shortint(ds(0x273F + d));   // step tables g_2736 / g_273F
  for (let k = 1; k <= 4; k++) {                                            // 8e00:1c2b
    const d = ds(0x290D + k);                                               // 8e00:1c3b  g_290D[k] square offsets
    const x = shortint(g.SpellX) + dX(d), y = shortint(g.SpellY) + dY(d);
    const o = ref(0), tl = ref(0);
    await X.CellAt(x, y, o, tl);                                            // 8e00:1c7d
    occ[k] = o.v;
    let tile = tl.v;
    r.b[0x0B + k] = (tile > 0 && terrainFrame(tile) < 0xFF) ? 1 : 0;        // 8e00:1c82 .. 1cb5  placed
    if (tile === 0x1E) {                                                    // 8e00:1cba  already cloud ground: take the tile saved by the older cloud
      for (let q = g.sc_List; q; q = q.next) {                              // 8e00:1cc3
        if (q === r) continue;                                              // 8e00:1ce1
        for (let j = 1; j <= 4; j++) {                                      // 8e00:1cee
          if (q.b[0x0B + j] === 0) continue;                                // 8e00:1d01
          const dj = ds(0x290D + j);
          if (shortint(q.b[0x10]) + dX(dj) === x && shortint(q.b[0x11]) + dY(dj) === y && q.b[7 + j] !== 0x1E)   // 8e00:1d41 / 1d7b / 1d89
            tile = q.b[7 + j];                                              // 8e00:1d9e  (last match wins)
        }
      }
    } else if (tile === 0x1F) {                                             // 8e00:1dc1  corpse: take its ground tile
      for (let j = 1; j <= g.BodyCount; j++) {                              // 8e00:1dca
        const bd = g.BodyList[j];
        if (shortint(bd.x) === x && shortint(bd.y) === y) tile = bd.ground;  // 8e00:1e06 / 1e31 / 1e45
      }
    }
    r.b[7 + k] = tile;                                                      // 8e00:1e5d
    if (r.b[0x0B + k] !== 0) g.cm_Map.b[7 + y * 50 + x] = 0x1E;             // 8e00:1e6b / 1ea9  cloud ground
  }
  await X.ShowCharacterMessage(g.SelectedChar, 'Creates a noxious cloud', 0x0A, 0);   // 8e00:1ed4  CS:1AF9
  await X.FocusSquare(g.SpellX, g.SpellY, 0xFF, 8);                         // 8e00:1ee7
  await X.MessageDelay();                                                   // 8e00:1eec
  await X.ClearCharacterMessage();                                          // 8e00:1ef1
  for (let k = 1; k <= 4; k++)
    if (occ[k] > 0) await X.StinkingCloudCheck(g.cb_Char[occ[k]]);          // 8e00:1f06 / 1f26
}

// 8E00:1F41 Spell_Strength (id 35)
export async function Spell_Strength() {
  let exc = 0;                                                              // 8e00:1f47
  const t = T1();
  let roll = 0;                                                             // TODO(decode): garbage — [bp-6] uninitialised when no class level > 0
  if (S8(t.b, LEVEL + 5) > 0) roll = X.Roll(1, 4);                         // 8e00:1f5b / 1f69  magic-user
  if (S8(t.b, LEVEL + 0) > 0 || S8(t.b, LEVEL + 6) > 0) roll = X.Roll(1, 6);   // 8e00:1f74 / 1f7f / 1f8d  cleric or thief
  if (S8(t.b, LEVEL + 2) > 0) roll = X.Roll(1, 8);                         // 8e00:1f98 / 1fa6  fighter (later tests win)
  let s = byte(t.b[STR] + byte(roll));                                      // 8e00:1fc0
  if (s > 0x12) {                                                           // 8e00:1fc3  unsigned
    if (S8(t.b, LEVEL + 2) > 0) {                                           // 8e00:1fcc
      exc = byte(t.b[STR_EXC] + byte((s - 0x12) * 10));                     // 8e00:1fd9 .. 1fee
      if (exc > 0x64) exc = 0x64;                                           // 8e00:1ff1
    }
    s = 0x12;                                                               // 8e00:1ffb / 2001
  }
  const old = ref(0);
  if (X.SetStrength(t, s, exc, old))                                        // 8e00:2018
    await X.ShowCharacterMessage(t, 'is stronger', 0x0A, 1);                // 8e00:203c  CS:1F35
  X.AddEffect(t, 0x26, await SpellDuration(g.sp_Current), old.v, 1);       // 8e00:204f / 205a
}

// 8E00:206F Spell_AnimateDead (id 36) — raise dead non-monster corpses (budget = caster level)
export async function Spell_AnimateDead() {
  g.SpellArea = 1;                                                          // 8e00:2075
  let budget = byte(await X.SpellCasterLevel(g.sp_Current));                // 8e00:207e
  g.SpellTargetCount = 0;                                                   // 8e00:2086
  for (let c = g.PartyHead; c && budget > 0; c = c.next) {                  // 8e00:2098 / 20a3
    if (c.b[STATUS] !== 6 || c.b[CREATURE_TYPE] !== 0) continue;           // 8e00:20af / 20bd  Dead, human/demi-human
    if (!(await X.PlaceCombatant(c, await X.CombatantCol(c), await X.CombatantRow(c), 1))) continue;   // 8e00:20e9
    const p3 = byte((shortint(c.b[SIDE]) << 4) + byte(await X.SpellCasterLevel(g.sp_Current)));   // 8e00:20f9 .. 210f
    c.b[SIDE] = g.SelectedChar.b[SIDE];                                     // 8e00:2120
    c.b[QUICK] = 1;                                                         // 8e00:2128  computer-controlled
    c.b[TURN_CLASS] = 2;                                                    // 8e00:2131  +76h (undead turning class)
    c.b[FIGHTER_LVL_EFF] = 0;                                               // 8e00:2139
    c.b[BASE_MOVE] = 6;                                                     // 8e00:2141
    for (let i = 0; i <= 0x14; i++) c.b[MEM_SPELL + i] = 0;                // 8e00:2146 .. 2162
    c.b[NPC_FLAGS] = c.b[NPC_FLAGS] > 0x7F ? 0xB2 : 0xB3;                   // 8e00:2167 .. 217d
    c.b[CREATURE_TYPE] = 4;                                                 // 8e00:2186
    if (g.game_Mode === 5) {                                                // 8e00:218c
      c.combat.b[0x0A] = 0; c.combat.b[0x0B] = 0;                           // 8e00:219d  combat record word +0Ah
      c.combat.b[0x0C] = 0; c.combat.b[0x0D] = 0;                           // 8e00:21a1  word +0Ch
    }
    budget = byte(budget - 1);                                              // 8e00:21a5
    if (await X.ReviveCombatant(c, c.b[HP_MAX])) {                          // 8e00:21b6
      await X.ApplyEffect(c, 0x20, 0, p3, 1, 0, 0, 'is animated');          // 8e00:21e7  CS:2063
      c.b[STATUS] = 1;                                                      // 8e00:21ef  Animated
    }
  }
}

// 8E00:2217 Cure Blindness (id 37)
async function Spell_CureBlindness() {
  if (await X.CureEffect(T1(), 0x21))                                       // 8e00:2228
    await X.ShowCombatMessageAnimation(T1(), 1, 'can see');                 // 8e00:224b  CS:220F
}

// 8E00:225D Cause Blindness (id 38)
async function Spell_CauseBlindness() { await ApplySpell(g.sp_Current, 0, 0, 0, 0, 'is blind'); }   // 8e00:2283  CS:2254

// 8E00:228A Spell_CureDisease: Boolean — the disease effect set (as the temple, ov04)
export async function Spell_CureDisease() {
  let any = 0;                                                              // 8e00:2290
  g.cure_InProgress = 1;                                                    // 8e00:2294
  if (await X.CureEffect(T1(), 0x22)) any = 1;                              // 8e00:22a4
  if (await X.CureEffect(T1(), 0x2B)) {                                     // 8e00:22bc
    any = 1;
    await X.RemoveEffect(T1(), 0x2C, null);                                 // 8e00:22da
    await X.RemoveEffect(T1(), 0x1F, null);                                 // 8e00:22f0
  }
  if (await X.CureEffect(T1(), 0x32)) {                                     // 8e00:2300
    any = 1;
    await X.RemoveEffect(T1(), 0x39, null);                                 // 8e00:231e
  }
  g.cure_InProgress = 0;                                                    // 8e00:2323
  return any !== 0;
}

// 8E00:232F Cure Disease (id 39) — result discarded
async function Spell_CureDiseaseHandler() { await Spell_CureDisease(); }   // 8e00:2336

// 8E00:234C Cause Disease (id 40)
async function Spell_CauseDisease() { await ApplySpell(g.sp_Current, 0, 1, 0, 0, 'is diseased'); }   // 8e00:2372  CS:2340

// 8E00:2385 Spell_DispelMagic (ids 41, 46)
export async function Spell_DispelMagic() {
  g.SpellArea = 1;                                                          // 8e00:238b
  const lvl = byte(await X.SpellCasterLevel(g.sp_Current));                 // 8e00:2394
  const n = g.SpellTargetCount;                                             // 8e00:239c
  for (let k = 1; k <= n; k++) {                                            // 8e00:23ac
    let dispelled = 0;                                                      // 8e00:23b4
    const t = T1();                                                         // 8e00:23b8  quirk: always SpellTargets[1]
    let e = t.effects;                                                      // 8e00:23c5
    while (e) {                                                             // 8e00:23d7
      const nx = e.next;                                                    // 8e00:23e2
      if (e.b[E_P3] < 0xFF) {                                               // 8e00:23f6
        g.g_4845 = e.b[E_P3] & 0x0F;                                        // 8e00:2407  caster level stored by ApplySpell
        if (lvl > g.g_4845) g.g_4844 = byte((lvl - g.g_4845) * 5 + 0x32);   // 8e00:240f .. 242e
        else if (lvl < g.g_4845) g.g_4844 = byte(0x32 - (g.g_4845 - lvl) * 2);   // 8e00:2436 .. 2453
        else g.g_4844 = 0x32;                                               // 8e00:2458
        if (X.Roll(1, 100) <= g.g_4844) {                                   // 8e00:2463 / 2468  unsigned
          await X.RemoveEffect(t, e.b[E_TYPE], e);                          // 8e00:2481
          dispelled = 1;
        }
      }
      e = nx;
    }
    if (dispelled) await X.ShowCombatMessageAnimation(t, 1, 'is affected'); // 8e00:24b7  CS:2379
  }
}

// 8E00:24D6 Prayer (id 42) — p3 = caster side*16 + level
async function Spell_Prayer() {
  const lvl = byte(await X.SpellCasterLevel(g.sp_Current));                 // 8e00:24e4
  const p3 = byte((shortint(g.SelectedChar.b[SIDE]) << 4) + lvl);           // 8e00:24f1 .. 24fb
  await ApplySpell(g.sp_Current, p3, 0, 0, 0, 'is praying');                // 8e00:2517  CS:24CB
}

// 8E00:2540 Remove Curse (id 43; also stub ov22 e9, temple)
export async function Spell_RemoveCurse() {
  if (await X.CureEffect(T1(), 0x24)) {                                     // 8e00:2551
    await X.ShowCombatMessageAnimation(T1(), 1, 'is un-cursed');            // 8e00:2574  CS:251E
    return;
  }
  let done = 0;                                                             // 8e00:257b
  for (let it = T1().items; it && !done; it = it.next) {                    // 8e00:257f .. 25c8
    if (it.b[0x36] !== 0) { done = 1; it.b[0x36] = 0; }                     // 8e00:25a4 / 25b2  item +36h cursed
  }
  if (done) await X.ShowCombatMessageAnimation(T1(), 1, "'s item is un-cursed");   // 8e00:25ea  CS:252B
}

// 8E00:2604 Bestow Curse (id 44)
async function Spell_BestowCurse() { await ApplySpell(g.sp_Current, 0, 0, 0, 0, 'has been cursed!'); }   // 8e00:262a  CS:25F3

// 8E00:263D Blink (id 45)
async function Spell_Blink() { await ApplySpell(g.sp_Current, 0, 0, 0, 0, 'is blinking'); }     // 8e00:2663  CS:2631

// 8E00:266B Spell_Fireball (ids 47 spell, 64 wand)
export async function Spell_Fireball() {
  g.SpellArea = 1;                                                          // 8e00:2671
  let lvl;
  if (g.sp_Current === 0x40) lvl = byte(X.Roll(1, 3) * 2 + 1);             // 8e00:2683 .. 268d  wand: 3, 5 or 7 dice
  else lvl = byte(await X.SpellCasterLevel(g.sp_Current));                  // 8e00:2696
  if (word(g.ecl_Mem4900[0x1CC >> 1]) === 0) {                              // 8e00:26a2  ECL word 49E6h (3D-area flag) = 0
    await X.BuildTargetList(g.SpellX, g.SpellY, 2, 0xFF, 1, g.cm_Map);      // 8e00:26c4  radius 2
    const n = g.tg_Count;                                                   // 8e00:26c9
    for (let k = 1; k <= n; k++) g.SpellTargets[k] = g.cb_Char[g.tg_List[k].who];   // 8e00:26e3 .. 270e
    g.SpellTargetCount = g.tg_Count;                                        // 8e00:271d
  }
  await X.FocusSquare(g.SpellX, g.SpellY, 0, 8);                            // 8e00:272e
  await ApplySpell(g.sp_Current, 0, 0, byte(X.RollDice(lvl, 6)), 9, '');   // 8e00:2744 / 275d  fire + magic
}

// 8E00:2764 HasteSlow(cancels, side, msg) — RETF 8
export async function HasteSlow(cancels, side, msg) {
  msg = msg.slice(0, 40);                                                   // 8e00:2778
  g.SpellArea = 1;                                                          // 8e00:277d
  let budget = byte(await X.SpellCasterLevel(g.sp_Current));                // 8e00:2786
  const n = g.SpellTargetCount;                                             // 8e00:278e
  for (let k = 1; k <= n; k++) {
    const t = g.SpellTargets[k];
    if (t.b[SIDE] === byte(side) && budget > 0) {                           // 8e00:27b5 / 27bf
      budget = byte(budget - 1);                                            // 8e00:27c5
      if (await X.CureEffect(t, cancels)) g.SpellTargets[k] = null;         // 8e00:27df  Haste cancels Slow and vice versa
    } else g.SpellTargets[k] = null;                                        // 8e00:27ff
  }
  await ApplySpell(g.sp_Current, 0, 0, 0, 0, msg);                          // 8e00:2832
  const m = g.SpellTargetCount;
  for (let k = 1; k <= m; k++)
    if (g.SpellTargets[k]) await X.CallEffectHooks(0x12, g.SpellTargets[k]);   // 8e00:2855 / 2875
}

// 8E00:2892 Haste (id 48)
async function Spell_Haste() { await HasteSlow(0x2A, g.SelectedChar.b[SIDE], 'is Hasted'); }    // 8e00:28b5  CS:2888

// 8E00:28BC BoltHitSquare(col, row, dmg, saveType, var wall) — RETF 0Ch
export async function BoltHitSquare(col, row, dmg, saveType, wall) {
  wall.v = 0;                                                               // 8e00:28c5
  const occ = ref(0), tile = ref(0);
  await X.CellAt(col, row, occ, tile);                                      // 8e00:28db
  if (tile.v > 0 && terrainFrame(tile.v) === 0xFF) wall.v = 1;              // 8e00:28e0 / 28f1
  if (occ.v > 0) {                                                          // 8e00:28ff
    const c = g.cb_Char[occ.v];                                             // 8e00:2910
    g.DamageType = 0x0C;                                                    // 8e00:291e
    const saved = await X.SavingThrow(c, saveType, 0);                      // 8e00:293d
    await X.DamageCharacter(c, dmg, 2, saved);                              // 8e00:2943  save for half
    await X.BuildFourAnimationFrames(0x13);                                 // 8e00:294b
    g.DamageType = 0;                                                       // 8e00:2950
  }
}

// 8E00:295B LightningBolt(length, dmg, saveType, mayBounce) — RETF 8
export async function LightningBolt(length, dmg, saveType, mayBounce) {
  await X.BuildFourAnimationFrames(0x13);                                   // 8e00:2964
  const occAimR = ref(0), tileR = ref(0);
  await X.CellAt(g.SpellX, g.SpellY, occAimR, tileR);                       // 8e00:297b
  let prevOcc = occAimR.v;                                                  // [bp-3Dh]
  let dirSign = 1;                                                          // 8e00:2980  [bp-39h]
  const cx = byte(await X.CombatantCol(g.SelectedChar));                    // 8e00:298c
  const cy = byte(await X.CombatantRow(g.SelectedChar));                    // 8e00:299c
  let bounce = byte(mayBounce);                                             // 8e00:29a7  [bp-3Ch]
  if (cx === g.SpellX && cy === g.SpellY) return;                           // 8e00:29ad / 29b6  aimed at the caster
  let left = byte(length * 2);                                              // 8e00:29c6  half-squares
  g.SpellArea = 1;                                                          // 8e00:29c9
  while (left > 0) {                                                        // 8e00:29ce
    const L = newLine();                                                    // 8e00:29e3  FillChar(L, 1Ah, 0)
    L.x0 = shortint(g.SpellX);  L.y0 = shortint(g.SpellY);
    L.x1 = integer((shortint(g.SpellX) - shortint(cx)) * dirSign * left + shortint(g.SpellX));   // 8e00:2a0d .. 2a1b
    L.y1 = integer((shortint(g.SpellY) - shortint(cy)) * dirSign * left + shortint(g.SpellY));   // 8e00:2a35 .. 2a43
    await X.LineInit(L);                                                    // 8e00:2a4b
    let wall;
    do {                                                                    // 8e00:2a50
      const sx = byte(L.x), sy = byte(L.y);                                 // segment start
      const occ = ref(0), tl = ref(0);
      if (!(L.x0 === L.x1 && L.y0 === L.y1)) {                              // 8e00:2a5c / 2a64
        for (;;) {
          const stepped = await X.LineStep(L);                              // 8e00:2a71
          await X.CellAt(byte(L.x), byte(L.y), occ, tl);                    // 8e00:2a8b
          if (!stepped) break;                                              // 8e00:2a90
          if (occ.v > 0 && occ.v !== prevOcc) break;                        // 8e00:2a96 / 2a9f  another occupant
          if (tl.v === 0) break;                                            // 8e00:2aa4  off the map
          if (terrainFrame(tl.v) > 1) break;                                // 8e00:2ab5
          if (!(byte(L.dist) < left)) break;                                // 8e00:2abc  unsigned
        }
      }
      prevOcc = occ.v;                                                      // 8e00:2ac7
      if (tl.v === 0) left = 0;                                             // 8e00:2aca
      await X.AnimateAlongPath(sx, sy, byte(L.x), byte(L.y), 4, 0x32);      // 8e00:2aea
      const w = ref(0);
      await BoltHitSquare(byte(L.x), byte(L.y), dmg, saveType, w);          // 8e00:2b05
      wall = w.v;
      if (wall) {                                                           // 8e00:2b08  bounce off the wall
        g.SpellX = byte(L.x);  g.SpellY = byte(L.y);                        // 8e00:2b11 / 2b17
        const L2 = newLine();                                               // 8e00:2b26
        L2.x0 = shortint(g.SpellX); L2.y0 = shortint(g.SpellY); L2.x1 = shortint(cx); L2.y1 = shortint(cy);
        await X.LineInit(L2);                                               // 8e00:2b4c
        while (await X.LineStep(L2)) { /* measure the distance back to the caster */ }   // 8e00:2b56
        if (bounce && byte(L2.dist) <= 8) L.dist = byte(L.dist + 8);        // 8e00:2b61 .. 2b6d  close bounce costs 8 more
        dirSign = -dirSign;                                                 // 8e00:2b71 .. 2b7b
        bounce = 0;  prevOcc = 0;                                           // 8e00:2b7e / 2b82
      }
      if (byte(L.dist) < left) left = byte(left - byte(L.dist));            // 8e00:2b86 / 2b91  quirk: cumulative dist of this line
      else left = 0;                                                        // 8e00:2b96
    } while (!wall && left !== 0);                                          // 8e00:2b9a / 2ba0  continue the same line
  }
  g.SpellArea = 0;                                                          // 8e00:2bac
}

// 8E00:2BB7 Lightning Bolt (id 51) — Roll(level, 6) on the aim square, then the bolt of length 8
async function Spell_LightningBolt() {
  const dmg = byte(X.Roll(byte(await X.SpellCasterLevel(g.sp_Current)), 6));   // 8e00:2bc1 / 2bca
  const w = ref(0);
  await BoltHitSquare(g.SpellX, g.SpellY, dmg, 4, w);                       // 8e00:2be7
  await LightningBolt(8, dmg, 4, 1);                                        // 8e00:2bf8
}

// 8E00:2C09 Slow (id 55) — the other side
async function Spell_Slow() { await HasteSlow(0x27, b01(await X.IsSideZero(g.SelectedChar)), 'is Slowed'); }   // 8e00:2c1a / 2c30  CS:2BFF

// 8E00:2C43 Spell_Restoration (id 56) — undo one drained level
export async function Spell_Restoration() {
  const t = T1();                                                           // 8e00:2c49
  if (!(t.b[DRAIN_LEVELS] > 0)) return;                                     // 8e00:2c59
  const n = byte(Math.trunc(t.b[DRAIN_HP] / t.b[DRAIN_LEVELS]));            // 8e00:2c78  IDIV, byte result
  t.b[HP_MAX] = byte(t.b[HP_MAX] + n);                                      // 8e00:2c83
  t.b[HP] = byte(t.b[HP] + n);                                              // 8e00:2c8d
  t.b[HP_ROLLED] = byte(t.b[HP_ROLLED] + n);                                // 8e00:2c98
  t.b[DRAIN_HP] = byte(t.b[DRAIN_HP] - n);                                  // 8e00:2ca3
  t.b[DRAIN_LEVELS] = byte(t.b[DRAIN_LEVELS] - 1);                          // 8e00:2caa
  let pickLvl = 0x0D;                                                       // 8e00:2cae
  let thresh = 0x00989680;                                                  // 8e00:2cb2 / 2cb7  10 000 000
  let pick = 0;                                                             // TODO(decode): garbage — [bp-0Ch] is uninitialised when no class qualifies
  for (let j = 0; j <= 7; j++) {                                            // 8e00:2cbc .. 2d86
    const lv = S8(t.b, LEVEL + j);                                          // 8e00:2cce
    if (!(lv > 0 && lv <= shortint(pickLvl))) continue;                     // 8e00:2cd6 / 2ce2  signed
    const T = dsLong(0x409B + j * 0x38 + (lv + 1) * 4);                     // 8e00:2cea .. 2d0c  next-level XP (LongInt)
    if (!(T > 0)) continue;                                                 // 8e00:2d03 .. 2d11
    if (!(T < thresh)) continue;                                            // 8e00:2d34 .. 2d3e  signed
    if (await X.RacialLevelLimitReached(t, j)) continue;                    // 8e00:2d4a
    pickLvl = lv;  pick = j;  thresh = T;                                   // 8e00:2d56 .. 2d83
  }
  t.b[LEVEL + pick] = byte(t.b[LEVEL + pick] + 1);                          // 8e00:2d98
  if (rdLong(t.b, XP) < thresh) wrLong(t.b, XP, thresh);                    // 8e00:2daa .. 2dc4  signed
  await X.UpdateLevelStats(t);                                              // 8e00:2dcf  ov23 e1
  await X.ShowCharacterMessage(t, 'is restored', 0x0A, 1);                  // 8e00:2def  CS:2C37
}

// 8E00:2E02 item power 57 (speed) — unless it cancels Slow
async function Spell_Speed() {
  if (await X.CureEffect(T1(), 0x2A)) return;                               // 8e00:2e13
  await ApplySpell(g.sp_Current, 0, 0, 0, 0, 'is Speedy');                  // 8e00:2e3c  CS:2DF8
}

// 8E00:2E4D item power 58 (neutralise / heal)
async function Spell_NeutraliseHeal() {
  if (await X.CureEffect(T1(), 0x37)) {                                     // 8e00:2e5e  poison
    g.cure_InProgress = 1;                                                  // 8e00:2e67
    await X.RemoveEffect(T1(), 0x16, null);                                 // 8e00:2e7d
    g.cure_InProgress = 0;                                                  // 8e00:2e82
    return;
  }
  if (await Spell_CureDisease()) return;                                    // 8e00:2e8a
  if (await X.HealCharacter(T1(), byte(X.Roll(1, 4) + 8), 0))              // 8e00:2e9f / 2ead
    await X.ShowCombatMessageAnimation(T1(), 1, 'is Healed');               // 8e00:2ed0  CS:2E43
}

// 8E00:2EE5 item power 59 (strength 21)
async function Spell_ItemStrength() {
  const old = ref(0);
  if (X.SetStrength(T1(), 0x15, 0, old))                                    // 8e00:2efe
    await X.ShowCharacterMessage(T1(), 'is stronger', 0x0A, 1);             // 8e00:2f24  CS:2ED9
  X.AddEffect(T1(), 0x26, await SpellDuration(g.sp_Current), old.v, 1);    // 8e00:2f39 / 2f44  SpellDuration(sp_Current) (= 3Bh for this power)
}

// 8E00:2F4D item power 60 (lightning, wand / monster) — 1d6+20 on the aim square, bolt of length 3 with 20 damage
async function Spell_ItemLightning() {
  const w = ref(0);
  await BoltHitSquare(g.SpellX, g.SpellY, byte(X.Roll(1, 6) + 0x14), 4, w);   // 8e00:2f61 / 2f75
  await LightningBolt(3, 0x14, 4, 0);                                       // 8e00:2f85
}

// 8E00:2F99 item power 61 (paralysis)
async function Spell_Paralysis() { await ApplySpell(g.sp_Current, 0, 0, 0, 0, 'is paralyzed'); }   // 8e00:2fbf  CS:2F8C

// 8E00:2FD0 item power 62 (potion of healing) — 2d4+2
async function Spell_PotionHealing() {
  if (await X.HealCharacter(T1(), byte(X.Roll(2, 4) + 2), 0))              // 8e00:2fe4 / 2ff1
    await X.ShowCombatMessageAnimation(T1(), 1, 'is Healed');               // 8e00:3014  CS:2FC6
}

// 8E00:302A item power 63 (invisibility)
async function Spell_ItemInvisibility() { await ApplySpell(g.sp_Current, 0, 0, 0, 0, 'is invisible'); }   // 8e00:3050  CS:301D

// 8E00:3058 item power 65 (magic missile, wand) — RollDice(2,4)+2
async function Spell_WandMagicMissile() {
  await ApplySpell(g.sp_Current, 0, 0, byte(X.RollDice(2, 4) + 2), 8, '');   // 8e00:306e / 308b  CS:3057 ''
}

// 8E00:3092 item power 66 — empty
async function Spell_None() {}                                              // 8e00:3092

// 8E00:30A2 item power 67 (reading) — p3 FFh, callOnRemove 1
async function Spell_Reading() { await ApplySpell(g.sp_Current, 0xFF, 1, 0, 0, 'is Reading'); }   // 8e00:30c8  CS:3097

// 8E00:30D9 BreathWeapon(c, e, mode) — effect handler of type 58h (g_6988, set by InitSpellTable). RETF 0Ah.
export async function BreathWeapon(c, e, mode) {
  if (g.CombatRound !== 0 && X.Roll(1, 100) <= 0x32) return;               // 8e00:30df / 30ec / 30f1
  const cx = byte(await X.CombatantCol(c));                                 // 8e00:30fe
  const cy = byte(await X.CombatantRow(c));                                 // 8e00:310c
  await X.ShowCharacterMessage(c, 'Breathes!', 0x0A, 1);                    // 8e00:312f  CS:30CF
  const aimed = { get v() { return g.g_70C6; }, set v(x) { g.g_70C6 = x; } };
  await SpellHandlers[0](0x33, 1, aimed);                                   // 8e00:313f  aim as for Lightning Bolt (var g_70C6)
  g.SpellX = byte(shortint(cx) + (await X.Sign(shortint(g.SpellX) - shortint(cx))));   // 8e00:3150 / 315d
  g.SpellY = byte(shortint(cy) + (await X.Sign(shortint(g.SpellY) - shortint(cy))));   // 8e00:316d / 317a
  if (shortint(g.SpellX) === shortint(cx) + 1) g.SpellX = byte(g.SpellX + 1);   // 8e00:3188  quirk: only the +1 direction
  if (shortint(g.SpellY) === shortint(cy) + 1) g.SpellY = byte(g.SpellY + 1);   // 8e00:319b  steps one more square
  await X.ov24_0FD2(c);                                                     // 8e00:31a9  BreakInvisibility
  await X.BuildFourAnimationFrames(0x13);                                   // 8e00:31b1
  await X.AnimateAlongPath(cx, cy, g.SpellX, g.SpellY, 4, 0x32);            // 8e00:31cc
  const w = ref(0);
  await BoltHitSquare(g.SpellX, g.SpellY, c.b[HP_MAX], 3, w);               // 8e00:31ea  damage = breather's max hp, save 3 (breath)
  await LightningBolt(0x0A, c.b[HP_MAX], 3, 0);                             // 8e00:31ff
  if (e.b[E_P3] > 0xFD) e.b[E_P3] = byte(e.b[E_P3] - 1);                    // 8e00:3205 / 320f  FEh/FFh: count down
  else await X.RemoveEffect(c, 0x58, e);                                    // 8e00:3224
  await X.ClearCombatantActionFlags(c);                                     // 8e00:322f
}

// ---- handler table (InitSpellTable 8E00:3413 stores these ov22 stub pointers; ids verified on the bytes) -----------
const TABLE = {
  1: Spell_Bless, 2: Spell_Curse, 3: Spell_CureLightWounds, 4: Spell_CauseLightWounds, 5: Spell_Affected,
  6: Spell_Protected, 7: Spell_Protected, 8: Spell_ResistCold, 9: Spell_BurningHands, 10: Spell_CharmPerson,
  11: Spell_Affected, 12: Spell_Enlarge, 13: Spell_Reduce, 14: Spell_Friends, 15: Spell_MagicMissile,
  16: Spell_Protected, 17: Spell_Protected, 18: Spell_Affected, 19: Spell_Shield, 20: Spell_ShockingGrasp,
  21: Spell_Sleep, 22: Spell_Affected, 23: Spell_HoldPerson, 24: Spell_ResistFire, 25: Spell_Silence,
  26: Spell_SlowPoison, 27: Spell_SnakeCharm, 28: Spell_SpiritualHammer, 29: Spell_Affected, 30: Spell_Invisibility,
  31: Spell_Knock, 32: Spell_MirrorImage, 33: Spell_RayOfEnfeeblement, 34: Spell_StinkingCloud, 35: Spell_Strength,
  36: Spell_AnimateDead, 37: Spell_CureBlindness, 38: Spell_CauseBlindness, 39: Spell_CureDiseaseHandler,
  40: Spell_CauseDisease, 41: Spell_DispelMagic, 42: Spell_Prayer, 43: Spell_RemoveCurse, 44: Spell_BestowCurse,
  45: Spell_Blink, 46: Spell_DispelMagic, 47: Spell_Fireball, 48: Spell_Haste, 49: Spell_HoldPerson,
  50: Spell_Invisibility, 51: Spell_LightningBolt, 52: Spell_Protected, 53: Spell_Protected, 54: Spell_Protected,
  55: Spell_Slow, 56: Spell_Restoration, 57: Spell_Speed, 58: Spell_NeutraliseHeal, 59: Spell_ItemStrength,
  60: Spell_ItemLightning, 61: Spell_Paralysis, 62: Spell_PotionHealing, 63: Spell_ItemInvisibility,
  64: Spell_Fireball, 65: Spell_WandMagicMissile, 66: Spell_None, 67: Spell_Reading,
};
for (const [id, f] of Object.entries(TABLE)) SpellHandlers[+id] = f;
export const SPELL_HANDLER_OFFSETS = {                                      // id -> 8E00 offset (InitSpellTable bytes)
  1: 0x100F, 2: 0x1040, 3: 0x106B, 4: 0x10A7, 5: 0x10E9, 6: 0x1123, 7: 0x1123, 8: 0x1162, 9: 0x1190, 10: 0x11DD,
  11: 0x10E9, 12: 0x12A5, 13: 0x136E, 14: 0x13D8, 15: 0x1439, 16: 0x1123, 17: 0x1123, 18: 0x10E9, 19: 0x1499,
  20: 0x14C7, 21: 0x151B, 22: 0x10E9, 23: 0x1658, 24: 0x17E9, 25: 0x1822, 26: 0x185B, 27: 0x190F, 28: 0x19C3,
  29: 0x10E9, 30: 0x1A16, 31: 0x1A4F, 32: 0x1A8A, 33: 0x1ACC, 34: 0x1B11, 35: 0x1F41, 36: 0x206F, 37: 0x2217,
  38: 0x225D, 39: 0x232F, 40: 0x234C, 41: 0x2385, 42: 0x24D6, 43: 0x2540, 44: 0x2604, 45: 0x263D, 46: 0x2385,
  47: 0x266B, 48: 0x2892, 49: 0x1658, 50: 0x1A16, 51: 0x2BB7, 52: 0x1123, 53: 0x1123, 54: 0x1123, 55: 0x2C09,
  56: 0x2C43, 57: 0x2E02, 58: 0x2E4D, 59: 0x2EE5, 60: 0x2F4D, 61: 0x2F99, 62: 0x2FD0, 63: 0x302A, 64: 0x266B,
  65: 0x3058, 66: 0x3092, 67: 0x30A2,
};
