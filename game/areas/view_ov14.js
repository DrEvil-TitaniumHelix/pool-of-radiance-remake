// game/areas/view_ov14.js — VIEW ov14 (6600): party movement, doors, the 3D / overland command loop.
// por-only: Pool GEO/wall/picture layouts, asset names and travel rendering (whole module) (profile: engine.areaModules / daxGroups / areas; game/profiles/PORONLY.md)
// Owner: por-build-ecl. Source: decode/pseudo/VIEW.pas.md ov14 (verified); ExploreCommand, TryWalkOffMap, MoveParty
// and StepOverland re-read from decode/listings/ov14.lst (caution rule 2: menu loops / prose parts).
// Findings from the bytes: the overland branch of ExploreCommand has no 'A' and calls CastMenu without the status test;
// HorizontalMenu is called as ('', menu, 0Dh, 0Ah, 0Fh, allowExt 1, animate 0, var ext); the door menu as
// ('Locked. ', opts, 0Dh, 0Ah, 0Fh, 0, 0, var ext).
// Globals: g = ecl_host.js eclG (state.js G). ECL words: Mem6B00 w[$592] = ECL 6DC9 (block next move), w[$594] = 6DCA
// (search/look bits), w[$5AA] = 6DD5 (left the map); Mem4900 w[$1F6] = 49FB (area map off), w[$186]/[$188] = 49C3/49C4
// (overland x/y), w[$344] = 4AA2 (river passable).

import { view, GetPassage, GetWallType, GetCellAttr, Draw3DView } from './view.js';
import { HorizontalMenu, menu } from '../engine/menus.js';
import { ShowTimedBottomPrompt, ClearRectangle } from '../engine/text.js';
import { FreePicture } from '../engine/pictures.js';
import { setPointerRegion, clearPointerRegion, KEY } from '../engine/input.js';
import { hooks } from '../plus/hooks.js';   // GBP W1 (docs/PLUS_HOOKS.md)

const DX = [0, 1, 1, 1, 0, -1, -1, -1, 0];               // g_2736
const DY = [-1, -1, 0, 1, 1, 1, 0, -1, 0];               // g_273F
const sx8 = (v) => ((v & 0xFF) ^ 0x80) - 0x80;
const g = new Proxy({}, { get: (_, k) => view.g[k], set: (_, k, v) => { view.g[k] = v; return true; } });
const m0 = (a) => view.m0(a), setM0 = (a, v) => view.setM0(a, v);
const m1 = (a) => view.m1(a), setM1 = (a, v) => view.setM1(a, v);

// Other areas' routines by published name (combat ov19/ov24, magic ov15, res00ba, party ov20, engine audio, VIEW ov28/ov32).
const AREAS = ['./combat.js', './magic.js', './res_00ba.js', './party.js', '../engine/audio.js', './view_ov28.js', './view_ov32.js'];
const ext = {};
let extReady = null;
const warned = new Set();
export function bindOv14(more = {}) { Object.assign(ext, more); }
async function ensureExt() {
  if (!extReady) extReady = (async () => {
    for (const m of AREAS) {
      try { const mod = await import(m); for (const [k, v] of Object.entries(mod)) if (typeof v === 'function' && !(k in ext)) ext[k] = v; }
      catch { /* area not built yet */ }
    }
  })();
  return extReady;
}
const X = new Proxy({}, {
  get(_, name) {
    if (typeof ext[name] === 'function') return ext[name];
    return (...a) => { if (!warned.has(name)) { warned.add(name); console.warn('VIEW ov14: ' + String(name) + ' not bound yet'); } return 0; };
  },
});

// 6600:0000 ClosePassage(x, y, dir) — no bounds check
export function ClosePassage(x, y, dir) {
  const i = 0x300 + sx8(y) * 16 + sx8(x);
  const m = { 6: 0x3F, 4: 0xCF, 2: 0xF3, 0: 0xFC }[dir];
  if (m !== undefined && i >= 0 && i < 0x400) view.map[i] &= m;          // 6600:0018
}

