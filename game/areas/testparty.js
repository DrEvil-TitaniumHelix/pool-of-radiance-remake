// game/areas/testparty.js — the prebuilt test party, generated in the browser from the player's own files (BYOC step 6,
// docs/BYOC.md §7; owner por-accept). Moved here from tools/make_test_party.mjs (lane testparty), which is now a thin Node
// wrapper around this module. Output = a genuine Pool of Radiance save in the ORIGINAL format (decode/data/SAVES.md):
// SAVGAM<slot>.DAT + CHRDAT<slot><n>.SAV/.ITM/.SPC, n = 1..6 — the same 16 files `?save=testparty&force=1` copied before.
//
// Every character is made the way a player makes one in the original, statement by statement from the decode:
//   1. CreateCharacter 7000:056C (race effects, levels, class mask, THAC0, saves, thief skills, age, HP, gold, spells)
//   2. ModifyCharacter 7000:209F (abilities set within RaceAbilityLimits/ClassAbilityMin, max HP = MaxHitPoints 7000:408C)
//   3. XP earned, TrainCharacter 7000:29AE once per level (UpdateLevelStats 9300:0000, RollHitDice 7000:4235 at its
//      highest roll, ConHpBonus 7000:3F31, the magic-user's learned spell), never past the race level limits
//   4. gear bought in the Phlan arms-and-armor shop (ECL3_00 A8D6..A940: TREASURE items=35h -> ITEM3.DAX record 53)
//      via AddItemToChar 3E00:0239 + readied, SetCharMoneyGold 8900:0130 for the coins
//   5. spells memorised (Memorize: first empty slot, SortMemorized 6B00:0824, rest finished -> bit 7 cleared)
//   6. RecalcCharacter 00BA:0BB8 (derived fields) and SaveGame 7500:1D58 from the party menu right after
//      "Add Character to Party" in a fresh start (InitGameState 5700:002D + PartyCreationMenu 7000:0161 state):
//      LoadGame leaves game_Mode 0, so the game stays in the party menu and B (BEGIN Adventuring) starts Phlan.
// Inputs (never stored): `ds` = the DS 0C7C image (G.ds: index = DS offset, from the imported START.EXE), `items` = the
// ITEMS file, `shop` = ITEM3.DAX record 53 decoded. Deterministic: fixed TP RandSeed (the one random byte, unk_AB).
import { newChar, newItem, newEffect, rdW, wrW, pstr, setPstr, CHAR_SIZE, ITEM_SIZE, EFFECT_SIZE } from '../engine/ecl.js';
import { Random, setRandSeed } from '../engine/tp.js';

export const SAVGAM_SIZE = 13137;

// ---- TChar field offsets (SAVES.md §3) ---------------------------------------------------------------------------
export const F = { str: 0x10, int: 0x11, wis: 0x12, dex: 0x13, con: 0x14, cha: 0x15, str_exc: 0x16, mem: 0x17, rest_need: 0x2C,
  base_thac0: 0x2D, race: 0x2E, cls: 0x2F, age: 0x30, hp_max: 0x32, known: 0x32 /* +id */, fle: 0x6B, size: 0x6C, save: 0x6D,
  base_move: 0x72, level_main: 0x73, thief: 0x77, effects: 0x7F, money: 0x88, level: 0x96, gender: 0x9E, align: 0xA0,
  attacks: 0xA1, bdice: 0xA3, bsides: 0xA5, bbonus: 0xA7, base_ac: 0xA9, unk_AA: 0xAA, unk_AB: 0xAB, xp: 0xAC, class_mask: 0xB0,
  hp_rolled: 0xB1, slots: 0xB2, head: 0xBB, body: 0xBC, icon_head: 0xBD, icon_body: 0xBE, party_slot: 0xBF, icon_size: 0xC0,
  icon_col: 0xC1, item_count: 0xC7, hands: 0x100, ac_item: 0x101, enc: 0x102, status: 0x10C, active: 0x10D, thac0: 0x110,
  ac: 0x111, ac_rear: 0x112, dice: 0x115, sides: 0x117, bonus: 0x119, hp: 0x11B, move: 0x11C, unk_85: 0x85 };
const sb = (v) => (v << 24) >> 24;
const lvl = (c, cls) => sb(c.b[F.level + cls]);
const ABIL = ['str', 'int', 'wis', 'dex', 'con', 'cha'];

// ---- the party -----------------------------------------------------------------------------------------------------
// race 1 Dwarf 2 Elf 5 Halfling 7 Human; class 0 Cleric 2 Fighter 5 Magic-User 6 Thief 13 F/MU; gender 0 M 1 F;
// alignment 0 LG 1 LN 3 NG 4 TN 6 CG. pic = head, body (PortraitMenu), icon head, icon body (IconEditor) — the picks of
// the shipped party A member of the same race/class (THRENDER, BAKSHI, RHIANNON, BROTHER SEAN, DARKSTAR, PHINEAS).
export const PARTY = [
  { name: 'CORWIN', race: 7, gender: 0, cls: 2, align: 0, str: 18, exc: 'max', int: 12, wis: 14, dex: 17, con: 17, cha: 15,
    pic: [11, 5, 9, 17], gear: [[36, 1], [59, 1], [58, 1], [43, 0], [73, 1]] },
  { name: 'THORGRIM', race: 1, gender: 0, cls: 2, align: 1, str: 18, exc: 'max', int: 11, wis: 13, dex: 'max', con: 'max', cha: 12,
    pic: [4, 1, 11, 3], gear: [[1, 1], [59, 1], [58, 1], [46, 0], [28, 1]] },
  { name: 'ALYS', race: 7, gender: 1, cls: 0, align: 3, str: 16, int: 13, wis: 18, dex: 15, con: 17, cha: 16,
    pic: [3, 4, 5, 26], gear: [[23, 1], [59, 1], [58, 1]],
    spells: ['Cure Light Wounds', 'Cure Light Wounds', 'Cure Light Wounds', 'Bless', 'Protection From Evil', 'Hold Person', 'Hold Person', 'Silence, 15\' Radius', 'Spiritual Hammer'] },
  { name: 'MORGANA', race: 7, gender: 1, cls: 5, align: 3, str: 12, int: 18, wis: 14, dex: 17, con: 16, cha: 15,
    pic: [6, 10, 9, 29], gear: [[33, 1], [8, 0], [9, 0]],
    learn: ['Magic Missile', 'Stinking Cloud', 'Invisibility', 'Mirror Image'], spells: ['Sleep', 'Magic Missile', 'Magic Missile', 'Stinking Cloud', 'Invisibility'] },
  { name: 'PIP', race: 5, gender: 0, cls: 6, align: 4, str: 'max', int: 14, wis: 12, dex: 'max', con: 'max', cha: 14,
    pic: [1, 6, 13, 5], gear: [[37, 1], [50, 1], [9, 0]] },
  { name: 'ELARIEL', race: 2, gender: 1, cls: 13, align: 6, str: 'max', exc: 'max', int: 'max', wis: 13, dex: 'max', con: 'max', cha: 16,
    pic: [9, 9, 10, 24], gear: [[36, 1], [59, 1], [57, 1], [43, 0], [73, 1]],
    learn: ['Magic Missile', 'Stinking Cloud', 'Invisibility', 'Mirror Image'], spells: ['Sleep', 'Magic Missile', 'Magic Missile', 'Stinking Cloud', 'Invisibility'] },
];

