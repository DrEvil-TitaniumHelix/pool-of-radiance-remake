// game/areas/view_ov30.js — VIEW ov30 (B600): combat line of sight and the target list.
// por-only: Pool GEO/wall/picture layouts, asset names and travel rendering (whole module) (profile: engine.areaModules / daxGroups / areas; game/profiles/PORONLY.md)
// Owner: por-build-ecl. Source: decode/pseudo/VIEW.pas.md ov30 (verified), every routine re-read from
// decode/listings/ov30.lst (b600:0000..0bd8). Findings from the bytes (differences to VIEW.pas.md):
//  - TraceLine: the step limit is range*2+1 against the byte L.dist (b600:0431 / 0510); the blocking test reads the tile
//    under the current point (L.x, L.y), which on the first pass is the start tile (b600:04e9).
//  - BuildTargetList: outer loop over the target's footprint cells m, inner over the attacker's cells k (b600:0a3f / 0a58);
//    `found` is set by any successful TraceLine, even when its distance is not below `best` (b600:0b04) — quirk; best
//    starts at FFh (word); the stored distance is its low byte (b600:0b57).
//  - InFrontArc: dir > 8 (not FFh) leaves the result uninitialised (b600:08f8) — TODO(decode): garbage, false here.
// Data: combatants g.cb_Col/cb_Row/cb_Size[n] (DS:5F27/5F28/5F2A + 4n, cb_Size[0] = count); target list
// g.tg_List[1..g.tg_Count] = { who, dist, dir } (DS:6718 + 3n, count DS:671A); combat map g.cm_Map = { b } with the
// 25 x 50 grid at +7; terrain table DS:2744 (4 bytes per tile: +1 height, +2 obstacle height).
// TLine (26 bytes): { x0, y0, x1, y1, err, adx, ady, incDiag, incStraight, sx, sy, x, y, dist, dir } (words / bytes as in
// the record; magic_spells.js and res_00ba_v.js build it with their own newLine()).

import { view } from './view.js';

const sx8 = (v) => ((v & 0xFF) ^ 0x80) - 0x80;
const i16 = (v) => ((v & 0xFFFF) ^ 0x8000) - 0x8000;
const DX = [0, 1, 1, 1, 0, -1, -1, -1, 0];                // g_2736
const DY = [-1, -1, 0, 1, 1, 1, 0, -1, 0];                // g_273F
const DIR_OF = [7, 0, 1, 6, 8, 2, 5, 4, 3];               // g_25C0[(oy+1)*3 + (ox+1)] (image)

const ext = {};
export function bindOv30(more = {}) { Object.assign(ext, more); }

export function newLine() {
  return { x0: 0, y0: 0, x1: 0, y1: 0, err: 0, adx: 0, ady: 0, incDiag: 0, incStraight: 0, sx: 0, sy: 0, x: 0, y: 0, dist: 0, dir: 0 };
}

// BB00:0000 FootprintCell(size, k, var dx, var dy) — VIEW ov31; used here until view_ov31.js exports it
// (table DS:2844[size*8 + k*2], dx < 0 = unused; VIEW.pas.md ov31, H)
function footprintCell(size, k, dx, dy) {
  if (typeof ext.FootprintCell === 'function') return ext.FootprintCell(size, k, dx, dy);
  if (size === 0) return false;
  const ds = view.g.ds;
  dx.v = sx8(ds[0x2844 + size * 8 + k * 2]); dy.v = sx8(ds[0x2845 + size * 8 + k * 2]);
  return dx.v >= 0;
}

// B600:0000 Sign(n): -1 / 0 / 1
export function Sign(n) { n = i16(n); return n < 0 ? -1 : n > 0 ? 1 : 0; }

// B600:002E SortTargets: exchange sort by distance; equal distance: lower direction code first when its parity is not greater
export function SortTargets() {
  const g = view.g, L = g.tg_List;
  if (g.tg_Count <= 1) return;                                             // b600:0034
  for (let i = 1; i <= g.tg_Count - 1; i++)
    for (let j = i + 1; j <= g.tg_Count; j++) {
      const a = L[i], b = L[j];
      const swap = b.dist < a.dist ||                                      // b600:00c1
        (b.dist === a.dist && b.dir < a.dir && (b.dir % 2) <= (a.dir % 2));  // b600:00e7..0113
      if (swap) { L[i] = b; L[j] = a; }                                    // b600:0131 / 0160 / 0181 3-byte swaps
    }
}

