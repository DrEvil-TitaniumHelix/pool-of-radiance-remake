// game/areas/view_ov10.js — VIEW ov10 (5200): combat battlefield construction and party deployment (StartCombat).
// Owner: por-build-ecl. Source: decode/pseudo/VIEW.pas.md ov10 (verified) with the summarised parts (FillSquareNW/NE,
// generators, FindDeploySpot, DeployParty, StartCombat) translated from decode/listings/ov10.c and checked on ov10.lst.
// Findings from the bytes: the enemy start square is ECL[6DC1] (encounter distance, Mem6B00 w[$582]) x step[party_Dir]
// (5200:1a40..1a9f); unplaced extras are removed with RemoveFromParty(1, 0) (5200:1dc9..1dcf); the combatant count
// cb_Size[0] starts at 1 and is incremented with every kept member (5200:1bf1 / 1d7c / 1df1, as compiled);
// OverlandTerrainFlags has no final else (an unclassified tile returns an uninitialised local: TODO(decode) garbage, 0 here);
// the battlefield record comes from GetMem (cells the dungeon builder does not reach keep heap garbage: 0 here).
// Shapes: as view_ov31.js (cb_* arrays, cm_Map = { b }, BodyList/BodyCount, c.combat = { b: Uint8Array(0x16) }).
// Deployment globals: g_4650/4651 start x per side, g_4652/4653 start y, g_4654/4655 half counts, g_4656/4657 facing
// (0..3) per side, g_4658 current side; deployment boxes g_4440[side*108h + tmpl*42h + r*0Bh + c] (2 x 4 x 6 x 11).

import { view, GetPassage, GetWallType } from './view.js';
import { ClearMenuLine } from '../engine/menus.js';
import { DrawText, MessageDelay } from '../engine/text.js';
import { AllocPicture } from '../engine/pictures.js';
import { PollOneKey } from '../engine/input.js';
import * as O31 from './view_ov31.js';

const g = new Proxy({}, { get: (_, k) => view.g[k], set: (_, k, v) => { view.g[k] = v; return true; } });
const DX = [0, 1, 1, 1, 0, -1, -1, -1, 0];               // g_2736
const DY = [-1, -1, 0, 1, 1, 1, 0, -1, 0];               // g_273F
const sx8 = (v) => ((v & 0xFF) ^ 0x80) - 0x80;
const ds = (o) => g.ds[o];
const S = (o) => sx8(g.ds[o]);
const frameOf = (t) => g.ds[0x2747 + t * 4];             // g_2747[t*4]
const costOf = (t) => g.ds[0x2744 + t * 4];              // CombatTerrain[t].cost
const gridAt = (row, col) => g.cm_Map.b[7 + row * 50 + col];
const setGrid = (row, col, t) => { const i = 7 + row * 50 + col; if (i >= 7 && i < g.cm_Map.b.length) g.cm_Map.b[i] = t & 0xFF; };
const deploy = () => { if (!g.DeployBox) g.DeployBox = new Uint8Array(0x210); return g.DeployBox; };   // g_4440
const arr2 = (name) => { if (!Array.isArray(g[name])) g[name] = [0, 0]; return g[name]; };

// other areas by published name (combat ov24 Roll/CallEffectHooks, ov13 CalcEnemyHpPct, res00ba, party ov16)
let extP = null;
async function ext() {
  if (!extP) extP = (async () => {
    const e = {};
    for (const m of ['./combat.js', './res_00ba.js', './party.js', './magic.js']) {
      try { const mod = await import(m); for (const [k, v] of Object.entries(mod)) if (typeof v === 'function' && !(k in e)) e[k] = v; } catch { /* not built */ }
    }
    const warned = new Set();
    return new Proxy(e, { get: (t, k) => k === 'then' ? undefined : t[k] || ((...a) => { if (!warned.has(k)) { warned.add(k); console.warn('VIEW ov10: ' + String(k) + ' not bound yet'); } return 0; }) });
  })();
  return extP;
}
let X = null;
const roll = async (n, s) => (await X.Roll(n, s)) & 0xFF;

