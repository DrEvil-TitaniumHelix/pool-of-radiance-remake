// game/areas/magic_ov22.js — ov22 (seg 8E00): spell lists, spell range/duration, the common spell resolver,
// camp target selection, CastSpell, scrolls, "casts" message, InitSpellTable. The spell handlers themselves
// (SpellHandlers[id], 8E00:0F4F..323C) are in magic_spells.js.
// Source: decode/pseudo/MAGIC.pas.md "## ov22 (8E00)" (verified, fixes #verify-3 / #fable-4 applied), MAGIC_SCREENS.md
// MAGIC-11..13, evidence decode/listings/ov22.lst (every routine re-read against the bytes while translating —
// build-area-template caution rules 1..3). Conventions: magic_core.js header.
//
// Local conventions of this unit
// - Pascal `var` parameters are ref objects `{ v }` (same as the COMBAT build): ChooseSpell(mode, page),
//   SelectTargetsCamp(spell, auto, ok), CastSpell(spell, auto, announce, used); a ref for SelectedChar-like
//   globals uses a getter/setter object.
// - Spell table SpellTable{DS:31FA}[id*16 + k] and SpellNames{DS:28E9}[id*29h] (string[40]) are read from g.ds.
// - Menu-list nodes (sl_List{DS:4766}, 46 bytes each): { b: Uint8Array(0x2E) (text string[40] +00, header flag +29h),
//   next } — the layout VerticalListMenu reads (same as combat_ov19.js).
// - sl_Ids{DS:476A} is a byte array declared 0..14h, directly followed by sl_Items{DS:477F} (far pointers 0..30h):
//   AddSpellLine writes sl_Ids[n] for any n — quirk: with more than 21 spell lines (spell book, Learn list) the
//   writes run into sl_Items. Modelled as an unbounded JS byte array g.sl_Ids plus a separate g.sl_Items array;
//   the overlap only matters if both are used for the same list (scroll lists stay below 21 lines in practice;
//   TODO(decode): overlap not reproduced byte-exactly).
// - SpellTargets{DS:6C91 + 4k}, k = 1..SpellTargetCount{DS:6C94}: g.SpellTargets[k] (JS refs), g.SpellTargetCount.

import { X, g, ds, dsPstr, pstr, setPstr, byte, word, shortint, chain } from './magic_core.js';
import { SpellHandlers as SPELL_HANDLERS, BreathWeapon } from './magic_spells.js';

// ---- local helpers -------------------------------------------------------------------------------------
const ref = (v) => ({ v });
const keyOf = (r) => (r !== null && typeof r === 'object' ? r.key : r);
const ch = (k) => (typeof k === 'string' ? k.charCodeAt(0) : (k ?? 0)) & 0xFF;
export const spellTbl = (id, k) => ds(0x31FA + byte(id) * 16 + k);          // SpellTable[id].b[k]
export const spellName = (id) => dsPstr(0x28E9 + byte(id) * 0x29);           // SpellNames[id] string[40]
const levelHeading = (lvl) => dsPstr(0x0A79 + byte(lvl) * 0x29);             // '1st Level'.. DS:0A79 + level*29h
const itemClass = (type) => ds(0x5582 + byte(type) * 16);                    // ITEMS[type] byte 0 (slot/class)
// GetMem($2E): fields set below. `text` / `isHeader` view the same bytes in the engine's TMenuItem shape, which
// VerticalListMenu (engine/menus.js) reads (RUN-2: cast list crashed in DrawText on p.text = undefined).
const newLine = () => {
  const b = new Uint8Array(0x2E);
  return {
    b, next: null,
    get text() { return pstr(b, 0); }, set text(s) { setPstr(b, 0, s, 40); },
    get isHeader() { return b[0x29]; }, set isHeader(v) { b[0x29] = v; },
  };
};
const ensure = () => {
  if (!g.sl_Ids) g.sl_Ids = [];
  if (!g.sl_Items) g.sl_Items = new Array(0x31).fill(null);
  if (!g.SpellTargets) g.SpellTargets = [];
  if (!g.SpellHandlers) g.SpellHandlers = [];
};