// The generator over one set of inputs: tables from the DS image, ITEMS and the shop record.
export function testPartyRules({ ds, items, shop }) {
  if (!ds || !items || !shop) throw new Error('testparty: needs the DS image (START.EXE), ITEMS and ITEM3.DAX record 53');
  const dv = new DataView(ds.buffer, ds.byteOffset, ds.byteLength);
  const u8 = (o) => ds[o];
  const s8 = (o) => (ds[o] << 24) >> 24;
  const u16 = (o) => dv.getUint16(o, true);
  const i32 = (o) => dv.getInt32(o, true);
  const dsStr = (o) => { let t = ''; for (let i = 1; i <= ds[o]; i++) t += String.fromCharCode(ds[o + i]); return t; };

  // ---- tables (PARTY.pas.md "Data tables read here", VIEW.pas.md ov23, ENGINE.pas.md part U) ----------------------
  const RaceName = (r) => dsStr(0x0F03 + r * 10);
  const ClassName = (c) => dsStr(0x0D38 + c * 27);
  const GenderName = (g) => dsStr(0x0FEC + g * 7);
  const AlignmentName = (a) => dsStr(0x0F53 + a * 17);
  const ItemWord = (w) => dsStr(0x10A7 + w * 21);
  const SpellName = (id) => dsStr(0x28E9 + id * 0x29);
  const SpellCls = (id) => u8(0x31FA + id * 16);
  const SpellLvl = (id) => u8(0x31FB + id * 16);
  const BaseThac0 = (cls, l) => u8(0x3C7C + cls * 11 + l);
  const ClassMaskBit = (cls) => u8(0x05D6 + cls);
  const ClassTrainBits = (cls) => u8(0x05DE + cls);
  const HitDiceCount = (cls) => u8(0x08B6 + cls);
  const HitDieSides = (cls) => u8(0x08BE + cls);
  const XpForLevel = (cls, l) => i32(0x409B + cls * 0x38 + l * 4);
  const ConHpAdj = (con) => s8(0x408E + con);
  const RaceClasses = (race) => { const n = u8(0x3E17 + race * 12); return Array.from({ length: n }, (_, k) => u8(0x3E17 + race * 12 + 1 + k)); };
  const ClassAligns = (cls) => { const n = u8(0x3FE7 + cls * 10); return Array.from({ length: n }, (_, k) => u8(0x3FE7 + cls * 10 + 1 + k)); };
  const StartAge = (race, cls) => ({ base: u16(0x3E5B + race * 28 + cls * 4), dice: u8(0x3E5B + race * 28 + cls * 4 + 2), sides: u8(0x3E5B + race * 28 + cls * 4 + 3) });
  const RaceLim = (race, j) => u8(0x3DA3 + race * 16 + j);
  const ClassAbilityMin = (cls, a) => u8(0x3F81 + cls * 6 + a);
  const StartGoldDice = (cls) => [u8(0x4263 + cls * 2), u8(0x4263 + cls * 2 + 1)];
  const IconColourSlot = (k) => u8(0x3CF5 + k);

  // ---- ITEMS item-type table (SAVES.md §6: file offset 2, 128 x 16) ------------------------------------------------
  const IT = (t, j) => items[2 + t * 16 + j];
  const ITs = (t, j) => (items[2 + t * 16 + j] << 24) >> 24;

  // ---- ov23 (VIEW.pas.md 9300) -------------------------------------------------------------------------------------
  function WisdomBonusSpells(c) {                                       // 9300:01AF
    const b = c.b, w = b[F.wis];
    if (w > 12 && b[0xB2]) b[0xB2]++;
    if (w > 13 && b[0xB2]) b[0xB2]++;
    if (w > 14 && b[0xB3]) b[0xB3]++;
    if (w > 15 && b[0xB3]) b[0xB3]++;
    if (w > 16 && b[0xB4]) b[0xB4]++;
  }
  function UpdateSaves(c) {                                             // 9300:0255
    for (let k = 0; k < 5; k++) {
      let s = 20;
      for (let cls = 0; cls < 8; cls++) if (lvl(c, cls) > 0) s = Math.min(s, u8(0x426E + cls * 45 + lvl(c, cls) * 5 + k));
      c.b[F.save + k] = s;
    }
  }
  function UpdateThiefSkills(c) {                                       // 9300:0329
    const tl = lvl(c, 6);
    for (let k = 1; k <= 8; k++) {
      const base = u8(0x3CF3 + tl * 8 + k), adj = s8(0x3D3B + c.b[F.race] * 8 + k);
      let v;
      if (adj < 0 && -adj > base) v = 0;
      else { v = base + adj; if (k < 6) v += s8(0x3D4E + c.b[F.dex] * 5 + k); }
      c.b[0x76 + k] = v & 0xFF;
    }
  }
  function UpdateLevelStats(c) {                                        // 9300:0000
    const b = c.b;
    b[F.base_thac0] = 0;
    for (let cls = 0; cls < 8; cls++) {
      const l = b[F.level + cls];
      if (BaseThac0(cls, l) > b[F.base_thac0]) b[F.base_thac0] = BaseThac0(cls, l);
      if (sb(l) > sb(b[F.level_main])) b[F.level_main] = l;
      if (cls === 2) b[F.attacks] = l < 7 ? 2 : 3;
      else if (cls === 0 && l > 1) {
        for (let k = 1; k <= 3; k++) b[F.slots + k - 1] = u8(0x40BC + l * 3 + k);
        WisdomBonusSpells(c);
        for (let id = 1; id <= 0x38; id++) if (SpellCls(id) === 0 && b[0xB1 + SpellLvl(id)] !== 0) b[F.known + id] = 1;
      } else if (cls === 5 && l > 1) for (let k = 1; k <= 3; k++) b[0xB4 + k] = u8(0x41D4 + l * 3 + k);
    }
    UpdateSaves(c);
    if (lvl(c, 6) > 0) UpdateThiefSkills(c);
  }
  // quirk kept: the fighter branch runs for every character (cls 2 loop pass), so non-fighters also get attacks := 2.

  // ---- ov16 HP helpers (PARTY.pas.md 7000:3F31 / 408C / 4235) -------------------------------------------------------
  function ConHpBonus(c) {
    let sum = 0;
    for (let cls = 0; cls < 8; cls++) if (lvl(c, cls) > 0) {
      sum += ConHpAdj(c.b[F.con]);
      if (c.b[F.con] > 16 && c.b[F.cls] === 2) sum++;
      if (c.b[F.con] > 17 && c.b[F.cls] === 2) sum++;
    }
    return sum;
  }
  function MaxHitPoints(c) {
    let n = 0, sum = 0;
    for (let cls = 0; cls < 8; cls++) if (lvl(c, cls) > 0) {
      n++; const l = lvl(c, cls);
      sum += [l * 8, l * 8, l * 10, l * 10, (l + 1) * 8, l * 4, l * 6, (l + 1) * 4][cls];
    }
    sum &= 0xFF;
    const adj = ConHpBonus(c);
    if (adj < 0) sum = sum > n - adj ? Math.trunc((sum + adj) / n) : 1; else sum = Math.trunc((sum + adj) / n);
    return sum & 0xFF;
  }
  function RollHitDiceMax(c, bits) {                                     // RollHitDice with every Roll at its maximum
    let sum = 0;
    for (let cls = 0; cls < 8; cls++) if (lvl(c, cls) > 0 && (ClassTrainBits(cls) & bits)) sum += HitDiceCount(cls) * HitDieSides(cls);
    return sum & 0xFF;
  }

  // ---- res_00BA RecalcCharacter and helpers (ENGINE.pas.md part U) -------------------------------------------------
  function StrengthIndex(c) {
    const s = c.b[F.str], e = c.b[F.str_exc];
    if (s <= 17) return s;
    if (s === 18) return e === 0 ? 18 : e <= 50 ? 19 : e <= 75 ? 20 : e <= 90 ? 21 : e <= 99 ? 22 : 23;
    return s + 5;
  }
  function StrToHitAdj(c) {
    const i = StrengthIndex(c); if (!c.b[F.unk_AA]) return 0;
    if (i <= 3) return i >= 1 ? -3 : 0; if (i <= 5) return -2; if (i <= 7) return -1; if (i < 17) return 0;
    if (i <= 19) return 1; if (i <= 22) return 2; if (i <= 25) return 3; if (i <= 27) return 4; return i - 23;
  }
  function StrDamageAdj(c) {
    const i = StrengthIndex(c); if (!c.b[F.unk_AA]) return 0;
    if (i >= 1 && i <= 2) return -2; if (i >= 3 && i <= 5) return -1; if (i === 16) return 1;
    if (i >= 17 && i <= 19) return i - 16; if (i >= 20 && i <= 29) return i - 17; if (i === 30) return 14; return 0;
  }
  function StrWeightAllowance(c) {
    const i = StrengthIndex(c);
    if (i >= 1 && i <= 3) return -350; if (i >= 4 && i <= 5) return -250; if (i >= 6 && i <= 7) return -150;
    if (i >= 12 && i <= 13) return 100; if (i >= 14 && i <= 15) return 200; if (i === 16) return 350;
    if (i >= 17 && i <= 21) return (i - 17) * 250 + 500; if (i >= 22 && i <= 26) return (i - 22) * 1000 + 2000;
    if (i === 27) return 7500; if (i >= 28 && i <= 30) return (i - 28) * 3000 + 9000; return 0;
  }
  function DexDefenseAdj(c) {
    const d = c.b[F.dex];
    if (d >= 1 && d <= 3) return -4; if (d >= 4 && d <= 6) return d - 7; if (d >= 15 && d <= 18) return d - 14;
    if (d >= 19 && d <= 20) return 4; if (d >= 21 && d <= 23) return 5; if (d >= 24 && d <= 25) return 6; return 0;
  }
  function DexMissileAdj(c) {
    const d = c.b[F.dex];
    if (d <= 2) return -4; if (d <= 5) return d - 6; if (d >= 16 && d <= 18) return d - 15;
    if (d >= 19 && d <= 20) return 3; if (d >= 21 && d <= 23) return 4; if (d >= 24 && d <= 25) return 5; return 0;
  }
  function RecalcCharacter(c) {                                          // 00BA:0BB8
    const b = c.b, readied = new Array(13).fill(null);
    b[F.item_count] = 0; b[F.hands] = 0; let enc = 0, holding = false, readiedW = 0;
    for (let it = c.items; it; it = it.next) {
      b[F.item_count]++;
      let w = rdW(it.b, 0x37); if (it.b[0x39] > 0) w = it.b[0x39] * w;
      enc += w;
      if (it.b[0x34]) {
        readiedW += w; const t = it.b[0x2E], s = IT(t, 0);
        if (s <= 8) readied[s] = it; else if (s === 9) { if (readied[9]) { if (!readied[10]) readied[10] = it; } else readied[9] = it; }
        if (t === 0x49) readied[11] = it; if (t === 0x1C) readied[12] = it;
        if (it.b[0x2F] === 0xBA) holding = true;
        b[F.hands] += IT(t, 1);
      }
    }
    for (let k = 0; k < 7; k++) enc += rdW(b, F.money + k * 2);
    for (let k = 0; k < 2; k++) { b[F.dice + k] = b[F.bdice + k]; b[F.sides + k] = b[F.bsides + k]; b[F.bonus + k] = b[F.bbonus + k]; }
    const f = [0, 0, 0, 0, 0]; let magicArmour = false;
    b[F.ac_item] = 0; b[F.ac] = b[F.base_ac]; b[F.move] = b[F.base_move]; b[F.thac0] = b[F.base_thac0];
    f[0] = DexDefenseAdj(c);
    if (!readied[0]) { b[F.thac0] += StrToHitAdj(c); b[F.bonus] += StrDamageAdj(c); }
    const w = readied[0];                                                // 00BA:0000 RecalcWeaponStats
    if (w) {
      const t = w.b[0x2E];
      b[F.thac0] = b[F.base_thac0];
      if (IT(t, 14) & 2) b[F.thac0] += DexMissileAdj(c);
      b[F.bonus] = ITs(t, 11);
      if (IT(t, 14) & 4) { b[F.thac0] += StrToHitAdj(c); b[F.bonus] += StrDamageAdj(c); }
      let plus = sb(w.b[0x32]);
      if (IT(t, 14) > 0x7F && readied[12]) plus += sb(readied[12].b[0x32]);
      if ((IT(t, 14) & 1) && readied[11]) plus += sb(readied[11].b[0x32]);
      b[F.bonus] += plus;
      if (b[F.race] === 2 && ((t > 0x28 && t < 0x2D) || t === 0x25 || t === 0x24)) plus++;
      b[F.thac0] += plus; b[F.dice] = IT(t, 9); b[F.sides] = IT(t, 10);
    }
    for (let it = c.items; it; it = it.next) if (it.b[0x34]) {
      const t = it.b[0x2E];
      if (IT(t, 0) === 2) {                                              // 00BA:01FB ArmourMoveLimit
        const wt = rdW(it.b, 0x37);
        b[F.move] = wt <= 150 ? b[F.base_move] : wt <= 399 ? 9 : 6;
        if (it.b[0x32] !== 0 && b[F.move] <= 9) b[F.move] += 3;
      }
      let acv = IT(t, 6);                                                // 00BA:0282 AddItemAC
      if (acv > 0x7F) {
        acv &= 0x7F; const slot = IT(t, 0), p = sb(it.b[0x32]);
        if (slot === 1) f[1] = acv + p;
        else if (acv === 0) { if (slot === 9) { if (p > f[3]) f[3] = p; } else f[2] += p; b[F.ac_item] += it.b[0x33]; }
        else if (acv + p > f[4]) { f[4] = acv + p; if (p > 0 && slot === 2) magicArmour = true; }
      }
    }
    if (magicArmour) f[3] = 0;
    if (holding) { enc = enc < 5000 ? 0 : enc - 5000; if (enc < readiedW) enc = readiedW; }
    wrW(b, F.enc, enc);
    let e = ((enc - StrWeightAllowance(c)) << 16) >> 16; if (e < 0) e = 0;   // 00BA:03A0 EncumbranceMoveLimit
    const m = e <= 512 ? b[F.move] : e <= 768 ? 9 : e <= 1024 ? 6 : 3;
    if (m < b[F.move]) b[F.move] = m;
    if (f[4] < b[F.ac]) f[4] = b[F.ac];
    b[F.ac] = (f[0] + f[1] + f[2] + f[3] + f[4]) & 0xFF;
    b[F.ac_rear] = (f[4] + f[2] + f[3] - 2) & 0xFF;
    b[F.fle] = lvl(c, 2) > 0 && b[F.race] > 0 ? b[F.level + 2] : 1;
    c.readied = readied;
  }

  // ---- items (SAVES.md §4; BuildItemName 00BA:0442 without ready column / Detect Magic) -----------------------------
  function BuildItemName(it) {
    const b = it.b; let name = '';
    if (b[0x39] > 0) name += b[0x39] + ' ';
    let shown = 0;
    for (let k = 1; k <= 3; k++) if (b[0x2E + k] && !((b[0x35] >> (3 - k)) & 1)) shown += 1 << (k - 1);
    let plural = false;
    for (let k = 3; k >= 1; k--) if ((shown >> (k - 1)) & 1) {
      name += ItemWord(b[0x2E + k]);
      const t = b[0x2E];
      if (b[0x39] < 2 || plural) name += ' ';
      else if ((1 << (k - 1)) === shown || (k === 1 && shown > 4 && t !== 0x56) || (k === 2 && !(shown & 1)) || (k === 3 && t === 0x56)
        || ((t === 0x49 || t === 0x1C) && b[0x31] !== 0xB1)) { name += 's '; plural = true; }
      else name += ' ';
    }
    b.fill(0, 0, 0x2A); setPstr(b, 0, name, 40);
  }
  function buy(c, type, readied) {                                       // AddItemToChar 3E00:0239 (+ Ready)
    let src = null;
    for (let o = 0; o + ITEM_SIZE <= shop.length; o += ITEM_SIZE) if (shop[o + 0x2E] === type) { src = shop.subarray(o, o + ITEM_SIZE); break; }
    if (!src) throw new Error(`type ${type} not sold in the Phlan arms shop`);
    if (!(IT(type, 13) & c.b[F.class_mask])) throw new Error(`${pstr(c.b, 0)} cannot use item type ${type} (usable ${IT(type, 13).toString(16)})`);
    const it = newItem(); it.b.set(src); it.b.fill(0, 0x2A, 0x2E);
    if (rdW(it.b, 0x3A) === 0) wrW(it.b, 0x3A, 1);                        // ShopItemsMenu 3e00:0068 quirk: free wares cost 1
    it.b[0x34] = readied ? 1 : 0;
    BuildItemName(it);
    if (!c.items) c.items = it; else { let p = c.items; while (p.next) p = p.next; p.next = it; }
    return it;
  }

  // ---- effects (AddEffect ov24_0E52: type, duration 0, p3 FFh, p4 0 as CreateCharacter calls it) --------------------
  function addEffect(c, type) {
    const e = newEffect(); e.b[0] = type; e.b[3] = 0xFF;
    if (!c.effects) c.effects = e; else { let p = c.effects; while (p.next) p = p.next; p.next = e; }
  }

  // ---- 1. CreateCharacter 7000:056C ---------------------------------------------------------------------------------
  function create(spec) {
    const c = newChar(), b = c.b;
    for (let k = 1; k <= 6; k++) b[F.icon_col + k - 1] = ((IconColourSlot(k) + 8) * 16 + IconColourSlot(k)) & 0xFF;  // 7000:05ac
    b[F.base_ac] = 0x32; b[F.base_thac0] = 0x28; b[F.status] = 0; b[F.active] = 1;                         // 7000:05e4..05f5
    b[F.head] = 1; b[F.body] = 1; b[F.size] = 1; b[F.unk_AB] = Random(256);                                // 7000:0607 / 0622
    if (![1, 2, 3, 4, 5, 7].includes(spec.race)) throw new Error('race not offered by Pick Race (7000:0664)');
    b[F.race] = spec.race;
    const fx = { 5: [0x5A, 0x61], 1: [0x5A, 0x61, 0x1A, 0x2F], 3: [0x61, 0x12, 0x2F, 0x30], 2: [0x6B], 4: [0x7C] }[spec.race] || [];
    fx.forEach((t) => addEffect(c, t));                                                                   // 7000:07ab
    b[F.icon_size] = [1, 3, 5].includes(spec.race) ? 1 : 2;
    b[F.gender] = spec.gender;                                                                            // 7000:0a29
    if (!RaceClasses(spec.race).includes(spec.cls)) throw new Error(`${ClassName(spec.cls)} not offered to ${RaceName(spec.race)} (RaceClasses DS:3E17)`);
    b[F.cls] = spec.cls; b[F.level_main] = 1;                                                              // 7000:0b94 / 0ba2
    const bases = { 8: [0, 2], 9: [0, 2, 5], 10: [0, 4], 11: [0, 5], 12: [0, 6], 13: [2, 5], 14: [2, 6], 15: [2, 5, 6], 16: [5, 6] }[spec.cls] || [spec.cls];
    bases.forEach((k) => { b[F.level + k] = 1; });                                                         // 7000:0baa
    if (lvl(c, 6) > 0) UpdateThiefSkills(c);                                                              // 7000:0cb8 (DEX still 0; redone below)
    b[F.class_mask] = 0; b[F.base_thac0] = 0;
    for (let k = 0; k < 8; k++) if (lvl(c, k) > 0) {
      if (BaseThac0(k, lvl(c, k)) > b[F.base_thac0]) b[F.base_thac0] = BaseThac0(k, lvl(c, k));
      b[F.class_mask] += ClassMaskBit(k);
    }
    UpdateSaves(c);                                                                                       // 7000:0d6b
    if (!ClassAligns(spec.cls).includes(spec.align)) throw new Error(`alignment not allowed for ${ClassName(spec.cls)} (ClassAligns DS:3FE7)`);
    b[F.align] = spec.align;                                                                              // 7000:0ecd
    const ageCls = spec.cls <= 7 ? spec.cls : [8, 9, 11, 12].includes(spec.cls) ? 0 : spec.cls === 14 ? 2 : 5;
    const A = StartAge(spec.race, ageCls);
    wrW(b, F.age, A.base + A.dice * A.sides);   // multi-class rule 7000:0f49 (base + dice*sides); for a single class the highest roll of 7000:0f26
    // abilities: the creation rolls are replaced through ModifyCharacter (step 2); limits checked there
    b[F.hp] = b[F.hp_max];
    b[F.attacks] = 2; b[F.bdice] = 1; b[F.bsides] = 2; b[F.unk_AA] = 1; b[F.base_move] = 12;               // 7000:1bfc / 1c14
    for (const a of ABIL) b[F[a]] = spec[a];                                                              // provisional, validated in modify()
    if (spec.str === 18 && spec.exc) b[F.str_exc] = spec.exc;
    let goldSum = 0, nCls = 0;
    for (let k = 0; k < 8; k++) if (lvl(c, k) > 0) {
      if (k === 0) b[0xB2] = 1; else if (k === 5) b[0xB5] = 1;                                            // 7000:1c51 / 1c60
      const [d, s] = StartGoldDice(k); goldSum += d * s; nCls++;                                          // 7000:1c83 (highest roll)
      if (k === 0) { WisdomBonusSpells(c); for (let id = 1; id <= 0x38; id++) if (SpellCls(id) === 0 && SpellLvl(id) === 1) b[F.known + id] = 1; }
      else if (k === 5) [0x0B, 0x12, 0x13, 0x15].forEach((id) => { b[F.known + id] = 1; });              // 7000:1cec
    }
    wrW(b, F.money + 6, ((goldSum & 0xFF) * 10 / nCls) | 0);                                               // 7000:1d15 gold
    const roll = (() => { let s = 0; for (let k = 0; k < 8; k++) if (lvl(c, k) > 0) s += HitDiceCount(k) * HitDieSides(k); return s; })();
    b[F.hp_rolled] = roll;                                                                                // 7000:1d3b RollHitDice($FF), highest
    let hp = roll; const adj = ConHpBonus(c);
    if (adj < 0) hp = hp > -adj + nCls ? Math.trunc((hp + adj) / nCls) : 1; else hp = Math.trunc((hp + adj) / nCls);
    b[F.hp_max] = hp; b[F.hp] = hp; b[F.hp_rolled] = Math.trunc(roll / nCls);                             // 7000:1d49..1df0
    setPstr(b, 0, spec.name, 15);                                                                         // 7000:1e5a
    b[F.head] = spec.pic[0]; b[F.body] = spec.pic[1]; b[F.icon_head] = spec.pic[2]; b[F.icon_body] = spec.pic[3];   // PortraitMenu / IconEditor
    return c;
  }

  // ---- 2. ModifyCharacter 7000:209F (xp = 0): abilities and max HP within the limits it enforces --------------------
  function modify(c, spec) {
    const b = c.b, r = b[F.race], g = b[F.gender], k = b[F.cls];
    const lim = { str: [RaceLim(r, 0 + g), RaceLim(r, 2 + g)], int: [RaceLim(r, 6), RaceLim(r, 7)], wis: [RaceLim(r, 8), RaceLim(r, 9)],
      dex: [RaceLim(r, 10), RaceLim(r, 11)], con: [RaceLim(r, 12), RaceLim(r, 13)], cha: [RaceLim(r, 14), RaceLim(r, 15)] };
    ABIL.forEach((a, i) => {
      const lo = Math.max(lim[a][0], ClassAbilityMin(k, i)), hi = lim[a][1];
      const v = spec[a] === 'max' ? hi : spec[a];
      if (v < lo || v > hi) throw new Error(`${spec.name} ${a} ${v} outside ${lo}..${hi} (RaceAbilityLimits DS:3DA3 / ClassAbilityMin DS:3F81)`);
      b[F[a]] = v;
    });
    b[F.str_exc] = 0;
    if (b[F.str] === 18 && lvl(c, 2) > 0) {                                                                // 7000:25c8 only with a fighter level
      const max = RaceLim(r, 4 + g), v = spec.exc === 'max' ? max : (spec.exc || 0);
      if (v > max) throw new Error(`${spec.name} exceptional STR ${v} > ${max}`);
      b[F.str_exc] = v;
    }
    if (b[0xB2] > 0) { b[0xB2] = 1; WisdomBonusSpells(c); }                                                // 7000:26c7 / 26e3 (WIS change)
    b[F.hp_max] = MaxHitPoints(c); b[F.hp] = b[F.hp_max];                                                  // 7000:2833 / 283d
    if (lvl(c, 6) > 0) UpdateThiefSkills(c);                                                              // DEX entered (AddToParty -> UpdateLevelStats redoes it)
    RecalcCharacter(c);                                                                                   // 7000:28bc
    b[F.unk_85] = 1;                                                                                      // 7000:28e0 Keep
  }

  // ---- 3. XP + TrainCharacter 7000:29AE (one level per training, hall trains the class) ------------------------------
  function raceBlocked(c, cls, l) {                                                                       // 7000:2a78
    const r = c.b[F.race], s = c.b[F.str];
    if (cls === 2) {
      if (r === 1) return (l === 8 && s === 17) || (l === 7 && s < 17);
      if (r === 2) return l === 7 || (l === 6 && s === 17) || (l === 5 && s < 17);
      if (r === 3) return l === 6 || (l === 5 && s < 18);
      if (r === 4) return l === 8 || (l === 7 && s === 17) || (l === 6 && s < 17);
      if (r === 5) return l === 6 || (l === 5 && s === 17) || (l === 4 && s < 17);
    }
    return r === 4 && cls === 0 && l === 5;
  }
  const xpOf = (c) => new DataView(c.b.buffer, c.b.byteOffset).getInt32(F.xp, true);
  const setXp = (c, v) => new DataView(c.b.buffer, c.b.byteOffset).setInt32(F.xp, v, true);
  function canTrain(c, target) {                                                                         // target: level, or per class id [0..7]
    let bits = 0;
    for (let k = 0; k < 8; k++) {
      const l = lvl(c, k);
      if (l > 0 && l < (Array.isArray(target) ? target[k] ?? 0 : target) && !raceBlocked(c, k, l) && XpForLevel(k, l + 1) > 0 && XpForLevel(k, l + 1) <= xpOf(c)) bits |= ClassTrainBits(k);
    }
    return bits;
  }
  function trainOnce(c, bits, learnPick) {                                                                 // 7000:2ed2..3031
    const b = c.b; let nClasses = 0; const oldMu = lvl(c, 5), gained = [];
    for (let k = 0; k < 8; k++) if (lvl(c, k) > 0) {
      nClasses++;
      if (ClassTrainBits(k) & bits) { b[F.level + k]++; gained.push(`${ClassName(k)} ${b[F.level + k]}`); }
    }
    UpdateLevelStats(c);                                                                                  // 7000:2f5a
    if (lvl(c, 5) > oldMu) {                                                                              // 7000:2f62 learn one spell
      const learnable = []; for (let id = 1; id <= 0x38; id++) if (b[0xB1 + SpellCls(id) * 3 + SpellLvl(id)] !== 0 && b[F.known + id] === 0) learnable.push(id);
      const pick = learnPick.find((id) => learnable.includes(id));
      if (pick === undefined) throw new Error(`${pstr(b, 0)}: no wanted spell learnable (${learnable.map(SpellName)})`);
      b[F.known + pick] = 1; gained.push('learns ' + SpellName(pick));
    }
    const roll = RollHitDiceMax(c, bits);                                                                 // 7000:2fb1 (highest roll)
    let gain = Math.trunc(roll / nClasses); if (gain === 0) gain = 1;
    b[F.hp_rolled] += gain;
    gain = Math.trunc((roll + ConHpBonus(c)) / nClasses); if (gain < 1) gain = 1;
    const wounds = b[F.hp_max] - b[F.hp];
    b[F.hp_max] += gain; b[F.hp] = b[F.hp_max] - wounds;
    return gained.join(', ') + ` (+${gain} HP)`;
  }

  // ---- 5. Memorize (MAGIC.pas.md 6B00:0A4E + SortMemorized 6B00:0824), rest done -> bit 7 cleared ----------------------
  function memorize(c, ids) {
    const b = c.b, used = {};
    for (const id of ids) {
      const key = SpellCls(id) * 3 + SpellLvl(id);
      used[key] = (used[key] || 0) + 1;
      if (!b[F.known + id]) throw new Error(`${pstr(b, 0)} does not know ${SpellName(id)}`);
      if (used[key] > b[0xB1 + key]) throw new Error(`${pstr(b, 0)}: no free slot for ${SpellName(id)} (FreeSlots 6B00:025C)`);
      const i = b.subarray(F.mem, F.mem + 21).indexOf(0); b[F.mem + i] = id;
    }
    const m = Array.from(b.subarray(F.mem, F.mem + 21)).sort((x, y) => (x & 0x7F) - (y & 0x7F));
    b.set(m, F.mem); b[F.rest_need] = 0;
  }

  const SPELL = (name) => { for (let id = 1; id <= 0x38; id++) if (SpellName(id).toUpperCase() === name.toUpperCase()) return id; throw new Error('no spell ' + name); };

  function build(level = 4, gold = 300) {
    setRandSeed(0x19881988);                                                                              // fixed: reproducible unk_AB bytes
    const chars = [];
    for (const spec of PARTY) {
      const c = create(spec);
      modify(c, spec);
      const history = [];
      // XP earned in steps: every threshold of the character's classes up to the target level, trained at each one
      const thresholds = [];
      for (let k = 0; k < 8; k++) if (lvl(c, k) > 0) for (let l = 2; l <= level; l++) { const x = XpForLevel(k, l); if (x > 0) thresholds.push(x); }
      thresholds.sort((a, b) => a - b);
      for (const x of thresholds) {
        if (x > xpOf(c)) setXp(c, x);
        let bits;
        while ((bits = canTrain(c, level))) history.push(`xp ${xpOf(c)}: ` + trainOnce(c, bits, (spec.learn || []).map(SPELL)));
      }
      UpdateLevelStats(c);                                                                                // AddToParty 7500:156e (also run by LoadGame)
      for (const [type, rd] of spec.gear) buy(c, type, rd);
      wrW(c.b, F.money + 8, Math.trunc(gold / 5)); wrW(c.b, F.money + 6, gold % 5);                       // SetCharMoneyGold 8900:0130
      for (let k = 0; k < 3; k++) wrW(c.b, F.money + k * 2, 0);
      if (spec.spells) memorize(c, spec.spells.map(SPELL));
      RecalcCharacter(c);
      chars.push({ spec, c, history });
    }
    return chars;
  }

  // ---- 6. files: WriteCharacter 7500:069E + SaveGame 7500:1D58 ------------------------------------------------------
  function files(chars, slot) {
    const out = [];                                                                // [name, Uint8Array], in write order
    const cat = (parts) => { const r = new Uint8Array(parts.reduce((n, p) => n + p.length, 0)); let o = 0; for (const p of parts) { r.set(p, o); o += p.length; } return r; };
    chars.forEach(({ c }, i) => {
      const base = `CHRDAT${slot}${i + 1}`;
      c.b[F.party_slot] = i;                                                       // AddToParty lowest free slot
      out.push([base + '.SAV', Uint8Array.from(c.b)]);
      const its = []; for (let it = c.items; it; it = it.next) its.push(it.b);
      if (its.length) out.push([base + '.ITM', cat(its)]);
      const fx = []; for (let e = c.effects; e; e = e.next) fx.push(e.b);
      if (fx.length) out.push([base + '.SPC', cat(fx)]);
    });
    const g = new Uint8Array(SAVGAM_SIZE), gv = new DataView(g.buffer);
    let o = 0;
    g[o++] = 3;                                                                     // DataSet: PartyCreationMenu 7000:0168
    const m49 = o; o += 0x800;                                                      // ecl_Mem4900 (InitGameState FillChar 0)
    gv.setUint16(m49 + 0x3F4, 0, true); gv.setUint16(m49 + 0x3FA, 1, true);         // wall-set slot 1: id 0, slot 1 (5700:0355)
    for (const off of [0x3F6, 0x3F8, 0x3FC, 0x3FE]) gv.setUint16(m49 + off, 0xFFFF, true);   // slots 2, 3 empty (5700:0374)
    gv.setUint16(m49 + 0x1F8, 1, true);                                             // GameSpeed 1 (5700:03c6)
    gv.setUint16(m49 + 0x1FE, 1 * 2 + 1, true);                                     // opt_MonsterPics*2 + opt_Portraits
    const m6b = o; o += 0x800;                                                      // ecl_Mem6B00
    gv.setUint16(m6b + 0x624, 3, true);                                             // DataSet (7500:1f0f)
    gv.setUint16(m6b + 0x67C, chars.length, true);                                  // party count (AddToParty 7500:1565)
    o += 0x400 + 0x1E00;                                                            // ecl_Mem9700, ecl_CodeBuf: zero
    g[o++] = 15; g[o++] = 1; g[o++] = 6; g[o++] = 0; g[o++] = 0;                    // party_MapX/Y/Dir (5700:0333..033d)
    g[o++] = 1;                                                                     // travel_Mode (5700:03f0)
    g[o++] = 0;                                                                     // game_Mode 0 = party menu (7000:017a)
    g[o++] = chars.length;
    chars.forEach((_, i) => { const s = `CHRDAT${slot}${i + 1}`; g[o + i * 41] = s.length; for (let k = 0; k < s.length; k++) g[o + i * 41 + 1 + k] = s.charCodeAt(k); });
    o += 328;
    if (o !== SAVGAM_SIZE) throw new Error('SAVGAM size ' + o);
    out.push([`SAVGAM${slot}.DAT`, g]);
    return out;
  }

  // ---- readable dump (party.json / README rows; printed by the Node wrapper, never committed after BYOC step 8) ------
  const thac0 = (c) => 60 - c.b[F.thac0], acOf = (c) => 60 - c.b[F.ac];
  function describe(c) {
    const b = c.b, lv = [];
    for (let k = 0; k < 8; k++) if (lvl(c, k) > 0) lv.push(lvl(c, k));
    const its = []; for (let it = c.items; it; it = it.next) its.push((it.b[0x34] ? '*' : '') + pstr(it.b, 0).trim());
    const mem = Array.from(b.subarray(F.mem, F.mem + 21)).filter((x) => x).map(SpellName);
    const known = []; for (let id = 1; id <= 0x38; id++) if (b[F.known + id]) known.push(SpellName(id));
    const str = b[F.str] === 18 && b[F.str_exc] ? `18/${b[F.str_exc] === 100 ? '00' : String(b[F.str_exc]).padStart(2, '0')}` : b[F.str];
    const money = Array.from({ length: 7 }, (_, k) => rdW(b, F.money + k * 2));
    return { name: pstr(b, 0), race: RaceName(b[F.race]), gender: GenderName(b[F.gender]), cls: ClassName(b[F.cls]), align: AlignmentName(b[F.align]),
      age: rdW(b, F.age), level: lv.join('/'), xp: xpOf(c), str, int: b[F.int], wis: b[F.wis], dex: b[F.dex], con: b[F.con], cha: b[F.cha],
      hp: `${b[F.hp]}/${b[F.hp_max]}`, ac: acOf(c), thac0: thac0(c), dmg: `${b[F.dice]}d${b[F.sides]}${sb(b[F.bonus]) >= 0 ? '+' : ''}${sb(b[F.bonus])}`,
      attacks: b[F.attacks], move: b[F.move], enc: rdW(b, F.enc), saves: Array.from(b.subarray(F.save, F.save + 5)).join(' '),
      thief: lvl(c, 6) > 0 ? Array.from(b.subarray(F.thief, F.thief + 8)).join(' ') : '', slots: Array.from(b.subarray(F.slots, F.slots + 6)).join(' '),
      items: its, mem, known, money };
  }

  return { build, files, describe, UpdateLevelStats, RecalcCharacter, SpellName, SpellCls, SpellLvl,
    // the single steps, for party specs other than PARTY (plus/cheats/party.js, W11 scenarios)
    create, modify, canTrain, trainOnce, buy, memorize, SPELL, xpOf, setXp, MaxHitPoints,
    tables: { RaceName, ClassName, GenderName, AlignmentName, RaceClasses, ClassAligns, XpForLevel, RaceLim, ClassAbilityMin } };
}