// 5200:0000 ScatterFloorDebris
async function ScatterFloorDebris() {
  for (let col = 0; col <= 49; col++)
    for (let row = 0; row <= 24; row++) {
      if (frameOf(gridAt(row, col)) !== 0x16) continue;
      const r = await roll(1, 100);                                      // 5200:004b
      if (r === 0x62) setGrid(row, col, 0x1A);
      else if (r === 0x63) setGrid(row, col, 0x1B);
      else if (r === 100 && g.ecl_Block !== 10 && await roll(1, 100) === 1) {   // 5200:00b7
        const r2 = await roll(1, 10);                                    // 5200:00c6
        if (r2 >= 1 && r2 <= 6) setGrid(row, col, 0x1C);
        else if (r2 >= 7 && r2 <= 10) setGrid(row, col, 0x1D);
      }
    }
}

// 5200:012B ProbeSide(x, y, dir) / 5200:01AD ProbeWall(x, y, dir)
function ProbeSide(x, y, dir) {
  x = sx8(x); y = sx8(y);
  if (x < 0 || x > 15 || y < 0 || y > 15) return (y === sx8(g.party_MapY) && (dir === 2 || dir === 6)) ? 0 : 1;
  if (GetPassage(x, y, dir) === 0) return 1;
  return GetWallType(x, y, dir) === 0 ? 0 : 3;
}
export function ProbeWall(x, y, dir) {
  return ProbeSide(x, y, dir) | ProbeSide(sx8(x) + DX[dir], sx8(y) + DY[dir], (dir + 4) % 8);
}

// 5200:0810 BuildDungeonField with its nested square fillers (5200:0221..0807)
function BuildDungeonFieldSquares() {
  for (let sdy = -2; sdy <= 2; sdy++)
    for (let sdx = -6; sdx <= 6; sdx++) {
      const sx = sx8(g.party_MapX + sdx), sy = sx8(g.party_MapY + sdy);
      const west = ProbeWall(sx, sy, 6), north = ProbeWall(sx, sy, 0), east = ProbeWall(sx, sy, 2);   // 5200:0852..0876
      const put = (col, row, tile) => {                                  // 5200:0221 PutCombatTile
        const c = sx8(sdx * 6 + sdy * 5 + 0x15 + col), r = sx8(sdy * 5 + 10 + row);
        if (c >= 0 && c < 50 && r >= 0 && r < 25) setGrid(r, c, tile + 1);
      };
      // 5200:02BA FillSquareFloor
      for (let row = 2; row <= 4; row++) for (let col = 0; col <= 5; col++) put(col, row, 0x16);
      if (west === 1) for (let row = 2; row <= 4; row++) { put(row - 1, row, 4); put(row, row, 3); put(row + 1, row, 0x0D); }
      else if (west === 3) { put(1, 2, 8); put(5, 4, 0); }
      // 5200:0377 FillSquareNorth
      if (north === 1) { put(3, 0, 5); put(4, 0, 5); put(3, 1, 10); put(4, 1, 10); }
      else { put(3, 0, 0x16); put(4, 0, 0x16); put(3, 1, 0x16); put(4, 1, 0x16); }
      // 5200:040F FillSquareNW (locals uninitialised when no case matches: 0 here)
      {
        const open = ProbeWall(sx, sy - 1, 6) === 0 && ProbeWall(sx - 1, sy, 0) === 0;   // 5200:042b / 0448
        let a = 0, b = 0, c = 0, d = 0;
        if (north === 0) a = west === 0 ? 0x16 : west === 3 ? 0x0D : west === 1 ? (open ? 0 : 0x0D) : 0;
        else if (north === 3 || north === 1) a = west === 0 ? (open ? 0x0F : 5) : (open ? 0x12 : 2);
        b = north === 0 ? 0x16 : north === 3 ? 0x11 : north === 1 ? 5 : 0;
        if (west === 0) c = north === 0 ? 0x16 : (open ? 0x10 : 10);
        else if (west === 3) c = open ? 0x14 : 7;
        else if (west === 1) c = open ? 1 : 3;
        if (west === 0 || west === 3) d = north === 0 ? 0x16 : north === 3 ? 0x17 : north === 1 ? 10 : 0;
        else if (west === 1) d = north === 0 ? 0x0D : north === 3 ? 0x15 : north === 1 ? 6 : 0;
        put(1, 0, a); put(2, 0, b); put(1, 1, c); put(2, 1, d);         // 5200:05d9..060c
      }
      // 5200:0615 FillSquareNE
      {
        const pN = ProbeWall(sx, sy - 1, 2), pE = ProbeWall(sx + 1, sy, 0);   // 5200:0631 / 064d
        const open = pN === 0 && pE === 0;
        let a = 0, b = 0, c = 0, d = 0;
        if (north === 0) a = pN === 1 ? 4 : 0x16; else if (north === 3) a = 0x0F; else if (north === 1) a = 5;
        if (north === 0) {
          if (pN === 0) b = 0x16;
          else if (pN === 3) b = (east === 0 && pE !== 0) ? 0x18 : 1;
          else if (pN === 1) b = (east === 0 && pE !== 0) ? 0x0B : 3;
        } else if (east === 0) b = pE === 0 ? (open ? 0x11 : 0x13) : 5;
        else b = 9;
        c = north === 0 ? 0x16 : north === 3 ? 0x10 : north === 1 ? 10 : 0;
        if (north === 0) d = pN === 0 ? 0x16 : east === 0 ? (pE === 0 ? 8 : 0x0C) : 4;
        else d = east === 0 ? (pE === 0 ? 0x17 : 10) : 0x0E;
        put(5, 0, a); put(6, 0, b); put(5, 1, c); put(6, 1, d);         // 5200:07d4..0807
      }
    }
}
async function BuildDungeonField() { BuildDungeonFieldSquares(); await ScatterFloorDebris(); }   // 5200:089d