// 8E00:008A ChooseSpell(mode, var page: Integer): Byte — stub ov22 e1
export async function ChooseSpell(mode, page) {
  ensure();
  mode = byte(mode);
  let opt;                                                                   // [bp-5Bh] string[40]
  switch (mode) {                                                            // 8e00:0090
    case 1: opt = 'Cast'; break;                                             // cs:0000
    case 2: opt = 'Memorize'; break;                                         // cs:0005
    case 3: opt = 'Scribe'; break;                                           // cs:000E
    case 4: opt = 'Learn'; break;                                            // cs:0015
    default: opt = '';
  }
  const prompt = mode >= 1 && mode <= 4 ? 'Choose Spell: ' : '';             // 8e00:0104  set CS:001B = [1..4]
  const bottom = mode === 2 ? 0x0F : 0x16;                                   // 8e00:0124
  const showExit = mode === 4 ? 0 : 1;                                       // 8e00:0134  [bp-60h]
  const redraw = ref(0);                                                     // 8e00:0144  [bp-61h]
  if (((page.v << 16) >> 16) < 0) {                                         // 8e00:0148  JGE: signed Integer
    X.DrawTitledFrame(1, 3, 0x26, bottom, 0, 0, '');                         // 8e00:0173
    redraw.v = 1;                                                            // 8e00:0178
    page.v = 0;                                                              // 8e00:0181
  }
  if (mode === 4 || mode === 1) redraw.v = 1;                                // 8e00:0184
  const sel = ref(null);                                                     // 8e00:0194  [bp-5]: nil, not reset in the loop
  let key;
  do {                                                                       // 8e00:019C
    key = ch(keyOf(await X.VerticalListMenu(prompt, opt, 0x0D, 0x0A, 0x0F, 1, 5, 0x26, bottom,
      g.sl_List, showExit, redraw, page, sel)));                             // 8e00:01d7
  } while (![0, 13, 0x43, 0x45, 0x4C, 0x4D, 0x53].includes(key));            // 8e00:01e8  set CS:004A = [#0,#13,'C','E','L','M','S']
  let n = 0;                                                                 // 8e00:01fc
  for (let p = g.sl_List; p !== sel.v; p = p.next) {                         // 8e00:0200  (sel = nil: counts the whole list)
    if (!p) break;                                                           // (the original would run off nil; unreachable)
    if (p.b[0x29] === 0) n = byte(n + 1);                                    // 8e00:0213
  }
  let result;
  if ([0, 0x45].includes(key)) result = 0;                                   // 8e00:0239  set CS:006A = [#0,'E']
  else result = byte(g.sl_Ids[n] ?? 0);                                      // 8e00:024d  Enter and C/L/M/S pick the line
  if (mode === 3) g.ScrollItem = g.sl_Items[n] ?? null;                      // 8e00:0265  scroll chosen for Scribe
  g.sl_List = await X.FreeMenuList(g.sl_List) ?? null;                       // 8e00:0279  var list (freed -> nil)
  return result;
}

// 8E00:028D AddSpellLine(id: Byte)
export function AddSpellLine(id) {
  ensure();
  id = byte(id);
  let p = g.sl_List, n, prevLevel;
  if (!g.sl_List) {                                                          // 8e00:02a1
    p = newLine();                                                           // 8e00:02ae
    g.sl_List = p;
    prevLevel = 0;                                                           // 8e00:02c6
    n = 0;                                                                   // 8e00:02ca
  } else {
    n = 1;                                                                   // 8e00:02d0
    while (p.next) {                                                         // 8e00:02d4  every line but the last
      if (p.b[0x29] === 0) n = byte(n + 1);                                  // 8e00:02e4
      p = p.next;
    }
    prevLevel = spellTbl(g.sl_Ids[shortint(n) - 1] ?? 0, 1);                 // 8e00:0301  level of the last spell line
    p.next = newLine();                                                      // 8e00:031f
    p = p.next;
  }
  p.next = null;                                                             // 8e00:0340
  if (spellTbl(id & 0x7F, 1) !== prevLevel) {                                // 8e00:035e  new level: heading line first
    setPstr(p.b, 0, levelHeading(spellTbl(id & 0x7F, 1)), 40);              // 8e00:038b
    p.b[0x29] = 1;                                                           // 8e00:0393
    p.next = newLine();                                                      // 8e00:039c
    p = p.next;
    p.next = null;                                                           // 8e00:03bd
  }
  const prefix = id > 0x7F ? ' *' : '  ';                                    // 8e00:03ca  ' *' = chosen, not yet memorised
  setPstr(p.b, 0, (prefix + spellName(id & 0x7F)).slice(0, 40), 40);        // 8e00:03de .. 042a
  p.b[0x29] = 0;                                                             // 8e00:0432
  g.sl_Ids[shortint(n)] = id & 0x7F;                                         // 8e00:0444  quirk: no bound (see header)
}