// One call: the 16 save files of the test party (slot C by default) as [name, Uint8Array] pairs + the characters.
export function buildTestParty({ ds, items, shop, level = 4, gold = 300, slot = 'C' }) {
  slot = String(slot).toUpperCase();
  if (!/^[A-J]$/.test(slot)) throw new Error('slot must be A..J (LoadGame 7500:16e6)');
  const rules = testPartyRules({ ds, items, shop });
  const chars = rules.build(level, gold);
  return { rules, chars, files: rules.files(chars, slot) };
}

// Read a party back from save files (ReadCharacter 7500:0AEC layout, as game/test/combat/harness.js loadSaveParty).
// `get(name)` returns the file's bytes or null.
export function readParty(get, slot) {
  const g = get(`SAVGAM${slot}.DAT`);
  const n = g[12808], out = [];
  for (let i = 0; i < n; i++) {
    let fn = ''; for (let k = 1; k <= g[12809 + i * 41]; k++) fn += String.fromCharCode(g[12809 + i * 41 + k]);
    const c = newChar(); c.b.set(get(fn + '.SAV').subarray(0, CHAR_SIZE));
    let last = null;
    const d = get(fn + '.ITM');
    if (d) for (let o = 0; o + ITEM_SIZE <= d.length; o += ITEM_SIZE) { const it = newItem(); it.b.set(d.subarray(o, o + ITEM_SIZE)); if (last) last.next = it; else c.items = it; last = it; }
    last = null;
    const s = get(fn + '.SPC');
    if (s) for (let o = 0; o + EFFECT_SIZE <= s.length; o += EFFECT_SIZE) { const e = newEffect(); e.b.set(s.subarray(o, o + EFFECT_SIZE)); if (last) last.next = e; else c.effects = e; last = e; }
    out.push(c);
  }
  return { g, chars: out };
}