// 5200:08A4 OverlandTerrainFlags (classification of g_465A, from the bytes)
export function OverlandTerrainFlags() {
  const t = g.g_465A & 0xFF;
  const inR = (a, b) => t >= a && t <= b;
  let r;
  if (inR(0, 2) || inR(0x28, 0x29) || inR(0x4F, 0x56) || inR(0x5B, 0x5C) || t === 0x2B || t === 0xF1) r = 1;
  else if (inR(0xA8, 0xB1)) r = 0x21;
  else if (t === 0xB9 || inR(0xBC, 0xC0)) r = 0x11;
  else if (inR(3, 4) || inR(6, 9) || inR(0x13, 0x15) || inR(0x17, 0x19)) r = 3;
  else if (inR(3, 4) || t === 7 || inR(0x0A, 0x12) || t === 0x16 || inR(0x1A, 0x24) || inR(0xC9, 0xD0)) r = 2;
  else if (inR(0xD1, 0xD5)) r = 0x12;
  else if (t === 0x25 || t === 0x39 || t === 0x40 || inR(0x9A, 0x9E) || inR(0xA4, 0xA5) || t === 0xB4 || t === 0xF3 || inR(0xEF, 0xF0) || t === 0xFA || t === 0xFC) r = 4;
  else if (inR(0x27, 0x2C) || t === 0x99 || t === 0x9F) r = 5;
  else if (inR(0x2D, 0x2E) || inR(0x33, 0x38) || inR(0x43, 0x4D) || inR(0x5D, 0x61)) r = 0x44;
  else if (inR(0xB5, 0xB8) || t === 0xBA || inR(0xC1, 0xC8)) r = 0x14;
  else if (inR(0x2F, 0x32) || inR(0x62, 0x65) || t === 0xF2) r = 0x40;
  else if (t === 0x26) r = 0x41;
  else if (inR(0xB2, 0xB3)) r = 0x60;
  else if (inR(0x3A, 0x3C) || inR(0x41, 0x42)) r = 0x48;
  else if (inR(0x3D, 0x3F) || inR(0x79, 0x7C) || inR(0x87, 0x89) || t === 0x8B || t === 0x8D || inR(0x90, 0x93) || t === 0x95 || inR(0x97, 0x98) || inR(0xA0, 0xA2) || inR(0xA6, 0xA7) || inR(0xD6, 0xD8) || t === 0xEE) r = 8;
  else if (inR(0x57, 0x5A) || t === 0xA3 || t === 0xE0) r = 0x88;
  else if (t === 0x7D || t === 0x7C || t === 0x8A || t === 0x8C || t === 0x8E || t === 0x8F || t === 0x94 || t === 0x96) r = 9;
  else if (inR(0x7E, 0x85) || inR(0xE5, 0xE7)) r = 0x28;
  else if (inR(0xD9, 0xDF)) r = 0x18;
  else if (t === 0x4E || t === 0xF5 || inR(0xE8, 0xE9)) r = 0x20;
  else if (t === 0x6D || inR(0xF4, 0xF6)) r = 0x80;
  else if (inR(0x6E, 0x71) || inR(0x73, 0x78)) r = 0x81;
  else if (inR(0x66, 0x6C) || t === 0x72) r = 0x90;
  else if (inR(0xE1, 0xE4) || inR(0xEA, 0xED)) r = 0xA0;
  else r = 0;                                                            // TODO(decode): uninitialised local in the original
  if ((r & 0x80) && view.m0(0x4AB3) === 0xFF) r = ((r + 0x80) | 1) & 0xFF;   // 5200:0b6b ecl w[$366]
  return r;
}