// 8E00:044E AddItemSpells(pendingOnly: Boolean) — item = ScrollItem{DS:6B80}
export async function AddItemSpells(pendingOnly) {
  ensure();
  const c = g.SelectedChar, it = g.ScrollItem;
  if (await X.HasEffect(c, 0x10, ref(null)) ||                               // 8e00:0464  Read Magic
      (shortint(c.b[0x96]) > 0 /* level[0] cleric, JLE signed */ && itemClass(it.b[0x2E]) === 0x0C)) {   // 8e00:0471 / 0489
    it.b[0x35] = 0;                                                          // 8e00:0494  hidden/unread cleared
  }
  if (it.b[0x35] !== 0) return;                                              // 8e00:049d
  for (let k = 1; k <= 3; k++) {                                             // 8e00:04a4
    const pw = it.b[0x3B + k];                                               // power[k]
    if ((pendingOnly && pw > 0x80) || (!pendingOnly && pw > 0)) {            // 8e00:04ad .. 04db  (pending: JA 80h)
      AddSpellLine(pw);                                                      // 8e00:04ee
      g.sl_Items[byte(g.sl_ItemCount ?? 0)] = g.ScrollItem;                  // 8e00:0504
      g.sl_ItemCount = byte((g.sl_ItemCount ?? 0) + 1);                      // 8e00:050c
    }
  }
}

// 8E00:051C AddScrollSpells(pendingOnly: Boolean)
export async function AddScrollSpells(pendingOnly) {
  ensure();
  for (let i = 0; i <= 0x30; i++) g.sl_Items[i] = null;                      // 8e00:0522
  g.sl_ItemCount = 0;                                                        // 8e00:0546
  g.ScrollItem = g.SelectedChar.items;                                       // 8e00:054b  TChar +C8h
  while (g.ScrollItem) {                                                     // 8e00:0560
    if (IsScroll(g.ScrollItem)) await AddItemSpells(pendingOnly);            // 8e00:0572 / 057e
    g.ScrollItem = g.ScrollItem.next;                                        // 8e00:0581  quirk: ends with ScrollItem = nil
  }
}

// 8E00:059C BuildSpellList(mode: Byte): Boolean — stub ov22 e2
export async function BuildSpellList(mode) {
  ensure();
  const c = g.SelectedChar;
  g.sl_List = null;                                                          // 8e00:05a6  (no FreeMenuList)
  for (let i = 0; i <= 0x14; i++) g.sl_Ids[i] = 0;                           // 8e00:05ae
  switch (byte(mode)) {
    case 0:                                                                  // 8e00:05d0  memorised
      for (let i = 0; i <= 0x14; i++) { const s = c.b[0x17 + i]; if (s > 0 && s < 0x80) AddSpellLine(s); }
      break;
    case 5:                                                                  // 8e00:061e  chosen, not yet memorised
      for (let i = 0; i <= 0x14; i++) { const s = c.b[0x17 + i]; if (s > 0x7F) AddSpellLine(s); }
      break;
    case 1:                                                                  // 8e00:065a  spell book
      for (let id = 1; id <= 0x37; id++) if (c.b[0x32 + id] !== 0) AddSpellLine(id);
      break;
    case 2: await AddItemSpells(false); break;                               // 8e00:068e  current item
    case 3: await AddScrollSpells(false); break;                             // 8e00:069c
    case 6: await AddScrollSpells(true); break;                              // 8e00:06a9
    case 4:                                                                  // 8e00:06b2  Learn
      for (let id = 1; id <= 0x38; id++) {
        const slot = 0xB1 + shortint(spellTbl(id, 0)) * 3 + shortint(spellTbl(id, 1));   // +B1h + class*3 + level (CBW)
        if (c.b[slot] > 0 && c.b[0x32 + id] === 0) AddSpellLine(id);         // 8e00:06eb / 06fe  = spell_slots[cls*3+lvl-1]
      }
      break;
  }
  return g.sl_List ? 1 : 0;                                                  // 8e00:0713
}

