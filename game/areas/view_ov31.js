// game/areas/view_ov31.js — VIEW ov31 (BB00): combat map window, occupancy, combatant placement.
// por-only: Pool GEO/wall/picture layouts, asset names and travel rendering (whole module) (profile: engine.areaModules / daxGroups / areas; game/profiles/PORONLY.md)
// Owner: por-build-ecl. Source: decode/pseudo/VIEW.pas.md ov31 (verified; mostly prose) translated from the code
// (decode/listings/ov31.c, Ghidra parameter lists read right-to-left = Pascal order, checked on ov31.lst pushes).
// Findings vs VIEW.pas.md: RedrawSquare calls RestoreTerrain(colRel, rowRel, 0) (col first); RemoveCombatant's
// "already a corpse" test indexes the corpse list with the global gfx_LoopCounter (g_70C7), not its own loop variable
// (quirk, kept); the fallen picture is DrawPicture(col*3, row*3, 0, 5, g_5F1A, viewPic) (mask + save background).
// Shapes (combat_ov13.js conventions): g.cb_Char/cb_Col/cb_Row/cb_Size[i] (i = 1..n, cb_Size[0] = n), g.cb_ScrCol/
// cb_ScrRow[i], g.cm_Map = { b } (+2/+3 window origin, +4 cursor shown, +5 cursor size, +7 grid 25 x 50),
// g.cm_Occupant Uint8Array(1250), g.BodyList[k] = { char, x, y, ground } (k = 1..8), g.BodyCount,
// combat record c.combat.b (+9 facing, +13h extra flag). CombatTerrain = DS:2744 (4 bytes per tile, +0 cost, +3 frame).

import { view } from './view.js';
import { state as pic, DrawPicture, FlushViewDirtyLines } from '../engine/pictures.js';
import { MessageDelay } from '../engine/text.js';

const g = new Proxy({}, { get: (_, k) => view.g[k], set: (_, k, v) => { view.g[k] = v; return true; } });
const DX = [0, 1, 1, 1, 0, -1, -1, -1, 0];               // g_2736
const DY = [-1, -1, 0, 1, 1, 1, 0, -1, 0];               // g_273F
const sx8 = (v) => ((v & 0xFF) ^ 0x80) - 0x80;
const map = () => g.cm_Map.b;
const grid = (row, col) => map()[7 + row * 50 + col];
const terrCost = (t) => g.ds[0x2744 + t * 4];            // CombatTerrain[t].cost (FFh impassable)
const terrFrame = (t) => g.ds[0x2747 + t * 4];           // g_2747[t*4] symbol frame
const occ = () => { if (!g.cm_Occupant) g.cm_Occupant = new Uint8Array(1250); return g.cm_Occupant; };
const scr = () => { if (!g.cb_ScrCol) { g.cb_ScrCol = []; g.cb_ScrRow = []; } };

let V32 = null;
const ov32 = async () => V32 || (V32 = await import('./view_ov32.js'));
const tile24 = async (col, row, t, a) => (await ov32()).DrawTile24(col, row, t, a);
const iconAt = async (col, row, dir, pose, slot) => (await ov32()).DrawIconAt(col, row, dir, pose, slot);

// BB00:0000 FootprintCell(size, k, var dx, var dy): g_2844 / g_2845 (size*8 + k*2)
export function FootprintCell(size, k, dx, dy) {
  if (size === 0) return false;
  dx.v = sx8(g.ds[0x2844 + size * 8 + k * 2]); dy.v = sx8(g.ds[0x2845 + size * 8 + k * 2]);
  return dx.v >= 0;
}
const fp = (size, k) => { const dx = { v: 0 }, dy = { v: 0 }; return FootprintCell(size, k, dx, dy) ? [dx.v, dy.v] : null; };