// 5200:0B97 PlaceBoulderPair (linear grid write: col+1 may run into the next row, as compiled)
function PlaceBoulderPair(col, row) { const i = 7 + sx8(row) * 50 + sx8(col); g.cm_Map.b[i] = 0x34; g.cm_Map.b[i + 1] = 0x35; }

// 5200:0BDE BuildRoadOrRidge
async function BuildRoadOrRidge() {
  let chance = 0;
  if (OverlandTerrainFlags() & 0x20) chance = 0x23;
  if (OverlandTerrainFlags() & 0x10) chance = 0x4B;
  if (await roll(1, 100) > chance) return;                               // 5200:0c0e
  let c = sx8(0x22 - await roll(5, 4));                                  // 5200:0c21
  while ((c + 2) % 7 > 0) c = sx8(c - 1);
  const start = c;
  for (let row = 0; row <= 24; row++)
    if (c < 0x32) {
      setGrid(row, c, 0x32); g.cm_Map.b[7 + row * 50 + c + 1] = 0x33;
      if (await roll(1, 20) === 1) PlaceBoulderPair(c, row);             // 5200:0c9c / 0cb6
      c = sx8(c + 1);
    }
  const r = sx8(0x10 - await roll(1, 9));                                // 5200:0cce
  PlaceBoulderPair(start + r, r); PlaceBoulderPair(sx8(start + r) + 1, r + 1);   // 5200:0cfb / 0d0c
}

// 5200:0D13 BuildTrees
async function BuildTrees() {
  OverlandTerrainFlags();
  let density = 1;
  if (OverlandTerrainFlags() & 4) density = 3;
  if (OverlandTerrainFlags() & 0x40) density = 4;
  if (OverlandTerrainFlags() & 8) density = 7;
  if (OverlandTerrainFlags() & 0x80) density = 0;
  for (let col = 0; col <= 49; col++)
    for (let row = 1; row <= 24; row++) {
      if (frameOf(gridAt(row, col)) === 0x16 && frameOf(gridAt(row - 1, col)) === 0x16 && await roll(1, 100) <= density) {   // 5200:0dd6
        const r = await roll(1, 10);
        let size = r < 9 ? (r + 1) >> 1 : (await roll(1, 2)) + 4;        // 5200:0de9 / 0dfd
        if (OverlandTerrainFlags() & 0x40) size = (await roll(1, 3)) + 3; // 5200:0e27
        setGrid(row, col, size + 0x23);
        if (size < 5) setGrid(row - 1, col, size + 0x1F);
      }
    }
}

// 5200:0E9E BuildGroundCover
async function BuildGroundCover() {
  let a = 0, b = 0x0F, c = 0x28, e = 0;
  if (OverlandTerrainFlags() & 2) { b = 0x2D; c = 10; }
  if (OverlandTerrainFlags() & 4) b = 0x19;
  if (OverlandTerrainFlags() & 0x40) { c = 5; e = 0x1E; }
  if (OverlandTerrainFlags() & 0x80) { a = 0x0F; c = 0x19; b = 10; }
  for (let col = 0; col <= 49; col++)
    for (let row = 0; row <= 24; row++) {
      if (frameOf(gridAt(row, col)) !== 0x16) continue;
      const r = await roll(1, 0xFF);                                     // 5200:0f45
      if (r <= a) {
        const k = await roll(1, 4);
        if (k === 4 && row > 0 && frameOf(gridAt(row - 1, col)) === 0x16) { setGrid(row - 1, col, 0x41); setGrid(row, col, 0x40); }
        if (k < 4) setGrid(row, col, k + 0x3C);
      } else if (r <= ((a + 6) & 0xFF)) setGrid(row, col, (await roll(1, 3)) + 0x36);
      else if (r <= ((b + a + 6) & 0xFF)) setGrid(row, col, (await roll(1, 4)) + 0x29);
      else if (r <= e + b + a + 6) setGrid(row, col, Math.floor(((await roll(1, 10)) - 1) / 3) + 0x39);
      else if (r <= c + e + b + a + 6) {
        let k = await roll(1, 4);
        if (k === 4 && (OverlandTerrainFlags() & 0x40) === 0) k = await roll(1, 3);
        setGrid(row, col, k + 0x2D);
      }
    }
}