// 8E00:0729 SpellRange(spell: Byte): Byte — stub ov22 e3
export async function SpellRange(spell) {
  spell = byte(spell);
  let r;
  if (byte(g.ItemCast ?? 0) === 0)                                           // 8e00:072f
    r = byte(spellTbl(spell, 2) + spellTbl(spell, 3) * byte(await X.SpellCasterLevel(spell)));   // 8e00:073a .. 076b
  else
    r = byte(spellTbl(spell, 2) + spellTbl(spell, 3) * 6);                   // 8e00:0770 .. 079e  item: level 6
  if (r === 0 && spellTbl(spell, 6) !== 0) r = 1;                            // 8e00:07a1  area spells reach 1
  if (r === 0xFF) r = 1;                                                     // 8e00:07bd  touch
  return r;
}

// 8E00:07D6 SpellDuration(spell: Byte): Word
export async function SpellDuration(spell) {
  spell = byte(spell);
  let d;
  switch (spell) {
    case 0x28: d = word(byte(X.Roll(1, 6)) * 10); break;                     // 8e00:07e9  Cause Disease
    case 0x39: case 0x3D: d = byte(X.Roll(5, 4)); break;                     // 8e00:0809
    case 0x3B: d = word(byte(X.Roll(1, 4)) * 10 + 0x28); break;              // 8e00:0820
    case 0x3F:
      if (g.game_Mode === 5) d = word(byte(X.Roll(2, 10)) * 10);             // 8e00:0846
      else d = word((byte(X.Roll(1, 10)) + 10) * 10);                        // 8e00:085d
      break;
    case 0x43: d = 0x5A0; break;                                             // 8e00:0875  1440
    default:
      d = word(spellTbl(spell, 4) + spellTbl(spell, 5) * byte(await X.SpellCasterLevel(spell)));   // 8e00:0880
  }
  return d;
}

// 8E00:08C3 ApplySpell(spell, level, onRemove, damage, dmgType: Byte; msg: string[40]) — the common resolver
export async function ApplySpell(spell, level, onRemove, damage, dmgType, msg) {
  ensure();
  spell = byte(spell); damage = byte(damage);
  const m = String(msg).slice(0, 40);                                        // 8e00:08d7  StrAssign 28h
  g.DamageType = damage === 0 ? 0 : byte(dmgType);                           // 8e00:08dc
  if (byte(g.SpellTargetCount) === 0) return;                                // 8e00:08ef
  let lvl = byte(level);
  if (lvl === 0) lvl = byte(await X.SpellCasterLevel(spell));                // 8e00:0903
  const count = byte(g.SpellTargetCount);                                    // 8e00:0913  copied once
  for (let k = 1; k <= count; k++) {                                         // 8e00:0923
    const t = g.SpellTargets[k];
    if (!t) continue;                                                        // 8e00:093a
    let saved;
    if (spellTbl(spell, 8) === 0) saved = 0;                                 // 8e00:0967  no save effect
    else saved = (await X.SavingThrow(t, spellTbl(spell, 9), 0)) ? 1 : 0;   // 8e00:098d
    if (spellTbl(g.sp_Current ?? 0, 2) === 0xFF) {                           // 8e00:09a0  touch spell (range of sp_Current!)
      await X.RecalcCharacter(t);                                            // 8e00:09ad
      await X.CallEffectHooks(0x0B, t);                                      // 8e00:09bb
      if (!(await X.AttackRoll(g.SelectedChar, t, t.b[0x111] /* ac */))) {   // 8e00:09d7
        damage = 0;                                                          // 8e00:09e0  quirk: stays 0 for later targets
        saved = 1;                                                           // 8e00:09e4
      }
    }
    if (damage > 0) await X.DamageCharacter(t, damage, spellTbl(spell, 8), saved);   // 8e00:0a0c
    if (spellTbl(spell, 0x0A) > 0)                                           // 8e00:0a1c
      await X.ApplyEffect(t, spellTbl(spell, 0x0A), await SpellDuration(spell), lvl, byte(onRemove),
        spellTbl(spell, 8), saved, m);                                       // 8e00:0a3e / 0a63
  }
  g.DamageType = 0;                                                          // 8e00:0a73
}