// BB00:0068
export function UpdateScreenPositions() {
  scr();
  for (let n = 1; n <= (g.cb_Size[0] || 0); n++) {
    g.cb_ScrCol[n] = sx8(g.cb_Col[n] - map()[2]); g.cb_ScrRow[n] = sx8(g.cb_Row[n] - map()[3]);
  }
}

// BB00:00E3 / 0105 (EGA): palette entries 0 and 8 swapped / restored
export async function PaletteFlashOn() { await setPal(0, 8); await setPal(8, 0); }
export async function PaletteFlashOff() { await setPal(0, 0); await setPal(8, 8); }
async function setPal(reg, val) {
  const d = pic.display;
  if (d && typeof d.setPaletteRegister === 'function') d.setPaletteRegister(reg, val);   // 0464:2A0D SetEgaPaletteRegister
}

// BB00:04BE CellAt(col, row, var occupant, var tile)
export function CellAt(col, row, occupant, tile) {
  col = sx8(col); row = sx8(row);
  if (col < 0 || col > 49 || row < 0 || row > 24) { occupant.v = 0; tile.v = 0; return; }
  tile.v = grid(row, col); occupant.v = occ()[row * 50 + col];
}

// BB00:06E9
export function InWindow(a, b) { a = sx8(a); b = sx8(b); return a >= 0 && a <= 6 && b >= 0 && b <= 6; }

// BB00:0C5F CombatantIndex(c): 0 if absent
export function CombatantIndex(c) {
  const n = g.cb_Size[0] || 0;
  let i = 0;
  do { i++; if (g.cb_Char[i] === c) return i; } while (i !== n && i < 255);
  return 0;
}
export const CombatantCol = (c) => g.cb_Col[CombatantIndex(c)];   // BB00:0BE7
export const CombatantRow = (c) => g.cb_Row[CombatantIndex(c)];   // BB00:0C0F
export const CombatantSize = (c) => g.cb_Size[CombatantIndex(c)]; // BB00:0C37

// BB00:071A IsVisible(c, all)
export function IsVisible(c, all) {
  const n = CombatantIndex(c); scr();
  if (!g.cb_Size[n]) return false;
  let r = true;
  for (let k = 0; k <= 3; k++) {
    const f = fp(g.cb_Size[n], k);
    if (!f) continue;
    if (!InWindow(sx8(g.cb_ScrCol[n]) + f[0], sx8(g.cb_ScrRow[n]) + f[1])) { r = false; if (all) return false; }
    else { r = true; if (!all) return true; }
  }
  return r;
}

// BB00:03A0
export function RebuildOccupancy() {
  occ().fill(0); scr();
  for (let n = 1; n <= (g.cb_Size[0] || 0); n++) {
    if (!g.cb_Size[n]) continue;
    for (let k = 0; k <= 3; k++) {
      const f = fp(g.cb_Size[n], k);
      if (f) { const i = (sx8(g.cb_Row[n]) + f[1]) * 50 + sx8(g.cb_Col[n]) + f[0]; if (i >= 0 && i < 1250) occ()[i] = n; }
    }
    g.cb_ScrCol[n] = sx8(g.cb_Col[n] - map()[2]); g.cb_ScrRow[n] = sx8(g.cb_Row[n] - map()[3]);
  }
}

async function drawOccupant(n) {
  const c = g.cb_Char[n];
  if (n !== 0 && IsVisible(c, false)) await iconAt(g.cb_ScrCol[n], g.cb_ScrRow[n], c.combat.b[9], 0, c.b[0xBF]);
}