// 5200:11B4 BuildWildernessField
async function BuildWildernessField() {
  g.cm_Map.b.fill(0x17, 7, 7 + 0x4E2);                                   // 5200:11cb
  let x = sx8(view.m0(0x49C3));                                          // ecl w[$186] (byte)
  if (g.travel_Mode === 3) x = sx8(x + 13);
  if (g.travel_Mode === 4) x = sx8(x + 26);
  g.g_465A = ds(0x3648 + sx8(view.m0(0x49C4)) * 44 + x);                 // OverlandMap
  await BuildRoadOrRidge(); await BuildTrees(); await BuildGroundCover(); await ScatterFloorDebris();
}

// 5200:1244 PrepareBattlefield
async function PrepareBattlefield() {
  const O32 = await import('./view_ov32.js');
  if (g.travel_Mode === 1) await O32.Load24x24Set('DungCom', 0, 0x18);  // 5200:1266
  else await O32.Load24x24Set('WildCom', 0, 0x21);                      // 5200:1282
  await O32.Load24x24Set('RandCom', 0x22, 5);                            // 5200:129c
  g.cm_Map = { b: new Uint8Array(0x4E9) };                               // 5200:12a5 GetMem (garbage: 0)
  g.cm_Map.b[4] = 0; g.cm_Map.b[5] = 1; g.cm_Map.b[6] = 0;
  if (g.travel_Mode === 1) await BuildDungeonField(); else await BuildWildernessField();
}

// 5200:12E1 InitPartyCombatants
async function InitPartyCombatants() {
  let n = 0;
  for (let c = g.PartyHead; c; c = c.next) {
    await X.RecalcCharacter(c);                                          // 5200:1309
    n = (n + 1) & 0xFF;
    c.combat = { b: new Uint8Array(0x16) };                              // GetMem($16) + FillChar
    if (n > view.m1(0x6E3E)) c.combat.b[0x13] = 1;                       // ecl w[$67C] party size -> extra
    c.combat.b[9] = ds(0x2F2 + (g.party_Dir >> 1));                      // facing g_02F2
    if (c.b[0x10E] === 1) c.combat.b[9] = (c.combat.b[9] + 4) % 8;
    const m = c.b[0x84] & 0x7F;
    if (c.b[0x10E] === 0 && c.combat.b[0x13] === 1 && (m === 0 || m > 0x66))
      c.b[0x84] = (view.m1(0x6DC6) - 0x80) & 0xFF;                       // ecl w[$58C] morale
  }
}

// 5200:1403 OutsideDeployBox(c, r) — quirk: "and" of the two axis tests
export function OutsideDeployBox(c, r) { c = sx8(c); r = sx8(r); return (c < 0 || c > 10) && (r < 0 || r > 5); }

// 5200:1434 TryPlaceCombatant(who, c, r, sq_x, sq_y, tmpl)
function TryPlaceCombatant(who, c, r, sqx, sqy, tmpl) {
  c = sx8(c); r = sx8(r);
  const side = sx8(g.g_4658);
  const bi = side * 0x108 + tmpl * 0x42 + r * 0x0B + c;
  if (c < 0 || r < 0 || c > 10 || r > 5 || deploy()[bi] === 0) return false;
  g.cb_Col[who] = (c + sqx * 6 + sqy * 5 + 0x16) & 0xFF;
  g.cb_Row[who] = (r + sqy * 5 + 10) & 0xFF;
  const o = { v: 0 }, t = { v: 0 };
  O31.ProbeMove(g.cb_Char[who], 8, o, t);                                // 5200:150e
  if (o.v === 0 && t.v !== 0 && costOf(t.v) !== 0xFF) { deploy()[bi] = 0; return true; }
  return false;
}