// 8E00:0A91 SelectTargetsCamp(spell, auto: Byte; var ok: Boolean) — stub ov22 e4, SpellHandlers[0] outside combat
export async function SelectTargetsCamp(spell, auto, ok) {
  ensure();
  if (!g.sp_CampTarget) g.sp_CampTarget = g.SelectedChar;                    // 8e00:0a97
  g.SpellTargets[1] = g.SelectedChar;                                        // 8e00:0aae
  g.SpellTargetCount = 1;                                                    // 8e00:0abc
  ok.v = 1;                                                                  // 8e00:0ac4
  switch (spellTbl(spell, 7)) {                                              // 8e00:0ad3  target mode
    case 1: break;                                                           // the caster
    case 2: {                                                                // one party member
      await X.RedrawCurrentMode();                                           // 8e00:0ae2
      const who = { get v() { return g.sp_CampTarget; }, set v(x) { g.sp_CampTarget = x; } };   // @sp_CampTarget
      await X.SelectPartyCharacter('Cast Spell on whom', 1, who);           // 8e00:0afe
      if (!g.sp_CampTarget) {                                                // 8e00:0b03
        g.SpellTargets[1] = null; g.SpellTargetCount = 0; ok.v = 0;          // 8e00:0b0c .. 0b1c
      } else g.SpellTargets[1] = g.sp_CampTarget;                            // 8e00:0b22
      break;
    }
    case 4:                                                                  // whole party
      g.SpellTargets[g.SpellTargetCount] = g.PartyHead;                      // 8e00:0b36  (count = 1)
      while (g.SpellTargets[g.SpellTargetCount].next) {                      // 8e00:0b51
        g.SpellTargets[g.SpellTargetCount + 1] = g.SpellTargets[g.SpellTargetCount].next;   // 8e00:0b91
        g.SpellTargetCount = byte(g.SpellTargetCount + 1);                   // 8e00:0b99
      }
      break;
    default: ok.v = 0;                                                       // 8e00:0ba1  combat-only spell
  }
}