// Browser: generate the party from the imported originals and write it into the save store (?testparty=1, BYOC screen
// "Add test party"). Inputs come through the engine's own readers, so this works with /data/ today and byoc.js later.
// Other CHRDAT<slot>* names are erased (an absent list = absent file, as the Node generator removed stale files).
export async function installTestParty({ slot = 'C', level = 4, gold = 300 } = {}) {
  const { G } = await import('../engine/state.js');
  const { fetchFile, LoadDaxRecord } = await import('../engine/dax.js');
  const { writeFile, eraseFile } = await import('../engine/files.js');
  if (!G.ds) await (await import('../engine/state.js')).initState();
  const items = await fetchFile('ITEMS');
  const shop = await LoadDaxRecord('ITEM3', '.DAX', 53);
  const { files } = buildTestParty({ ds: G.ds, items, shop, level, gold, slot });
  const written = new Set(files.map(([n]) => n));
  for (const [n, b] of files) await writeFile(n, b);
  for (let i = 1; i <= 8; i++) for (const e of ['SAV', 'ITM', 'SPC']) {
    const n = `CHRDAT${String(slot).toUpperCase()}${i}.${e}`;
    if (!written.has(n)) await eraseFile(n);
  }
  return files.map(([n, b]) => [n, b.length]);
}