// 5200:1577 FindDeploySpot(who) — from ov10.c / .lst (spiral through the side's deployment templates)
function FindDeploySpot(who) {
  const side = sx8(g.g_4658);
  const sxA = arr2('g_4650s'), syA = arr2('g_4652s'), halfA = arr2('g_4654s'), faceA = arr2('g_4656s');
  let first = true, fail = false, phase = 1, ring = 0, alt = 0, placed = false;
  let sqx = sx8(sxA[side]), sqy = sx8(syA[side]);
  let len = 0, steps = 0, c = 0, r = 0, c0 = 0, r0 = 0;
  do {
    const f = ds(sx8(faceA[side]) * 4 + alt + 0x2E2) >> 1;
    if (phase === 1) {
      const d = ds((f + 2) % 4 + 0x2F2);
      c = sx8(S((alt !== 0 ? 4 : 0) + f + 0x2F6) + DX[d] * ring);
      r = sx8(S((alt !== 0 ? 4 : 0) + f + 0x2FE) + DY[d] * ring);
      len = 1; phase = 2; steps = 1; r0 = r; c0 = c;
    } else if (phase === 2) {
      const d = ds((f + 1) % 4 + 0x2F2);
      c = sx8(c0 + DX[d] * len); r = sx8(r0 + DY[d] * len); phase = 3; steps++;
    } else if (phase === 3) {
      const d = ds((f + 3) % 4 + 0x2F2);
      c = sx8(c0 + DX[d] * len); r = sx8(r0 + DY[d] * len); phase = 2; len++; steps++;
    }
    const outside = c < 0 || r < 0 || c > 10 || r > 5;
    if (phase > 1 && ((outside && !OutsideDeployBox(c, r)) || (first && sx8(halfA[side]) <= steps) || (!first && steps > 11))) {
      let nr = (ring + 1) & 0xFF;
      if (side === 0 && (faceA[0] & 1) && alt === 0 && nr === 1) {      // 5200:1201
        const px = sx8(sxA[0] + g.party_MapX), py = sx8(syA[0] + g.party_MapY);
        let ok = false;
        for (let k = 1; k <= 3; k++)
          if (g.travel_Mode > 1 || ProbeWall(px, py, ds(sx8(faceA[side]) * 4 + k + 0x2D2)) !== 1) ok = true;
        if (ok) nr = (ring + 2) & 0xFF;
      }
      ring = nr; phase = 1; first = false;
    }
    if (outside && OutsideDeployBox(c, r)) {                             // try the neighbouring 3D squares
      phase = 0;
      while (alt < 3 && phase !== 1) {
        alt++;
        const d = ds(sx8(faceA[side]) * 4 + alt + 0x2D2);
        if (g.travel_Mode > 1 || ProbeWall(sx8(sxA[side] + g.party_MapX), sx8(syA[side] + g.party_MapY), d) !== 1) {
          sqx = sx8(sxA[side] + DX[d]); sqy = sx8(syA[side] + DY[d]); ring = 0; phase = 1;
        }
      }
      if (phase !== 1) fail = true;
    }
    if (!outside) placed = TryPlaceCombatant(who, c, r, sqx, sqy, alt);   // 5200:19c7
  } while (!placed && !fail);
  return !fail;
}