// 8E00:0C20 CastSpell(spell, auto, announce: Byte; var used: Boolean) — stub ov22 e5
export async function CastSpell(spell, auto, announce, used) {
  ensure();
  spell = byte(spell);
  const caster = g.SelectedChar;                                             // 8e00:0c26  [bp-9]
  let again = true;                                                          // 8e00:0c33  [bp-1]
  if (g.game_Mode !== 5 && spellTbl(spell, 7) === 0) {                       // 8e00:0c37 / 0c4c  combat-only, outside combat
    if (byte(g.ItemCast ?? 0) === 0) {                                       // 8e00:0c56
      X.DrawText(1, 0x13, 0x0A, spellName(spell));                           // 8e00:0c78
      X.DrawText(1, 0x14, 0x0A, 'is a combat-only spell...');                // 8e00:0c95
      if (ch(keyOf(await X.AskYesNo('Lose it? ', 0x0D, 0x0F, 0x0A))) === 0x59)   // 8e00:0cb2
        await X.ForgetMemorizedSpell(spell);                                 // 8e00:0cbf
    } else {
      X.DrawText(1, 0x13, 0x0A, 'That Item');                                // 8e00:0cde
      X.DrawText(1, 0x14, 0x0A, 'is a combat-only item...');                 // 8e00:0cfb
      if (ch(keyOf(await X.AskYesNo('Use it? ', 0x0D, 0x0F, 0x0A))) === 0x59) used.v = 1;   // 8e00:0d18 / 0d24
    }
    announce = 0;                                                            // 8e00:0d28
    again = false;                                                           // 8e00:0d2c
  }
  if (byte(announce) !== 0 && byte(g.ItemCast ?? 0) === 0)                   // 8e00:0d30 / 0d36
    await ShowCasts(caster, 'casts', spell);                                 // 8e00:0d57
  while (again) {                                                            // 8e00:0d5a
    await g.SpellHandlers[0](spell, auto, used);                             // 8e00:0d70  choose targets (camp/combat)
    if (used.v) {                                                            // 8e00:0d77
      again = false;                                                         // 8e00:0d80
      if (g.game_Mode === 5) {                                               // 8e00:0d84
        await X.BuildFourAnimationFrames(0x12);                              // 8e00:0d91
        const col = byte(await X.CombatantCol(caster));                      // 8e00:0d9c
        const row = byte(await X.CombatantRow(caster));                      // 8e00:0daa
        let dir = 0;                                                         // 8e00:0db2
        while (!(await X.InFrontArc(col, row, g.SpellX, g.SpellY, dir))) dir = byte(dir + 1);   // 8e00:0dca
        await X.ShowCombatant(caster, dir, 1, 0);                            // 8e00:0de8  casting pose
        await X.SetSoundTimerMode(0);                                        // 8e00:0df0
        if (spell === 0x2F) await X.PlayOrStopSound(g.g_262A);               // 8e00:0e00  Fireball
        else if (spell === 0x33) await X.PlayOrStopSound(g.g_2624);          // 8e00:0e0f  Lightning Bolt
        else await X.PlayOrStopSound(g.g_2618);                              // 8e00:0e1a
        await X.AnimateAlongPath(col, row, g.SpellX, g.SpellY, 4, 0x1E);     // 8e00:0e35
        await X.SetSoundTimerMode(10);                                       // 8e00:0e3e
        if (await X.IsVisible(caster, 0)) {                                  // 8e00:0e4c
          await X.ShowCombatant(caster, caster.combat.b[9], 1, 1);           // 8e00:0e6e  combat record +9 (facing)
          await X.ShowCombatant(caster, caster.combat.b[9], 0, 0);           // 8e00:0e8c
        }
      }
      await X.ov24_0FD2(caster);                                             // 8e00:0e97  break invisibility (effect 19h)
      if (byte(g.ItemCast ?? 0) === 0) await X.ForgetMemorizedSpell(spell);  // 8e00:0ea7
      g.sp_Current = spell;                                                  // 8e00:0eac
      await g.SpellHandlers[g.sp_Current]();                                 // 8e00:0ebd
      g.sp_Current = 0;                                                      // 8e00:0ec1
      g.SpellArea = 0;                                                       // 8e00:0ec6
    } else if (g.game_Mode !== 5) {                                          // 8e00:0ecd
      again = false;                                                         // 8e00:0ed4  camp: selection cancelled
    } else if (byte(auto) !== 0 ||
               ch(keyOf(await X.AskYesNo('Abort Spell? ', 0x0E, 0x0A, 0x0F))) === 0x59) {   // 8e00:0eda / 0ef8
      await X.ShowTimedBottomMessage('Spell Aborted');                       // 8e00:0f10
      if (byte(g.ItemCast ?? 0) === 0) await X.ForgetMemorizedSpell(spell);  // 8e00:0f20
      again = false;                                                         // 8e00:0f25
    }                                                                        // 'N': choose targets again
  }
  await X.ClearCharacterMessage();                                           // 8e00:0f2c
  if (g.game_Mode === 5) X.ClearRectangle(0, 0x17, 0x27, 0x17);              // 8e00:0f44
}

// 8E00:323D IsScroll(item): Boolean — stub ov22 e6
export function IsScroll(item) {
  if (!item) return 0;                                                       // 8e00:3243
  const cl = itemClass(item.b[0x2E]);
  return cl > 0x0A && cl < 0x0E ? 1 : 0;                                     // 8e00:325a / 3270  class 0Bh..0Dh
}

// 8E00:328A UseScrollSpell(owner, item; spell: Byte) — stub ov22 e7
export async function UseScrollSpell(owner, item, spell) {
  const id = byte(spell) & 0x7F;                                             // 8e00:3290
  let found = 0;                                                             // 8e00:3298
  for (let k = 1; k <= 3; k++) if ((item.b[0x3B + k] & 0x7F) === id) found = k;   // 8e00:329c  last match
  if (found === 0) return;                                                   // 8e00:32c6
  item.b[0x3B + found] = 0;                                                  // 8e00:32d8
  item.b[0x30] = byte(item.b[0x30] - 1);                                     // 8e00:32e0  charges (+30h)
  if (item.b[0x30] < 0xD2) await X.LoseItem(owner, item);                    // 8e00:32e7 / 32fa  (JNC: unsigned)
}