// 6600:0109 OpenPassage(x, y, dir)
export function OpenPassage(x, y, dir) {
  x = sx8(x); y = sx8(y);
  if (x < 0 || x > 15 || y < 0 || y > 15) return;
  const i = 0x300 + y * 16 + x;
  switch (dir) {                                                         // 6600:013c
    case 6: view.map[i] = (view.map[i] & 0x3F) | 0x40; break;
    case 4: view.map[i] = (view.map[i] & 0xCF) | 0x10; break;
    case 2: view.map[i] = (view.map[i] & 0xF3) | 0x04; break;
    case 0: view.map[i] = (view.map[i] & 0xFC) | 0x01; break;
  }
}

// 6600:0236 PartyHasClass(cls): some member with level[cls] (TChar +96h+cls) > 0
export function PartyHasClass(cls) {
  for (let c = g.PartyHead; c; c = c.next) if (c.b[0x96 + cls] > 0) return true;   // 6600:0264
  return false;
}

function openBothSides() {
  OpenPassage(g.party_MapX, g.party_MapY, g.party_Dir);                                              // 6600:0491
  OpenPassage(sx8(g.party_MapX) + DX[g.party_Dir], sx8(g.party_MapY) + DY[g.party_Dir], (g.party_Dir + 4) % 8);   // 6600:04cf
}

// 6600:0294 BashDoor
export async function BashDoor() {
  let ok = false;
  const roll = (n, s) => X.Roll(n, s);
  for (let c = g.PartyHead; c && !ok; c = c.next) {
    const str = c.b[0x10], exc = c.b[0x16];                              // TChar str +10h, str_exc +16h
    if (GetPassage(g.party_MapX, g.party_MapY, g.party_Dir) === 3) {     // 6600:02d4 wizard-locked
      if (str === 18) {
        if (exc >= 91 && exc <= 99) ok = await roll(1, 6) === 1;          // 6600:0300
        else if (exc === 100) ok = await roll(1, 6) < 3;                  // 6600:0319
        else g.door_CanBash = 0;                                         // 6600:0328
      } else if (str === 19 || str === 20) ok = await roll(1, 6) < 4;    // 6600:033d
      else if (str === 21 || str === 22) ok = await roll(1, 6) < 5;      // 6600:035a
      else if (str === 23) ok = await roll(1, 6) < 6;                    // 6600:0373
      else if (str === 24) ok = await roll(1, 8) < 8;                    // 6600:038c
      else if (str === 25) ok = true;
      else g.door_CanBash = 0;                                           // 6600:03a5
    } else {
      if (str >= 3 && str <= 7) ok = await roll(1, 6) === 1;             // 6600:03c2
      else if (str >= 8 && str <= 15) ok = await roll(1, 6) < 3;         // 6600:03e0
      else if (str === 16 || str === 17) ok = await roll(1, 6) < 4;      // 6600:03fd
      else if (str === 18) {
        if (exc < 51) ok = await roll(1, 6) < 4;                         // 6600:0425
        else if (exc < 100) ok = await roll(1, 6) < 5;                   // 6600:0442
        else ok = await roll(1, 6) < 6;                                  // 6600:045b
      }
    }
  }
  if (ok) openBothSides();
  return ok;
}

// 6600:04DF PickLock
export async function PickLock() {
  let ok = false;
  for (let c = g.PartyHead; c && !ok; c = c.next)
    if (await X.Roll(1, 100) <= c.b[0x78] && c.b[0x10C] === 0) ok = true;   // 6600:0513 thief_skill[1] +78h, status +10Ch
  g.door_CanPick = 0;                                                    // 6600:0545
  if (ok) openBothSides();                                               // 6600:055d / 059b
  return ok;
}

// 6600:05AB FindMemorizedSpell(spell, c): slot 0..20 of mem_spell (+17h) or FFh
export function FindMemorizedSpell(spell, c) {
  for (let i = 0; i <= 20; i++) if (c.b[0x17 + i] === spell) return i;   // 6600:05b5
  return 0xFF;
}
// 6600:05EE FindCasterOf(spell)
export function FindCasterOf(spell) {
  for (let c = g.PartyHead; c; c = c.next) if (FindMemorizedSpell(spell, c) !== 0xFF) return c;   // 6600:0614
  return null;
}
// 6600:0648 CastKnock
export function CastKnock() {
  const c = FindCasterOf(0x1F);                                          // 6600:0652
  if (!c) return false;
  c.b[0x17 + FindMemorizedSpell(0x1F, c)] = 0;                           // 6600:066d
  return true;
}