// 5200:19F5 DeployParty
async function DeployParty() {
  await X.CountActiveSides();                                            // 5200:19fb
  for (let d = 1; d <= 0xFF; d++) g.cb_Size[d] = 0;
  O31.RebuildOccupancy();
  const sxA = arr2('g_4650s'), syA = arr2('g_4652s'), halfA = arr2('g_4654s'), faceA = arr2('g_4656s');
  sxA[0] = 0; syA[0] = 0;
  faceA[0] = g.party_Dir >> 1;
  const dist = view.m1(0x6DC1);                                          // ecl w[$582] encounter distance
  sxA[1] = sx8(sxA[0] + dist * DX[g.party_Dir]);                         // 5200:1a5c
  syA[1] = sx8(syA[0] + dist * DY[g.party_Dir]);                         // 5200:1a8d
  faceA[1] = ((g.party_Dir + 4) % 8) >> 1;
  const counts = arr2('side_ActiveCount');
  for (let s = 0; s <= 1; s++) halfA[s] = ((counts[s] & 0xFF) + 1) >> 1;
  for (let s = 0; s <= 1; s++)                                           // deployment boxes 5200:1aea..1be3
    for (let t = 0; t <= 3; t++) {
      const face = t === 1 ? 4 : faceA[s];
      for (let r = 0; r <= 5; r++)
        for (let c = 0; c <= 10; c++) {
          const lo = S(face * 12 + r * 2 + 0x306), hi = S(face * 12 + r * 2 + 0x307);
          deploy()[s * 0x108 + t * 0x42 + r * 0x0B + c] = (c < lo || hi < c) ? 0 : 1;
        }
    }
  let d = 1;
  g.cb_Size[0] = 1;                                                      // 5200:1bf1 (as compiled)
  let last = g.PartyHead, c = g.PartyHead;
  while (c) {
    await PollOneKey();
    g.cb_Char[d] = c;
    g.g_4658 = c.b[0x10E];                                               // side
    if (!g.cb_Index) g.cb_Index = [];
    g.cb_Index[d] = d;
    g.cb_Size[d] = c.b[0x6C] & 7;
    if (FindDeploySpot(d)) {                                             // 5200:1c75
      last = c;
      if (c.b[0x10D] === 0) {                                            // not active
        g.cb_Size[d] = 0;
        if (!g.DuelActive && c.combat.b[0x13] === 0) {                   // corpse marker
          const col = sx8(g.cb_Col[d]), row = sx8(g.cb_Row[d]);
          g.BodyCount = (g.BodyCount + 1) & 0xFF;
          if (!g.BodyList) g.BodyList = [];
          g.BodyList[g.BodyCount] = { char: c, x: col, y: row, ground: gridAt(row, col) };
          setGrid(row, col, 0x1F);
        }
      }
      O31.RebuildOccupancy();                                            // 5200:1d74
      d++; g.cb_Size[0] = (g.cb_Size[0] + 1) & 0xFF;
      c = c.next;
    } else {
      g.cb_Size[d] = 0;
      if (c.combat.b[0x13] === 1) {                                      // extra that does not fit: dropped
        g.cb_Char[d] = null;
        g.SelectedChar = c;
        await X.RemoveFromParty(1, 0);                                   // 5200:1dcf
        c = last.next;                                                   // continue after the previous kept member
      } else {
        last = c; d++; g.cb_Size[0] = (g.cb_Size[0] + 1) & 0xFF;
        c = c.next;
      }
    }
  }
  if (last) last.next = null;                                            // 5200:1e0b
}

// 5200:1E31 StartCombat
export async function StartCombat() {
  X = await ext();
  const O28 = await import('./view_ov28.js');
  O28.FreeAnimation();                                                   // 5200:1e3c
  view.headPic = null; view.bodyPic = null; g.g_6B00 = 0xFF; g.g_6B05 = 0xFF;
  ClearMenuLine(); await MessageDelay();                                 // 5200:1e5f / 1e64
  DrawText(0, 0x18, 0x0A, 'A battle begins...');                         // 5200:1e81
  g.MagicOn = 0; g.CombatRound = 0; g.AttackRollValue = 0; g.BodyCount = 0;
  g.sc_List = null; g.g_5D9A = 0; g.g_5D9C = 0;
  g.BodyList = Array.from({ length: 9 }, () => ({ char: null, x: 0, y: 0, ground: 0 }));   // FillChar(g_66DD, 38h, 0)
  if (!Array.isArray(g.cb_Char)) { g.cb_Char = [null]; g.cb_Col = [0]; g.cb_Row = [0]; g.cb_Size = [0]; }
  view.setM1(0x6E33, 0);                                                 // ecl w[$666]
  if (view.m1(0x6DC6) > 100) view.setM1(0x6DC6, 100);                    // ecl w[$58C] morale cap
  await PrepareBattlefield(); await PollOneKey();
  await InitPartyCombatants(); await PollOneKey();
  await DeployParty(); await PollOneKey();
  g.g_6E36 = AllocPicture(0x18, 3, 4, 1);                                // 5200:1f0b
  g.cm_Map.b[2] = (sx8(O31.CombatantCol(g.PartyHead)) - 3) & 0xFF;       // 5200:1f25
  g.cm_Map.b[3] = (sx8(O31.CombatantRow(g.PartyHead)) - 3) & 0xFF;
  await X.DrawCombatLayout();                                            // 5200:1f42
  for (let c = g.PartyHead; c; c = c.next) await X.CallEffectHooks(8, c);   // 5200:1f65
  await X.CalcEnemyHpPct();                                              // 5200:1f7f
  g.game_Mode = 5;
}