// BB00:0127 RedrawCell(col, row): terrain under the cursor footprint (+ cursor icon), then the cell's occupant
export async function RedrawCell(col, row) {
  col = sx8(col); row = sx8(row);
  const c0 = col - sx8(map()[2]), r0 = row - sx8(map()[3]);
  for (let k = 0; k <= 3; k++) {
    const f = fp(map()[5], k);
    if (f && InWindow(c0 + f[0], r0 + f[1])) {
      await tile24((c0 + f[0]) * 3, (r0 + f[1]) * 3, terrFrame(grid(row + f[1], col + f[0])), 0);   // bb00:0206
      if (map()[4] !== 0) await iconAt(c0 + f[0], r0 + f[1], 0, 0, 0x19);   // bb00:0239 cursor
    }
  }
  const o = { v: 0 }, t = { v: 0 };
  CellAt(col, row, o, t);                                                // bb00:025a
  await drawOccupant(o.v);                                               // bb00:027a / 02ca
}

// BB00:052B RestoreTerrain(scol, srow, who)
export async function RestoreTerrain(scol, srow, who) {
  scol = sx8(scol); srow = sx8(srow);
  let col = 0, row = 0;
  if (who === 0) {
    col = scol + sx8(map()[2]); row = srow + sx8(map()[3]);
    const o = { v: 0 }, t = { v: 0 }; CellAt(col, row, o, t); who = o.v;   // bb00:0572
  }
  if (who === 0) {
    if (InWindow(srow, scol)) await tile24(scol * 3, srow * 3, terrFrame(grid(row, col)), 0);   // bb00:0615 / 067d
  } else {
    scr();
    scol = sx8(g.cb_ScrCol[who]); srow = sx8(g.cb_ScrRow[who]);
    col = scol + sx8(map()[2]); row = srow + sx8(map()[3]);
    for (let k = 0; k <= 3; k++) {
      const f = fp(g.cb_Size[who], k);
      if (f && InWindow(srow + f[1], scol + f[0]))
        await tile24((scol + f[0]) * 3, (srow + f[1]) * 3, terrFrame(grid(row + f[1], col + f[0])), 0);   // bb00:06de
    }
  }
}

// BB00:02D5 RedrawSquare(col, row)
export async function RedrawSquare(col, row) {
  col = sx8(col); row = sx8(row);
  await RestoreTerrain(col - sx8(map()[2]), row - sx8(map()[3]), 0);     // bb00:030f (col first, from the bytes)
  const o = { v: 0 }, t = { v: 0 }; CellAt(col, row, o, t);              // bb00:0325
  await drawOccupant(o.v);                                               // bb00:0345 / 0395
}

// BB00:07D4 ScrollToShow(col, row, margin): true if the window moved (all 7x7 tiles redrawn)
export async function ScrollToShow(col, row, margin) {
  col = sx8(col); row = sx8(row);
  let cx = sx8(map()[2] + 3), cy = sx8(map()[3] + 3);
  const m = margin === 0xFF ? 0 : margin;
  const hi = sx8(cy + m);
  if (!(margin === 0xFF || col < sx8(cx - m) || sx8(cx + m) < col || row < sx8(cy - m) || hi < row)) return false;
  if (col < sx8(cx - m)) { while (col < cx && cx > 3) cx--; }
  else if (sx8(cx + m) < col) { while (cx < col && cx < 0x2E) cx++; }
  if (row < sx8(cy - m)) { while (row < cy && cy > 3) cy--; }
  else if (hi < row) { while (cy < row && cy < 0x15) cy++; }
  map()[2] = (cx - 3) & 0xFF; map()[3] = (cy - 3) & 0xFF;
  for (let r = 0; r <= 6; r++)
    for (let c = 0; c <= 6; c++)
      await tile24(c * 3, r * 3, terrFrame(grid(sx8(map()[3]) + r, sx8(map()[2]) + c)), 1);   // bb00:0966
  UpdateScreenPositions();                                               // bb00:0986
  return true;
}