// 6600:068D TryWalkOffMap — from the bytes 6600:068d..0738
export function TryWalkOffMap() {
  let x = sx8(g.party_MapX), y = sx8(g.party_MapY);
  const dir = g.party_Dir;
  setM1(0x6DD5, 0);                                                      // 6600:06a9 Mem6B00 w[$5AA]
  if (GetPassage(x, y, dir) === 0) return;                               // 6600:06c0
  x += DX[dir]; y += DY[dir];
  if (x > 15) { g.party_MapX = 15; setM1(0x6DD5, 1); }                   // 6600:06e5
  if (x < 0) { g.party_MapX = 0; setM1(0x6DD5, 1); }
  if (y > 15) { g.party_MapY = 15; setM1(0x6DD5, 1); }
  if (y < 0) { g.party_MapY = 0; setM1(0x6DD5, 1); }
}

// 6600:073B StepForward3D
export async function StepForward3D() {
  await X.PlayOrStopSound(g.g_2628);                                     // 6600:0742
  let x = sx8(g.party_MapX) + DX[g.party_Dir], y = sx8(g.party_MapY) + DY[g.party_Dir];   // 6600:0752 / 0761
  if (x > 15) x = 0; if (x < 0) x = 15; if (y > 15) y = 0; if (y < 0) y = 15;            // 6600:0765
  g.party_MapX = x & 0xFF; g.party_MapY = y & 0xFF;
  g.party_Ahead = GetWallType(g.party_MapX, g.party_MapY, g.party_Dir);  // 6600:07a1
  g.door_CanBash = 1; g.door_CanPick = 1; g.door_CanKnock = 1;           // 6600:07b5 FillChar(door_CanBash, 3, 1)
  g.party_CellAttr = GetCellAttr(g.party_MapX, g.party_MapY);            // 6600:07c2
  if (m1(0x6DCA) & 1) await X.AdvanceClock(1, 2);                        // 6600:07e0 search mode
  else await X.AdvanceClock(1, 1);                                       // 6600:07ed
}

// 6600:0818 StepOverland — from the bytes (byte coordinates, signed clamps)
const IMPASSABLE = (t) => t === 0x4E || (t >= 0x7E && t <= 0x80) || (t >= 0x82 && t <= 0x84) || (t >= 0xA8 && t <= 0xAC) ||
  (t >= 0xAE && t <= 0xB3) || t === 0xBC || (t >= 0xDD && t <= 0xDE) || (t >= 0xE1 && t <= 0xE9) || t === 0xF5;
export const OverlandImpassable = IMPASSABLE;                           // GBP W3: the same rule for click travel
export async function StepOverland() {
  let nx = sx8(m0(0x49C3) + DX[g.party_Dir]), ny = sx8(m0(0x49C4) + DY[g.party_Dir]);   // 6600:081e / 0841 (byte)
  if (nx < 0) nx = 0; if (nx > 15) nx = 15;                              // 6600:0864
  if (ny < 0) ny = 0; if (ny > 0x23) ny = 0x23;
  const col = sx8(nx + g.ds[0x3C76 + g.travel_Mode]);                    // g_3C76 window column offset
  const t = g.ds[0x3648 + ny * 44 + col];                                // g_3648 overland map 36 x 44
  if (IMPASSABLE(t)) return;                                             // 6600:08bb
  if ((t >= 0x66 && t <= 0x6C) || t === 0x72) {                          // 6600:08f9 river
    if (m0(0x4AA2) === 0) { await ShowTimedBottomPrompt("The river's stench drives you back.", 0x0E); return; }   // 6600:0923
  }
  setM0(0x49C3, nx & 0xFFFF); setM0(0x49C4, ny & 0xFFFF);                // 6600:092d / 094a
  await X.AdvanceClock(0x0C, 3);                                         // 6600:0971
}