// 8E00:331A ShowCasts(c; msg: string[40]; spell: Byte) — stub ov22 e8
export async function ShowCasts(c, msg, spell) {
  const m = String(msg).slice(0, 40);                                        // 8e00:332f
  if (g.game_Mode === 5) {                                                   // 8e00:3334
    await X.ShowCharacterMessage(c, 'Casts a Spell', 0x0A, 1);               // 8e00:3356
    X.ClearRectangle(0, 0x17, 0x27, 0x17);                                   // 8e00:3367
    X.DrawText(0, 0x17, 0x0A, 'Spell:' + spellName(spell));                  // 8e00:339c
  } else {
    X.ClearRectangle(1, 0x12, 0x26, 0x16);                                   // 8e00:33af
    await X.DrawCharacterName(c, 1, 0x13, 0);                                // 8e00:33c3
    X.DrawText(c.b[0] + 2, 0x13, 0x0A, m);                                   // 8e00:33de  Length(name) + 2
    X.DrawText(1, 0x14, 0x0A, spellName(spell));                             // 8e00:33fe
    await X.MessageDelay();                                                  // 8e00:3403
    await X.ClearCharacterMessage();                                         // 8e00:3408
  }
}

// Handler table as InitSpellTable writes it (8e00:3413..37ad, decoded from the bytes: far pointers to ov22 stub
// entries 0096:00xx, resolved to the ov22 routine they jump to). Index = spell id; 0 = target selector.
export const SPELL_HANDLER_ADDR = [
  '8E00:0A91', '8E00:100F', '8E00:1040', '8E00:106B', '8E00:10A7', '8E00:10E9', '8E00:1123', '8E00:1123',
  '8E00:1162', '8E00:1190', '8E00:11DD', '8E00:10E9', '8E00:12A5', '8E00:136E', '8E00:13D8', '8E00:1439',
  '8E00:1123', '8E00:1123', '8E00:10E9', '8E00:1499', '8E00:14C7', '8E00:151B', '8E00:10E9', '8E00:1658',
  '8E00:17E9', '8E00:1822', '8E00:185B', '8E00:190F', '8E00:19C3', '8E00:10E9', '8E00:1A16', '8E00:1A4F',
  '8E00:1A8A', '8E00:1ACC', '8E00:1B11', '8E00:1F41', '8E00:206F', '8E00:2217', '8E00:225D', '8E00:232F',
  '8E00:234C', '8E00:2385', '8E00:24D6', '8E00:2540', '8E00:2604', '8E00:263D', '8E00:2385', '8E00:266B',
  '8E00:2892', '8E00:1658', '8E00:1A16', '8E00:2BB7', '8E00:1123', '8E00:1123', '8E00:1123', '8E00:2C09',
  '8E00:2C43', '8E00:2E02', '8E00:2E4D', '8E00:2EE5', '8E00:2F4D', '8E00:2F99', '8E00:2FD0', '8E00:302A',
  '8E00:266B', '8E00:3058', '8E00:3092', '8E00:30A2',
];

// 8E00:3413 InitSpellTable — stub ov22 e10 (caller ov11, game start)
export function InitSpellTable() {
  ensure();
  g.SpellHandlers = [];
  g.SpellHandlers[0] = SelectTargetsCamp;                                    // 8e00:341c
  g.cure_InProgress = 0;                                                     // 8e00:3423  g_681F
  g.ItemCast = 0;                                                            // 8e00:3428  g_6DBF
  g.sp_CampTarget = null;                                                    // 8e00:342f
  g.ItemsChanged = 1;                                                        // 8e00:3435  g_6821
  for (let id = 1; id <= 67; id++) g.SpellHandlers[id] = SPELL_HANDLERS[id];   // 8e00:343a .. 3712  (table above)
  if (!g.EffectHandler) g.EffectHandler = [];
  g.EffectHandler[0x58] = BreathWeapon;                                      // g_6988 = DS:6828 + 58h*4 (CallEffectHandler)
}