// BB00:0996 FocusSquare(col, row, margin, dir): moves the cursor to (col,row)+step[dir]
export async function FocusSquare(col, row, margin, dir) {
  col = sx8(col); row = sx8(row);
  let tc = sx8(col + DX[dir]), tr = sx8(row + DY[dir]);
  if (await ScrollToShow(tc, tr, margin)) {                              // bb00:09d7
    for (let n = 1; n <= (g.cb_Size[0] || 0); n++) {
      const c = g.cb_Char[n];
      if (c && c.b[0x10D] !== 0 && g.cb_Size[n] && IsVisible(c, false))
        await iconAt(g.cb_ScrCol[n], g.cb_ScrRow[n], c.combat.b[9], 0, c.b[0xBF]);   // bb00:0a71
    }
  }
  await RedrawSquare(col, row);                                          // bb00:0a8a
  if (!InWindow(tc - sx8(map()[2]), tr - sx8(map()[3]))) {               // bb00:0ab2
    if (tc > 49) tc = 49; if (tc < 0) tc = 0; if (tr > 24) tr = 24; if (tr < 0) tr = 0;
  }
  await RedrawCell(tc, tr);                                              // bb00:0aea
  FlushViewDirtyLines();
}

// BB00:0AF8 ShowCombatant(c, dir, pose, noDraw)
export async function ShowCombatant(c, dir, pose, noDraw) {
  const n = CombatantIndex(c);
  if (!IsVisible(c, true)) await FocusSquare(CombatantCol(c), CombatantRow(c), 3, 8);   // bb00:0b39
  if ((c.combat.b[9] >> 2) !== (dir >> 2) || pose || noDraw) await RestoreTerrain(0, 0, n);   // bb00:0b74
  if (dir !== c.combat.b[9]) c.combat.b[9] = dir;
  if (!noDraw && IsVisible(c, true)) {
    await iconAt(g.cb_ScrCol[n], g.cb_ScrRow[n], dir, pose, c.b[0xBF]);  // bb00:0bd7
    FlushViewDirtyLines();
  }
}

// BB00:0CB9 ProbeMove(c, dir, var occupant, var tile)
export function ProbeMove(c, dir, occupant, tile) {
  occupant.v = 0; tile.v = 0x17;
  let best = 1;
  const n = CombatantIndex(c);
  const col = sx8(g.cb_Col[n]), row = sx8(g.cb_Row[n]);
  for (let k = 0; k <= 3; k++) {
    const f = fp(g.cb_Size[n], k);
    if (!f) continue;
    const o = { v: 0 }, t = { v: 0 };
    CellAt(col + f[0] + DX[dir], row + f[1] + DY[dir], o, t);           // bb00:0d85
    if (o.v === n) o.v = 0;
    if (o.v !== 0) occupant.v = o.v;
    if (t.v === 0 || tile.v === 0) tile.v = 0;
    else if (t.v === 0x1E || tile.v === 0x1E) tile.v = 0x1E;
    else if (best <= terrCost(t.v)) { best = terrCost(t.v); tile.v = t.v; }
  }
}