// 6600:0989 ExploreCommand — from the bytes 6600:0989..0d4b; returns the key (char code)
export async function ExploreCommand() {
  await ensureExt();
  setM1(0x6DC9, 0);                                                      // 6600:0995
  let key = 0, ext_ = false, done;
  const look = async () => { setM1(0x6DCA, m1(0x6DCA) | 2); await X.AdvanceClock(1, 2); view.setEclPC(view.vecB()); };   // 6600:0a79..0aa0
  const turn = async (add, sound) => {
    g.party_Dir = (g.party_Dir + add) % 8;
    if (sound) await X.PlayOrStopSound(g.g_2628);                        // 6600:0b14 / 0b59
    g.party_Ahead = GetWallType(g.party_MapX, g.party_MapY, g.party_Dir);
    Draw3DView(g.party_MapX, g.party_MapY, g.party_Dir);
    hooks.emit('moved', () => ({ ...hooks.state.position(), from: { x: g.party_MapX, y: g.party_MapY }, stepped: false, turned: add }));   // 6600:0b14
  };
  if (g.travel_Mode === 1) {                                             // 6600:099a
    done = false;
    do {
      // pointer layer (engine/input.js): a click in the 3D view (pixels 24..111, VIEW-01) = Left / Up / Right by thirds
      setPointerRegion('view', { x1: 24, y1: 24, x2: 111, y2: 111, prio: 1,
        keysAt: (x) => [x < 53 ? KEY.left : x < 83 ? KEY.up : KEY.right] });
      menu.abortWhen = hooks.safePointWanted;                            // GBP #14: a pending Plus cheat ends the wait
      const r = await HorizontalMenu('', 'Area Cast View Encamp Search Look', 0x0D, 0x0A, 0x0F, 1, 0);   // 6600:09d0 DS:04B6
      menu.abortWhen = null;
      if (r.aborted) { key = 0; break; }
      key = r.key.charCodeAt(0); ext_ = r.ext;
      if (!ext_) {
        if (key === 0x41) {                                              // 'A'
          if (m0(0x49FB) === 0) { g.view_AreaMap = g.view_AreaMap ? 0 : 1; Draw3DView(g.party_MapX, g.party_MapY, g.party_Dir); }
          else await ShowTimedBottomPrompt('Not Here', 0x0E);            // 6600:0a26
        } else if (key === 0x43) { if (g.SelectedChar.b[0x10C] === 0) await X.CastMenu(); }   // 'C' 6600:0a3d
        else if (key === 0x56) await X.ViewMenu({ v: 0 });               // 'V' 6600:0a4d (var local [BP-2Eh])
        else if (key === 0x45) done = true;                              // 'E'
        else if (key === 0x53) setM1(0x6DCA, m1(0x6DCA) ^ 1);            // 'S' 6600:0a5e
        else if (key === 0x4C) { await look(); done = true; }            // 'L'
      } else {
        if (key === 0x48) { TryWalkOffMap(); done = true; }              // Up 6600:0ab2
        else if (key === 0x50) await turn(4, false);                     // Down 6600:0ade
        else if (key === 0x4B) await turn(6, true);                      // Left
        else if (key === 0x4D) await turn(2, true);                      // Right
        else { await X.CycleSelectedChar(String.fromCharCode(key)); await X.DrawPartyRoster(g.SelectedChar); }   // 6600:0b89 / 0b96
      }
      await X.DrawLocationTimeStatus();                                  // 6600:0b9b
    } while (!done);
    clearPointerRegion('view');
  } else if (g.travel_Mode >= 2 && g.travel_Mode <= 4) {                 // 6600:0bac overland
    if (g.g_49F9 < 2) {                                                  // 6600:0bba
      await X.LoadCombatIcon('ICON', 0, 9); await X.LoadCombatIcon('ICON', 1, 10); await X.LoadCombatIcon('ICON', 2, 11);
      await X.SwitchToExploreMode();                                     // 6600:0c0f
    }
    done = false;
    do {
      menu.abortWhen = hooks.safePointWanted;                            // GBP #14
      const r = await HorizontalMenu('', 'Cast View Encamp Search Look', 0x0D, 0x0A, 0x0F, 1, 0);   // 6600:0c40 DS:04DF
      menu.abortWhen = null;
      if (r.aborted) { key = 0; break; }
      key = r.key.charCodeAt(0); ext_ = r.ext;
      if (!ext_) {
        if (key === 0x43) await X.CastMenu();                            // 6600:0c55 (no status test here)
        else if (key === 0x56) await X.ViewMenu({ v: 0 });
        else if (key === 0x45) done = true;
        else if (key === 0x53) setM1(0x6DCA, m1(0x6DCA) ^ 1);
        else if (key === 0x4C) { await look(); done = true; }
      } else {
        done = true;                                                     // 6600:0cc1
        if (key === 0x48) g.party_Dir = 0;
        else if (key === 0x4D) g.party_Dir = 2;
        else if (key === 0x50) g.party_Dir = 4;
        else if (key === 0x4B) g.party_Dir = 6;
        else { await X.CycleSelectedChar(String.fromCharCode(key)); await X.DrawPartyRoster(g.SelectedChar); done = false; }   // 6600:0cf8
      }
      await X.DrawLocationTimeStatus();                                  // 6600:0d0e
    } while (!done);
  }
  g.g_49F9 = g.travel_Mode;                                              // 6600:0d1c
  if (g.g_84E4 === 0) { ClearRectangle(1, 0x11, 0x26, 0x16); g.g_84E4 = 1; }   // 6600:0d22
  return key;
}