// B600:01A0 LineInit(var L)
export function LineInit(L) {
  L.dist = 0;                                                              // b600:01b0
  L.adx = Math.abs(i16(L.x1 - L.x0)); L.ady = Math.abs(i16(L.y1 - L.y0));
  L.sx = Sign(L.x1 - L.x0); L.sy = Sign(L.y1 - L.y0);                      // b600:01f9 / 0213
  L.x = L.x0; L.y = L.y0;
  if (L.adx > L.ady) {                                                     // b600:0242
    L.err = i16(2 * L.ady - L.adx); L.incDiag = i16(2 * (L.ady - L.adx)); L.incStraight = i16(2 * L.ady);
  } else {
    L.err = i16(2 * L.adx - L.ady); L.incDiag = i16(2 * (L.adx - L.ady)); L.incStraight = i16(2 * L.adx);
  }
}

// B600:02CC LineStep(var L): one Bresenham step; false when already at (x1, y1)
export function LineStep(L) {
  let ox = 0, oy = 0, r = false;
  if (L.adx > L.ady) {                                                     // b600:02ef x-major
    if (L.x !== L.x1) {
      ox = L.sx;
      if (L.err >= 0) { oy = L.sy; L.y = i16(L.y + L.sy); L.err = i16(L.err + L.incDiag); L.dist = (L.dist + 3) & 0xFF; }
      else { L.err = i16(L.err + L.incStraight); L.dist = (L.dist + 2) & 0xFF; }
      L.x = i16(L.x + L.sx); r = true;
    }
  } else if (L.y !== L.y1) {                                               // b600:037a y-major
    oy = L.sy;
    if (L.err >= 0) { ox = L.sx; L.x = i16(L.x + L.sx); L.err = i16(L.err + L.incDiag); L.dist = (L.dist + 3) & 0xFF; }
    else { L.err = i16(L.err + L.incStraight); L.dist = (L.dist + 2) & 0xFF; }
    L.y = i16(L.y + L.sy); r = true;
  }
  L.dir = DIR_OF[(oy + 1) * 3 + (ox + 1)];                                 // b600:040e
  return r;
}

const tile = (map, x, y) => map.b[(7 + y * 0x32 + x) & 0xFFFF];            // cm_Map^.grid[y, x]
const height = (t) => view.g.ds[0x2745 + t * 4];                           // g_2745
const obstacle = (t) => view.g.ds[0x2746 + t * 4];                         // g_2746

// B600:0422 TraceLine(x0, y0, var x1, var y1, var range, map): true = target reached (range := distance); false = blocked
// or out of range (x1, y1 := where it stopped, range := distance so far)
export function TraceLine(x0, y0, x1, y1, range, map) {
  const maxSteps = ((range.v & 0xFFFF) * 2 + 1) & 0xFFFF;                  // b600:0431
  const L = newLine();
  L.x0 = sx8(x0); L.y0 = sx8(y0); L.x1 = sx8(x1.v); L.y1 = sx8(y1.v);
  LineInit(L);                                                             // b600:045c
  const H = newLine();
  const h0 = height(tile(map, sx8(x0), sx8(y0)));
  H.x0 = 0; H.y0 = h0;                                                     // b600:0464 .. 0485
  H.x1 = L.adx > L.ady ? L.adx : L.ady;                                    // b600:048b
  H.y1 = h0;                                                               // b600:04b5 quirk: start tile again
  LineInit(H);                                                             // b600:04d6
  for (;;) {
    if ((map.b[6] === 0 && obstacle(tile(map, L.x, L.y)) > H.y) || L.dist > maxSteps) {   // b600:04dd .. 0515
      x1.v = L.x & 0xFF; y1.v = L.y & 0xFF; range.v = L.dist;              // b600:0518 .. 0533
      return false;
    }
    LineStep(H);                                                           // b600:0541
    if (!LineStep(L)) { range.v = L.dist; return true; }                   // b600:054d / 0563
  }
}