// BB00:0E11 RemoveCombatant(c)
export async function RemoveCombatant(c) {
  const X = await ext();
  await X.SetSoundTimerMode(0);                                          // bb00:0e1a
  if (g.game_Mode === 5) {
    let k = 1;
    const lc = (g.gfx_LoopCounter ?? 0) & 0xFF;                          // quirk: g_70C7, not k
    while (!(k > 8 || (g.BodyList && g.BodyList[lc] && g.BodyList[lc].char === c))) k++;
    if (k < 9) return;
    const n = CombatantIndex(c), col = sx8(CombatantCol(c)), row = sx8(CombatantRow(c));
    if (!IsVisible(c, true)) await FocusSquare(col, row, 3, 8);          // bb00:0eb3
    await RestoreTerrain(0, 0, n);                                       // bb00:0ec1
    for (let i = 0; i <= 3; i++) {
      const f = fp(g.cb_Size[n], i);
      if (f) DrawPicture((sx8(g.cb_ScrCol[n]) + f[0]) * 3, (sx8(g.cb_ScrRow[n]) + f[1]) * 3, 0, 5, g.g_5F1A, pic.viewPic);   // bb00:0f3f
    }
    FlushViewDirtyLines();
    if (c.combat.b[0x13] === 0) {                                        // not an extra
      g.BodyCount = (g.BodyCount + 1) & 0xFF;
      if (!g.BodyList) g.BodyList = [];
      const ground = grid(row, col);
      if (ground !== 0x1E) map()[7 + row * 50 + col] = 0x1F;
      g.BodyList[g.BodyCount] = { char: c, x: col, y: row, ground };
    }
    await X.PlayOrStopSound(g.g_261E);                                   // bb00:100e
    await MessageDelay();
    await RestoreTerrain(0, 0, n);                                       // bb00:1023
    g.cb_Size[CombatantIndex(c)] = 0;
    RebuildOccupancy();                                                  // bb00:103e
    await FocusSquare(sx8(map()[2]) + 3, sx8(map()[3]) + 3, 3, 8);       // bb00:1062 recentre
    c.combat.b[3] = 0; c.combat.b[6] = 0; c.combat.b[0] = 0; c.combat.b[7] = 0;
  } else {
    await X.PlayOrStopSound(g.g_261E); await MessageDelay();
  }
  await X.SetSoundTimerMode(10);                                         // bb00:109c
}

// BB00:10A7 PlaceCombatant(c, col, row, restoreTile)
export function PlaceCombatant(c, col, row, restoreTile) {
  if (g.game_Mode !== 5) return true;
  let ok = false;
  const n = CombatantIndex(c);
  g.cb_Size[n] = c.b[0x6C] & 0x7F; g.cb_Col[n] = col & 0xFF; g.cb_Row[n] = row & 0xFF;   // bb00:10c2
  const o = { v: 0 }, t = { v: 0 };
  ProbeMove(c, 8, o, t);                                                 // bb00:111a
  if (o.v === 0 && t.v !== 0 && terrCost(t.v) !== 0xFF) {
    ok = true;
    let tile = t.v;
    if (restoreTile && c.combat.b[0x13] === 0) {
      const cnt = g.BodyCount || 0;
      for (let k = 1; k <= cnt; k++) {
        const b = g.BodyList[k];
        if (b && b.char === c) { if (b.ground !== 0x1F) tile = b.ground; g.BodyList[k] = { char: null, x: 0, y: 0, ground: 0 }; }   // FillChar(7, 0)
      }
      let other = false;
      for (let k = 1; k <= cnt; k++) {
        const b = g.BodyList[k];
        if (b && b.char && sx8(b.x) === (col & 0xFF) && sx8(b.y) === (row & 0xFF)) other = true;
      }
      if (!other) map()[7 + (row & 0xFF) * 50 + (col & 0xFF)] = tile;   // bb00:11df
    }
    RebuildOccupancy();                                                  // bb00:1286
  } else g.cb_Size[n] = 0;
  return ok;
}

// BB00:1298 FocusCombatant(c, margin, cursor)
export async function FocusCombatant(c, margin, cursor) {
  map()[4] = cursor ? 1 : 0;
  map()[5] = g.cb_Size[CombatantIndex(c)];
  await FocusSquare(CombatantCol(c), CombatantRow(c), margin, 8);        // bb00:12e2
  map()[4] = 0; map()[5] = 1;
}

// other areas' routines by published name (engine audio SetSoundTimerMode / PlayOrStopSound)
let extP = null;
async function ext() {
  if (!extP) extP = (async () => {
    const e = {};
    for (const m of ['../engine/audio.js', './res_00ba.js']) {
      try { const mod = await import(m); for (const [k, v] of Object.entries(mod)) if (typeof v === 'function' && !(k in e)) e[k] = v; } catch { /* not built */ }
    }
    return new Proxy(e, { get: (t, k) => k === 'then' ? undefined : t[k] || (() => 0) });   // not a thenable
  })();
  return extP;
}