async function doorMenu(knockOk) {
  let opts = '';
  if (g.door_CanBash !== 0) opts = 'Bash';                               // 6600:0db9
  if (g.door_CanPick !== 0 && PartyHasClass(6)) opts = (opts + ' Pick').substring(0, 40);
  if (g.door_CanKnock !== 0 && knockOk()) opts = (opts + ' Knock').substring(0, 40);
  opts = (opts + ' Exit').substring(0, 40);
  if (opts === ' Exit') { ClosePassage(g.party_MapX, g.party_MapY, g.party_Dir); return null; }   // 6600:0e79
  const r = await HorizontalMenu('Locked. ', opts, 0x0D, 0x0A, 0x0F, 0, 0);   // 6600:0eba
  return r.key;
}

// 6600:0D6D MoveParty — from the bytes 6600:0d6d..10a6
export async function MoveParty() {
  await ensureExt();
  let moved = false;
  if (g.travel_Mode === 1) {
    if (m1(0x6DC9) < 0xFF) {                                             // 6600:0d86
      const p = GetPassage(g.party_MapX, g.party_MapY, g.party_Dir);    // 6600:0d9e
      if (p === 1) moved = true;
      else if (p === 2) {                                                // locked door
        const k = await doorMenu(() => FindCasterOf(0x1F) !== null);
        if (k === 'B') moved = await BashDoor();                        // 6600:0eca
        else if (k === 'P') moved = await PickLock();                   // 6600:0ed7
        else if (k === 'K') moved = CastKnock();                        // 6600:0ee4
      } else if (p === 3) {                                              // wizard-locked door
        const k = await doorMenu(() => PartyHasClass(5));
        if (k === 'B') moved = await BashDoor();                        // 6600:1009
        else if (k === 'P') g.door_CanPick = 0;                          // 6600:1015 cannot be picked
        else if (k === 'K') moved = CastKnock();                        // 6600:1021
      }
      if (moved) await StepForward3D();                                  // 6600:102e
      else await X.PlayOrStopSound(g.g_2622);                            // 6600:1037 bump
      await X.DrawLocationTimeStatus();                                  // 6600:103c
    } else setM1(0x6DC9, 0);                                             // 6600:1049
  } else if (g.travel_Mode >= 2 && g.travel_Mode <= 4) {
    if (m1(0x6DC9) < 0xFF) { await StepOverland(); await X.DrawLocationTimeStatus(); }   // 6600:1066 / 1069
    else setM1(0x6DC9, 0);
  }
  await X.FreeAnimation(view.anim);                                      // 6600:1080 FreeAnimation(@g_6ABE)
  view.headPic = FreePicture(view.headPic); view.bodyPic = FreePicture(view.bodyPic);   // g_6B01 / g_6B06
  g.g_6B00 = 0xFF; g.g_6B05 = 0xFF;                                      // loaded head/body ids reset
}