// B600:057B InFrontArc(sx, sy, tx, ty, dir): target in the 90-degree quadrant in front (dir FFh/8 = all directions)
export function InFrontArc(sx, sy, tx, ty, dir) {
  sx = sx8(sx); sy = sx8(sy); tx = sx8(tx); ty = sx8(ty);
  if (sx < 0 || sx > 0x31 || sy < 0 || sy > 0x18 || tx < 0 || tx > 0x31 || ty < 0 || ty > 0x18) return false;   // b600:057b..05b1
  if (dir === 0xFF) dir = 8;                                               // b600:05b8
  const fx = sx8(sx + (DX[dir] ?? 0)), fy = sx8(sy + (DY[dir] ?? 0));      // b600:05c2..05f3
  if ((sx === tx && sy === ty) || (fx === tx && fy === ty)) return true;   // b600:05f6..0610
  switch (dir) {                                                           // b600:0617..08f8
    case 0: return (tx >= fx && ty <= fy + fx - tx) || (tx <= fx && ty <= fy + tx - fx);
    case 1: return (tx >= fx && ty <= fy + fx - tx) || (tx >= fx + fy - ty && ty <= fy);
    case 2: return (tx >= fx + fy - ty && ty <= fy) || (tx >= fx + ty - fy && ty >= fy);
    case 3: return (tx >= fx + ty - fy && ty >= fy) || (tx >= fx && ty >= fy + tx - fx);
    case 4: return (tx >= fx && ty >= fy + tx - fx) || (tx <= fx && ty >= fy + fx - tx);
    case 5: return (tx <= fx && ty >= fy + fx - tx) || (tx <= fx + fy - ty && ty >= fy);
    case 6: return (tx <= fx + fy - ty && ty >= fy) || (tx <= fx + ty - fy && ty <= fy);
    case 7: return (tx <= fx + ty - fy && ty <= fy) || (tx <= fx && ty <= fy + tx - fx);
    case 8: return true;
  }
  return false;                                                            // TODO(decode): garbage result for dir 9..FEh
}

// B600:0909 BuildTargetList(col, row, range, dir, size, map)
export function BuildTargetList(col, row, range, dir, size, map) {
  const g = view.g;
  if (!Array.isArray(g.tg_List)) g.tg_List = [];
  const ac = [], ar = [], tc = [], tr = [];
  const dx = { v: 0 }, dy = { v: 0 };
  for (let k = 0; k <= 3; k++) {                                           // b600:0915
    if (footprintCell(size, k, dx, dy)) { ac[k] = sx8(col + dx.v); ar[k] = sx8(row + dy.v); }   // b600:092a
    else ac[k] = -1;
  }
  g.tg_Count = 0;                                                          // b600:0976
  const count = g.cb_Size[0] & 0xFF;                                       // DS:5F2A
  for (let n = 1; n <= count; n++) {
    if (!(g.cb_Size[n] > 0)) continue;                                     // b600:09a0
    let found = false, best = 0xFF, bk = 0, bm = 0;                         // b600:09a8 / 09ac
    for (let m = 0; m <= 3; m++) {                                         // b600:09b7 target footprint
      if (footprintCell(g.cb_Size[n], m, dx, dy)) { tc[m] = sx8(g.cb_Col[n] + dx.v); tr[m] = sx8(g.cb_Row[n] + dy.v); }   // b600:09d8
      else tc[m] = -1;
    }
    for (let m = 0; m <= 3; m++) {
      if (tc[m] < 0) continue;                                             // b600:0a50
      for (let k = 0; k <= 3; k++) {
        if (ac[k] < 0) continue;                                           // b600:0a69
        if (InFrontArc(ac[k], ar[k], tc[m], tr[m], dir)) {                 // b600:0aa2
          const x = { v: tc[m] & 0xFF }, y = { v: tr[m] & 0xFF }, d = { v: range & 0xFFFF };
          if (TraceLine(ac[k], ar[k], x, y, d, map)) {                     // b600:0af5
            found = true;                                                  // b600:0b04 quirk: before the distance test
            if (d.v < best) { best = d.v; bk = k; bm = m; }                // b600:0b0c
          }
        }
      }
    }
    if (!found) continue;                                                  // b600:0b2c
    g.tg_Count = (g.tg_Count + 1) & 0xFF;                                  // b600:0b35
    let d = 0;
    if (dir < 8) d = dir;                                                  // b600:0b67
    else while (!InFrontArc(ac[bk], ar[bk], tc[bm], tr[bm], d)) d = (d + 1) & 0xFF;   // b600:0ba4
    g.tg_List[g.tg_Count] = { who: n, dist: best & 0xFF, dir: d };         // b600:0b45 / 0b57 / 0bc0
  }
  SortTargets();                                                           // b600:0bd0
}
